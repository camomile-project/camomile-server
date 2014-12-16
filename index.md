---
title: API Reference

language_tabs:
  - shell
  - python
  - javascript

toc_footers:
  - <a href='http://github.com/tripit/slate'>Documentation Powered by Slate</a>

includes:
  - errors

search: true
---


# prerequisite

## Create an object user_client for python and javascript client

```javascript
````
```python
import camomile.client
user_client = camomile.client.CamomileClient(<username>, <password>, URL, <return_type>)
````

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
username         | String    | The user name  (required)
password         | String    | The password (required)
URL              | String    | base of the url (e.g. http://example.com/) (required)
return_type      | Bool      | "False" for a python dictionnary, "True" for an objectifier





# Authentication

## Login

```shell
curl -i -X POST http://example.com/login --data '{"username":<username>, "password":<password>}' -H "Content-Type: application/json" --cookie "cookies.txt" --cookie-jar "cookies.txt"
````
```javascript
````
```python
user_client.login(<username>, <password>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "You have been successfully logged in as user1"
}
```

#### HTTP request
`POST http://example.com/login`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
username         | String    | The user name (required) 
password         | String    | The password (required)





## Logout

<aside class="notice">Restriction: user logged in</aside>

```shell
curl -i -X POST http://example.com/logout -H "Content-Type: application/json" --cookie "cookies.txt" 

````
```javascript
````
```python
user_client.logout()
````
> The above command returns JSON structured like this:

```json
{
  "message": "user1 is logged out"
}
```

#### HTTP request
`POST http://example.com/logout`





## me

<aside class="notice">Restriction: user logged in</aside>


```shell
curl -i -X POST http://example.com/me -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.me()
````


> The above command returns JSON structured like this:

```json
{
  "description": "",
  "id_user": "5305d1a044dc07e805000003",
  "role": "admin",
  "username": "root"
}
```

#### HTTP request
`POST http://example.com/me`





# User

## Create new user

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X POST http://example.com/user --data '{"username":<username>, "password":<password>, "description":<description>, "role":<role>}' -H "Content-Type: application/json" --cookie "cookies.txt" 
````
```javascript
````
```python
user_client.create_user({"username":<username>, "password":<password>, "description":<description>, "role":<role>})
````

> The above command returns JSON structured like this:

```json
{
  "username": "n1",
  "description": {"abc":"def"},
  "role": "user",
  "_id": "5422bd9396a223a62d901c75"
}
```

#### HTTP request
`POST http://example.com/user`

#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
username         | String    | The user name  (required, unique in the db and can't be update, without wight space)
password         | String    | The password  (required)
description      | free      | A description of the user
role             | String    | The user role ("admin" or "user")  (required)




## Get list of users

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X GET http://example.com/user -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_user()
````

> The above command returns JSON structured like this:

```json
[
  {
    "username": "root",
    "role": "admin",
    "_id": "5305d1a044dc07e805000003"
  },
  {
    "username": "name1",
    "description": {"abc":"def"},
    "role": "user",
    "_id": "5422bd9396a223a62d901c75"
  }
]
```

#### HTTP request
`GET http://example.com/user`





## Get a user

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X GET http://example.com/user/<id_user> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_user(<id_user>)
````

> The above command returns JSON structured like this:

```json
{
  "username": "n1",
  "description": {"abc":"def"},
  "role": "user",
  "_id": "5422bd9396a223a62d901c75"
}
```

#### HTTP request
`GET http://example.com/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier to retrieve  (required)




 
## Update a user

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X PUT http://example.com/user/<id_user> --data '{"description":<description>, "password":<password>, "role":<role>}' -H "Content-Type: application/json" --cookie "cookies.txt"

````
```javascript
````
```python
user_client.update_user(id_user, {"description":<description>, "password":<password>, "role":<role>})
````

> The above command returns JSON structured like this:

```json
{
  "username": "n1",
  "description": {"abc":"def"},
  "role": "user",
  "_id": "5422bd9396a223a62d901c75"
}
```

#### HTTP request
`PUT http://example.com/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier to update  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | ----------- 
password         | String    | The password
description      | free      | A description of the user
role             | String    | The user role ("admin" or "user")





## Delete a user

<aside class="warning">Restriction: root user only</aside>

```shell
curl -i -X DELETE http://example.com/user/<id_user> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.delete_user(<id_user>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "The user as been delete"
}
```

#### HTTP request
`DELETE http://example.com/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier to delete  (required)





## Get all group of a user

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X GET http://example.com/user/<id_user>/group -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_group_of_a_user(<id_user>)
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "544a6e937f965ffe2ccf4b6c",
    "name": "g1",
    "users_list": [
      "5425834830841d2577a439b8"
    ],
    "description": {"abc":"def"}
  },
  {
    "_id": "544e049fd25b5c00001c1f2a",
    "name": "g2",
    "users_list": [
      "544a71c293a56e4f30e67686",
      "5425834830841d2577a439b8"
    ],
    "description": ""
  }
]
```

#### HTTP request
`GET http://example.com/user/<id_user>/group`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_user          | String    | The user identifier to delete  (required)




# Group


## Create new group

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X POST http://example.com/group --data '{"name":<name>, "description":<description>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.create_group(data)
````

> The above command returns JSON structured like this:

```json
{
    "_id": "544a6e937f965ffe2ccf4b6c",
    "name": "g1",
    "users_list": [
      "5425834830841d2577a439b8"
    ],
    "description": {"abc":"def"}
}
```

#### HTTP request
`POST http://example.com/group`

#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
name             | String    | The group name (unique in the db and can't be update) (required)
description      | free      | A description of the group





## Get list of groups

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X GET http://example.com/group -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_group()
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "544a6e937f965ffe2ccf4b6c",
    "name": "g1",
    "users_list": [
      "5425834830841d2577a439b8"
    ],
    "description": {"abc":"def"}
  }
]
```

#### HTTP request
`GET http://example.com/group`




## Get a group

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X GET http://example.com/group/<id_group> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_group(<id_group>)
````

> The above command returns JSON structured like this:

```json
{
  "_id": "544a6e937f965ffe2ccf4b6c",
  "name": "g1",
  "users_list": [
    "5425834830841d2577a439b8"
  ],
  "description": {"abc":"def"}
}
```

#### HTTP request
`GET http://example.com/group/<id_group>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier to get (required)





## Update a group

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X PUT http://example.com/group/<id_group> --data '{"description":<description>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_group(<id_group>, {"description":<description>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "544a6e937f965ffe2ccf4b6c",
  "name": "g1",
  "users_list": [
    "5425834830841d2577a439b8"
  ],
  "description": {"abc":"def"}
}
```

#### HTTP request
`PUT http://example.com/group/<id_group>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier to update (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
description      | free      | A description of the group





## Delete a group

<aside class="warning">Restriction: root user only</aside>

```shell
curl -i -X DELETE http://example.com/group/<id_group> -H "Content-Type: application/json" --cookie "cookies.txt"

````
```javascript
````
```python
user_client.delete_group(<id_group>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "The group as been delete"
}
```

#### HTTP request
`DELETE http://example.com/group/<id_group>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier to delete (required)





## Add user to a group

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X PUT http://example.com/group/<id_group>/user/<id_user> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.add_user_to_a_group(<id_group>, <id_user>)
````

> The above command returns JSON structured like this:

```json
{
  "_id": "544a6e937f965ffe2ccf4b6c",
  "name": "g1",
  "users_list": [
    "5425834830841d2577a439b8",
    "5305d1a044dc07e805000003"
  ],
  "description": {"abc":"def"}
}
```

#### HTTP request
`PUT http://example.com/group/<id_group>/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier (required)
id_user          | String    | The user identifier to delete (required)





## Remove user from a group

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X DELETE http://example.com/group/<id_group>/user/<id_user> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.remove_user_to_a_group(<id_group>, <id_user>)
````

> The above command returns JSON structured like this:

```json
{
  "_id": "544a6e937f965ffe2ccf4b6c",
  "name": "g1",
  "users_list": [
    "5425834830841d2577a439b8",
  ],
  "description": {"abc":"def"}
}
```

#### HTTP request
`DELETE http://example.com/group/<id_group>/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_group         | String    | The group identifier (required)
id_user          | String    | The user identifier to delete (required)







# Corpus



## Create a corpus

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X POST http://example.com/corpus --data '{"name":<name>, "description":<description>}' -H "Content-Type: application/json" --cookie "cookies.txt" 

````
```javascript
````
```python
user_client.create_corpus({"name":<name>, "description":<description>})
````

> The above command returns JSON structured like this:

```json
{
  "ACL": {
    "users": {
      "5305d1a044dc07e805000003": "O"
    }
  },
  "_id": "545385c6777a800000766be7",
  "description": {
    "abc": "def"
  },
  "history": [
    {
      "date": "2014-10-31T12:51:18.832Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "description": {
          "abc": "def"
        },
        "name": "corpus1"
      }
    }
  ],
  "name": "corpus1"
}
```

#### HTTP request
`POST http://example.com/corpus`

#### DATA PARAMETERS
Parameter         | Type      | Description
----------------- | --------- | -----------
name              | String    | The corpus name (required, unique)
description       | free      | A description of the corpus






## Get list of corpus

<aside class="notice">Restriction: only shows corpus where user/group rights is 'O' or 'W' or 'R' for these corpus</aside>


```shell
curl -i -X GET http://example.com/corpus -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_corpus()
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "54538552777a800000766be1",
    "description": {
      "abc": "def"
    },
    "history": [
      {
        "date": "2014-10-31T12:49:22.007Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "description": {
            "abc": "def"
          },
          "name": "corpus1"
        }
      }
    ],
    "name": "corpus1"
  },
  {
    "_id": "54538552777a800000766be2",
    "description": {
      "abc": "def"
    },
    "history": [
      {
        "date": "2014-10-31T12:49:22.011Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "description": {
            "abc": "def"
          },
          "name": "corpus2"
        }
      }
    ],
    "name": "corpus2"
  }
]
```

#### HTTP request
`GET http://example.com/corpus`





## Get a corpus

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for this corpus</aside>


```shell
curl -i -X GET http://example.com/corpus/<id_corpus> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_corpus(<id_corpus>)
````

> The above command returns JSON structured like this:

```json
{
  "_id": "545385a3777a800000766be5",
  "description": {
    "abc": "def"
  },
  "history": [
    {
      "date": "2014-10-31T12:50:43.307Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "description": {
          "abc": "def"
        },
        "name": "corpus1"
      }
    }
  ],
  "name": "corpus1"
}
```

#### HTTP request
`GET http://example.com/corpus/<id_corpus>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)





## Update a corpus

<aside class="notice">Restriction: user/group rights is 'O' for this corpus</aside>


```shell
curl -i -X PUT http://example.com/corpus/<id_corpus> --data '{"name":<name>, "description":<description>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_corpus(<id_corpus>, {"name":<name>, "description":<description>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "545386ce777a800000766beb",
  "description": {
    "abc": "def"
  },
  "history": [
    {
      "date": "2014-10-31T12:55:42.742Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "description": {
          "abc": "def"
        },
        "name": "corpus1"
      }
    },
    {
      "date": "2014-10-31T12:55:42.749Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "name": "corpus12"
      }
    }
  ],
  "name": "corpus12"
}
```

#### HTTP request
`PUT http://example.com/corpus/<id_corpus>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)



#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
name             | String    | Name of the corpus 
description      | free      | A description of the corpus





## Delete a corpus

<aside class="warning">Restriction: admin user only</aside>
<aside class="notice">Restriction: user/group rights is 'O' for this corpus</aside>

<aside class="warning">This request also delete media, layers and annotations inside the corpus</aside>



```shell
curl -i -X DELETE http://example.com/corpus/<id_corpus> -H "Content-Type: application/json" --cookie "cookies.txt"

````
```javascript
````
```python
user_client.delete_corpus(<id_corpus>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "The corpus as been delete"
}
```

#### HTTP request
`DELETE http://example.com/corpus/<id_corpus>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required)





## Add media into a corpus

<aside class="notice">Restriction: user/group rights is 'O' or 'W' for this corpus</aside>

For a medium {...} or a list of media [{...}, {...}]

```shell
curl -i -X POST http://example.com/corpus/<id_corpus>/media --data '{"name":<name>, "url":<url>, "description":<description>}' -H "Content-Type: application/json" --cookie "cookies.txt" 
curl -i -X POST http://example.com/corpus/<id_corpus>/media --data '[{"name":<name>, "url":<url>, "description":<description>}, {...}]' -H "Content-Type: application/json" --cookie "cookies.txt" 
````
```javascript
````
```python
user_client.add_media(<id_corpus>, {"name":<name>, "url":<url>, "description":<description>})
user_client.add_media(<id_corpus>, [{"name":<name>, "url":<url>, "description":<description>}, {...}])
````

> The above command returns JSON structured like this:

```json
{
  "_id": "5453874c777a800000766bf1",
  "history": [
    {
      "date": "2014-10-31T12:57:48.539Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "name": "media1",
        "url": "url_media1"
      }
    }
  ],
  "id_corpus": "5453874c777a800000766bf0",
  "name": "media1",
  "url": "url_media1"
}
```

#### HTTP request
`POST http://example.com/corpus/<id_corpus>/media`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
name             | String    | The media name (required, unique in the corpus)
url              | String    | Media url
description      | free      | A description of the media




## Create a layer into a corpus

<aside class="notice">Restriction: user/group rights is 'O' or 'W' for this corpus</aside>


```shell
curl -i -X POST http://example.com/corpus/<id_corpus>/layer --data '{"name":<name>, "description":<description>, "fragment_type":<fragment_typ>, "data_type":<data_typ>, "annotations":[{"media_name":<media_name>, "fragment":<fragment>, "data":<data>}]}' -H "Content-Type: application/json" --cookie "cookies.txt" 
````
```javascript
````
```python
user_client.add_layer(<id_corpus>, {"name":<name>, "description":<description>, "fragment_type":<fragment_typ>, "data_type":<data_typ>, "annotations":[{"media_name":<media_name>, "id_media":<id_media>, "fragment":<fragment>, "data":<data>}]})
````

> The above command returns JSON structured like this:

```json
{
  "ACL": {
    "users": {
      "5305d1a044dc07e805000003": "O"
    }
  },
  "_id": "545387f8777a800000766bf3",
  "description": {
    "abc": "def"
  },
  "history": [
    {
      "date": "2014-10-31T13:00:40.604Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "description": {
          "abc": "def"
        },
        "name": "new layer"
      }
    }
  ],
  "id_corpus": "545387f8777a800000766bf2",
  "name": "new layer"
}
```

#### HTTP request
`POST http://example.com/corpus/<id_corpus>/layer`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
name             | String    | Name of the layer (required, unique in the corpus)
description      | free      | A description of the layer
fragment_typ     | String    | The fragment type (required)
data_typ         | String    | The data type (required)
annotations      | List      | list of annotations (<media_name> OR <id_media>, <fragment>, <data>) to add to the new layer




## Get list of medias into a corpus

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for this corpus</aside>


```shell
curl -i -X GET http://example.com/corpus/<id_corpus>/media -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_media_of_a_corpus(<id_corpus>)
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "54538cbf777a800000766bfa",
    "description": {
      "abc": "def"
    },
    "history": [
      {
        "date": "2014-10-31T13:21:03.288Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "description": {
            "abc": "def"
          },
          "name": "media1",
          "url": "url_media1"
        }
      }
    ],
    "id_corpus": "54538cbf777a800000766bf9",
    "name": "media1",
    "url": "url_media1"
  }
]
```

#### HTTP request
`GET http://example.com/corpus/<id_corpus>/media`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)







## Get list of layers into a corpus

<aside class="notice">Restriction: only shows layers where user/group rights is 'O' or 'W' or 'R' for these layers</aside>


```shell
curl -i -X GET http://example.com/corpus/<id_corpus>/layer -H "Content-Type: application/json" --cookie "cookies.txt"

````
```javascript
````
```python
user_client.get_all_layer_of_a_corpus(<id_corpus>)
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "54538c8e777a800000766bf6",
    "data_type": "",
    "description": {
      "abc": "def"
    },
    "fragment_type": "",
    "history": [
      {
        "date": "2014-10-31T13:20:14.205Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "description": {
            "abc": "def"
          },
          "name": "new layer"
        }
      }
    ],
    "id_corpus": "54538c8e777a800000766bf5",
    "name": "new layer"
  }
]
```

#### HTTP request
`GET http://example.com/corpus/<id_corpus>/layer`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier (required) 






## get ACL of a corpus

<aside class="notice">Restriction: user/group rights is 'O' for this corpus</aside>


```shell
curl -i -X GET http://example.com/corpus/<id_corpus>/ACL -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_ACL_of_a_corpus(<id_corpus>)
````

> The above command returns JSON structured like this:

```json
{
  "ACL": {
    "groups": {
      "5453beb5d7007fe508e24246": "R"
    },
    "users": {
      "5305d1a044dc07e805000003": "O",
      "5453beb5d7007fe508e24244": "W"
    }
  },
  "_id": "5453beb5d7007fe508e24243"
}
```

#### HTTP request
`GET http://example.com/corpus/<id_corpus>/ACL`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)





## update user ACL of a corpus

<aside class="notice">Restriction: user/group rights is 'O' for this corpus</aside>

<aside class="warning">User rights exceeds group rights</aside>


```shell
curl -i -X PUT http://example.com/corpus/<id_corpus>/user/<id_user> --data '{"right":<right>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_user_ACL_of_a_corpus(<id_corpus>, <id_user>, {"right":<right>})
````

> The above command returns JSON structured like this:

```json
{
  "users": {
    "5305d1a044dc07e805000003": "O",
    "5453bef0d7007fe508e24248": "W"
  }
}
```

#### HTTP request
`PUT http://example.com/corpus/<id_corpus>/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)
id_user          | String    | The user identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
right            | String    | 'O' for Owner, 'W' for Writter, 'R' for Reader (required)

    

    
## update group ACL of a corpus

<aside class="notice">Restriction: user/group rights is 'O' for this corpus</aside>


```shell
curl -i -X PUT http://example.com/corpus/<id_corpus>/group/<id_group> --data '{"right":<right>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_group_ACL_of_a_corpus(<id_corpus>, <id_group>, {"right":<right>})
````

> The above command returns JSON structured like this:

```json
{
  "groups": {
    "5453bef0d7007fe508e2424a": "R"
  },
  "users": {
    "5305d1a044dc07e805000003": "O",
    "5453bef0d7007fe508e24248": "W"
  }
}
```

#### HTTP request
`PUT http://example.com/corpus/<id_corpus>/group/<id_group>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)
id_group         | String    | The user identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
right            | String    | 'O' for Owner, 'W' for Writter, 'R' for Reader (required)



    
## remove user from ACL of a corpus

<aside class="notice">Restriction: user/group rights is 'O' for this corpus</aside>

```shell
curl -i -X DELETE http://example.com/corpus/<id_corpus>/group/<id_group>  -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.remove_user_from_ACL_of_a_corpus(<id_corpus>, <id_user>)
````

> The above command returns JSON structured like this:

```json
{
  "groups": {
    "5453bf22d7007fe508e2424e": "R"
  },
  "users": {
    "5305d1a044dc07e805000003": "O"
  }
}
```

#### HTTP request
`DELETE http://example.com/corpus/<id_corpus>/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)
id_user          | String    | The user identifier  (required)



    
## remove group from ACL of a corpus

<aside class="notice">Restriction: user/group rights is 'O' for this corpus</aside>

```shell
curl -i -X DELETE http://example.com/corpus/<id_corpus>/group/<id_group>  -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.remove_group_from_ACL_of_a_corpus(<id_corpus>, <id_group>)
````

> The above command returns JSON structured like this:

```json
{
  "groups": null,
  "users": {
    "5305d1a044dc07e805000003": "O"
  }
}
```

#### HTTP request
`DELETE http://example.com/corpus/<id_corpus>/group/<id_group>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_corpus        | String    | The corpus identifier  (required)
id_group         | String    | The user identifier  (required)
    







# Media

## get all media

<aside class="warning">Restriction: root user only</aside>

```shell
curl -i -X GET http://example.com/media -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_media()
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "54538cbf777a800000766bfa",
    "description": {
      "abc": "def"
    },
    "history": [
      {
        "date": "2014-10-31T13:21:03.288Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "description": {
            "abc": "def"
          },
          "name": "media1",
          "url": "url_media1"
        }
      }
    ],
    "id_corpus": "54538cbf777a800000766bf9",
    "name": "media1",
    "url": "url_media1"
  }
]
```

#### HTTP request
`GET http://example.com/media`









## Get a media

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the corresponding corpus</aside>

```shell
curl -i -X GET http://example.com/media/<id_media> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_media(<id_media>)
````

> The above command returns JSON structured like this:

```json
{
  "_id": "545393bf777a800000766bfc",
  "description": {
    "abc": "def"
  },
  "history": [
    {
      "date": "2014-10-31T13:50:55.181Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "description": {
          "abc": "def"
        },
        "name": "media1",
        "url": "url_media1"
      }
    }
  ],
  "id_corpus": "545393bf777a800000766bfb",
  "name": "media1",
  "url": "url_media1"
}
```

#### HTTP request
`GET http://example.com/media/<id_media>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier   (required)  





## Update a media

<aside class="notice">Restriction: user/group rights is 'O' for the corresponding corpus</aside>


```shell
curl -i -X PUT http://example.com/media/<id_media> --data '{"name":<name>, "url":<url>, "description":<description>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_media(<id_media>, {"name":<name>, "url":<url>, "description":<description>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "5453946fb32f8d9106fb0fe8",
  "description": {
    "abc": "def"
  },
  "history": [
    {
      "date": "2014-10-31T13:53:51.524Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "description": {
          "abc": "def"
        },
        "name": "media1",
        "url": "url_media1"
      }
    },
    {
      "date": "2014-10-31T13:53:51.536Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "url": "newurl_media1"
      }
    }
  ],
  "id_corpus": "5453946fb32f8d9106fb0fe7",
  "name": "media1",
  "url": "newurl_media1"
}
```

#### HTTP request
`PUT http://example.com/media/<id_media>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
name             | String    | The media name     
url              | String    | Media url
description      | free      | A description of the media





## Delete a media

<aside class="notice">Restriction: user/group rights is 'O' for the corresponding corpus</aside>

```shell
curl -i -X DELETE http://example.com/media/<id_media> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.delete_media(<id_media>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "The media as been delete"
}
```

#### HTTP request
`DELETE http://example.com/media/<id_media>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier  (required)





## Read video

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the corresponding corpus</aside>


```shell
curl -i -X DELETE http://example.com/media/<id_media>/video -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_media_video_stream(<id_media>)
````

> The above command returns video stream

#### HTTP request
`GET http://example.com/media/<id_media>/video`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier  (required)






## Read webm

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the corresponding corpus</aside>


```shell
curl -i -X DELETE http://example.com/media/<id_media>/webm -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_media_webm_stream(<id_media>)
````

> The above command webm stream

#### HTTP request
`GET http://example.com/media/<id_media>/webm`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier  (required)






## Read mp4

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the corresponding corpus</aside>

```shell
curl -i -X DELETE http://example.com/media/<id_media>/mp4 -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_media_mp4_stream(<id_media>)
````

> The above command returns mp4 stream



#### HTTP request
`GET http://example.com/media/<id_media>/mp4`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier  (required)





## Read ogv

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the corresponding corpus</aside>

```shell
curl -i -X DELETE http://example.com/media/<id_media>/ogv -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_media_ogv_stream(<id_media>)
````

> The above command returns ogv stream

#### HTTP request
`GET http://example.com/media/<id_media>/ogv`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier  (required)







# Layer


## Get list of layers

<aside class="warning">Restriction: root user only</aside>


```shell
curl -i -X GET http://example.com/layer -H "Content-Type: application/json" --cookie "cookies.txt"

````
```javascript
````
```python
user_client.get_all_layer()
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "54538c8e777a800000766bf6",
    "data_type": "",
    "description": {
      "abc": "def"
    },
    "fragment_type": "",
    "history": [
      {
        "date": "2014-10-31T13:20:14.205Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "description": {
            "abc": "def"
          },
          "name": "new layer"
        }
      }
    ],
    "id_corpus": "54538c8e777a800000766bf5",
    "name": "new layer"
  }
]
```

#### HTTP request
`GET http://example.com/layer`








## Get a layer

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the layer</aside>

```shell
curl -i -X GET http://example.com/layer/<id_layer> -H "Content-Type: application/json" --cookie "cookies.txt"

````
```javascript
````
```python
user_client.get_layer(<id_layer>)
````

> The above command returns JSON structured like this:

```json

```

#### HTTP request
`GET http://example.com/layer/<id_layer>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)






## Update a layer

<aside class="notice">Restriction: user/group rights is 'O' for the layer</aside>

```shell
curl -i -X PUT http://example.com/layer/<id_layer> --data '{"name":<name>, "description":<description>, "fragment_type":<fragment_typ>, "data_type":<data_typ>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_layer(<id_layer>, {"name":<name>, "description":<description>, "fragment_type":<fragment_typ>, "data_type":<data_typ>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "54539672b32f8d9106fb0fee",
  "data_type": "",
  "description": {
    "abc": "def"
  },
  "fragment_type": "",
  "history": [
    {
      "date": "2014-10-31T14:02:26.609Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "description": {
          "abc": "def"
        },
        "name": "layer1"
      }
    },
    {
      "date": "2014-10-31T14:02:26.619Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {}
    }
  ],
  "id_corpus": "54539672b32f8d9106fb0fed",
  "name": "layer1"
}
```

#### HTTP request
`PUT http://example.com/layer/<id_layer>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
name             | String    | Name of the layer
description      | free      | A description of the layer
fragment_typ     | String    | The fragment type
data_typ         | String    | The data type




## Delete a layer

<aside class="notice">Restriction: user/group rights is 'O' for the layer</aside>

<aside class="warning">This request also delete annotations inside the layer</aside>

```shell
curl -i -X DELETE http://example.com/layer/<id_layer> -H "Content-Type: application/json" --cookie "cookies.txt"

````
```javascript
````
```python
user_client.delete_layer(<id_layer>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "The layer as been delete"
}
```

#### HTTP request
`DELETE http://example.com/layer/<id_layer>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier  (required)



## Add annotation into layer

<aside class="notice">Restriction: user/group rights is 'O' or 'W' for the layer</aside>

For an annotation {...} or a list of annotations [{...}, {...}]


```shell
curl -i -X POST http://example.com/layer/<id_layer>/annotation --data '{"id_media":<id_media>, "fragment":<fragment>, "data":<data>}' -H "Content-Type: application/json" --cookie "cookies.txt" 
curl -i -X POST http://example.com/layer/<id_layer>/annotation --data '[{"id_media":<id_media>, "fragment":<fragment>, "data":<data>}, {...}]' -H "Content-Type: application/json" --cookie "cookies.txt" 
````
```javascript
````
```python
user_client.add_annotation(<id_layer>, {"id_media":<id_media>, "fragment":<fragment>, "data":<data>})
user_client.add_annotation(<id_layer>, [{"id_media":<id_media>, "fragment":<fragment>, "data":<data>}, {...}])
````

> The above command returns JSON structured like this:

```json
{
  "_id": "5453978db32f8d9106fb0ffb",
  "data": "data",
  "fragment": "fragment",
  "history": [
    {
      "date": "2014-10-31T14:07:09.376Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "data": "data1",
        "fragment": "fragment1"
      }
    }
  ],
  "id_layer": "5453978db32f8d9106fb0ffa",
  "id_media": "5453978db32f8d9106fb0ff9"
}
```

#### HTTP request
`POST http://example.com/layer/<id_layer>/annotation`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
annotation_list  | list      | list of annotation to add
id_media         | String    | The media identifier
fragment         | Free      | Fragment (required)
data             | Free      | Data (required)



## Get list of annotations into a layer

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the layer</aside>

```shell
curl -i -X GET http://example.com/layer/<id_layer>/annotation?media=<media> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_annotation_of_a_layer(<id_layer>, <media>)
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "5453988cb32f8d9106fb1036",
    "data": "data1",
    "fragment": "fragment1",
    "history": [
      {
        "date": "2014-10-31T14:11:24.615Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "data": "data1",
          "fragment": "fragment1"
        }
      }
    ],
    "id_layer": "5453988cb32f8d9106fb1035",
    "id_media": "5453988cb32f8d9106fb1034"
  },
  {
    "_id": "5453988cb32f8d9106fb1037",
    "data": "data2",
    "fragment": "fragment2",
    "history": [
      {
        "date": "2014-10-31T14:11:24.623Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "data": "data2",
          "fragment": "fragment2"
        }
      }
    ],
    "id_layer": "5453988cb32f8d9106fb1035",
    "id_media": "5453988cb32f8d9106fb1034"
  }
]
```

#### HTTP request
`GET http://example.com/layer/<id_layer>/annotation?media=<media>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier  (required)
media            | String    | id_media to filter annotation (optional)





## get ACL of a layer

<aside class="notice">Restriction: user/group rights is 'O' for the layer</aside>

```shell
curl -i -X GET http://example.com/layer/<id_layer>/ACL -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_ACL_of_a_layer(<id_layer>)
````

> The above command returns JSON structured like this:

```json
{
  "ACL": {
    "groups": {
      "5453beb5d7007fe508e24246": "R"
    },
    "users": {
      "5305d1a044dc07e805000003": "O",
      "5453beb5d7007fe508e24244": "W"
    }
  },
  "_id": "5453beb5d7007fe508e24243"
}
```

#### HTTP request
`GET http://example.com/layer/<id_layer>/ACL`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier  (required)





## update user ACL of a layer

<aside class="notice">Restriction: user/group rights is 'O' for the layer</aside>

<aside class="warning">User rights exceeds group rights</aside>

```shell
curl -i -X PUT http://example.com/layer/<id_layer>/user/<id_user> --data '{"right":<right>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_user_ACL_of_a_layer(<id_layer>, <id_user>, {"right":<right>})
````

> The above command returns JSON structured like this:

```json
{
  "users": {
    "5305d1a044dc07e805000003": "O",
    "5453bf22d7007fe508e2424c": "W"
  }
}
```

#### HTTP request
`PUT http://example.com/layer/<id_layer>/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier  (required)
id_user          | String    | The user identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
right            | String    | 'O' for Owner, 'W' for Writter, 'R' for Reader (required)

    

    
## update group ACL of a layer

<aside class="notice">Restriction: user/group rights is 'O' for the layer</aside>

```shell
curl -i -X PUT http://example.com/layer/<id_layer>/group/<id_group> --data '{"right":<right>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_group_ACL_of_a_layer(<id_layer>, <id_group>, {"right":<right>})
````

> The above command returns JSON structured like this:

```json
{
  "groups": {
    "5453bf22d7007fe508e2424e": "R"
  },
  "users": {
    "5305d1a044dc07e805000003": "O",
    "5453bf22d7007fe508e2424c": "W"
  }
}
```

#### HTTP request
`PUT http://example.com/layer/<id_layer>/group`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier  (required)
id_group         | String    | The user identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
right            | String    | 'O' for Owner, 'W' for Writter, 'R' for Reader (required)



    
## remove user from ACL of a layer

<aside class="notice">Restriction: user/group rights is 'O' for the layer</aside>

```shell
curl -i -X DELETE http://example.com/layer/<id_layer>/user/<id_user>  -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.remove_user_from_ACL_of_a_layer(<id_layer>, <id_user>)
````

> The above command returns JSON structured like this:

```json
{
  "groups": {
    "5453bf22d7007fe508e2424e": "R"
  },
  "users": {
    "5305d1a044dc07e805000003": "O"
  }
}
```

#### HTTP request
`DELETE http://example.com/layer/<id_layer>/user/<id_user>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier  (required)
id_user          | String    | The user identifier  (required)



    
## remove group from ACL of a layer

<aside class="notice">Restriction: user/group rights is 'O' for the layer</aside>

```shell
curl -i -X DELETE http://example.com/layer/<id_layer>/group/<id_group>  -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.remove_group_from_ACL_of_a_layer(<id_layer>, <id_group>)
````

> The above command returns JSON structured like this:

```json
{
  "groups": null,
  "users": {
    "5305d1a044dc07e805000003": "O"
  }
}
```

#### HTTP request
`DELETE http://example.com/layer/<id_layer>/group/<id_group>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_layer         | String    | The layer identifier (required) 
id_group         | String    | The user identifier  (required)










# Annotation

## Get all annotation

<aside class="warning">Restriction: root user only</aside>


```shell
curl -i -X GET http://example.com/annotation -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_annotation()
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "545398bbb32f8d9106fb103b",
    "data": "data1",
    "fragment": "fragment1",
    "history": [
      {
        "date": "2014-10-31T14:12:11.029Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "data": "data1",
          "fragment": "fragment1"
        }
      }
    ],
    "id_layer": "545398bbb32f8d9106fb103a",
    "id_media": "545398bbb32f8d9106fb1039"
  },
  {
    "_id": "545398bbb32f8d9106fb103c",
    "data": "data2",
    "fragment": "fragment2",
    "history": [
      {
        "date": "2014-10-31T14:12:11.034Z",
        "id_user": "5305d1a044dc07e805000003",
        "modification": {
          "data": "data2",
          "fragment": "fragment2"
        }
      }
    ],
    "id_layer": "545398bbb32f8d9106fb103a",
    "id_media": "545398bbb32f8d9106fb1039"
  }
]
```

#### HTTP request
`GET http://example.com/annotation`










## Get an annotation

<aside class="notice">Restriction: user/group rights is 'O' or 'W' or 'R' for the corresponding layer</aside>

```shell
curl -i -X GET http://example.com/annotation/<id_annotation> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_annotation(<id_annotation>)
````

> The above command returns JSON structured like this:

```json
{
  "_id": "545398f9b32f8d9106fb1040",
  "data": "data1",
  "fragment": "fragment1",
  "history": [
    {
      "date": "2014-10-31T14:13:13.587Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "data": "data1",
        "fragment": "fragment1"
      }
    }
  ],
  "id_layer": "545398f9b32f8d9106fb103f",
  "id_media": "545398f9b32f8d9106fb103e"
}
```

#### HTTP request
`GET http://example.com/annotation/<id_annotation>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_annotation    | String    | The annotation identifier  (required)




## Update an annotation

<aside class="notice">Restriction: user/group rights is 'O' or 'W' for the corresponding layer</aside>

```shell
curl -i -X PUT http://example.com/annotation/<id_annotation> --data '{"id_media":<id_media>, "fragment":<fragment>, "data":<data>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_annotation(<id_annotation>, {"id_media":<id_media>, "fragment":<fragment>, "data":<data>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "54539922b32f8d9106fb1044",
  "data": "data2",
  "fragment": "fragment1",
  "history": [
    {
      "date": "2014-10-31T14:13:54.109Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "data": "data1",
        "fragment": "fragment1"
      }
    },
    {
      "date": "2014-10-31T14:13:54.117Z",
      "id_user": "5305d1a044dc07e805000003",
      "modification": {
        "data": "data2"
      }
    }
  ],
  "id_layer": "54539922b32f8d9106fb1043",
  "id_media": "54539922b32f8d9106fb1042"
}
```

#### HTTP request
`PUT http://example.com/annotation/<id_annotation>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_media         | String    | The media identifier  (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
fragment         | Free      | Fragment
data             | Free      | Data




## Delete an annotation

<aside class="notice">Restriction: user/group rights is 'O' for the corresponding layer</aside>

```shell
curl -i -X DELETE http://example.com/annotation/<id_annotation> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.delete_annotation(<id_annotation>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "The annotation as been delete"
}
```

#### HTTP request
`DELETE http://example.com/annotation/<id_annotation>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_annotation    | String    | The annotation identifier (required)






# Queues

## Create a queue

<aside class="notice">Restriction: user logged in</aside>

```shell
curl -i -X POST http://example.com/queue --data '{"name":<name>, "description":<description>}' -H "Content-Type: application/json" --cookie "cookies.txt" 
````
```javascript
````
```python
user_client.create_queue({"name":<name>, "description":<description>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "5453bfc5d7007fe508e2424f",
  "description": {
    "abc": "def"
  },
  "list": [],
  "name": "queue1"
}
```

#### HTTP request
`POST http://example.com/queue`

#### DATA PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
name             | String    | The queue name (required)
description      | free      | A description of the media




## Get all queues

<aside class="notice">Restriction: root user only</aside>

```shell
curl -i -X GET http://example.com/queue -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_all_queue()
````

> The above command returns JSON structured like this:

```json
[
  {
    "_id": "5453bfe5d7007fe508e24250",
    "description": {
      "abc": "def"
    },
    "list": [],
    "name": "queue1"
  },
  {
    "_id": "5453bfe5d7007fe508e24251",
    "description": {
      "abc": "def"
    },
    "list": [],
    "name": "queue2"
  }
]
```

#### HTTP request
`GET http://example.com/queue`




## Get a queue

<aside class="notice">Restriction: user logged in</aside>

```shell
curl -i -X GET http://example.com/queue/<id_queue> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_queue(<id_queue>)
````

> The above command returns JSON structured like this:

```json
{
  "_id": "5453bfffd7007fe508e24252",
  "description": {
    "abc": "def"
  },
  "list": [],
  "name": "queue1"
}
```

#### HTTP request
`GET http://example.com/queue/<id_queue>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)






## Update a queue

<aside class="notice">Restriction: user logged in</aside>

```shell
curl -i -X PUT http://example.com/queue/<id_queue> --data '{"name":<name>, "description":<description>, "list":<list>}}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.update_queue(<id_queue>, {"name":<name>, "description":<description>, "list":<list>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "5453c083d7007fe508e24258",
  "description": {
    "abc": "def"
  },
  "list": [
    "1",
    "2",
    "3"
  ],
  "name": "queue1"
}
```

#### HTTP request
`PUT http://example.com/queue/<id_queue>`

#### QUERY PARAMETERS
Parameter          | Type       | Description
------------------ | ---------- | -----------
id_queue           | String     | The queue identifier (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
name               | String     | The queue name
description        | free       | A description of the media
list               | list       | queue contain





## Push into a queue

<aside class="notice">Restriction: user logged in</aside>

```shell
curl -i -X PUT http://example.com/queue/<id_queue>/next --data '{"id_list":<list>}' -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.push_into_a_queue(<id_queue>, {"id_list":<list>})
````

> The above command returns JSON structured like this:

```json
{
  "_id": "5453c0c4d7007fe508e2425a",
  "description": {
    "abc": "def"
  },
  "list": [
    "1",
    "2",
    "3",
    "3",
    "4",
    "5"
  ],
  "name": "queue1"
}
```

#### HTTP request
`PUT http://example.com/queue/<id_queue>/next`

#### QUERY PARAMETERS
Parameter          | Type       | Description
------------------ | ---------- | -----------
id_queue           | String     | The queue identifier (required)


#### DATA PARAMETERS
Parameter        | Type      | Description
list               | list       | queue contain (required)





## Pop a queue

<aside class="notice">Restriction: user logged in</aside>

```shell
curl -i -X GET http://example.com/queue/<id_queue>/next -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.pop_a_queue(<id_queue>)
````

> The above command returns JSON structured like this:

```json
"1"
```

#### HTTP request
`GET http://example.com/queue/<id_queue>/next`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)






## Delete a queue

<aside class="notice">Restriction: admin user only</aside>

```shell
curl -i -X DELETE http://example.com/queue/<id_queue> -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.delete_queue(<id_queue>)
````

> The above command returns JSON structured like this:

```json
{
  "message": "The queue as been delete"
}
```

#### HTTP request
`DELETE http://example.com/queue/<id_queue>`

#### QUERY PARAMETERS
Parameter        | Type      | Description
---------------- | --------- | -----------
id_queue         | String    | The queue identifier (required)



# tools

## Get server date

<aside class="notice">Restriction: user logged in</aside>

```shell
curl -i -X GET http://example.com/date -H "Content-Type: application/json" --cookie "cookies.txt"
````
```javascript
````
```python
user_client.get_date()
````

> The above command returns JSON structured like this:

```json
{
  "date": "2014-11-03T10:21:27.549Z"
}
```

#### HTTP request
`GET http://example.com/date`


