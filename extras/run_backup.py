import click
from datetime import datetime
import pytz
from pathlib import Path

import shutil
import os

from time import sleep


newYorkTz = pytz.timezone("America/New_York") 
BACKUP_DIR = "backups"
SRC_DIR = "../data"



BUILD_SRC_DIR = "../build/data/"


@click.command()
def backup():


    timeInNewYork = datetime.now(newYorkTz)
    TIMESTAMP = timeInNewYork.strftime("%H:%MET")

    DESTINATION_DIR = BACKUP_DIR + "/" + TIMESTAMP 
    BUILD_DEST_DIR = DESTINATION_DIR + "/build/"


    print("copying files to %s" % DESTINATION_DIR)

    shutil.copytree(SRC_DIR, DESTINATION_DIR)

    ## The build directory gets removed and rebuilt
    
    attempts = 3
    wait_time = 20
    while attempts > 0:
        try:
            shutil.copytree(BUILD_SRC_DIR, BUILD_DEST_DIR)
            attempts = 0
        except FileNotFoundError:
            print("build directory not available, waiting")
            attempts -= 1
            sleep(wait_time)

if __name__ == '__main__':
    backup()