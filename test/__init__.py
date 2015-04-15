import tempfile
import subprocess
import shutil
import time

from requests.exceptions import HTTPError
from functools import wraps


def success_message(message):
    response = {'message': message}

    def success_message_decorator(f):

        @wraps(f)
        def wrapper(self):
            assert f(self) == response

        return wrapper

    return success_message_decorator


def error_message(message):
    response = {'message': message}

    def error_message_decorator(f):
        @wraps(f)
        def wrapper(self):
            try:
                f(self)
            except HTTPError, e:
                assert e.response.json() == response
            else:
                raise AssertionError()
        return wrapper
    return error_message_decorator

from camomile import Camomile

URL = 'http://localhost:3000'
CLIENT = Camomile(URL)

ROOT_USERNAME = 'root'
ROOT_PASSWORD = 'C4m0m1l3'

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'p4s5w0rD'
ADMIN_DESCRIPTION = 'admin user'

USER_USERNAME = 'user'
USER_PASSWORD = '123456'
USER_DESCRIPTION = 'regular user'


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
    time.sleep(3)

    # launch API
    cmd = ['node', 'app.js', '--root-password', ROOT_PASSWORD]
    NODE_PROCESS = subprocess.Popen(cmd, stdout=subprocess.PIPE)

    # wait a few seconds to make sure Node server is running
    time.sleep(3)

    with Camomile(URL,
                  username=ROOT_USERNAME,
                  password=ROOT_PASSWORD) as client:

        # create regular user
        client.createUser(USER_USERNAME, USER_PASSWORD,
                          description=USER_DESCRIPTION,
                          role='user')

        # create admin user
        client.createUser(ADMIN_USERNAME, ADMIN_PASSWORD,
                          description=ADMIN_DESCRIPTION,
                          role='admin')


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
