from __future__ import unicode_literals
import tempfile
import subprocess
import pymongo
import shutil
import time
import sys


from camomile import Camomile

URL = 'http://localhost:3000'
CLIENT = Camomile(URL, debug=False)


MONGO_DIR = None
MONGO_PROCESS = None
NODE_PROCESS = None

ROOT_USERNAME = 'root'
ROOT_PASSWORD = 'password'


def setup():

    global MONGO_DIR
    global MONGO_PROCESS
    global NODE_PROCESS
    global CLIENT

    # create MONGO_DIR
    MONGO_DIR = tempfile.mkdtemp()

    # launch MongoDB
    sys.stdout.write('Running MongoDB instance... ')
    sys.stdout.flush()
    cmd = ['mongod', '--dbpath={dbpath:s}'.format(dbpath=MONGO_DIR)]
    MONGO_PROCESS = subprocess.Popen(cmd, stdout=subprocess.PIPE)

    # testing MongoDB
    client = pymongo.MongoClient('localhost', 27017)
    try:
        # will block until MongoDB is ready
        client.database_names()
    except Exception:
        MONGO_PROCESS.kill()
        assert False, 'Cannot connect to the MongoDB instance.'

    sys.stdout.write('DONE\n')
    sys.stdout.flush()

    # launch API
    sys.stdout.write('Running Camomile test instance... ')
    sys.stdout.flush()
    cmd = ['node', 'app.js', '--root-password', ROOT_PASSWORD]
    NODE_PROCESS = subprocess.Popen(cmd, stdout=subprocess.PIPE)

    # testing if server is running
    for i in range(15):
        time.sleep(1)
        try:
            Camomile(URL, username=ROOT_USERNAME, password=ROOT_PASSWORD)
        except Exception:
            continue
        else:
            break
    else:
        NODE_PROCESS.kill()
        assert False, 'Cannot connect to the Camomile test instance.'

    sys.stdout.write('DONE\n')
    sys.stdout.flush()


def teardown():

    global MONGO_DIR
    global MONGO_PROCESS
    global NODE_PROCESS

    # stop API
    sys.stdout.write('\nKilling Camomile test instance... ')
    sys.stdout.flush()
    NODE_PROCESS.kill()
    sys.stdout.write('DONE\n')
    sys.stdout.flush()

    # stop MongoDB
    sys.stdout.write('Killing MongoDB instance... ')
    sys.stdout.flush()
    MONGO_PROCESS.kill()
    sys.stdout.write('DONE\n')
    sys.stdout.flush()

    # delete MONGO_DIR
    shutil.rmtree(MONGO_DIR)


