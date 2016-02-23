# Philosophy

## Medium

A `medium` is a multimedia document (e.g. an audio file, an image or a video file).

attributes    | type
--------------|------------------------
`name`        | String
`url`         | String
`description` | free
`history`     | list
`id_corpus`   | id


## Corpus

A `corpus` is simply a collection of `media` (e.g. all eight *Harry Potter* movies) -- nothing more.

attributes    | type
--------------|------------------------
`name`        | String
`description` | free
`history`     | list
`permissions` | dict

## Fragment

A `fragment` is a *part* of a `medium` (e.g. a rectangular area of an image or a temporal segment of an audio file). 

A `fragment` can be anything -- be creative!

## Annotation

An `annotation` is a `fragment` and its associated `metadata` (e.g. the name of the person whose face is covered by the rectangular area).

Once again, a `metadata` can be anything -- be creative!

attributes    | type
--------------|------------------------
`fragment`    | free
`data`        | free
`history`     | list
`id_layer`    | id
`id_medium`   | id

## Layer

A `layer` is simply a collection of `annotations` sharing the same `fragment` type and `metadata` type.

attributes      | type
----------------|------------------------
`name`          | String (lowercase) 
`description`   | free
`fragment_type` | free
`data_type`     | free
`history`       | list
`permissions`   | dict
`id_corpus`     | id


## User

A `user` is a person with an account on the Camomile platform.

attributes      | type
----------------|------------------------
`username`      | String (lowercase, unique)
`description`   | free
`role`          | "user" or "admin"

## Group

A `group` is simply a set of `users` -- how extraordinary!

attributes      | type
----------------|------------------------
`name`          | String (lowercase, unique)
`description`   | free
`users`         | list

## Queue

A `queue` is a list of items

attributes      | type
----------------|------------------------
`name`          | String (lowercase, unique)
`description`   | free
`list`          | list of items
