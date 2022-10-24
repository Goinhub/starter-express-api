const Order = require("../models/Order");
const Event = require("../models/Event");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");
const Card = require("../models/Card");
const User = require("../models/User");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided");
  }
  if (tax == undefined) {
    throw new CustomError.BadRequestError("Please provide tax");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbEvent = await Event.findOne({ _id: item.event });
    if (!dbEvent) {
      throw new CustomError.NotFoundError(`No event with id : ${item.event}`);
    }
    const { name, price, image, _id } = dbEvent;
    const singleOrderItem = {
      amount: item.quantity,
      name,
      price,
      image,
      event: _id,
    };
    // add item to order
    orderItems = [...orderItems, singleOrderItem];
    // calculate subtotal
    subtotal += item.quantity * price;
  }
  // calculate total
  const total = tax + subtotal;
  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "mad",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const verifyOrder = async (req, res) => {
  const { userId, event, pin } = req.body;
  const card = await Card.findOne({ user: userId });
  if (card.pin != pin) {
    throw new CustomError.BadRequestError("pin is not valid");
  } else {
    const orders = await Order.find({ userId });
    let amount = 0;
    orders.forEach((order) => {
      if (order.status === "paid") {
        order.orderItems.forEach((item) => {
          if (item.event == event) {
            amount += item.amount;
          }
        });
      }
    });
    res.status(StatusCodes.OK).json({ NumberOfPlace: amount });
  }
};
const deleteOrder = async (req, res) => {
  const { id } = req.body;
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${id}`);
  }
  res.status(StatusCodes.OK).json({ order });
};

const editamount = async (req, res) => {
  const { id, amount } = req.body;
  const order = await Order.findById(id);
  let total = 0;
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${id}`);
  }
  if (order.status === "paid") {
    order.orderItems.forEach((item) => {
      if (item.event == req.body.event) {
        total = item.amount - amount;
        if (total < 0) {
          throw new CustomError.BadRequestError("amount is not valid");
        }
        if (total === 0) {
          item.remove();
        }
        if (total > 0) {
          item.amount = total;
        }
      }
    });
  }
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  let revenue = 0;
  orders.map((order) => {
    revenue += order.total;
  });
  res.status(StatusCodes.OK).json({ orders, count: orders.length, revenue });
};

const getPartnerCostumers = async (req, res) => {
  const events = await Event.find({ user: req.user.userId });
  const orders = await Order.find({});
  let costumers = [];
  orders.map((order) => {
    order.orderItems.map((item) => {
      if (events.map((event) => event._id).includes(item.event)) {
        costumers.push(order.user);
      }
    });
  });
  res.status(StatusCodes.OK).json({ costumers });
};

const getAllCostumers = async (req, res) => {
  const orders = await Order.find({});
  let costumers = [];
  orders.map((order) => {
    costumers.push(order.user);
  });
  res.status(StatusCodes.OK).json({ costumers });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
  getAllCostumers,
  getPartnerCostumers,
  verifyOrder,
  deleteOrder,
  editamount,
};
