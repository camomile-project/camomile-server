# Philosophy

## Medium

A `medium` is a multimedia document (e.g. an audio file, an image or a video file).

attributes    | description
--------------|------------------------
`name`        |
`url`         |
`description` |
`history`     |
`id_corpus`   |


## Corpus

A `corpus` is simply a collection of `media` (e.g. all eight *Harry Potter* movies) -- nothing more.

attributes    | description
--------------|------------------------
`name`        |
`description` |
`history`     |
`permissions` |

## Fragment

A `fragment` is a *part* of a `medium` (e.g. a rectangular area of an image or a temporal segment of an audio file). 

A `fragment` can be anything -- be creative!

## Annotation

An `annotation` is a `fragment` and its associated `metadata` (e.g. the name of the person whose face is covered by the rectangular area).

Once again, a `metadata` can be anything -- be creative!

attributes    | description
--------------|------------------------
`fragment`    |
`data`        |
`history`     |
`id_layer`    |
`id_medium`   |

## Layer

A `layer` is simply a collection of `annotations` sharing the same `fragment` type and `metadata` type.

attributes      | description
----------------|------------------------
`name`          |
`description`   |
`fragment_type` |
`data_type`     |
`history`       |
`permissions`   |
`id_corpus`     |


## User

A `user` is a person with an account on the Camomile platform.

## Group

A `group` is simply a set of `users` -- how extraordinary!
