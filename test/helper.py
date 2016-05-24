from . import CLIENT
from . import ROOT_USERNAME, ROOT_PASSWORD
from functools import wraps
from requests.exceptions import HTTPError


ADMIN = None
ADMIN_USERNAME = 'admin_user'
ADMIN_PASSWORD = 'admin_user password'
ADMIN_DESCRIPTION = 'admin user'

USER0 = None
USER0_USERNAME = 'regularuser0'
USER0_PASSWORD = 'regularuser0 password'
USER0_DESCRIPTION = 'regular user 0'

USER1 = None
USER1_USERNAME = 'regularuser1'
USER1_PASSWORD = 'regularuser1 password'
USER1_DESCRIPTION = 'regular user 1'

USER2 = None
USER2_USERNAME = 'regularuser2'
USER2_PASSWORD = 'regularuser2 password'
USER2_DESCRIPTION = 'regular user 2'

USER3 = None
USER3_USERNAME = 'regularuser3'
USER3_PASSWORD = 'regularuser3 password'
USER3_DESCRIPTION = 'regular user 3'

GROUP1 = None
GROUP1_NAME = 'group1'
GROUP1_DESCRIPTION = 'group 1'

GROUP2 = None
GROUP2_NAME = 'group2'
GROUP2_DESCRIPTION = 'group 2'

GROUP3 = None
GROUP3_NAME = 'group3'
GROUP3_DESCRIPTION = 'group 3'


def initDatabase():

    global ADMIN
    global ADMIN_USERNAME
    global ADMIN_PASSWORD
    global ADMIN_DESCRIPTION

    global USER0
    global USER0_USERNAME
    global USER0_PASSWORD
    global USER0_DESCRIPTION

    global USER1
    global USER1_USERNAME
    global USER1_PASSWORD
    global USER1_DESCRIPTION

    global USER2
    global USER2_USERNAME
    global USER2_PASSWORD
    global USER2_DESCRIPTION

    global USER3
    global USER3_USERNAME
    global USER3_PASSWORD
    global USER3_DESCRIPTION

    global GROUP1
    global GROUP1_NAME
    global GROUP1_DESCRIPTION

    global GROUP2
    global GROUP2_NAME
    global GROUP2_DESCRIPTION

    emptyDatabase()

    # login as root
    CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)

    # create admin user
    ADMIN = CLIENT.createUser(ADMIN_USERNAME, ADMIN_PASSWORD,
                              description=ADMIN_DESCRIPTION,
                              role='admin', returns_id=True)

    # create regular users 0, 1, 2 and 3
    USER0 = CLIENT.createUser(USER0_USERNAME, USER0_PASSWORD,
                              description=USER0_DESCRIPTION,
                              role='user', returns_id=True)
    USER1 = CLIENT.createUser(USER1_USERNAME, USER1_PASSWORD,
                              description=USER1_DESCRIPTION,
                              role='user', returns_id=True)
    USER2 = CLIENT.createUser(USER2_USERNAME, USER2_PASSWORD,
                              description=USER2_DESCRIPTION,
                              role='user', returns_id=True)
    USER3 = CLIENT.createUser(USER3_USERNAME, USER3_PASSWORD,
                              description=USER3_DESCRIPTION,
                              role='user', returns_id=True)

    # create group 1 (with user 1)
    GROUP1 = CLIENT.createGroup(GROUP1_NAME,
                                description=GROUP1_DESCRIPTION,
                                returns_id=True)
    CLIENT.addUserToGroup(USER1, GROUP1)

    # create group 2 (with user 1 and user 2)
    GROUP2 = CLIENT.createGroup(GROUP2_NAME,
                                description=GROUP2_DESCRIPTION,
                                returns_id=True)
    CLIENT.addUserToGroup(USER1, GROUP2)
    CLIENT.addUserToGroup(USER2, GROUP2)

    # create group 3 (with user 1, 2 and 3)
    GROUP3 = CLIENT.createGroup(GROUP3_NAME,
                                description=GROUP3_DESCRIPTION,
                                returns_id=True)
    CLIENT.addUserToGroup(USER1, GROUP3)
    CLIENT.addUserToGroup(USER2, GROUP3)
    CLIENT.addUserToGroup(USER3, GROUP3)

    # logout
    CLIENT.logout()


def emptyDatabase():

    global ADMIN
    global USER0
    global USER1
    global USER2
    global USER3
    global GROUP1
    global GROUP2

    # login as root
    CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)
    root = CLIENT.me(returns_id=True)

    # remove all resources
    for corpus in CLIENT.getCorpora(returns_id=True):
        CLIENT.deleteCorpus(corpus)

    # remove all groups
    for group in CLIENT.getGroups(returns_id=True):
        CLIENT.deleteGroup(group)

    # remove all users but root
    for user in CLIENT.getUsers(returns_id=True):
        if user == root:
            continue
        CLIENT.deleteUser(user)

    # logout
    CLIENT.logout()


def success_message(message):
    expected = {'success': message}

    def success_message_decorator(f):

        @wraps(f)
        def wrapper(self):
            actual = f(self)
            self.assertDictEqual(expected, actual)

        return wrapper

    return success_message_decorator


def error_message(message):
    expected = {'error': message}

    def error_message_decorator(f):
        @wraps(f)
        def wrapper(self):
            with self.assertRaises(HTTPError) as cm:
                f(self)
            print('response: ' + str(cm.exception.response.json()))
            print('expected: ' + str(expected))
            self.assertDictEqual(cm.exception.response.json(), expected)

        return wrapper
    return error_message_decorator
