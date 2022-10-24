################################################################################
#                                   Packages                                   #
################################################################################
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from selenium import webdriver
import pandas as pd
from termcolor import colored
import urllib.request
import os
import time
import uuid

################################################################################
#                                  Main Code                                   #
################################################################################


class InstaStoryScraper:
    """
    A class for scraping stories, and downloading the result.
    ...

    Attributes
    ----------
    :param username: username for the account to scrap.

    Methods
    -------
    download(url, is_video, dir): Download a content given its url.
    download_all(): Download all scraped content.
    scraper(): Scrap stories from Instagram account.

    """

    def __init__(self, username):
        """
        Constructs all the necessary attributes for the InstaStoryScraper object.
        :param username: username for the account to scrap.
        """
        self.usr = "dearstidier"
        self.pswd = "dearstidierr"
        self.username = username
        self.project_direc = '/'.join(os.getcwd().split('/')[:-1])
        self.login_page = "https://www.instagram.com/accounts/login/"
        self.story_link = "https://www.instagram.com/stories/{}/".format(
            username)
        self.api = []

    def scraper(self):
        """
        Scraping stories.
        :return:
        """
        # Specify Chrome driver options
        options = webdriver.ChromeOptions()
        options.add_argument("--window-size=1920,1080")
        options.add_argument('--ignore-certificate-errors')
        options.add_argument('--allow-running-insecure-content')
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                             "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36")
        options.add_argument('--headless')
        driver = webdriver.Chrome(
            ChromeDriverManager().install(), options=options)
        driver.get(self.login_page)
        time.sleep(4)

        # Accept the website cookies
        ''''driver.find_element(By.XPATH,"/html/body/div[4]/div/div/button[1]").click()
        time.sleep(3)'''

        # Login with a random account since we can't scrap stories without being logged
        driver.find_element(By.NAME, "username").send_keys(self.usr)
        driver.find_element(By.NAME, "password").send_keys(self.pswd)

        # Check that we had access to the account, otherwise keep retrying
        while True:
            driver.find_element(
                By.XPATH, "//*[@id='loginForm']/div/div[3]/button").click()
            time.sleep(5)
            try:
                if driver.find_element(By.XPATH, "/html/body/div[1]/section/nav/div[2]/div/div/div[2]/input"):
                    break
            except NoSuchElementException:
                pass
        print(colored("\n[SUCCESS]: Logged into the website. \n", "green"))

        # Get access to the story link
        driver.get(self.story_link)
        time.sleep(3)

        # Check if there are any stories for the last 24h, if so start scraping all stories
        if driver.current_url != self.story_link:
            print(
                colored("\n[ERROR]: No stories are available for the last 24h. \n", "red"))
        else:
            rows = []
            print(self.story_link)
            print(colored("\n[SUCCESS]: Got into the story link. \n", "green"))
            driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/div[1]/div/div/div/div[1]/div[1]/section/"
                                "div[1]/div/section/div/div[1]/div/div/div/div[3]/button").click()
            time.sleep(3)
            while driver.current_url != "https://www.instagram.com/":
                # Collect the link to the video content of the story if it exists, otherwise take the image link
                is_video = True
                try:
                    content_link = driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/"
                                                       "div[1]/div/div/div/div[1]/div[1]/"
                                                       "section/div[1]/div/section/div/"
                                                       "div[1]/div/div/video/source").get_attribute("src")
                    insta_img = driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/"
                                                    "div[1]/div/div/div/div[1]/div[1]/"
                                                    "section/div[1]/div/section/div/"
                                                    "div[1]/div/div/img").get_attribute("src")
                except NoSuchElementException:
                    content_link = driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/div[1]/"
                                                       "div/div/div/div[1]/div[1]/section/div[1]"
                                                       "/div/section/div/div[1]/div/div/img").get_attribute(
                        "src")
                    insta_img = content_link
                    is_video = False

                # Get the link of the story
                insta_link = driver.current_url
                # Get insta img of the story

                # Get the date of the story
                date = driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/"
                                           "div[1]/div/div/div/div[1]/"
                                           "div[1]/section/div[1]/div/section"
                                           "/div/header/div[2]/div[1]/div/div/div/time").get_attribute(
                    "datetime")

                # Append all collected information into a row
                rows.append(
                    {
                        'Instagram img': insta_img,
                        'Instagram URL': insta_link,
                        'Content URL': content_link,
                        'Date': date,
                        'is_video': is_video
                    }
                )

                # Click on the next button
                driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/div[1]/"
                                    "div/div/div/div[1]/div[1]/section/div[1]"
                                    "/div/section/div/button[2]").click()

                time.sleep(3)

            # Save scrapped data into a dataframe
            self.api = rows
            df = pd.DataFrame(rows)
            df.to_csv('out.csv')
            driver.quit()
            print(
                colored("\n[SUCCESS]: Scrapped all stories for the last 24h. \n", "green"))


def resp(username):
    scrp = InstaStoryScraper(username)
    scrp.scraper()
    return scrp.api
