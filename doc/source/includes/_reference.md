
# Reference

## Foreword

### CRUD REST API

CAMOMILE server follows the conventional REST API for CRUD (Create, Read, Update, Delete) data access.
For a given *resource* (either corpus, medium, layer, annotation), the correspondance with HTTP commands and Python or Javascript interface is as follows.

Action      | HTTP command                       | Python/Javascript interface
------------|------------------------------------|------------------
**C**reate  | POST /*resource*                   | .createResource(...)
**R**ead    | GET /*resource*/`:id_resource`     | .getResource(`:id_resource`)
**U**pdate  | PUT /*resource*/`:id_resource`     | .updateResource(`:id_resource`,...)
**D**elete  | DELETE /*resource*/`:id_resource`  | .deleteResource(`:id_resource`)


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

  - `3 - ADMIN` admin permissions to the resource
  - `2 - WRITE` edition permissions to the resource
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

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
username         | String    | The user name  (required)
password         | String    | The password  (required)


```http
POST /login HTTP/1.1

{'username': 'johndoe', 'password': 'secretpassword'}

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

> JSON response upon success

```json
{
 "success": "Authentication succeeded."
}
```

### logout

POST /logout

```http
POST /logout HTTP/1.1
```

```python
client.logout()
```

> JSON response upon success

```json
{
 "success": "Logout succeeded."
}
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
{
 "_id": "555299eff80f910100d741d1",
 "description": "",
 "role": "user",
 "username": "johndoe"
}
```

### update password

PUT /me

```python
client.update_password('new_password')
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

> JSON response upon success

```json
{
  "success": "Password successfully updated."
}
```

## Users & Groups

### create new user 

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

POST /user 

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
username         | String    | The user name  (required, unique and without space, can't be updated)
password         | String    | The password  (required)
description      | free      | A description of the user
role             | String    | The user role ("admin" or "user")  (required)

```http
POST /user HTTP/1.1

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
{
 "_id": "558818da01e0ef01006e979b",
 "description": "annotator",
 "role": "user",
 "username": "johndoe"
}
```

### delete one user

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

DELETE /user/`:id_user`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier (required)

```python
client.deleteUser(id_user)
```

```http
DELETE /user/:id_user HTTP/1.1
```

> JSON response upon success

```json
{
 "success": "Successfully deleted."
}
```

### get all users

GET /user

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
username         | String    | filter users by username (optional)

```python
users = client.getUsers()
```

```http
GET /user HTTP/1.1
```


> Sample JSON response

```json
[
 {
  "_id": "5552998df80f910100d741d0",
  "description": "",
  "role": "admin",
  "username": "root"
 },
 {
  "_id": "558818da01e0ef01006e979b",
  "description": "annotator",
  "role": "user",
  "username": "johndoe"
 }
]
```

### get one user

GET /user/`:id_user`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier (required)

```python
user = client.getUser(id_user)
```

```http
GET /user/:id_user HTTP/1.1
```

> Sample JSON response

```json
{
 "_id": "558818da01e0ef01006e979b",
 "description": "annotator",
 "role": "user",
 "username": "johndoe"
}
```

### update one user

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

PUT /user/`:id_user`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
password         | String    | The password
description      | free      | A description of the user
role             | String    | The user role ("admin" or "user")

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
{
 "_id": "558818da01e0ef01006e979b",
 "description": "expert annotator",
 "role": "user",
 "username": "johndoe"
}
```

### get one user's groups

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

GET /user/`:id_user`/group

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier (required)

```http
GET /user/:id_user/group HTTP/1.1
```

```python
id_groups = client.getUserGroups(id_user)
```

> Sample JSON response

```json
[
 "55881d1601e0ef01006e979c"
]
```


### get all groups

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

GET /group

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | filter groups by name (optional)

```http
GET /group HTTP/1.1

{'name': 'project'}
```

```python
groups = client.getGroups()
```

> Sample JSON response

```json
[
 {
  "_id": "55881d1601e0ef01006e979c",
  "description": "members of the project",
  "name": "project",
  "users": ["558818da01e0ef01006e979b", "55881d6001e0ef01006e979d"]
 }
]
```

### get one group

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

GET /group/`:id_group`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier (required)

```http
GET /group/:id_group HTTP/1.1
```

```python
group = client.getGroup(id_group)
```

> Sample JSON response

```json
{
  "_id": "55881d1601e0ef01006e979c",
  "description": "members of the project",
  "name": "project",
  "users": ["558818da01e0ef01006e979b", "55881d6001e0ef01006e979d"]
}
```


### create new group

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

POST /group

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | The group name (can't be updated)
description      | free      | A description of the group

```http
POST /group HTTP/1.1

{'name': 'guests'}
```

```python
group = client.createGroup(
  'limsi', 
  description={'affiliation': 'LIMSI'})
```

> Sample JSON response

```json
{
 "_id": "55881f8301e0ef01006e979e",
 "description": "",
 "name": "guests",
 "users": []
}
```

### update one group

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

PUT /group/`:id_group`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
description      | free      | A description of the group


```http
PUT /group/:id_group HTTP/1.1

{ 'description': 'open trial'}
```

```python
group = client.updateGroup(
  id_group, 
  description={'affiliation': 'LIMSI/CNRS'})
```

> Sample JSON response

```json
{
 "_id": "55881f8301e0ef01006e979e",
 "description": "open trial",
 "name": "guests",
 "users": []
}
```

### delete one group

<aside class="warning">
Restricted to 'root' user.
</aside>

DELETE /group/`:id_group`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier (required)

```http
DELETE /group/:id_group HTTP/1.1
```

```python
client.deleteGroup(id_group)
```

> JSON response upon success

```json
{
 "success": "Successfully deleted."
}
```

### add one user to one group

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

PUT /group/`:id_group`/user/`:id_user`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier (required)
id_user          | String    | The user identifier (required)


```http
PUT /group/:id_group/user/:id_user HTTP/1.1
```

```python
client.addUserToGroup(id_user, id_group)
```

> Sample JSON response

```json
{
  "_id": "55881d1601e0ef01006e979c",
  "description": "members of the project",
  "name": "project",
  "users": ["558818da01e0ef01006e979b", "55881d6001e0ef01006e979d"]
}
```

### remove one user from one group

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

DELETE /group/`:id_group`/user/`:id_user`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier (required)
id_user          | String    | The user identifier (required)

```python
client.removeUserFromGroup(id_user, id_group)
```

```http
DELETE /group/:id_group/user/:id_user HTTP/1.1
```

> Sample JSON response

```json
{
  "_id": "55881d1601e0ef01006e979c",
  "description": "members of the project",
  "name": "project",
  "users": ["558818da01e0ef01006e979b"]
}
```

## Corpora

### get all READable corpora

GET /corpus

```python
corpora = client.getCorpora()
```

```http
GET /corpus HTTP/1.1
```

> Sample JSON response

```json
[
 {
  "_id": "555daefff80f910100d741d6",
  "description": "Test corpus",
  "name": "ctest"
 }
]
```

### get one corpus

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /corpus/`:id_corpus`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)

```python
corpus = client.getCorpus(id_corpus)
```

```http
GET /corpus/:id_corpus HTTP/1.1
```

> Sample JSON response

```json
{
  "_id": "555daefff80f910100d741d6",
  "description": "Test corpus",
  "name": "ctest"
}
```

### create new corpus

<aside class="notice">
Restricted to user with 'admin' role.
</aside>

POST /corpus

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | The corpus name (unique)
description      | free      | A description of the corpus

```python
corpus = client.createCorpus(
  'unique name', 
  description={'license': 'Creative Commons'})
```

```http
POST /corpus HTTP/1.1

{'name': 'unique name', 'description': {'license': 'Creative Commons'}}

```

> Sample JSON response

```json
{
 "_id": "555daefff80f910100d741d6",
 "description": {"license": "Creative Commons"},
 "name": "unique name"
}
```

### update one corpus

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /corpus/`:id_corpus`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | The corpus name (unique)
description      | free      | A description of the corpus

```python
corpus = client.updateCorpus(
  id_corpus, 
  name='new name', 
  description={'license': 'MIT'})
```

```http
PUT /corpus/:id_corpus HTTP/1.1

{'description': {'license': 'MIT'},
 'name': 'new name'}
```

> Sample JSON response

```json
{
 "_id": "555daefff80f910100d741d6",
 "description": {"license": "MIT"},
 "name": "new name"
}
```

### delete one corpus

<aside class="notice">
Restricted to user with 'admin' role and ADMIN permissions to the resource.
</aside>

<aside class="warning">This request also delete media, layers and annotations inside the corpus</aside>

DELETE /corpus/`:id_corpus`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)


```python
client.deleteCorpus(id_corpus)
```

```http
DELETE /corpus/:id_corpus HTTP/1.1
```

> JSON response upon success

```json
{
 "success": "Successfully deleted."
}
```

### get one corpus' permissions

<aside class="notice">
Restricted to user with ADMIN permissions to the resource.
</aside>

GET /corpus/`:id_corpus`/permissions

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)

```http
GET /corpus/:id_corpus/permissions HTTP/1.1
```

```python
permissions = client.getCorpusPermissions(id_corpus)
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

<aside class="notice">
Restricted to user with ADMIN permissions to the resource.
</aside>

PUT /corpus/`:id_corpus`/user/`:id_user`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)
id_user          | String    | The user identifier (required)


#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
right            | 1, 2 or 3 | The corpus permissions (1:READ, 2:WRITE, 3:ADMIN)

```python
client.setCorpusPermissions(id_corpus, client.ADMIN, user=id_user)
```

```http
PUT /corpus/:id_corpus/user/:id_user HTTP/1.1
{'right': 3}
```

> Sample JSON response

```json
{
  "users": {"555299eff80f910100d741d1": 3,
  "5552bf5cf80f910100d741d2": 2,
  "55881d6001e0ef01006e979d": 3}
}
```

### remove one user's permissions to one corpus

<aside class="notice">
Restricted to user with ADMIN permissions to the resource.
</aside>

DELETE /corpus/`:id_corpus`/user/`:id_user`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)
id_user          | String    | The user identifier (required)

```python
client.removeCorpusPermissions(id_corpus, user=id_user)
```

```http
DELETE /corpus/:id_corpus/user/:id_user HTTP/1.1
```

> Sample JSON response

```json
{
 "users": {"555299eff80f910100d741d1": 3,
  "5552bf5cf80f910100d741d2": 2}
}
```

### give one group permissions to one corpus

<aside class="notice">
Restricted to user with ADMIN permissions to the resource.
</aside>

PUT /corpus/`:id_corpus`/group/`:id_group`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)
id_group         | String    | The group identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
right            | 1, 2 or 3 | The corpus permissions (1:READ, 2:WRITE, 3:ADMIN)


```python
client.setCorpusPermissions(id_corpus, ADMIN, group=id_group)
```

```http
PUT /corpus/:id_corpus/group/:id_group HTTP/1.1
```

> Sample JSON response

```json
{
 "groups": {"55881d1601e0ef01006e979c": 2},
 "users": {"555299eff80f910100d741d1": 3, 
   "5552bf5cf80f910100d741d2": 2}
}
 ```

### remove one group's permissions to one corpus

<aside class="notice">
Restricted to user with ADMIN permissions to the resource.
</aside>

DELETE /corpus/`:id_corpus`/group/`:id_group`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)
id_group         | String    | The group identifier (required)

```python
client.removeCorpusPermissions(id_corpus, group=id_group)
```

```http
DELETE /corpus/:id_corpus/group/:id_group HTTP/1.1
```

> Sample JSON response

```json
{
 "users": {"555299eff80f910100d741d1": 3,
  "5552bf5cf80f910100d741d2": 2}
}
```

## Media

### get all media

<aside class="warning">
Restricted to 'root' user.
</aside>

GET /medium 

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | filter media by name

```python
client.getMedia()
```

```http
GET /medium HTTP/1.1
```

> Sample JSON response

```json
[
 {"_id": "...", "description": "", "id_corpus": "...", "name": "show1", "url": ""},
 {"_id": "...", "description": "", "id_corpus": "...", "name": "show2", "url": ""}
 ...
]
```

### get one medium

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /medium/:id_medium`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_medium        | String    | The medium identifier (required)

```python
client.getMedium(id_medium)
```

```http
GET /medium/:id_medium HTTP/1.1
```

> Sample JSON response

```json
{
  "_id": "555db2e6f80f910100d741d8",
  "description": "",
  "id_corpus": "555daefff80f910100d741d6",
  "name": "LCP_PileEtFace_2012-11-30_012500",
  "url": ""
}
```

### get one corpus' media

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /corpus/`:id_corpus`/medium

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | filter media by name

```python
client.getMedia(id_corpus)
```

```http
GET /corpus/:id_corpus/medium HTTP/1.1
```

> Sample JSON response

```json
{
  "_id": "555db2e6f80f910100d741d8",
  "description": "",
  "id_corpus": "555daefff80f910100d741d6",
  "name": "LCP_PileEtFace_2012-11-30_012500",
  "url": ""
}
```

### create new medium(a) in one corpus

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

POST /corpus/:id_corpus/medium

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | The medium name (unique)
url              | String    | absolute or relative URL to the medium
description      | free      | A description of the medium

OR list of {name, url, description}

```python
client.createMedium(id_corpus, name, url, description)

media = [{'name':'show1'}, {'name':'show2'}]
client.createMedia(id_corpus, media)
```

```http
POST /corpus/:id_corpus/medium HTTP/1.1

{'name': 'LCP_PileEtFace_2012-11-30_012500'}
```

> Sample JSON response

```json
{
 "_id": "55895e90c70125010026f6b5",
 "id_corpus": "558955cec70125010026f6aa",
 "name": "LCP_PileEtFace_2012-11-30_012500",
 "url": ""
}
```

### update one medium

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /medium/:id_medium

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_medium        | String    | The medium identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | The medium name (unique)
url              | String    | absolute or relative URL to the medium
description      | free      | A description of the medium

```python
client.updateMedium(id_medium, name, url, description)
```

```http
PUT /medium/:id_medium HTTP/1.1

{'description': 'LCP channel'}
```

> Sample JSON response

```json
{
 "_id": "55895e90c70125010026f6b5",
 "id_corpus": "558955cec70125010026f6aa",
 "name": "LCP_PileEtFace_2012-11-30_012500",
 "url": "",
 "description": "LCP channel"
}
 ```

### delete one medium

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /medium/:id_medium

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_medium        | String    | The medium identifier (required)

```python
client.deleteMedium(id_medium)
```

```http
DELETE /medium/:id_medium HTTP/1.1
```

> JSON response upon success

```json
{
 "success": "Successfully deleted."
}
```

### stream one medium in default format

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /medium/:id_medium/video

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_medium        | String    | The medium identifier (required)

```python
client.streamMedium(id_medium)
```

```http
GET /medium/:id_medium/video HTTP/1.1
```

### stream one medium in WebM, MP4 or OGV

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /medium/:id_medium/{webm,mp4,ogv}

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_medium        | String    | The medium identifier (required)

```python
client.streamMedium(id_medium, format='webm')
client.streamMedium(id_medium, format='mp4')
client.streamMedium(id_medium, format='ogv')
```

```http
GET /medium/:id_medium/webm HTTP/1.1

GET /medium/:id_medium/mp4 HTTP/1.1

GET /medium/:id_medium/ogv HTTP/1.1
```

 ## Layers

### get all layers

<aside class="warning">
Restricted to 'root' user.
</aside>

GET /layer

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | filter layers by name (optional)
fragment_type    | String    | filter layers by fragment type (optional)
data_type        | String    | filter layers by data type (optional)

```http
GET /layer HTTP/1.1
```

```python
layers = client.getLayers()
```

> Sample JSON response

```json
{

}
```

### get one layer

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /layer/:id_layer

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)

```http
GET /layer/:id_layer HTTP/1.1
```

```python
layer = client.getLayer(id_layer)
```

> Sample JSON response

```json
{

}
```

### get one corpus' layers

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /corpus/:id_corpus/layer

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
name             | String    | filter layers by name (optional)
fragment_type    | String    | filter layers by fragment type (optional)
data_type        | String    | filter layers by data type (optional)

```http
GET /corpus/:id_corpus/layer HTTP/1.1
```

```python
layer = client.getLayers(id_corpus)
```

> Sample JSON response

```json
{

}
```

### create new layer(s) in one corpus

<aside class="notice">Restricted to user with WRITE permissions to the resource.</aside>

POST /corpus/:id_corpus/layer

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)

#### DATA PARAMETERS
Key           | Type      | Description
------------- | --------- | -----------
name          | String    | layer name (required)
description   | free      | layer description (optional)
fragment_type | free      | layer fragment type (optional)
data_type     | free      | layer data type (optional)
annotations   | list      | list of annotations (optional)

```http
POST /corpus/:id_corpus/layer HTTP/1.1
```

```python
client.createLayer(id_corpus, name, description, fragment_type, data_type, annotations)
```

> Sample JSON response

```json
{

}
```

### update one layer

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /layer/:id_layer

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)

#### DATA PARAMETERS
Key           | Type      | Description
------------- | --------- | -----------
name          | String    | layer name (optional)
description   | free      | layer description (optional)
fragment_type | free      | layer fragment type (optional)
data_type     | free      | layer data type (optional)

```http
PUT /layer/:id_layer HTTP/1.1
```

```python
client.updateLayer(id_layer, name, description, fragment_type, data_type)
```

> Sample JSON response

```json
{

}
```

### delete one layer

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /layer/:id_layer

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)

```http
DELETE /layer/:id_layer HTTP/1.1
```

```python
client.deleteLayer(id_layer)
```

> Sample JSON response

```json
{

}
```

### get one layer's permissions

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

GET /layer/:id_layer/permissions

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)

```http
GET /layer/:id_layer/permissions HTTP/1.1
```

```python
permission = client.getLayerPermission(id_layer)
```

> Sample JSON response

```json
{

}
```

### give one user permissions to one layer

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /layer/:id_layer/user/:id_user

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)
id_user          | String    | The user identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
right            | 1, 2 or 3 | The layer permissions (1:READ, 2:WRITE, 3:ADMIN)

```http
PUT /layer/:id_layer/user/:id_user HTTP/1.1
```

```python
client.setLayerPermission(id_layer, permission, user=id_user)
```

> Sample JSON response

```json
{

}
```

### remove one user's permissions to one layer

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /layer/:id_layer/user/:id_user

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)
id_user          | String    | The user identifier (required)

```http
DELETE /layer/:id_layer/user/:id_user HTTP/1.1
```

```python
client.removeLayerPermission(id_layer, permission, user=id_user)
```

> Sample JSON response

```json
{

}
```

### give one group permissions to one layer

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /layer/:id_layer/group/:id_group 

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)
id_group         | String    | The group identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
right            | 1, 2 or 3 | The layer permissions (1:READ, 2:WRITE, 3:ADMIN)

```http
PUT /layer/:id_layer/group/:id_group HTTP/1.1
```

```python
client.setLayerPermission(id_layer, permission, group=id_group)
```

> Sample JSON response

```json
{

}
```

### remove on group's permissions to one layer

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /layer/:id_layer/group/:id_group

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)
id_group         | String    | The group identifier (required)

```http
DELETE /layer/:id_layer/group/:id_group HTTP/1.1
```

```python
client.removeLayerPermission(id_layer, permission, group=id_group)
```

> Sample JSON response

```json
{

}
```

## Annotations

### get all annotations

<aside class="warning">
Restricted to 'root' user.
</aside>

GET /annotation

#### DATA PARAMETERS
Key         | Type      | Description
----------- | --------- | -----------
id_medium   | String    | filter annotations by medium (optional)
fragment    | String    | filter annotations by fragment (optional)
data        | String    | filter annotations by data (optional)

```http
GET /annotation HTTP/1.1
```

```python
client.getAnnotations(medium=id_medium, fragment=fragment, data=data)
```

> Sample JSON response

```json
{

}
```

### get one annotation

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /annotation/:id_annotation

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_annotation    | String    | The annotation identifier (required)

```http
GET /annotation/:id_annotation HTTP/1.1
```

```python
client.getAnnotation(id_annotation)
```

> Sample JSON response

```json
{

}
```

### get one layer's annotations

<aside class="notice">Restricted to user with READ permissions to the resource.</aside>

GET /layer/:id_layer/annotation

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)

#### DATA PARAMETERS
Key         | Type      | Description
----------- | --------- | -----------
id_medium   | String    | filter annotations by medium (optional)
fragment    | String    | filter annotations by fragment (optional)
data        | String    | filter annotations by data (optional)

```http
GET /layer/:id_layer/annotation HTTP/1.1
```

```python
client.getAnnotations(id_layer, medium=id_medium, fragment=fragment, data=data)
```

> Sample JSON response

```json
{

}
```

### create new annotation(s) in one layer

<aside class="notice">Restricted to user with WRITE permissions to the resource.</aside>

POST /layer/:id_layer/annotation

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)

#### DATA PARAMETERS
Key           | Type      | Description
------------- | --------- | -----------
id_medium     | String    | medium identifier (required)
fragment      | free      | annotation fragment (required)
data          | free      | annotation data (required)

OR

list of {id_medium:..., fragment:..., data:...}

```http
POST /layer/:id_layer/annotation HTTP/1.1
```

```python
client.createAnnotation(id_layer, medium=id_medium, fragment=fragment, data=data)

OR

client.createAnnotations(id_layer,annotations)

```

> Sample JSON response

```json
{

}
```

### update one annotation

<aside class="notice">Restricted to user with WRITE permissions to the resource.</aside>

PUT /annotation/:id_annotation

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_annotation    | String    | The annotation identifier (required)

#### DATA PARAMETERS
Key           | Type      | Description
------------- | --------- | -----------
fragment      | free      | annotation fragment (optional)
data          | free      | annotation data (optional)

```http
PUT /annotation/:id_annotation HTTP/1.1
```

```python
client.updateAnnotation(id_annotation, fragment=fragment, data=data)
```

> Sample JSON response

```json
{

}
```

### delete one annotation

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /annotation/:id_annotation

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_annotation    | String    | The annotation identifier (required)

```http
DELETE /annotation/:id_annotation HTTP/1.1
```

```python
client.deleteAnnotation(id_annotation)
```

> Sample JSON response

```json
{

}
```

## Queues

### get all queues

GET /queue

#### DATA PARAMETERS
Key           | Type      | Description
------------- | --------- | -----------
name          | String    | queue name (optional)


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

<aside class="notice">Restricted to user with WRITE permissions to the resource.</aside>

GET /queue/:id_queue

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

```http
GET /queue/:id_queue HTTP/1.1
```

```python
queues = client.getQueue(id_queue)
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

<aside class="notice">Restricted to user with 'admin' role.</aside>

POST /queue

#### DATA PARAMETERS
Key           | Type      | Description
------------- | --------- | -----------
name          | String    | queue name (required)
description   | free      | queue description (optional)

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

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /queue/:id_queue

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

#### DATA PARAMETERS
Key           | Type      | Description
------------- | --------- | -----------
name          | String    | queue name (optional)
description   | free      | queue description (optional)
list          | list      | list of new queue elements (optional)

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

<aside class="notice">Restricted to user with WRITE permissions to the resource.</aside>

PUT /queue/:id_queue/next

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

#### DATA PARAMETERS
Type      | Description
--------- | -----------
list      | list of queue elements

```http
PUT /queue/:id_queue/next HTTP/1.1
```

```python
queue = client.enqueue(id_queue, items)
```

> Sample JSON response

```json
{

}
```

### pop one item from one queue

<aside class="notice">Restricted to user with WRITE permissions to the resource.</aside>

GET /queue/:id_queue/next

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

```http
GET /queue/:id_queue/next HTTP/1.1
```

```python
item = client.dequeue(id_queue)
```

### get next item on one queue (without actually removing it)

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

(Non-destructively) pick first element of queue

GET /queue/:id_queue/first

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

```http
GET /queue/:id_queue/first HTTP/1.1
```

```python
item = client.pick(id_queue)
```

### get number of items in one queue

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

(Non-destructively) get number of elements in queue

GET /queue/:id_queue/length

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

```http
GET /queue/:id_queue/length HTTP/1.1
```

```python
item = client.pickLength(id_queue)
```

### get all items from one queue

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

(Non-destructively) pick all elements of queue

GET /queue/:id_queue/all

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

```http
GET /queue/:id_queue/all HTTP/1.1
```

```python
item = client.pickAll(id_queue)
```

### remove one queue

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /queue/:id_queue

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

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

### get one queue's permissions

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

GET /queue/:id_queue/permissions

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)

```http
GET /queue/:id_queue/permissions HTTP/1.1
```

```python
client.getQueuePermissions(id_queue)
```

> Sample JSON response

```json
{

}
```

### give one user permissions to one queue

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /queue/:id_queue/user/:id_user

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)
id_user          | String    | The user identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
right            | 1, 2 or 3 | The queue permissions (1:READ, 2:WRITE, 3:ADMIN)

```http
PUT /queue/:id_queue/user/:id_user HTTP/1.1
```

```python
client.setQueuePermissions(id_queue, client.WRITE, user=id_user)
```

> Sample JSON response

```json
{

}
```

### remove one user's permissions to one queue

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /queue/:id_queue/user/:id_user

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)
id_user          | String    | The user identifier (required)

```http
DELETE /queue/:id_queue/user/:id_user HTTP/1.1
```

```python
client.removeQueuePermissions(id_queue, user=id_user)
```

> Sample JSON response

```json
{

}
```

### give one group permissions to one queue

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

PUT /queue/:id_queue/group/:id_group 

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)
id_group         | String    | The group identifier (required)

#### DATA PARAMETERS
Key              | Type      | Description
---------------- | --------- | -----------
right            | 1, 2 or 3 | The queue permissions (1:READ, 2:WRITE, 3:ADMIN)

```http
PUT /queue/:id_queue/group/:id_group HTTP/1.1
```

```python
client.setQueuePermissions(id_queue, client.WRITE, group=id_group)
```

> Sample JSON response

```json
{

}
```

### remove on group's permissions to one queue

<aside class="notice">Restricted to user with ADMIN permissions to the resource.</aside>

DELETE /queue/:id_queue/group/:id_group

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)
id_group         | String    | The group identifier (required)

```http
DELETE /queue/:id_queue/group/:id_group HTTP/1.1
```

```python
client.removeQueuePermissions(id_queue, group=id_group)
```

> Sample JSON response

```json
{

}
```

## Miscellaneous

### get current date/time

GET /date

```http
GET /date HTTP/1.1
```

> Sample JSON response

```json
{

}
```

```python
client.date()
```

