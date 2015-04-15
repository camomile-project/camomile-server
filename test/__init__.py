import tempfile
import subprocess
import shutil
import time

from camomile import Camomile
CLIENT = Camomile('http://localhost:3000')

ROOT_USERNAME = 'root'
ROOT_PASSWORD = 'C4m0m1l3'

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'p4s5w0rD'

USER_USERNAME = 'user'
USER_PASSWORD = '123456'


def setup():

    global MONGO_DIR
    global MONGO_PROCESS
    global NODE_PROCESS
    global CLIENT

    # create MONGO_DIR
    MONGO_DIR = tempfile.mkdtemp()

    # launch MongoDB
    cmd = ['mongod', '--dbpath={dbpath:s}'.format(dbpath=MONGO_DIR)]
    MONGO_PROCESS = subprocess.Popen(cmd, stdout=subprocess.PIPE)

    # wait a few seconds to make sure Mongo is running
    time.sleep(2.5)

    # launch API
    cmd = ['node', 'app.js', '--root-password', ROOT_PASSWORD]
    NODE_PROCESS = subprocess.Popen(cmd, stdout=subprocess.PIPE)

    # wait a few seconds to make sure Node server is running
    time.sleep(2.5)


def teardown():

    global MONGO_DIR
    global MONGO_PROCESS
    global NODE_PROCESS

    # stop API
    NODE_PROCESS.kill()

    # stop MongoDB
    MONGO_PROCESS.kill()

    # delete MONGO_DIR
    shutil.rmtree(MONGO_DIR)
