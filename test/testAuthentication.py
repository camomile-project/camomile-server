from . import CLIENT, ROOT_USERNAME, ROOT_PASSWORD


class TestAuthentication:

    def setup(self):
        pass

    def testLogin(self):
        message = {'message': 'Authentication succeeded.'}
        assert CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD) == message

    def testLogout(self):
        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)
        message = {'message': 'Logout succeeded.'}
        assert CLIENT.logout() == message

    def testMe(self):
        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)
        assert CLIENT.me().username == ROOT_USERNAME
