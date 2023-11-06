Geometry
========

The classes below provide an framework to manipulate geometric data such as points, tangent vectors, isometries, etc.
All the core files are geometry independent.
In particular, various methods need be overwritten for each geometry.

**Remark.**
For these classes, the constructor should a priori be different for each geometry.
In practice it often delegates the task to a `build` method --- see :meth:`Isometry.build` --- that can be overwritten easily unlike the constructor.
Another way to do would have been to implement for each geometry a new child class.
However it would produce a problem of simultaneous inheritance --- see for instance the :class:`Position` class whose methods may return an :class:`Isometry`.

.. js:autoclass:: Isometry
    :members:
    :private-members:

.. js:autoclass:: Point
    :members:
    :private-members:

.. js:autoclass:: Vector
    :members:
    :private-members:

.. js:autoclass:: Position
    :members:
    :private-members:

.. js:autoclass:: ./core/geometry/Group.Group
    :short-name:
    :members:
    :private-members:

.. js:autoclass:: ./core/geometry/GroupElement.GroupElement
    :short-name:
    :members:
    :private-members:

