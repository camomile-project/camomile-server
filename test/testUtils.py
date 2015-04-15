from . import CLIENT, USER_USERNAME, USER_PASSWORD
from datetime import datetime


class TestUtils:

    def setup(self):
        CLIENT.login(USER_USERNAME, USER_PASSWORD)

    def teardown(self):
        try:
            CLIENT.logout()
        except:
            pass

    def testDate(self):
        serverNow = datetime.strptime(CLIENT.getDate().date,
                                      '%Y-%m-%dT%H:%M:%S.%fZ')
        localNow = datetime.now()
        first = min(serverNow, localNow)
        last = max(serverNow, localNow)
        delta = last - first
        assert delta.days == 0 & delta.seconds < 1
