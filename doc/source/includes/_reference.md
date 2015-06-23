
# Reference

## Foreword

### History

```http
GET /corpus?history=on HTTP/1.1
```

```python
corpus = client.getCorpus(id_corpus, history=True)
do_something_with(corpus.history)
```

```javascript
client.getCorpus(
  id_corpus, 
  function (corpus) { 
    do_something_with(corpus.history); 
  },
  {history: True}
);
```

The API keeps track of all changes made to corpora, media, layers and annotations, in a dedicated `history` attribute. 

The `history` is simply a list of updates that were applied to the resource. 
Each update has the following attributes:

  - `date`: when the resource has changed
  - `id_user`: which user applied the change
  - `changes`: the actual modification


However, to avoid sending what may become a very large amount of data with every request, the default behavior is to not send `history`. 

If you really want to get the history, you need to ask for it explicitely to get it.

### Filters

```http
GET /corpus?name='my%20corpus' HTTP/1.1
```

```python
corpora = client.getCorpora(name='my corpus')
assert corpora[0].name == 'my corpus'
```

```javascript
client.getCorpora(
  function(corpora) {

  },
  {filter: {name: 'my corpus'}}
);
```

Most `get{Resource}` methods (e.g. `getCorpora`, `getLayers`, ...) support filtering by resource attribute. 

### Permissions

```http
PUT /corpus/:id_corpus/user/:id_user HTTP/1.1

{"right":3}
```

```python
client.setCorpusPermissions(id_corpus, client.ADMIN, user=id_user)
client.setCorpusPermissions(id_corpus, client.WRITE, user=id_user)
client.setCorpusPermissions(id_corpus, client.READ, group=id_group)
```

```javascript
Camomile.setCorpusPermissionsForUser(
  id_corpus, id_user, Camomile.ADMIN, callback);
Camomile.setCorpusPermissionsForUser(
  id_corpus, id_user, Camomile.WRITE, callback);
Camomile.setCorpusPermissionsForGroup(
  id_corpus, id_group, Camomile.READ, callback);
```

The Camomile platform handles permissions: a user may access only the resources for which they have enough permission.

Three levels of permissions are supported: 

  - `3 - ADMIN` admin privileges
  - `2 - WRITE` edition privileges
  - `1 - READ` read-only

`Annotations` inherit permissions from the `layer` they belong to.

`Media` inherit permissions from the `corpus` they belong to.

### Resource ID


```python
corpora = client.getCorpora()
id_corpora = client.getCorpora(returns_id=true)
assert corpora[0]._id == id_corpora[0]
```

```javascript
client.getCorpora(
  function(id_corpora) {
    do_something_with(id_corpora);
  },
  {returns_id: True}
);
```

Each resource is given a unique identifier (`_id`) by MongoDB upon creation.

The default behavior of most entry points is to return the complete resource, rather than just its `_id`. 

However, methods of the Python and Javascript clients support the `returns_id` optional parameter. 
Setting it to `true` will return the resource MongoDB `_id` instead of the complete resource.


## Authentication

### login

POST /login

Parameter        | Type      | Description
---------------- | --------- | -----------
username         | String    | The user name  (required)
password         | String    | The password  (required)


```http
POST /login HTTP/1.1

{'username': 'johndoe', 'password': 'yourpwd'}

```

```python
from camomile import Camomile 
server = 'http://example.com'  
client = Camomile(server)
client.login(username, password)
```

```javascript
var server = 'http://example.com';
Camomile.setURL(server);
```

> Sample JSON response

```json
{'success': 'Authentication succeeded.'}
```

### logout

POST /logout

```http
POST /logout HTTP/1.1
```

```python
client.logout()
```

> Sample JSON response

```json
{'success': 'Logout succeeded.'}
```

### get logged in user

GET /me 

```python
user = client.me()
id_user = client.me(returns_id=True)
```

```http
GET /me HTTP/1.1
```

> Sample JSON response

```json
{'_id': '555299eff80f910100d741d1',
 'description': '',
 'role': 'user',
 'username': 'johndoe'}
```

### update password

PUT /me

```python
client.update_password("new_password")
```

```javascript
client.update_password("new_password", callback);
```

```http
PUT /me HTTP/1.1

{
  "password": "new_password"
}
```

> Sample JSON response

```json
{
  'success': 'Password successfully updated.'
}
```

## Users & Groups

### create new user 

POST /user 

<aside class="notice">
Restricted to 'admin' user.
</aside>

#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
username         | String    | The user name  (required, unique and without space, can't be updated)
password         | String    | The password  (required)
description      | free      | A description of the user
role             | String    | The user role ("admin" or "user")  (required)

```http
POST /user HTTP/1.1

> Sample JSON request

{'username': 'johndoe',
 'password': 'secretpassword',
 'description': 'annotator',
 'role': 'user'}

```

```python
user = client.createUser('username', 'password', role='user',
                         description={'affiliation': 'LIMSI/CNRS', 
                                      'status': 'PhD student'})
```

```javascript
client.createUser('username', 'password', 
                  {'affiliation': 'LIMSI/CNRS', 'status': 'PhD student'}
                  'user', callback);
```


> Sample JSON response

```json
{'_id': '558818da01e0ef01006e979b',
 'description': 'annotator',
 'role': 'user',
 'username': 'johndoe'}
```

### delete one user

DELETE /user/:id_user

<aside class="warning">
Restricted to 'root' user.
</aside>

```python
client.deleteUser(id_user)
```

```http
DELETE /user/:id_user HTTP/1.1
```

> Sample JSON response

```json
{'success': 'Successfully deleted.'}
```

### get all users

GET /user

<aside class="notice">
Restricted to 'admin' user.
</aside>

Parameter        | Type      | Description
---------------- | --------- | -----------
username         | String    | Restrict list to username (optional)

```python
users = client.getUsers()
```

```http
GET /user HTTP/1.1
```


> Sample JSON response

```json
[{'_id': '5552998df80f910100d741d0',
  'description': '',
  'role': 'admin',
  'username': 'root'},
 {'_id': '558818da01e0ef01006e979b',
  'description': 'annotator',
  'role': 'user',
  'username': 'johndoe'}]
```

### get one user

GET /user/:id_user

<aside class="notice">
Restricted to 'admin' user.
</aside>

```python
user = client.getUser(id_user)
```

```http
GET /user/:id_user HTTP/1.1
```

> Sample JSON response

```json
{'_id': '558818da01e0ef01006e979b',
'description': 'annotator',
'role': 'user',
'username': 'johndoe'}
```

### update one user

PUT /user/:id_user

<aside class="notice">
Restricted to 'admin' user.
</aside>

```http
PUT /user/:id_user HTTP/1.1

{'description': 'expert annotator'}
```

```python
user = client.updateUser(id_user,
                         password='password',
                         description={'number': 42},
                         role='admin')
```

> Sample JSON response

```json
{'_id': '558818da01e0ef01006e979b',
'description': 'expert annotator',
'role': 'user',
'username': 'johndoe'}
```

### get one user's groups

GET /user/`:id_user`/group

```http
GET /user/:id_user/group HTTP/1.1
```

```python
id_groups = client.getUserGroups(id_user)
```

<aside class="notice">
Restricted to 'admin' user.
</aside>


> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```


### get all groups


```http
GET /group HTTP/1.1
```

```python
groups = client.getGroups()
```

<aside class="notice">
Restricted to 'admin' user.
</aside>

> Sample JSON request

```json
{'name': 'project'}
```

> Sample JSON response

```json
[{'_id': '55881d1601e0ef01006e979c',
  'description': 'members of the project',
  'name': 'project',
  'users': ['558818da01e0ef01006e979b', '55881d6001e0ef01006e979d']}]
```

### get one group

```http
GET /group/:id_group HTTP/1.1
```

```python
group = client.getGroup(id_group)
```

<aside class="notice">
Restricted to 'admin' user.
</aside>


> Sample JSON response

```json
{'_id': '55881d1601e0ef01006e979c',
  'description': 'members of the project',
  'name': 'project',
  'users': ['558818da01e0ef01006e979b', '55881d6001e0ef01006e979d']}
```


### create new group

```http
POST /group HTTP/1.1
```

```python
group = client.createGroup(
  'limsi', 
  description={'affiliation': 'LIMSI'})
```

<aside class="notice">
Restricted to 'admin' user.
</aside>


> Sample JSON request

```json
{'name': 'guests'}
```

> Sample JSON response

```json
{'_id': '55881f8301e0ef01006e979e',
 'description': '',
 'name': 'guests',
 'users': []}
```

### update one group

```http
PUT /group/:id_group HTTP/1.1
```

```python
group = client.updateGroup(
  id_group, 
  description={'affiliation': 'LIMSI/CNRS'})
```

<aside class="notice">
Restricted to 'admin' user.
</aside>


> Sample JSON request

```json
{ 'description': 'open trial'}
```

> Sample JSON response

```json
{'_id': '55881f8301e0ef01006e979e',
 'description': 'open trial',
 'name': u'guests',
 'users': []}
```

### delete one group

```http
DELETE /group/:id_group HTTP/1.1
```

```python
client.deleteGroup(id_group)
```

<aside class="warning">
Restricted to 'root' user.
</aside>

> Sample JSON response

```json
{'success': 'Successfully deleted.'}
```

### add one user to one group

```http
PUT /group/:id_group/user/:id_user HTTP/1.1
```

```python
client.addUserToGroup(id_user, id_group)
```

<aside class="notice">
Restricted to 'admin' user.
</aside>


> Sample JSON response

```json
{'_id': '55881d1601e0ef01006e979c',
  'description': 'members of the project',
  'name': 'project',
  'users': ['558818da01e0ef01006e979b', '55881d6001e0ef01006e979d']}
```

### remove one user from one group

```python
client.removeUserFromGroup(id_user, id_group)
```

<aside class="notice">
Restricted to 'admin' user.
</aside>

```http
DELETE /group/:id_group/user/:id_user HTTP/1.1
```

> Sample JSON response

```json
{'_id': '55881d1601e0ef01006e979c',
  'description': 'members of the project',
  'name': 'project',
  'users': ['558818da01e0ef01006e979b']}
```

## Corpora

### get all READable corpora

```python
corpora = client.getCorpora()
```

```http
GET /corpus HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one corpus

```python
corpus = client.getCorpus(id_corpus)
```

```http
GET /corpus/:id_corpus HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### create new corpus

```python
corpus = client.createCorpus(
  'unique name', 
  description={'license': 'Creative Commons'})
```

<aside class="notice">
Restricted to 'admin' user.
</aside>


```http
POST /corpus HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### update one corpus

```python
corpus = client.updateCorpus(
  id_corpus, 
  name='new name', 
  description={'license': 'MIT'})
```

<aside class="notice">
Restricted to user with ADMIN privileges.
</aside>

```http
PUT /corpus/:id_corpus HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### delete one corpus

```python
client.deleteCorpus(id_corpus)
```

<aside class="notice">
Restricted to user with ADMIN privileges.
</aside>

```http
DELETE /corpus/:id_corpus HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one corpus' permissions

```http
GET /corpus/:id_corpus/permissions HTTP/1.1
```

```python
permissions = client.getCorpusPermissions(id_corpus)
```

<aside class="notice">
Restricted to user with ADMIN privileges.
</aside>

> Sample JSON request

```json
```

> Sample JSON response

```json
{
  "users": [
    "5423dc0900e5c11a8fc723ba",
    "5423dc0900e5c11a8fc723bb"
  ],
  "groups": [
    "5423dfeb00e5c11a8fc723bc",
  ]
}
```


### give one user permissions to one corpus

```python
client.setCorpusPermissions(id_corpus, ADMIN, user=id_user)
```

<aside class="notice">
Restricted to user with ADMIN privileges.
</aside>

```http
PUT /corpus/:id_corpus/user/:id_user HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### remove one user's permissions to one corpus

```python
client.removeCorpusPermissions(id_corpus, user=id_user)
```

<aside class="notice">
Restricted to user with ADMIN privileges.
</aside>

```http
DELETE /corpus/:id_corpus/user/:id_user HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### give one group permissions to one corpus

```python
client.setCorpusPermissions(id_corpus, ADMIN, group=id_group)
```

<aside class="notice">
Restricted to user with ADMIN privileges.
</aside>

```http
PUT /corpus/:id_corpus/group/:id_group HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### remove one group's permissions to one corpus

```python
client.removeCorpusPermissions(id_corpus, group=id_group)
```

<aside class="notice">
Restricted to user with ADMIN privileges.
</aside>

```http
DELETE /corpus/:id_corpus/group/:id_group HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

## Media

### get all media

```http
GET /medium HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one medium

```http
GET /medium/:id_medium HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one corpus' media

```http
GET /corpus/:id_corpus/medium HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### create new medium(a) in one corpus

```http
POST /corpus/:id_corpus/medium HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### update one medium

```http
PUT /medium/:id_medium HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### delete one medium

```http
DELETE /medium/:id_medium HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### stream one medium in default format

```http
GET /medium/:id_medium/video HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### stream one medium in WebM

```http
GET /medium/:id_medium/webm HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### stream one medium in MP4

```http
GET /medium/:id_medium/mp4 HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### stream one medium in OGV

```http
GET /medium/:id_medium/ogv HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

## Layers

### get all layers

```http
GET /layer HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one layer

```http
GET /layer/:id_layer HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one corpus' layers

```http
GET /corpus/:id_corpus/layer HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### create new layer(s) in one corpus

```http
POST /corpus/:id_corpus/layer HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### update one layer

```http
PUT /layer/:id_layer HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### delete one layer

```http
DELETE /layer/:id_layer HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one layer's permissions

```http
GET /layer/:id_layer/permissions HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### give one user permissions to one layer

```http
PUT /layer/:id_layer/user/:id_user HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### remove one user's permissions to one layer

```http
DELETE /layer/:id_layer/user/:id_user HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### give one group permissions to one layer

```http
PUT /layer/:id_layer/group/:id_group HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### remove on group's permissions to one layer

```http
DELETE /layer/:id_layer/group/:id_group HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

## Annotations

### get all annotations

```http
GET /annotation HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one annotation

```http
GET /annotation/:id_annotation HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### get one layer's annotations

```http
GET /layer/:id_layer/annotation HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### create new annotation(s) in one layer

```http
POST /layer/:id_layer/annotation HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### update one annotation

```http
PUT /annotation/:id_annotation HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### delete one annotation

```http
DELETE /annotation/:id_annotation HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

## Queues

### get all queues

```http
GET /queue HTTP/1.1
```

```python
queues = client.getQueues()
```

> Sample JSON response

```json
[
  {
    "_id": "5423dc0900e5c11a8fc723bb",
    "name": "name",
    "description": {"my": "description"},
    "list": ["item1", "item2"]
  },
  ...
]
```

### get one queue

```http
GET /queue/:id_queue HTTP/1.1
```

> Sample JSON response

```json
{
  "_id": "5423dc0900e5c11a8fc723bb",
  "name": "name",
  "description": {"my": "description"},
  "list": ["item1", "item2"]
}
```

### create new queue

```http
POST /queue HTTP/1.1
```

```python
queue = client.createQueue('queue name', description={'my': 'description'})
```

> Sample JSON request

```json
{
  "name": "name",
  "description": {"my": "description"}
}
```

> Sample JSON response

```json
{
  "_id": "5423dc0900e5c11a8fc723bb",
  "name": "name",
  "description": {"my": "description"},
  "list": []
}
```

### update one queue

```http
PUT /queue/:id_queue HTTP/1.1
```

```python
queue = client.updateQueue(id_queue, 
  name='new name', description={'new': 'description'},
  elements=['item1', 'item2'])
```

> Sample JSON request

```json
{
  "name": "new name",
  "description": {"new": "description"},
  "list": ["item1", "item2"]
}
```

> Sample JSON response

```json
{
  "_id":"5423dc0900e5c11a8fc723bb",
  "name": "new name",
  "description": {"new": "description"},
  "list": ["item1", "item2"]
}
```

### append item(s) to one queue

```http
PUT /queue/:id_queue/next HTTP/1.1
```

```python
queue = client.enqueue(id_queue, items)
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

### pop one item from one queue

```http
GET /queue/:id_queue/next HTTP/1.1
```

```python
item = client.dequeue(id_queue)
```

### remove one queue

```http
DELETE /queue/:id_queue HTTP/1.1
```

```python
client.deleteQueue(id_corpus)
```

> Sample JSON response

```json
{
  "success": "Successfully deleted."
}
```

## Miscellaneous

### get current date/time

```http
GET /date HTTP/1.1
```

> Sample JSON request

```json
{

}
```

> Sample JSON response

```json
{

}
```

```python
client.date()
```

