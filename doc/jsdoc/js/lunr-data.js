window.lunrData = {
  "index": {
    "version": "1.0.0",
    "fields": [
      {
        "name": "longname",
        "boost": 1000
      },
      {
        "name": "name",
        "boost": 500
      },
      {
        "name": "tags",
        "boost": 300
      },
      {
        "name": "kind",
        "boost": 110
      },
      {
        "name": "title",
        "boost": 100
      },
      {
        "name": "summary",
        "boost": 70
      },
      {
        "name": "description",
        "boost": 50
      },
      {
        "name": "body",
        "boost": 1
      }
    ],
    "ref": "id",
    "tokenizer": "default",
    "documentStore": {
      "store": {
        "index.html": [
          "euclidean",
          "explor",
          "first",
          "geoemtri",
          "index",
          "non",
          "person",
          "readm",
          "thurston'",
          "vr"
        ],
        "global.html": [
          "document",
          "global"
        ],
        "list_class.html": [
          "class",
          "document",
          "list",
          "list:class"
        ],
        "list_module.html": [
          "document",
          "list",
          "list:modul",
          "modul"
        ],
        "Isometry.html": [
          "class",
          "geometri",
          "isometri"
        ],
        "Isometry.html#build": [
          "argument",
          "build",
          "constructor",
          "fake",
          "function",
          "ident",
          "isometry#build",
          "lt;abstract&gt",
          "pass",
          "return"
        ],
        "Isometry.html#set": [
          "current",
          "data",
          "function",
          "given",
          "isometri",
          "isometry#set",
          "lt;abstract&gt",
          "set"
        ],
        "Isometry.html#reduceError": [
          "current",
          "error",
          "eventu",
          "function",
          "gram",
          "isometri",
          "isometry#reduceerror",
          "lt;abstract&gt",
          "numer",
          "reduc",
          "reduceerror",
          "schmidt",
          "typic"
        ],
        "Isometry.html#multiply": [
          "current",
          "function",
          "i.",
          "isom",
          "isometri",
          "isometry#multipli",
          "left",
          "lt;abstract&gt",
          "multipli",
          "replac"
        ],
        "Isometry.html#premultiply": [
          "current",
          "function",
          "i.",
          "isom",
          "isometri",
          "isometry#premultipli",
          "lt;abstract&gt",
          "multipli",
          "premultipli",
          "replac",
          "right"
        ],
        "Isometry.html#getInverse": [
          "current",
          "function",
          "getinvers",
          "invers",
          "isom",
          "isometri",
          "isometry#getinvers",
          "lt;abstract&gt",
          "set"
        ],
        "Isometry.html#makeTranslation": [
          "etc",
          "function",
          "given",
          "isometri",
          "isometry#maketransl",
          "lt;abstract&gt",
          "maketransl",
          "nil",
          "origin",
          "point",
          "prefer",
          "return",
          "send",
          "sl2",
          "sol",
          "typic"
        ],
        "Isometry.html#makeInvTranslation": [
          "etc",
          "function",
          "given",
          "isometri",
          "isometry#makeinvtransl",
          "lt;abstract&gt",
          "makeinvtransl",
          "nil",
          "origin",
          "point",
          "prefer",
          "return",
          "send",
          "sl2",
          "sol",
          "typic"
        ],
        "Isometry.html#equals": [
          "boolean",
          "check",
          "current",
          "debug",
          "equal",
          "function",
          "isom",
          "isometri",
          "isometry#equ",
          "lt;abstract&gt",
          "mainli",
          "purpos",
          "same"
        ],
        "Isometry.html#clone": [
          "clone",
          "copi",
          "current",
          "function",
          "isometri",
          "isometry#clon",
          "lt;abstract&gt",
          "new",
          "return"
        ],
        "Isometry.html#copy": [
          "copi",
          "current",
          "function",
          "given",
          "isom",
          "isometri",
          "isometry#copi",
          "lt;abstract&gt",
          "set"
        ],
        "Isometry.html#toGLSL": [
          "block",
          "build",
          "code",
          "creat",
          "dynam",
          "function",
          "glsl",
          "isometri",
          "isometry#toglsl",
          "lt;abstract&gt",
          "return",
          "same",
          "shader",
          "string",
          "toglsl",
          "us"
        ],
        "Point.html": [
          "class",
          "geometri",
          "point"
        ],
        "Point.html#build": [
          "argument",
          "build",
          "constructor",
          "fake",
          "function",
          "lt;abstract&gt",
          "origin",
          "pass",
          "point#build",
          "return",
          "space"
        ],
        "Point.html#set": [
          "current",
          "data",
          "function",
          "given",
          "lt;abstract&gt",
          "point",
          "point#set",
          "set",
          "updat"
        ],
        "Point.html#applyIsometry": [
          "applyisometri",
          "current",
          "function",
          "given",
          "isom",
          "isometri",
          "lt;abstract&gt",
          "point",
          "point#applyisometri",
          "translat"
        ],
        "Point.html#equals": [
          "boolean",
          "check",
          "current",
          "debug",
          "equal",
          "function",
          "lt;abstract&gt",
          "mainli",
          "point",
          "point#equ",
          "purpos",
          "same"
        ],
        "Point.html#clone": [
          "clone",
          "copi",
          "current",
          "function",
          "lt;abstract&gt",
          "new",
          "point",
          "point#clon",
          "return"
        ],
        "Point.html#copy": [
          "copi",
          "current",
          "function",
          "given",
          "lt;abstract&gt",
          "point",
          "point#copi",
          "set"
        ],
        "Point.html#toGLSL": [
          "build",
          "code",
          "creat",
          "dynam",
          "function",
          "glsl",
          "line",
          "lt;abstract&gt",
          "point",
          "point#toglsl",
          "return",
          "same",
          "shader",
          "string",
          "toglsl",
          "us"
        ],
        "ObjectThurston.html": [
          "class",
          "directli",
          "etc",
          "gener",
          "instanti",
          "light",
          "lt;abstract&gt",
          "never",
          "object",
          "objectthurston",
          "scene",
          "solid"
        ],
        "ObjectThurston.html#uuid": [
          "assign",
          "automat",
          "edit",
          "get",
          "instanc",
          "member",
          "object",
          "objectthurston#uuid",
          "shouldn't",
          "string",
          "uuid"
        ],
        "ObjectThurston.html#glsl": [
          "code",
          "declar",
          "distanc",
          "function",
          "glsl",
          "gradient",
          "item",
          "member",
          "object",
          "objectthurston#glsl",
          "sign"
        ],
        "ObjectThurston.html#position": [
          "member",
          "object",
          "objectthurston#posit",
          "posit"
        ],
        "ObjectThurston.html#global": [
          "boolean",
          "flag",
          "global",
          "item",
          "member",
          "objectthurston#glob",
          "true"
        ],
        "ObjectThurston.html#local": [
          "boolean",
          "flag",
          "i.",
          "item",
          "local",
          "manifold/orbifold",
          "member",
          "objectthurston#loc",
          "quotient",
          "true"
        ],
        "ObjectThurston.html#shaderSource": [
          "code",
          "item",
          "member",
          "objectthurston#shadersourc",
          "path",
          "return",
          "shader",
          "shadersourc"
        ],
        "ObjectThurston.html#className": [
          "case",
          "class",
          "classnam",
          "first",
          "gener",
          "item",
          "letter",
          "lower",
          "member",
          "name",
          "objectthurston#classnam",
          "us"
        ],
        "ObjectThurston.html#name": [
          "befor",
          "call",
          "comput",
          "first",
          "getter",
          "id",
          "item",
          "member",
          "name",
          "objectthurston#nam",
          "receiv",
          "string",
          "time"
        ],
        "ObjectThurston.html#point": [
          "item'",
          "member",
          "objectthurston#point",
          "point",
          "posit",
          "underli"
        ],
        "ObjectThurston.html#isLight": [
          "boolean",
          "function",
          "islight",
          "item",
          "light",
          "objectthurston#islight"
        ],
        "ObjectThurston.html#isSolid": [
          "boolean",
          "function",
          "issolid",
          "item",
          "objectthurston#issolid",
          "solid"
        ],
        "ObjectThurston.html#toGLSL": [
          "block",
          "code",
          "function",
          "glsl",
          "item",
          "objectthurston#toglsl",
          "recreat",
          "return",
          "same",
          "string",
          "toglsl"
        ],
        "ObjectThurston.html#loadGLSLTemplate": [
          "block",
          "code",
          "contain",
          "dom",
          "file",
          "function",
          "glsl",
          "load",
          "loadglsltempl",
          "lt;async&gt",
          "objectthurston#loadglsltempl",
          "promise.&lt;document&gt",
          "return",
          "xml"
        ],
        "ObjectThurston.html#loadGLSLDefaultTemplate": [
          "block",
          "code",
          "contain",
          "dom",
          "file",
          "function",
          "glsl",
          "load",
          "loadglsldefaulttempl",
          "lt;async&gt",
          "objectthurston#loadglsldefaulttempl",
          "promise.&lt;document&gt",
          "return",
          "xml"
        ],
        "Teleport.html": [
          "back",
          "both",
          "brick",
          "class",
          "decid",
          "describ",
          "discret",
          "domain",
          "each",
          "elementari",
          "encod",
          "fundament",
          "gener",
          "move",
          "need",
          "point",
          "seen",
          "set",
          "subgroup",
          "teleport",
          "test"
        ],
        "Teleport.html#test": [
          "boolean",
          "fals",
          "function",
          "gt",
          "member",
          "need",
          "otherwis",
          "point",
          "return",
          "say",
          "signatur",
          "teleport",
          "teleport#test",
          "test",
          "true"
        ],
        "Teleport.html#isom": [
          "appli",
          "isom",
          "isometri",
          "member",
          "teleport",
          "teleport#isom"
        ],
        "Teleport.html#inv": [
          "inv",
          "invers",
          "isometri",
          "member",
          "teleport",
          "teleport#inv"
        ],
        "Teleport.html#uuid": [
          "assign",
          "automat",
          "edit",
          "get",
          "instanc",
          "member",
          "object",
          "shouldn't",
          "string",
          "teleport#uuid",
          "uuid"
        ],
        "Teleport.html#name": [
          "assign",
          "automat",
          "build",
          "edit",
          "get",
          "member",
          "name",
          "privat",
          "shouldn't",
          "string",
          "teleport#nam",
          "uniqu",
          "uuid",
          "version"
        ],
        "Teleport.html#glsl": [
          "automat",
          "code",
          "glsl",
          "level",
          "member",
          "perform",
          "setup",
          "string",
          "subgroup",
          "teleport#glsl",
          "test"
        ],
        "Position.html": [
          "class",
          "etc",
          "face",
          "locat",
          "object",
          "observ",
          "posit"
        ],
        "Position.html#boost": [
          "boost",
          "compon",
          "isometri",
          "member",
          "posit",
          "position#boost"
        ],
        "Position.html#facing": [
          "compon",
          "face",
          "matrix4",
          "member",
          "o(3",
          "posit",
          "position#fac"
        ],
        "Position.html#point": [
          "member",
          "point",
          "position#point",
          "return",
          "underli"
        ],
        "Position.html#setBoost": [
          "boost",
          "function",
          "isom",
          "part",
          "posit",
          "position#setboost",
          "set",
          "setboost"
        ],
        "Position.html#setFacing": [
          "face",
          "function",
          "part",
          "posit",
          "position#setfac",
          "set",
          "setfac"
        ],
        "Position.html#reduceErrorBoost": [
          "boost",
          "current",
          "error",
          "eventu",
          "function",
          "numer",
          "posit",
          "position#reduceerrorboost",
          "reduc",
          "reduceerrorboost"
        ],
        "Position.html#reduceErrorFacing": [
          "current",
          "error",
          "eventu",
          "face",
          "function",
          "numer",
          "posit",
          "position#reduceerrorfac",
          "reduc",
          "reduceerrorfac"
        ],
        "Position.html#reduceError": [
          "current",
          "error",
          "eventu",
          "function",
          "numer",
          "posit",
          "position#reduceerror",
          "reduc",
          "reduceerror"
        ],
        "Position.html#applyIsometry": [
          "action",
          "applyisometri",
          "current",
          "function",
          "g",
          "group",
          "isom",
          "isometri",
          "left",
          "posit",
          "position#applyisometri",
          "set",
          "translat"
        ],
        "Position.html#applyFacing": [
          "action",
          "applyfac",
          "face",
          "function",
          "m",
          "matrix",
          "o(3",
          "posit",
          "position#applyfac",
          "right",
          "rotat",
          "set"
        ],
        "Position.html#multiply": [
          "current",
          "function",
          "g",
          "g,m",
          "g0",
          "g0,m0",
          "given",
          "i.",
          "m",
          "m0",
          "multipli",
          "posit",
          "position#multipli",
          "return",
          "right"
        ],
        "Position.html#premultiply": [
          "current",
          "function",
          "g",
          "g,m",
          "g0",
          "g0,m0",
          "given",
          "i.",
          "left",
          "m",
          "m0",
          "multipli",
          "posit",
          "position#premultipli",
          "premultipli",
          "return"
        ],
        "Position.html#getInverse": [
          "current",
          "function",
          "getinvers",
          "given",
          "invers",
          "posit",
          "position#getinvers",
          "set"
        ],
        "Position.html#flowFromOrigin": [
          "current",
          "direct",
          "flow",
          "flowfromorigin",
          "frame",
          "function",
          "given",
          "id",
          "initi",
          "lt;abstract&gt",
          "obtain",
          "on",
          "posit",
          "position#flowfromorigin",
          "refer",
          "replac",
          "v"
        ],
        "Position.html#flow": [
          "assum",
          "back",
          "comput",
          "current",
          "d_o",
          "d_og",
          "data",
          "direct",
          "e",
          "e1",
          "e2",
          "e3",
          "everyth",
          "first",
          "flow",
          "follow",
          "frame",
          "function",
          "g",
          "g',m",
          "g,m",
          "gg",
          "given",
          "goe",
          "henc",
          "id",
          "initi",
          "invers",
          "m",
          "m'm",
          "move",
          "multipli",
          "new",
          "norm",
          "observ",
          "obtain",
          "origin",
          "posit",
          "position#flow",
          "procedur",
          "pull",
          "refer",
          "send",
          "space",
          "tangent",
          "time",
          "u",
          "u1",
          "u2",
          "u3",
          "us",
          "v",
          "v1",
          "v2",
          "v3",
          "vector",
          "w"
        ],
        "Position.html#equals": [
          "boolean",
          "check",
          "current",
          "equal",
          "function",
          "posit",
          "position#equ",
          "same"
        ],
        "Position.html#clone": [
          "clone",
          "copi",
          "current",
          "function",
          "new",
          "posit",
          "position#clon",
          "return"
        ],
        "Position.html#copy": [
          "copi",
          "current",
          "function",
          "given",
          "on",
          "posit",
          "position#copi",
          "set"
        ],
        "Position.html#toGLSL": [
          "build",
          "code",
          "creat",
          "dynam",
          "function",
          "glsl",
          "line",
          "posit",
          "position#toglsl",
          "return",
          "same",
          "shader",
          "string",
          "toglsl",
          "us"
        ],
        "Light.html": [
          "class",
          "gener",
          "light",
          "point",
          "scene"
        ],
        "Light.html#uuid": [
          "assign",
          "automat",
          "edit",
          "get",
          "instanc",
          "light#uuid",
          "member",
          "object",
          "shouldn't",
          "string",
          "uuid"
        ],
        "Light.html#glsl": [
          "code",
          "declar",
          "distanc",
          "function",
          "glsl",
          "gradient",
          "item",
          "light#glsl",
          "member",
          "object",
          "sign"
        ],
        "Light.html#position": [
          "light#posit",
          "member",
          "object",
          "posit"
        ],
        "Light.html#global": [
          "boolean",
          "flag",
          "global",
          "item",
          "light#glob",
          "member",
          "true"
        ],
        "Light.html#local": [
          "boolean",
          "flag",
          "i.",
          "item",
          "light#loc",
          "local",
          "manifold/orbifold",
          "member",
          "quotient",
          "true"
        ],
        "Light.html#shaderSource": [
          "code",
          "item",
          "light#shadersourc",
          "member",
          "path",
          "return",
          "shader",
          "shadersourc"
        ],
        "Light.html#className": [
          "case",
          "class",
          "classnam",
          "first",
          "gener",
          "item",
          "letter",
          "light#classnam",
          "lower",
          "member",
          "name",
          "us"
        ],
        "Light.html#color": [
          "color",
          "light",
          "light#color",
          "member"
        ],
        "Light.html#maxDirs": [
          "direct",
          "each",
          "light#maxdir",
          "maxdir",
          "maxim",
          "member",
          "number",
          "point",
          "return"
        ],
        "Light.html#name": [
          "befor",
          "call",
          "comput",
          "first",
          "getter",
          "id",
          "item",
          "light#nam",
          "member",
          "name",
          "receiv",
          "string",
          "time"
        ],
        "Light.html#point": [
          "item'",
          "light#point",
          "member",
          "point",
          "posit",
          "underli"
        ],
        "Light.html#isLight": [
          "boolean",
          "function",
          "islight",
          "item",
          "light",
          "light#islight"
        ],
        "Light.html#isSolid": [
          "boolean",
          "function",
          "issolid",
          "item",
          "light#issolid",
          "object"
        ],
        "Light.html#toGLSL": [
          "block",
          "code",
          "function",
          "glsl",
          "light",
          "light#toglsl",
          "recreat",
          "return",
          "same",
          "string",
          "toglsl"
        ],
        "Light.html#glslBuildData": [
          "build",
          "code",
          "declar",
          "distanc",
          "function",
          "global",
          "glsl",
          "glslbuilddata",
          "gradient",
          "item",
          "light#glslbuilddata",
          "lt;async&gt",
          "promise.&lt;void&gt",
          "rel",
          "sign"
        ],
        "Light.html#glslBuildDataDefault": [
          "block",
          "build",
          "default",
          "function",
          "global",
          "glsl",
          "glslbuilddatadefault",
          "light#glslbuilddatadefault",
          "list",
          "lt;async&gt",
          "promise.&lt;void&gt",
          "templat",
          "us"
        ],
        "Light.html#loadGLSLTemplate": [
          "block",
          "code",
          "contain",
          "dom",
          "file",
          "function",
          "glsl",
          "light#loadglsltempl",
          "load",
          "loadglsltempl",
          "lt;async&gt",
          "promise.&lt;document&gt",
          "return",
          "xml"
        ],
        "Light.html#loadGLSLDefaultTemplate": [
          "block",
          "code",
          "contain",
          "dom",
          "file",
          "function",
          "glsl",
          "light#loadglsldefaulttempl",
          "load",
          "loadglsldefaulttempl",
          "lt;async&gt",
          "promise.&lt;document&gt",
          "return",
          "xml"
        ],
        "Solid.html": [
          "built",
          "class",
          "directli",
          "gener",
          "inherit",
          "instanti",
          "javascript",
          "name",
          "never",
          "object",
          "scene",
          "solid"
        ],
        "Solid.html#uuid": [
          "assign",
          "automat",
          "edit",
          "get",
          "instanc",
          "member",
          "object",
          "shouldn't",
          "solid#uuid",
          "string",
          "uuid"
        ],
        "Solid.html#glsl": [
          "code",
          "declar",
          "distanc",
          "function",
          "glsl",
          "gradient",
          "item",
          "member",
          "object",
          "sign",
          "solid#glsl"
        ],
        "Solid.html#position": [
          "member",
          "object",
          "posit",
          "solid#posit"
        ],
        "Solid.html#global": [
          "boolean",
          "flag",
          "global",
          "item",
          "member",
          "solid#glob",
          "true"
        ],
        "Solid.html#local": [
          "boolean",
          "flag",
          "i.",
          "item",
          "local",
          "manifold/orbifold",
          "member",
          "quotient",
          "solid#loc",
          "true"
        ],
        "Solid.html#material": [
          "materi",
          "member",
          "solid",
          "solid#materi"
        ],
        "Solid.html#shaderSource": [
          "code",
          "item",
          "member",
          "path",
          "return",
          "shader",
          "shadersourc",
          "solid#shadersourc"
        ],
        "Solid.html#className": [
          "case",
          "class",
          "classnam",
          "first",
          "gener",
          "item",
          "letter",
          "lower",
          "member",
          "name",
          "solid#classnam",
          "us"
        ],
        "Solid.html#name": [
          "befor",
          "call",
          "comput",
          "first",
          "getter",
          "id",
          "item",
          "member",
          "name",
          "receiv",
          "solid#nam",
          "string",
          "time"
        ],
        "Solid.html#point": [
          "item'",
          "member",
          "point",
          "posit",
          "solid#point",
          "underli"
        ],
        "Solid.html#isLight": [
          "boolean",
          "function",
          "islight",
          "item",
          "light",
          "solid#islight"
        ],
        "Solid.html#isSolid": [
          "boolean",
          "function",
          "issolid",
          "item",
          "object",
          "solid#issolid"
        ],
        "Solid.html#toGLSL": [
          "block",
          "code",
          "function",
          "glsl",
          "recreat",
          "return",
          "same",
          "solid",
          "solid#toglsl",
          "string",
          "toglsl"
        ],
        "Solid.html#glslBuildData": [
          "build",
          "code",
          "declar",
          "distanc",
          "function",
          "global",
          "glsl",
          "glslbuilddata",
          "gradient",
          "item",
          "lt;async&gt",
          "promise.&lt;void&gt",
          "rel",
          "sign",
          "solid#glslbuilddata"
        ],
        "Solid.html#glslBuildDataDefault": [
          "block",
          "build",
          "default",
          "function",
          "global",
          "glsl",
          "glslbuilddatadefault",
          "list",
          "lt;async&gt",
          "promise.&lt;void&gt",
          "solid#glslbuilddatadefault",
          "templat",
          "us"
        ],
        "Solid.html#loadGLSLTemplate": [
          "block",
          "code",
          "contain",
          "dom",
          "file",
          "function",
          "glsl",
          "load",
          "loadglsltempl",
          "lt;async&gt",
          "promise.&lt;document&gt",
          "return",
          "solid#loadglsltempl",
          "xml"
        ],
        "Solid.html#loadGLSLDefaultTemplate": [
          "block",
          "code",
          "contain",
          "dom",
          "file",
          "function",
          "glsl",
          "load",
          "loadglsldefaulttempl",
          "lt;async&gt",
          "promise.&lt;document&gt",
          "return",
          "solid#loadglsldefaulttempl",
          "xml"
        ],
        "Vector.html": [
          "algebra",
          "avail",
          "class",
          "form",
          "frame",
          "length",
          "linear",
          "origin",
          "refer",
          "tangent",
          "three.j",
          "vector",
          "written"
        ],
        "Vector.html#toLog": [
          "add",
          "debug",
          "function",
          "human",
          "method",
          "purpos",
          "readabl",
          "return",
          "string",
          "three.j",
          "tolog",
          "vector",
          "vector#tolog",
          "vector3",
          "version"
        ],
        "Vector.html#applyMatrix4": [
          "0",
          "1",
          "3d",
          "4th",
          "applymatrix4",
          "consid",
          "coordin",
          "data",
          "dimens",
          "divid",
          "function",
          "here",
          "implicit",
          "inde",
          "m",
          "multipli",
          "overload",
          "perspect",
          "point",
          "repres",
          "three.j",
          "thu",
          "vector",
          "vector#applymatrix4",
          "vector3"
        ],
        "Vector.html#applyFacing": [
          "applyfac",
          "chosen",
          "compon",
          "coordin",
          "current",
          "depend",
          "face",
          "frame",
          "function",
          "geometri",
          "given",
          "independ",
          "method",
          "posit",
          "refer",
          "rotat",
          "vector",
          "vector#applyfac"
        ],
        "Vector.html#toGLSL": [
          "add",
          "block",
          "code",
          "function",
          "glsl",
          "method",
          "recreat",
          "return",
          "same",
          "string",
          "three.j",
          "toglsl",
          "vec3",
          "vector",
          "vector#toglsl",
          "vector3"
        ],
        "RelPosition.html": [
          "bound",
          "cellboost",
          "class",
          "coordin",
          "discret",
          "domain",
          "element",
          "frame",
          "fundament",
          "g",
          "gener",
          "give",
          "h",
          "h,p",
          "hg",
          "idea",
          "imag",
          "implicit",
          "invers",
          "isometri",
          "keep",
          "lattic",
          "local",
          "p",
          "pair",
          "part",
          "piec",
          "posit",
          "rang",
          "rel",
          "relposit",
          "repres",
          "simplic",
          "split",
          "subgroup",
          "track",
          "two",
          "underli"
        ],
        "RelPosition.html#local": [
          "local",
          "member",
          "posit",
          "relposition#loc"
        ],
        "RelPosition.html#cellBoost": [
          "boost",
          "cellboost",
          "compon",
          "discret",
          "isometri",
          "member",
          "par",
          "relposition#cellboost"
        ],
        "RelPosition.html#invCellBoost": [
          "cellboost",
          "invcellboost",
          "invers",
          "isometri",
          "member",
          "relposition#invcellboost"
        ],
        "RelPosition.html#sbgp": [
          "compon",
          "domain",
          "fundament",
          "insid",
          "isometri",
          "member",
          "posit",
          "relposition#sbgp",
          "sbgp",
          "subgroup"
        ],
        "RelPosition.html#localPoint": [
          "boost",
          "cell",
          "i.",
          "ignor",
          "local",
          "localpoint",
          "member",
          "point",
          "relposition#localpoint",
          "underli"
        ],
        "RelPosition.html#point": [
          "account",
          "boost",
          "cell",
          "member",
          "point",
          "relposition#point",
          "take",
          "underli"
        ],
        "RelPosition.html#reduceErrorBoost": [
          "boost",
          "current",
          "error",
          "eventu",
          "function",
          "numer",
          "reduc",
          "reduceerrorboost",
          "relposit",
          "relposition#reduceerrorboost"
        ],
        "RelPosition.html#reduceErrorFacing": [
          "current",
          "error",
          "eventu",
          "face",
          "function",
          "numer",
          "reduc",
          "reduceerrorfac",
          "relposit",
          "relposition#reduceerrorfac"
        ],
        "RelPosition.html#reduceErrorLocal": [
          "current",
          "error",
          "eventu",
          "face",
          "function",
          "numer",
          "reduc",
          "reduceerrorloc",
          "relposit",
          "relposition#reduceerrorloc"
        ],
        "RelPosition.html#reduceErrorCellBoost": [
          "boost",
          "current",
          "error",
          "eventu",
          "function",
          "numer",
          "reduc",
          "reduceerrorcellboost",
          "relposit",
          "relposition#reduceerrorcellboost"
        ],
        "RelPosition.html#reduceError": [
          "current",
          "error",
          "eventu",
          "function",
          "numer",
          "posit",
          "reduc",
          "reduceerror",
          "relposit",
          "relposition#reduceerror"
        ],
        "RelPosition.html#applyFacing": [
          "action",
          "applyfac",
          "face",
          "function",
          "m",
          "matrix",
          "o(3",
          "posit",
          "relposit",
          "relposition#applyfac",
          "right",
          "rotat",
          "set"
        ],
        "RelPosition.html#teleport": [
          "appli",
          "back",
          "boo",
          "bring",
          "domain",
          "function",
          "fundament",
          "local",
          "need",
          "relposit",
          "relposition#teleport",
          "teleport"
        ],
        "RelPosition.html#flow": [
          "back",
          "boost",
          "current",
          "direct",
          "domain",
          "flow",
          "function",
          "fundament",
          "make",
          "method",
          "norm",
          "origin",
          "posit",
          "pull",
          "relposit",
          "relposition#flow",
          "stay",
          "sure",
          "time",
          "v"
        ],
        "RelPosition.html#equals": [
          "boolean",
          "check",
          "current",
          "debug",
          "equal",
          "function",
          "mainli",
          "posit",
          "purpos",
          "relposition#equ",
          "same"
        ],
        "RelPosition.html#clone": [
          "clone",
          "copi",
          "current",
          "function",
          "new",
          "posit",
          "relposit",
          "relposition#clon",
          "return"
        ],
        "RelPosition.html#copy": [
          "copi",
          "current",
          "function",
          "given",
          "posit",
          "relposit",
          "relposition#copi",
          "set"
        ],
        "RelPosition.html#toGLSL": [
          "build",
          "code",
          "creat",
          "dynam",
          "function",
          "glsl",
          "line",
          "posit",
          "relposition#toglsl",
          "return",
          "same",
          "shader",
          "string",
          "toglsl",
          "us"
        ],
        "Material.html": [
          "class",
          "materi",
          "object",
          "scene"
        ],
        "Material.html#color": [
          "color",
          "materi",
          "material#color",
          "member"
        ],
        "Material.html#ambient": [
          "ambient",
          "constant",
          "material#ambi",
          "member",
          "number",
          "reflect"
        ],
        "Material.html#diffuse": [
          "constant",
          "diffus",
          "material#diffus",
          "member",
          "number",
          "reflect"
        ],
        "Material.html#specular": [
          "constant",
          "material#specular",
          "member",
          "number",
          "reflect",
          "specular"
        ],
        "Material.html#shininess": [
          "constant",
          "material#shini",
          "member",
          "number",
          "reflect",
          "shini"
        ],
        "Material.html#toGLSL": [
          "build",
          "code",
          "creat",
          "dynam",
          "function",
          "glsl",
          "line",
          "materi",
          "material#toglsl",
          "return",
          "same",
          "shader",
          "string",
          "toglsl",
          "us"
        ],
        "Subgroup.html": [
          "abelian",
          "actual",
          "advantag",
          "back",
          "bad",
          "case",
          "check",
          "class",
          "compar",
          "defin",
          "describ",
          "direct",
          "discret",
          "domain",
          "e",
          "e^3",
          "each",
          "easi",
          "element",
          "equal",
          "extens",
          "field",
          "find",
          "finit",
          "follow",
          "formal",
          "forward",
          "fundament",
          "gener",
          "gl(n",
          "go",
          "group",
          "h^2",
          "h^3",
          "handl",
          "implement",
          "import",
          "inde",
          "instanc",
          "integ",
          "isometri",
          "lattic",
          "list",
          "matric",
          "move",
          "need",
          "nil",
          "number",
          "obviou",
          "on",
          "opengl",
          "order",
          "perform",
          "play",
          "point",
          "possibl",
          "probabl",
          "product",
          "represent",
          "role",
          "s^2",
          "s^3",
          "seem",
          "seen",
          "semi",
          "set",
          "sl(2,r",
          "sol",
          "still",
          "straight",
          "straightforward",
          "string",
          "structur",
          "subgroup",
          "symbol",
          "teleport",
          "term",
          "those",
          "thu",
          "tow",
          "us",
          "word",
          "x",
          "z",
          "z^2"
        ],
        "Subgroup.html#teleports": [
          "array.&lt;teleport&gt",
          "class",
          "descript",
          "gener",
          "list",
          "matter",
          "member",
          "order",
          "see",
          "subgroup",
          "subgroup#teleport",
          "teleport"
        ],
        "Subgroup.html#shaderSource": [
          "file",
          "glsl",
          "implement",
          "lister",
          "member",
          "order",
          "path",
          "same",
          "shadersourc",
          "side",
          "string",
          "subgroup#shadersourc",
          "teleport",
          "test"
        ],
        "Subgroup.html#glslBuildData": [
          "associ",
          "build",
          "code",
          "discret",
          "function",
          "glsl",
          "glslbuilddata",
          "goe",
          "lt;async&gt",
          "perform",
          "promise.&lt;void&gt",
          "subgroup",
          "subgroup#glslbuilddata",
          "teleport",
          "test",
          "through"
        ],
        "VRControls.html": [
          "button",
          "class",
          "control",
          "direct",
          "drag",
          "fli",
          "flycontrol",
          "geometri",
          "implement",
          "inspir",
          "move",
          "rotat",
          "scene",
          "select",
          "squeez",
          "three.j",
          "us",
          "vr",
          "vrcontrol"
        ],
        "VRControls.html#update": [
          "function",
          "member",
          "posit",
          "updat",
          "vrcontrols#upd"
        ],
        "VRControls.html#onSelectStart": [
          "event",
          "function",
          "handler",
          "onselectstart",
          "select",
          "start",
          "user",
          "vrcontrols#onselectstart"
        ],
        "VRControls.html#onSelectEnd": [
          "event",
          "function",
          "handler",
          "onselectend",
          "select",
          "stop",
          "user",
          "vrcontrols#onselectend"
        ],
        "VRControls.html#onSqueezeStart": [
          "event",
          "function",
          "handler",
          "onsqueezestart",
          "squeez",
          "start",
          "user",
          "vrcontrols#onsqueezestart"
        ],
        "VRControls.html#onSqueezeEnd": [
          "event",
          "function",
          "handler",
          "onsqueezeend",
          "squeez",
          "stop",
          "user",
          "vrcontrols#onsqueezeend"
        ],
        "KeyboardControls.html": [
          "class",
          "control",
          "fli",
          "flycontrol",
          "geometri",
          "implement",
          "inspir",
          "keyboard",
          "keyboardcontrol",
          "three.j",
          "us"
        ],
        "KeyboardControls.html#keyboard": [
          "control",
          "keyboard",
          "keyboardcontrols#keyboard",
          "member",
          "string",
          "us"
        ],
        "KeyboardControls.html#infos": [
          "call",
          "function",
          "info",
          "key",
          "keyboardcontrols#info",
          "member",
          "press"
        ],
        "KeyboardControls.html#onKeyDown": [
          "event",
          "function",
          "handler",
          "key",
          "keyboardcontrols#onkeydown",
          "onkeydown",
          "press"
        ],
        "KeyboardControls.html#onKeyUp": [
          "event",
          "function",
          "handler",
          "key",
          "keyboardcontrols#onkeyup",
          "onkeyup",
          "press"
        ],
        "KeyboardControls.html#updateMovementVector": [
          "function",
          "keyboardcontrols#updatemovementvector",
          "movement",
          "updat",
          "updatemovementvector",
          "vector"
        ],
        "KeyboardControls.html#updateRotationVector": [
          "function",
          "keyboardcontrols#updaterotationvector",
          "rotat",
          "updat",
          "updaterotationvector",
          "vector"
        ],
        "KeyboardControls.html#update": [
          "assum",
          "attach",
          "boost",
          "camera",
          "chang",
          "correspond",
          "current",
          "d_og",
          "delta",
          "denot",
          "direct",
          "e",
          "e1",
          "e2",
          "e3",
          "element",
          "f",
          "f1",
          "f2",
          "f3",
          "face",
          "flow",
          "frame",
          "function",
          "g",
          "g,m",
          "given",
          "go",
          "i.",
          "keyboardcontrols#upd",
          "local",
          "look",
          "m",
          "matrix4",
          "move",
          "need",
          "note",
          "now",
          "o(3",
          "orient",
          "origin",
          "p",
          "posit",
          "refer",
          "repres",
          "rotat",
          "similar",
          "space",
          "strategi",
          "subgroup",
          "tangent",
          "three.j",
          "u",
          "understood",
          "updat",
          "v",
          "v1",
          "v1,v2,v3",
          "v2",
          "v3",
          "vector",
          "w",
          "want",
          "well",
          "word",
          "work",
          "written"
        ],
        "module-Thurston-Thurston.html": [
          "class",
          "creat",
          "geometri",
          "module:thurston~thurston",
          "scene",
          "specifi",
          "thurston",
          "thurston~thurston",
          "us"
        ],
        "module-Thurston-Thurston.html#geom": [
          "geom",
          "geometri",
          "member",
          "module:thurston~thurston#geom",
          "object",
          "underli"
        ],
        "module-Thurston-Thurston.html#subgroup": [
          "defin",
          "discret",
          "manifold/orbifold",
          "member",
          "module:thurston~thurston#subgroup",
          "quotient",
          "subgroup"
        ],
        "module-Thurston-Thurston.html#params": [
          "automat",
          "date",
          "go",
          "interact",
          "keep",
          "list",
          "member",
          "module:thurston~thurston#param",
          "object",
          "param",
          "paramet",
          "proxi",
          "through",
          "uniform",
          "up"
        ],
        "module-Thurston-Thurston.html#_renderer": [
          "_render",
          "lt;private&gt",
          "member",
          "module:thurston~thurston#_render",
          "render",
          "three.j",
          "us",
          "webglrender"
        ],
        "module-Thurston-Thurston.html#_camera": [
          "_camera",
          "camera",
          "lt;private&gt",
          "member",
          "module:thurston~thurston#_camera",
          "perspectivecamera",
          "three.j"
        ],
        "module-Thurston-Thurston.html#_scene": [
          "_scene",
          "lt;private&gt",
          "member",
          "module:thurston~thurston#_scen",
          "scene",
          "three.j",
          "underli"
        ],
        "module-Thurston-Thurston.html#_solids": [
          "_solid",
          "array.&lt;solid&gt",
          "euclidean",
          "list",
          "lt;private&gt",
          "member",
          "module:thurston~thurston#_solid",
          "non",
          "scene",
          "solid"
        ],
        "module-Thurston-Thurston.html#_lights": [
          "_light",
          "array.&lt;light&gt",
          "euclidean",
          "light",
          "list",
          "lt;private&gt",
          "member",
          "module:thurston~thurston#_light",
          "non",
          "scene"
        ],
        "module-Thurston-Thurston.html#_maxLightDirs": [
          "_maxlightdir",
          "automat",
          "comput",
          "direct",
          "light",
          "list",
          "lt;private&gt",
          "maxim",
          "member",
          "module:thurston~thurston#_maxlightdir",
          "number"
        ],
        "module-Thurston-Thurston.html#_keyboardControls": [
          "_keyboardcontrol",
          "control",
          "keyboard",
          "keyboardcontrol",
          "lt;private&gt",
          "member",
          "module:thurston~thurston#_keyboardcontrol"
        ],
        "module-Thurston-Thurston.html#_clock": [
          "_clock",
          "anim",
          "between",
          "call",
          "clock",
          "lt;private&gt",
          "measur",
          "member",
          "module:thurston~thurston#_clock",
          "time",
          "two"
        ],
        "module-Thurston-Thurston.html#gui": [
          "graphic",
          "gui",
          "interfac",
          "member",
          "module:thurston~thurston#gui",
          "user"
        ],
        "module-Thurston-Thurston.html#stats": [
          "member",
          "module:thurston~thurston#stat",
          "perform",
          "stat"
        ],
        "module-Thurston-Thurston.html#maxLightDirs": [
          "direct",
          "light",
          "maxim",
          "maxlightdir",
          "member",
          "module:thurston~thurston#maxlightdir",
          "number"
        ],
        "module-Thurston-Thurston.html#chaseCamera": [
          "both",
          "camera",
          "chang",
          "chasecamera",
          "done",
          "euclidean",
          "ey",
          "headset",
          "here",
          "horizon",
          "manual",
          "member",
          "module:thurston~thurston#chasecamera",
          "move",
          "non",
          "on",
          "posit",
          "scene",
          "somewher",
          "sphere",
          "three.j",
          "updat",
          "vr"
        ],
        "module-Thurston-Thurston.html#infos": [
          "data",
          "display",
          "function",
          "info",
          "key",
          "log",
          "module:thurston~thurston#info",
          "press"
        ],
        "module-Thurston-Thurston.html#registerParam": [
          "function",
          "module:thurston~thurston#registerparam",
          "name",
          "new",
          "param",
          "paramet",
          "pass",
          "regist",
          "registerparam",
          "thurston",
          "type"
        ],
        "module-Thurston-Thurston.html#setParams": [
          "function",
          "given",
          "module:thurston~thurston#setparam",
          "option",
          "param",
          "set",
          "setparam",
          "thurston"
        ],
        "module-Thurston-Thurston.html#setParam": [
          "function",
          "given",
          "key",
          "module:thurston~thurston#setparam",
          "option",
          "set",
          "setparam",
          "thurston",
          "valu"
        ],
        "module-Thurston-Thurston.html#addItem": [
          "ad",
          "additem",
          "function",
          "item",
          "module:thurston~thurston#additem",
          "scene",
          "thurston"
        ],
        "module-Thurston-Thurston.html#addItems": [
          "ad",
          "additem",
          "function",
          "item",
          "list",
          "module:thurston~thurston#additem",
          "scene",
          "thurston"
        ],
        "module-Thurston-Thurston.html#getEyePositions": [
          "both",
          "coincid",
          "comput",
          "current",
          "ey",
          "function",
          "geteyeposit",
          "left",
          "mode",
          "module:thurston~thurston#geteyeposit",
          "observ",
          "posit",
          "return",
          "right",
          "vr"
        ],
        "module-Thurston-Thurston.html#appendTitle": [
          "add",
          "appendtitl",
          "function",
          "geometri",
          "module:thurston~thurston#appendtitl",
          "name",
          "page",
          "titl"
        ],
        "module-Thurston-Thurston.html#setKeyboard": [
          "control",
          "function",
          "keyboard",
          "module:thurston~thurston#setkeyboard",
          "set",
          "setkeyboard",
          "us",
          "valu"
        ],
        "module-Thurston-Thurston.html#initUI": [
          "function",
          "graphic",
          "initi",
          "initui",
          "interfac",
          "module:thurston~thurston#initui",
          "thurston",
          "user"
        ],
        "module-Thurston-Thurston.html#initThreeJS": [
          "function",
          "initthreej",
          "module:thurston~thurston#initthreej",
          "scene",
          "setup",
          "three.j"
        ],
        "module-Thurston-Thurston.html#initStats": [
          "function",
          "initi",
          "initstat",
          "module:thurston~thurston#initstat",
          "perform",
          "stat",
          "thurston"
        ],
        "module-Thurston-Thurston.html#buildShaderVertex": [
          "build",
          "buildshadervertex",
          "file",
          "function",
          "lt;async&gt",
          "module:thurston~thurston#buildshadervertex",
          "shader",
          "string",
          "templat",
          "vertex"
        ],
        "module-Thurston-Thurston.html#buildShaderDataConstants": [
          "array.&lt;object&gt",
          "buildshaderdataconst",
          "collect",
          "constant",
          "function",
          "module:thurston~thurston#buildshaderdataconst",
          "paramet",
          "pass",
          "shader"
        ],
        "module-Thurston-Thurston.html#buildShaderDataUniforms": [
          "array.&lt;object&gt",
          "buildshaderdatauniform",
          "collect",
          "function",
          "module:thurston~thurston#buildshaderdatauniform",
          "paramet",
          "pass",
          "shader",
          "uniform"
        ],
        "module-Thurston-Thurston.html#buildShaderDataBackground": [
          "background",
          "block",
          "buildshaderdatabackground",
          "code",
          "function",
          "glsl",
          "item",
          "list",
          "lt;async&gt",
          "module:thurston~thurston#buildshaderdatabackground",
          "promise.&lt;array.&lt;string&gt;&gt",
          "requir",
          "return",
          "subgroup"
        ],
        "module-Thurston-Thurston.html#buildShaderDataItems": [
          "array.&lt;light&gt;}&gt",
          "array.&lt;solid&gt",
          "buildshaderdataitem",
          "function",
          "glsl",
          "item",
          "light",
          "list",
          "lt;async&gt",
          "module:thurston~thurston#buildshaderdataitem",
          "promise.&lt;{solid",
          "properti",
          "return",
          "review",
          "scene",
          "setup",
          "solid"
        ],
        "module-Thurston-Thurston.html#buildShaderFragment": [
          "background",
          "build",
          "buildshaderdatabackground",
          "buildshaderdataconst",
          "buildshaderdataitem",
          "buildshaderdatauniform",
          "buildshaderfrag",
          "constant",
          "data",
          "file",
          "fragment",
          "function",
          "item",
          "lt;async&gt",
          "module:thurston~thurston#buildshaderfrag",
          "popul",
          "routin",
          "shader",
          "string",
          "subgroup",
          "templat",
          "this.subgroup.glslbuilddata",
          "uniform",
          "us"
        ],
        "module-Thurston-Thurston.html#initHorizon": [
          "async",
          "constructor",
          "done",
          "function",
          "horizon",
          "init",
          "inithorizon",
          "lt;async&gt",
          "module:thurston~thurston#inithorizon",
          "promise.&lt;thurston&gt",
          "seen",
          "shader",
          "three.j"
        ],
        "module-Thurston-Thurston.html#animate": [
          "anim",
          "function",
          "module:thurston~thurston#anim",
          "simul"
        ],
        "module-Thurston-Thurston.html#run": [
          "anim",
          "async",
          "function",
          "handl",
          "here",
          "initi",
          "module:thurston~thurston#run",
          "more",
          "promis",
          "run",
          "togeth",
          "wrap"
        ],
        "module-Thurston-Thurston.html#onWindowResize": [
          "action",
          "event",
          "function",
          "module:thurston~thurston#onwindowres",
          "onwindowres",
          "resiz",
          "window"
        ],
        "module-Thurston-Thurston.html#addEventListeners": [
          "addeventlisten",
          "event",
          "function",
          "listen",
          "module:thurston~thurston#addeventlisten",
          "regist"
        ],
        "module-Thurston.html": [
          "defin",
          "eight",
          "geometri",
          "modul",
          "module:thurston",
          "on",
          "render",
          "scene",
          "thurston",
          "us"
        ]
      },
      "length": 193
    },
    "tokenStore": {
      "root": {
        "0": {
          "docs": {
            "Vector.html#applyMatrix4": {
              "ref": "Vector.html#applyMatrix4",
              "tf": 1.8518518518518516
            }
          }
        },
        "1": {
          "docs": {
            "Vector.html#applyMatrix4": {
              "ref": "Vector.html#applyMatrix4",
              "tf": 1.8518518518518516
            }
          }
        },
        "3": {
          "docs": {},
          "d": {
            "docs": {
              "Vector.html#applyMatrix4": {
                "ref": "Vector.html#applyMatrix4",
                "tf": 1.8518518518518516
              }
            }
          }
        },
        "4": {
          "docs": {},
          "t": {
            "docs": {},
            "h": {
              "docs": {
                "Vector.html#applyMatrix4": {
                  "ref": "Vector.html#applyMatrix4",
                  "tf": 3.7037037037037033
                }
              }
            }
          }
        },
        "docs": {},
        "e": {
          "1": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.9900990099009901
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.9259259259259258
              }
            }
          },
          "2": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.9900990099009901
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.9259259259259258
              }
            }
          },
          "3": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.9900990099009901
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 1.3888888888888888
              }
            }
          },
          "docs": {
            "Position.html#flow": {
              "ref": "Position.html#flow",
              "tf": 1.9801980198019802
            },
            "Subgroup.html": {
              "ref": "Subgroup.html",
              "tf": 1.0638297872340425
            },
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 1.3888888888888888
            }
          },
          "u": {
            "docs": {},
            "c": {
              "docs": {},
              "l": {
                "docs": {},
                "i": {
                  "docs": {},
                  "d": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "n": {
                          "docs": {
                            "index.html": {
                              "ref": "index.html",
                              "tf": 200
                            },
                            "module-Thurston-Thurston.html#_solids": {
                              "ref": "module-Thurston-Thurston.html#_solids",
                              "tf": 10
                            },
                            "module-Thurston-Thurston.html#_lights": {
                              "ref": "module-Thurston-Thurston.html#_lights",
                              "tf": 10
                            },
                            "module-Thurston-Thurston.html#chaseCamera": {
                              "ref": "module-Thurston-Thurston.html#chaseCamera",
                              "tf": 2
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "x": {
            "docs": {},
            "p": {
              "docs": {},
              "l": {
                "docs": {},
                "o": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "index.html": {
                        "ref": "index.html",
                        "tf": 14
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "e": {
                "docs": {},
                "n": {
                  "docs": {},
                  "s": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              }
            }
          },
          "r": {
            "docs": {},
            "r": {
              "docs": {},
              "o": {
                "docs": {},
                "r": {
                  "docs": {
                    "Isometry.html#reduceError": {
                      "ref": "Isometry.html#reduceError",
                      "tf": 5.555555555555555
                    },
                    "Position.html#reduceErrorBoost": {
                      "ref": "Position.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "Position.html#reduceErrorFacing": {
                      "ref": "Position.html#reduceErrorFacing",
                      "tf": 8.333333333333332
                    },
                    "Position.html#reduceError": {
                      "ref": "Position.html#reduceError",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorBoost": {
                      "ref": "RelPosition.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorFacing": {
                      "ref": "RelPosition.html#reduceErrorFacing",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorLocal": {
                      "ref": "RelPosition.html#reduceErrorLocal",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorCellBoost": {
                      "ref": "RelPosition.html#reduceErrorCellBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceError": {
                      "ref": "RelPosition.html#reduceError",
                      "tf": 8.333333333333332
                    }
                  }
                }
              }
            }
          },
          "v": {
            "docs": {},
            "e": {
              "docs": {},
              "n": {
                "docs": {},
                "t": {
                  "docs": {
                    "VRControls.html#onSelectStart": {
                      "ref": "VRControls.html#onSelectStart",
                      "tf": 10
                    },
                    "VRControls.html#onSelectEnd": {
                      "ref": "VRControls.html#onSelectEnd",
                      "tf": 10
                    },
                    "VRControls.html#onSqueezeStart": {
                      "ref": "VRControls.html#onSqueezeStart",
                      "tf": 10
                    },
                    "VRControls.html#onSqueezeEnd": {
                      "ref": "VRControls.html#onSqueezeEnd",
                      "tf": 10
                    },
                    "KeyboardControls.html#onKeyDown": {
                      "ref": "KeyboardControls.html#onKeyDown",
                      "tf": 62.5
                    },
                    "KeyboardControls.html#onKeyUp": {
                      "ref": "KeyboardControls.html#onKeyUp",
                      "tf": 62.5
                    },
                    "module-Thurston-Thurston.html#onWindowResize": {
                      "ref": "module-Thurston-Thurston.html#onWindowResize",
                      "tf": 50
                    },
                    "module-Thurston-Thurston.html#addEventListeners": {
                      "ref": "module-Thurston-Thurston.html#addEventListeners",
                      "tf": 16.666666666666664
                    }
                  },
                  "u": {
                    "docs": {
                      "Isometry.html#reduceError": {
                        "ref": "Isometry.html#reduceError",
                        "tf": 5.555555555555555
                      },
                      "Position.html#reduceErrorBoost": {
                        "ref": "Position.html#reduceErrorBoost",
                        "tf": 8.333333333333332
                      },
                      "Position.html#reduceErrorFacing": {
                        "ref": "Position.html#reduceErrorFacing",
                        "tf": 8.333333333333332
                      },
                      "Position.html#reduceError": {
                        "ref": "Position.html#reduceError",
                        "tf": 8.333333333333332
                      },
                      "RelPosition.html#reduceErrorBoost": {
                        "ref": "RelPosition.html#reduceErrorBoost",
                        "tf": 8.333333333333332
                      },
                      "RelPosition.html#reduceErrorFacing": {
                        "ref": "RelPosition.html#reduceErrorFacing",
                        "tf": 8.333333333333332
                      },
                      "RelPosition.html#reduceErrorLocal": {
                        "ref": "RelPosition.html#reduceErrorLocal",
                        "tf": 8.333333333333332
                      },
                      "RelPosition.html#reduceErrorCellBoost": {
                        "ref": "RelPosition.html#reduceErrorCellBoost",
                        "tf": 8.333333333333332
                      },
                      "RelPosition.html#reduceError": {
                        "ref": "RelPosition.html#reduceError",
                        "tf": 8.333333333333332
                      }
                    }
                  }
                }
              },
              "r": {
                "docs": {},
                "y": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "h": {
                      "docs": {
                        "Position.html#flow": {
                          "ref": "Position.html#flow",
                          "tf": 0.49504950495049505
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "t": {
            "docs": {},
            "c": {
              "docs": {
                "Isometry.html#makeTranslation": {
                  "ref": "Isometry.html#makeTranslation",
                  "tf": 4.166666666666666
                },
                "Isometry.html#makeInvTranslation": {
                  "ref": "Isometry.html#makeInvTranslation",
                  "tf": 4.166666666666666
                },
                "ObjectThurston.html": {
                  "ref": "ObjectThurston.html",
                  "tf": 4.545454545454546
                },
                "Position.html": {
                  "ref": "Position.html",
                  "tf": 10
                }
              }
            }
          },
          "q": {
            "docs": {},
            "u": {
              "docs": {},
              "a": {
                "docs": {},
                "l": {
                  "docs": {
                    "Isometry.html#equals": {
                      "ref": "Isometry.html#equals",
                      "tf": 675
                    },
                    "Point.html#equals": {
                      "ref": "Point.html#equals",
                      "tf": 675
                    },
                    "Position.html#equals": {
                      "ref": "Position.html#equals",
                      "tf": 683.3333333333334
                    },
                    "RelPosition.html#equals": {
                      "ref": "RelPosition.html#equals",
                      "tf": 683.3333333333334
                    },
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.3546099290780142
                    }
                  }
                }
              }
            }
          },
          "d": {
            "docs": {},
            "i": {
              "docs": {},
              "t": {
                "docs": {
                  "ObjectThurston.html#uuid": {
                    "ref": "ObjectThurston.html#uuid",
                    "tf": 6.25
                  },
                  "Teleport.html#uuid": {
                    "ref": "Teleport.html#uuid",
                    "tf": 6.25
                  },
                  "Teleport.html#name": {
                    "ref": "Teleport.html#name",
                    "tf": 4.545454545454546
                  },
                  "Light.html#uuid": {
                    "ref": "Light.html#uuid",
                    "tf": 6.25
                  },
                  "Solid.html#uuid": {
                    "ref": "Solid.html#uuid",
                    "tf": 6.25
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "c": {
              "docs": {},
              "h": {
                "docs": {
                  "Teleport.html": {
                    "ref": "Teleport.html",
                    "tf": 1.9230769230769231
                  },
                  "Light.html#maxDirs": {
                    "ref": "Light.html#maxDirs",
                    "tf": 8.333333333333332
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "i": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            }
          },
          "l": {
            "docs": {},
            "e": {
              "docs": {},
              "m": {
                "docs": {},
                "e": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "RelPosition.html": {
                          "ref": "RelPosition.html",
                          "tf": 0.9615384615384616
                        },
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.7092198581560284
                        },
                        "KeyboardControls.html#update": {
                          "ref": "KeyboardControls.html#update",
                          "tf": 1.3888888888888888
                        }
                      },
                      "a": {
                        "docs": {},
                        "r": {
                          "docs": {},
                          "i": {
                            "docs": {
                              "Teleport.html": {
                                "ref": "Teleport.html",
                                "tf": 1.9230769230769231
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "n": {
            "docs": {},
            "c": {
              "docs": {},
              "o": {
                "docs": {},
                "d": {
                  "docs": {
                    "Teleport.html": {
                      "ref": "Teleport.html",
                      "tf": 1.9230769230769231
                    }
                  }
                }
              }
            }
          },
          "^": {
            "3": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.7092198581560284
                }
              }
            },
            "docs": {}
          },
          "y": {
            "docs": {
              "module-Thurston-Thurston.html#chaseCamera": {
                "ref": "module-Thurston-Thurston.html#chaseCamera",
                "tf": 2
              },
              "module-Thurston-Thurston.html#getEyePositions": {
                "ref": "module-Thurston-Thurston.html#getEyePositions",
                "tf": 6.666666666666667
              }
            }
          },
          "i": {
            "docs": {},
            "g": {
              "docs": {},
              "h": {
                "docs": {},
                "t": {
                  "docs": {
                    "module-Thurston.html": {
                      "ref": "module-Thurston.html",
                      "tf": 5.555555555555555
                    }
                  }
                }
              }
            }
          }
        },
        "f": {
          "1": {
            "docs": {
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.4629629629629629
              }
            }
          },
          "2": {
            "docs": {
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.4629629629629629
              }
            }
          },
          "3": {
            "docs": {
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.9259259259259258
              }
            }
          },
          "docs": {
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 0.9259259259259258
            }
          },
          "i": {
            "docs": {},
            "r": {
              "docs": {},
              "s": {
                "docs": {},
                "t": {
                  "docs": {
                    "index.html": {
                      "ref": "index.html",
                      "tf": 14
                    },
                    "ObjectThurston.html#className": {
                      "ref": "ObjectThurston.html#className",
                      "tf": 5
                    },
                    "ObjectThurston.html#name": {
                      "ref": "ObjectThurston.html#name",
                      "tf": 3.3333333333333335
                    },
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 0.49504950495049505
                    },
                    "Light.html#className": {
                      "ref": "Light.html#className",
                      "tf": 5
                    },
                    "Light.html#name": {
                      "ref": "Light.html#name",
                      "tf": 3.3333333333333335
                    },
                    "Solid.html#className": {
                      "ref": "Solid.html#className",
                      "tf": 5
                    },
                    "Solid.html#name": {
                      "ref": "Solid.html#name",
                      "tf": 3.3333333333333335
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "e": {
                "docs": {
                  "ObjectThurston.html#loadGLSLTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "ObjectThurston.html#loadGLSLDefaultTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Light.html#loadGLSLTemplate": {
                    "ref": "Light.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Light.html#loadGLSLDefaultTemplate": {
                    "ref": "Light.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Solid.html#loadGLSLTemplate": {
                    "ref": "Solid.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Solid.html#loadGLSLDefaultTemplate": {
                    "ref": "Solid.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Subgroup.html#shaderSource": {
                    "ref": "Subgroup.html#shaderSource",
                    "tf": 4.166666666666666
                  },
                  "module-Thurston-Thurston.html#buildShaderVertex": {
                    "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                    "tf": 10
                  },
                  "module-Thurston-Thurston.html#buildShaderFragment": {
                    "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                    "tf": 2.083333333333333
                  }
                }
              }
            },
            "e": {
              "docs": {},
              "l": {
                "docs": {},
                "d": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 1.0638297872340425
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "d": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              },
              "i": {
                "docs": {},
                "t": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 1.0638297872340425
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "k": {
              "docs": {},
              "e": {
                "docs": {
                  "Isometry.html#build": {
                    "ref": "Isometry.html#build",
                    "tf": 8.333333333333332
                  },
                  "Point.html#build": {
                    "ref": "Point.html#build",
                    "tf": 7.142857142857142
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "s": {
                "docs": {
                  "Teleport.html#test": {
                    "ref": "Teleport.html#test",
                    "tf": 2.941176470588235
                  }
                }
              }
            },
            "c": {
              "docs": {},
              "e": {
                "docs": {
                  "Position.html": {
                    "ref": "Position.html",
                    "tf": 10
                  },
                  "Position.html#facing": {
                    "ref": "Position.html#facing",
                    "tf": 700
                  },
                  "Position.html#setFacing": {
                    "ref": "Position.html#setFacing",
                    "tf": 45.83333333333333
                  },
                  "Position.html#reduceErrorFacing": {
                    "ref": "Position.html#reduceErrorFacing",
                    "tf": 8.333333333333332
                  },
                  "Position.html#applyFacing": {
                    "ref": "Position.html#applyFacing",
                    "tf": 6.25
                  },
                  "Vector.html#applyFacing": {
                    "ref": "Vector.html#applyFacing",
                    "tf": 2.631578947368421
                  },
                  "RelPosition.html#reduceErrorFacing": {
                    "ref": "RelPosition.html#reduceErrorFacing",
                    "tf": 8.333333333333332
                  },
                  "RelPosition.html#reduceErrorLocal": {
                    "ref": "RelPosition.html#reduceErrorLocal",
                    "tf": 8.333333333333332
                  },
                  "RelPosition.html#applyFacing": {
                    "ref": "RelPosition.html#applyFacing",
                    "tf": 6.25
                  },
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "n": {
              "docs": {},
              "c": {
                "docs": {},
                "t": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "n": {
                        "docs": {
                          "Isometry.html#build": {
                            "ref": "Isometry.html#build",
                            "tf": 110
                          },
                          "Isometry.html#set": {
                            "ref": "Isometry.html#set",
                            "tf": 110
                          },
                          "Isometry.html#reduceError": {
                            "ref": "Isometry.html#reduceError",
                            "tf": 110
                          },
                          "Isometry.html#multiply": {
                            "ref": "Isometry.html#multiply",
                            "tf": 110
                          },
                          "Isometry.html#premultiply": {
                            "ref": "Isometry.html#premultiply",
                            "tf": 110
                          },
                          "Isometry.html#getInverse": {
                            "ref": "Isometry.html#getInverse",
                            "tf": 110
                          },
                          "Isometry.html#makeTranslation": {
                            "ref": "Isometry.html#makeTranslation",
                            "tf": 110
                          },
                          "Isometry.html#makeInvTranslation": {
                            "ref": "Isometry.html#makeInvTranslation",
                            "tf": 110
                          },
                          "Isometry.html#equals": {
                            "ref": "Isometry.html#equals",
                            "tf": 110
                          },
                          "Isometry.html#clone": {
                            "ref": "Isometry.html#clone",
                            "tf": 110
                          },
                          "Isometry.html#copy": {
                            "ref": "Isometry.html#copy",
                            "tf": 110
                          },
                          "Isometry.html#toGLSL": {
                            "ref": "Isometry.html#toGLSL",
                            "tf": 110
                          },
                          "Point.html#build": {
                            "ref": "Point.html#build",
                            "tf": 110
                          },
                          "Point.html#set": {
                            "ref": "Point.html#set",
                            "tf": 110
                          },
                          "Point.html#applyIsometry": {
                            "ref": "Point.html#applyIsometry",
                            "tf": 110
                          },
                          "Point.html#equals": {
                            "ref": "Point.html#equals",
                            "tf": 110
                          },
                          "Point.html#clone": {
                            "ref": "Point.html#clone",
                            "tf": 110
                          },
                          "Point.html#copy": {
                            "ref": "Point.html#copy",
                            "tf": 110
                          },
                          "Point.html#toGLSL": {
                            "ref": "Point.html#toGLSL",
                            "tf": 110
                          },
                          "ObjectThurston.html#glsl": {
                            "ref": "ObjectThurston.html#glsl",
                            "tf": 6.25
                          },
                          "ObjectThurston.html#isLight": {
                            "ref": "ObjectThurston.html#isLight",
                            "tf": 110
                          },
                          "ObjectThurston.html#isSolid": {
                            "ref": "ObjectThurston.html#isSolid",
                            "tf": 110
                          },
                          "ObjectThurston.html#toGLSL": {
                            "ref": "ObjectThurston.html#toGLSL",
                            "tf": 110
                          },
                          "ObjectThurston.html#loadGLSLTemplate": {
                            "ref": "ObjectThurston.html#loadGLSLTemplate",
                            "tf": 110
                          },
                          "ObjectThurston.html#loadGLSLDefaultTemplate": {
                            "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                            "tf": 110
                          },
                          "Teleport.html#test": {
                            "ref": "Teleport.html#test",
                            "tf": 52.94117647058823
                          },
                          "Position.html#setBoost": {
                            "ref": "Position.html#setBoost",
                            "tf": 110
                          },
                          "Position.html#setFacing": {
                            "ref": "Position.html#setFacing",
                            "tf": 110
                          },
                          "Position.html#reduceErrorBoost": {
                            "ref": "Position.html#reduceErrorBoost",
                            "tf": 110
                          },
                          "Position.html#reduceErrorFacing": {
                            "ref": "Position.html#reduceErrorFacing",
                            "tf": 110
                          },
                          "Position.html#reduceError": {
                            "ref": "Position.html#reduceError",
                            "tf": 110
                          },
                          "Position.html#applyIsometry": {
                            "ref": "Position.html#applyIsometry",
                            "tf": 110
                          },
                          "Position.html#applyFacing": {
                            "ref": "Position.html#applyFacing",
                            "tf": 110
                          },
                          "Position.html#multiply": {
                            "ref": "Position.html#multiply",
                            "tf": 110
                          },
                          "Position.html#premultiply": {
                            "ref": "Position.html#premultiply",
                            "tf": 110
                          },
                          "Position.html#getInverse": {
                            "ref": "Position.html#getInverse",
                            "tf": 110
                          },
                          "Position.html#flowFromOrigin": {
                            "ref": "Position.html#flowFromOrigin",
                            "tf": 110
                          },
                          "Position.html#flow": {
                            "ref": "Position.html#flow",
                            "tf": 110
                          },
                          "Position.html#equals": {
                            "ref": "Position.html#equals",
                            "tf": 110
                          },
                          "Position.html#clone": {
                            "ref": "Position.html#clone",
                            "tf": 110
                          },
                          "Position.html#copy": {
                            "ref": "Position.html#copy",
                            "tf": 110
                          },
                          "Position.html#toGLSL": {
                            "ref": "Position.html#toGLSL",
                            "tf": 110
                          },
                          "Light.html#glsl": {
                            "ref": "Light.html#glsl",
                            "tf": 6.25
                          },
                          "Light.html#isLight": {
                            "ref": "Light.html#isLight",
                            "tf": 110
                          },
                          "Light.html#isSolid": {
                            "ref": "Light.html#isSolid",
                            "tf": 110
                          },
                          "Light.html#toGLSL": {
                            "ref": "Light.html#toGLSL",
                            "tf": 110
                          },
                          "Light.html#glslBuildData": {
                            "ref": "Light.html#glslBuildData",
                            "tf": 115
                          },
                          "Light.html#glslBuildDataDefault": {
                            "ref": "Light.html#glslBuildDataDefault",
                            "tf": 110
                          },
                          "Light.html#loadGLSLTemplate": {
                            "ref": "Light.html#loadGLSLTemplate",
                            "tf": 110
                          },
                          "Light.html#loadGLSLDefaultTemplate": {
                            "ref": "Light.html#loadGLSLDefaultTemplate",
                            "tf": 110
                          },
                          "Solid.html#glsl": {
                            "ref": "Solid.html#glsl",
                            "tf": 6.25
                          },
                          "Solid.html#isLight": {
                            "ref": "Solid.html#isLight",
                            "tf": 110
                          },
                          "Solid.html#isSolid": {
                            "ref": "Solid.html#isSolid",
                            "tf": 110
                          },
                          "Solid.html#toGLSL": {
                            "ref": "Solid.html#toGLSL",
                            "tf": 110
                          },
                          "Solid.html#glslBuildData": {
                            "ref": "Solid.html#glslBuildData",
                            "tf": 115
                          },
                          "Solid.html#glslBuildDataDefault": {
                            "ref": "Solid.html#glslBuildDataDefault",
                            "tf": 110
                          },
                          "Solid.html#loadGLSLTemplate": {
                            "ref": "Solid.html#loadGLSLTemplate",
                            "tf": 110
                          },
                          "Solid.html#loadGLSLDefaultTemplate": {
                            "ref": "Solid.html#loadGLSLDefaultTemplate",
                            "tf": 110
                          },
                          "Vector.html#toLog": {
                            "ref": "Vector.html#toLog",
                            "tf": 110
                          },
                          "Vector.html#applyMatrix4": {
                            "ref": "Vector.html#applyMatrix4",
                            "tf": 110
                          },
                          "Vector.html#applyFacing": {
                            "ref": "Vector.html#applyFacing",
                            "tf": 110
                          },
                          "Vector.html#toGLSL": {
                            "ref": "Vector.html#toGLSL",
                            "tf": 110
                          },
                          "RelPosition.html#reduceErrorBoost": {
                            "ref": "RelPosition.html#reduceErrorBoost",
                            "tf": 110
                          },
                          "RelPosition.html#reduceErrorFacing": {
                            "ref": "RelPosition.html#reduceErrorFacing",
                            "tf": 110
                          },
                          "RelPosition.html#reduceErrorLocal": {
                            "ref": "RelPosition.html#reduceErrorLocal",
                            "tf": 110
                          },
                          "RelPosition.html#reduceErrorCellBoost": {
                            "ref": "RelPosition.html#reduceErrorCellBoost",
                            "tf": 110
                          },
                          "RelPosition.html#reduceError": {
                            "ref": "RelPosition.html#reduceError",
                            "tf": 110
                          },
                          "RelPosition.html#applyFacing": {
                            "ref": "RelPosition.html#applyFacing",
                            "tf": 110
                          },
                          "RelPosition.html#teleport": {
                            "ref": "RelPosition.html#teleport",
                            "tf": 110
                          },
                          "RelPosition.html#flow": {
                            "ref": "RelPosition.html#flow",
                            "tf": 110
                          },
                          "RelPosition.html#equals": {
                            "ref": "RelPosition.html#equals",
                            "tf": 110
                          },
                          "RelPosition.html#clone": {
                            "ref": "RelPosition.html#clone",
                            "tf": 110
                          },
                          "RelPosition.html#copy": {
                            "ref": "RelPosition.html#copy",
                            "tf": 110
                          },
                          "RelPosition.html#toGLSL": {
                            "ref": "RelPosition.html#toGLSL",
                            "tf": 110
                          },
                          "Material.html#toGLSL": {
                            "ref": "Material.html#toGLSL",
                            "tf": 110
                          },
                          "Subgroup.html#glslBuildData": {
                            "ref": "Subgroup.html#glslBuildData",
                            "tf": 110
                          },
                          "VRControls.html#update": {
                            "ref": "VRControls.html#update",
                            "tf": 66.66666666666666
                          },
                          "VRControls.html#onSelectStart": {
                            "ref": "VRControls.html#onSelectStart",
                            "tf": 110
                          },
                          "VRControls.html#onSelectEnd": {
                            "ref": "VRControls.html#onSelectEnd",
                            "tf": 110
                          },
                          "VRControls.html#onSqueezeStart": {
                            "ref": "VRControls.html#onSqueezeStart",
                            "tf": 110
                          },
                          "VRControls.html#onSqueezeEnd": {
                            "ref": "VRControls.html#onSqueezeEnd",
                            "tf": 110
                          },
                          "KeyboardControls.html#infos": {
                            "ref": "KeyboardControls.html#infos",
                            "tf": 60
                          },
                          "KeyboardControls.html#onKeyDown": {
                            "ref": "KeyboardControls.html#onKeyDown",
                            "tf": 110
                          },
                          "KeyboardControls.html#onKeyUp": {
                            "ref": "KeyboardControls.html#onKeyUp",
                            "tf": 110
                          },
                          "KeyboardControls.html#updateMovementVector": {
                            "ref": "KeyboardControls.html#updateMovementVector",
                            "tf": 110
                          },
                          "KeyboardControls.html#updateRotationVector": {
                            "ref": "KeyboardControls.html#updateRotationVector",
                            "tf": 110
                          },
                          "KeyboardControls.html#update": {
                            "ref": "KeyboardControls.html#update",
                            "tf": 110.46296296296296
                          },
                          "module-Thurston-Thurston.html#infos": {
                            "ref": "module-Thurston-Thurston.html#infos",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#registerParam": {
                            "ref": "module-Thurston-Thurston.html#registerParam",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#setParams": {
                            "ref": "module-Thurston-Thurston.html#setParams",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#setParam": {
                            "ref": "module-Thurston-Thurston.html#setParam",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#addItem": {
                            "ref": "module-Thurston-Thurston.html#addItem",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#addItems": {
                            "ref": "module-Thurston-Thurston.html#addItems",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#getEyePositions": {
                            "ref": "module-Thurston-Thurston.html#getEyePositions",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#appendTitle": {
                            "ref": "module-Thurston-Thurston.html#appendTitle",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#setKeyboard": {
                            "ref": "module-Thurston-Thurston.html#setKeyboard",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#initUI": {
                            "ref": "module-Thurston-Thurston.html#initUI",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#initThreeJS": {
                            "ref": "module-Thurston-Thurston.html#initThreeJS",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#initStats": {
                            "ref": "module-Thurston-Thurston.html#initStats",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#buildShaderVertex": {
                            "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#buildShaderDataConstants": {
                            "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                            "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#buildShaderDataBackground": {
                            "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#buildShaderDataItems": {
                            "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#buildShaderFragment": {
                            "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                            "tf": 112.08333333333333
                          },
                          "module-Thurston-Thurston.html#initHorizon": {
                            "ref": "module-Thurston-Thurston.html#initHorizon",
                            "tf": 115.55555555555556
                          },
                          "module-Thurston-Thurston.html#animate": {
                            "ref": "module-Thurston-Thurston.html#animate",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#run": {
                            "ref": "module-Thurston-Thurston.html#run",
                            "tf": 115
                          },
                          "module-Thurston-Thurston.html#onWindowResize": {
                            "ref": "module-Thurston-Thurston.html#onWindowResize",
                            "tf": 110
                          },
                          "module-Thurston-Thurston.html#addEventListeners": {
                            "ref": "module-Thurston-Thurston.html#addEventListeners",
                            "tf": 110
                          }
                        }
                      }
                    }
                  }
                }
              },
              "d": {
                "docs": {},
                "a": {
                  "docs": {},
                  "m": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "n": {
                        "docs": {},
                        "t": {
                          "docs": {
                            "Teleport.html": {
                              "ref": "Teleport.html",
                              "tf": 1.9230769230769231
                            },
                            "RelPosition.html": {
                              "ref": "RelPosition.html",
                              "tf": 0.9615384615384616
                            },
                            "RelPosition.html#sbgp": {
                              "ref": "RelPosition.html#sbgp",
                              "tf": 8.333333333333332
                            },
                            "RelPosition.html#teleport": {
                              "ref": "RelPosition.html#teleport",
                              "tf": 5.555555555555555
                            },
                            "RelPosition.html#flow": {
                              "ref": "RelPosition.html#flow",
                              "tf": 2.380952380952381
                            },
                            "Subgroup.html": {
                              "ref": "Subgroup.html",
                              "tf": 0.3546099290780142
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "l": {
            "docs": {},
            "a": {
              "docs": {},
              "g": {
                "docs": {
                  "ObjectThurston.html#global": {
                    "ref": "ObjectThurston.html#global",
                    "tf": 12.5
                  },
                  "ObjectThurston.html#local": {
                    "ref": "ObjectThurston.html#local",
                    "tf": 7.142857142857142
                  },
                  "Light.html#global": {
                    "ref": "Light.html#global",
                    "tf": 12.5
                  },
                  "Light.html#local": {
                    "ref": "Light.html#local",
                    "tf": 7.142857142857142
                  },
                  "Solid.html#global": {
                    "ref": "Solid.html#global",
                    "tf": 12.5
                  },
                  "Solid.html#local": {
                    "ref": "Solid.html#local",
                    "tf": 7.142857142857142
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "w": {
                "docs": {
                  "Position.html#flowFromOrigin": {
                    "ref": "Position.html#flowFromOrigin",
                    "tf": 3.3333333333333335
                  },
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 685.3135313531353
                  },
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 690.4761904761905
                  },
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                },
                "f": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "m": {
                        "docs": {},
                        "o": {
                          "docs": {},
                          "r": {
                            "docs": {},
                            "i": {
                              "docs": {},
                              "g": {
                                "docs": {},
                                "i": {
                                  "docs": {},
                                  "n": {
                                    "docs": {
                                      "Position.html#flowFromOrigin": {
                                        "ref": "Position.html#flowFromOrigin",
                                        "tf": 675
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {
                "VRControls.html": {
                  "ref": "VRControls.html",
                  "tf": 2.272727272727273
                },
                "KeyboardControls.html": {
                  "ref": "KeyboardControls.html",
                  "tf": 5.555555555555555
                }
              }
            },
            "y": {
              "docs": {},
              "c": {
                "docs": {},
                "o": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "t": {
                      "docs": {},
                      "r": {
                        "docs": {},
                        "o": {
                          "docs": {},
                          "l": {
                            "docs": {
                              "VRControls.html": {
                                "ref": "VRControls.html",
                                "tf": 2.272727272727273
                              },
                              "KeyboardControls.html": {
                                "ref": "KeyboardControls.html",
                                "tf": 5.555555555555555
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "r": {
            "docs": {},
            "a": {
              "docs": {},
              "m": {
                "docs": {},
                "e": {
                  "docs": {
                    "Position.html#flowFromOrigin": {
                      "ref": "Position.html#flowFromOrigin",
                      "tf": 3.3333333333333335
                    },
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 1.9801980198019802
                    },
                    "Vector.html": {
                      "ref": "Vector.html",
                      "tf": 3.8461538461538463
                    },
                    "Vector.html#applyFacing": {
                      "ref": "Vector.html#applyFacing",
                      "tf": 5.263157894736842
                    },
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 1.9230769230769231
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 1.8518518518518516
                    }
                  }
                }
              },
              "g": {
                "docs": {},
                "m": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "module-Thurston-Thurston.html#buildShaderFragment": {
                            "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                            "tf": 2.083333333333333
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "l": {
              "docs": {},
              "l": {
                "docs": {},
                "o": {
                  "docs": {},
                  "w": {
                    "docs": {
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 0.49504950495049505
                      },
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "m": {
                "docs": {
                  "Vector.html": {
                    "ref": "Vector.html",
                    "tf": 3.8461538461538463
                  }
                },
                "a": {
                  "docs": {},
                  "l": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              },
              "w": {
                "docs": {},
                "a": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "d": {
                      "docs": {
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.3546099290780142
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "g": {
          "0": {
            "docs": {
              "Position.html#multiply": {
                "ref": "Position.html#multiply",
                "tf": 3.571428571428571
              },
              "Position.html#premultiply": {
                "ref": "Position.html#premultiply",
                "tf": 3.571428571428571
              }
            },
            ",": {
              "docs": {},
              "m": {
                "0": {
                  "docs": {
                    "Position.html#multiply": {
                      "ref": "Position.html#multiply",
                      "tf": 3.571428571428571
                    },
                    "Position.html#premultiply": {
                      "ref": "Position.html#premultiply",
                      "tf": 3.571428571428571
                    }
                  }
                },
                "docs": {}
              }
            }
          },
          "docs": {
            "Position.html#applyIsometry": {
              "ref": "Position.html#applyIsometry",
              "tf": 4.545454545454546
            },
            "Position.html#multiply": {
              "ref": "Position.html#multiply",
              "tf": 3.571428571428571
            },
            "Position.html#premultiply": {
              "ref": "Position.html#premultiply",
              "tf": 3.571428571428571
            },
            "Position.html#flow": {
              "ref": "Position.html#flow",
              "tf": 1.4851485148514851
            },
            "RelPosition.html": {
              "ref": "RelPosition.html",
              "tf": 1.9230769230769231
            },
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 0.4629629629629629
            }
          },
          "e": {
            "docs": {},
            "o": {
              "docs": {},
              "e": {
                "docs": {},
                "m": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "index.html": {
                            "ref": "index.html",
                            "tf": 14
                          }
                        }
                      }
                    }
                  }
                }
              },
              "m": {
                "docs": {
                  "module-Thurston-Thurston.html#geom": {
                    "ref": "module-Thurston-Thurston.html#geom",
                    "tf": 700
                  }
                },
                "e": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "Isometry.html": {
                            "ref": "Isometry.html",
                            "tf": 25
                          },
                          "Point.html": {
                            "ref": "Point.html",
                            "tf": 25
                          },
                          "Vector.html#applyFacing": {
                            "ref": "Vector.html#applyFacing",
                            "tf": 5.263157894736842
                          },
                          "VRControls.html": {
                            "ref": "VRControls.html",
                            "tf": 2.272727272727273
                          },
                          "KeyboardControls.html": {
                            "ref": "KeyboardControls.html",
                            "tf": 5.555555555555555
                          },
                          "module-Thurston-Thurston.html": {
                            "ref": "module-Thurston-Thurston.html",
                            "tf": 8.333333333333332
                          },
                          "module-Thurston-Thurston.html#geom": {
                            "ref": "module-Thurston-Thurston.html#geom",
                            "tf": 25
                          },
                          "module-Thurston-Thurston.html#appendTitle": {
                            "ref": "module-Thurston-Thurston.html#appendTitle",
                            "tf": 10
                          },
                          "module-Thurston.html": {
                            "ref": "module-Thurston.html",
                            "tf": 5.555555555555555
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {
                "ObjectThurston.html#uuid": {
                  "ref": "ObjectThurston.html#uuid",
                  "tf": 6.25
                },
                "Teleport.html#uuid": {
                  "ref": "Teleport.html#uuid",
                  "tf": 6.25
                },
                "Teleport.html#name": {
                  "ref": "Teleport.html#name",
                  "tf": 4.545454545454546
                },
                "Light.html#uuid": {
                  "ref": "Light.html#uuid",
                  "tf": 6.25
                },
                "Solid.html#uuid": {
                  "ref": "Solid.html#uuid",
                  "tf": 6.25
                }
              },
              "i": {
                "docs": {},
                "n": {
                  "docs": {},
                  "v": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "r": {
                        "docs": {},
                        "s": {
                          "docs": {
                            "Isometry.html#getInverse": {
                              "ref": "Isometry.html#getInverse",
                              "tf": 675
                            },
                            "Position.html#getInverse": {
                              "ref": "Position.html#getInverse",
                              "tf": 683.3333333333334
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "t": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "ObjectThurston.html#name": {
                        "ref": "ObjectThurston.html#name",
                        "tf": 6.666666666666667
                      },
                      "Light.html#name": {
                        "ref": "Light.html#name",
                        "tf": 6.666666666666667
                      },
                      "Solid.html#name": {
                        "ref": "Solid.html#name",
                        "tf": 6.666666666666667
                      }
                    }
                  }
                }
              },
              "e": {
                "docs": {},
                "y": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "p": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "t": {
                              "docs": {
                                "module-Thurston-Thurston.html#getEyePositions": {
                                  "ref": "module-Thurston-Thurston.html#getEyePositions",
                                  "tf": 750
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {
                    "ObjectThurston.html": {
                      "ref": "ObjectThurston.html",
                      "tf": 4.545454545454546
                    },
                    "ObjectThurston.html#className": {
                      "ref": "ObjectThurston.html#className",
                      "tf": 5
                    },
                    "Teleport.html": {
                      "ref": "Teleport.html",
                      "tf": 5.769230769230769
                    },
                    "Light.html": {
                      "ref": "Light.html",
                      "tf": 10
                    },
                    "Light.html#className": {
                      "ref": "Light.html#className",
                      "tf": 5
                    },
                    "Solid.html": {
                      "ref": "Solid.html",
                      "tf": 2.631578947368421
                    },
                    "Solid.html#className": {
                      "ref": "Solid.html#className",
                      "tf": 5
                    },
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 0.9615384615384616
                    },
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.7092198581560284
                    },
                    "Subgroup.html#teleports": {
                      "ref": "Subgroup.html#teleports",
                      "tf": 5.555555555555555
                    }
                  }
                }
              }
            }
          },
          "l": {
            "docs": {},
            "o": {
              "docs": {},
              "b": {
                "docs": {},
                "a": {
                  "docs": {},
                  "l": {
                    "docs": {
                      "global.html": {
                        "ref": "global.html",
                        "tf": 2045
                      },
                      "ObjectThurston.html#global": {
                        "ref": "ObjectThurston.html#global",
                        "tf": 712.5
                      },
                      "Light.html#global": {
                        "ref": "Light.html#global",
                        "tf": 712.5
                      },
                      "Light.html#glslBuildData": {
                        "ref": "Light.html#glslBuildData",
                        "tf": 25
                      },
                      "Light.html#glslBuildDataDefault": {
                        "ref": "Light.html#glslBuildDataDefault",
                        "tf": 20
                      },
                      "Solid.html#global": {
                        "ref": "Solid.html#global",
                        "tf": 712.5
                      },
                      "Solid.html#glslBuildData": {
                        "ref": "Solid.html#glslBuildData",
                        "tf": 25
                      },
                      "Solid.html#glslBuildDataDefault": {
                        "ref": "Solid.html#glslBuildDataDefault",
                        "tf": 20
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "l": {
                "docs": {
                  "Isometry.html#toGLSL": {
                    "ref": "Isometry.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Point.html#toGLSL": {
                    "ref": "Point.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "ObjectThurston.html#glsl": {
                    "ref": "ObjectThurston.html#glsl",
                    "tf": 706.25
                  },
                  "ObjectThurston.html#toGLSL": {
                    "ref": "ObjectThurston.html#toGLSL",
                    "tf": 6.25
                  },
                  "ObjectThurston.html#loadGLSLTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "ObjectThurston.html#loadGLSLDefaultTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Teleport.html#glsl": {
                    "ref": "Teleport.html#glsl",
                    "tf": 706.25
                  },
                  "Position.html#toGLSL": {
                    "ref": "Position.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Light.html#glsl": {
                    "ref": "Light.html#glsl",
                    "tf": 706.25
                  },
                  "Light.html#toGLSL": {
                    "ref": "Light.html#toGLSL",
                    "tf": 6.25
                  },
                  "Light.html#glslBuildData": {
                    "ref": "Light.html#glslBuildData",
                    "tf": 5
                  },
                  "Light.html#glslBuildDataDefault": {
                    "ref": "Light.html#glslBuildDataDefault",
                    "tf": 6.25
                  },
                  "Light.html#loadGLSLTemplate": {
                    "ref": "Light.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Light.html#loadGLSLDefaultTemplate": {
                    "ref": "Light.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Solid.html#glsl": {
                    "ref": "Solid.html#glsl",
                    "tf": 706.25
                  },
                  "Solid.html#toGLSL": {
                    "ref": "Solid.html#toGLSL",
                    "tf": 6.25
                  },
                  "Solid.html#glslBuildData": {
                    "ref": "Solid.html#glslBuildData",
                    "tf": 5
                  },
                  "Solid.html#glslBuildDataDefault": {
                    "ref": "Solid.html#glslBuildDataDefault",
                    "tf": 6.25
                  },
                  "Solid.html#loadGLSLTemplate": {
                    "ref": "Solid.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Solid.html#loadGLSLDefaultTemplate": {
                    "ref": "Solid.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Vector.html#toGLSL": {
                    "ref": "Vector.html#toGLSL",
                    "tf": 4.166666666666666
                  },
                  "RelPosition.html#toGLSL": {
                    "ref": "RelPosition.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Material.html#toGLSL": {
                    "ref": "Material.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Subgroup.html#shaderSource": {
                    "ref": "Subgroup.html#shaderSource",
                    "tf": 8.333333333333332
                  },
                  "Subgroup.html#glslBuildData": {
                    "ref": "Subgroup.html#glslBuildData",
                    "tf": 4.545454545454546
                  },
                  "module-Thurston-Thurston.html#buildShaderDataBackground": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                    "tf": 5.555555555555555
                  },
                  "module-Thurston-Thurston.html#buildShaderDataItems": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                    "tf": 5
                  }
                },
                "b": {
                  "docs": {},
                  "u": {
                    "docs": {},
                    "i": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "d": {
                          "docs": {},
                          "d": {
                            "docs": {},
                            "a": {
                              "docs": {},
                              "t": {
                                "docs": {},
                                "a": {
                                  "docs": {
                                    "Light.html#glslBuildData": {
                                      "ref": "Light.html#glslBuildData",
                                      "tf": 675
                                    },
                                    "Solid.html#glslBuildData": {
                                      "ref": "Solid.html#glslBuildData",
                                      "tf": 675
                                    },
                                    "Subgroup.html#glslBuildData": {
                                      "ref": "Subgroup.html#glslBuildData",
                                      "tf": 683.3333333333334
                                    }
                                  },
                                  "d": {
                                    "docs": {},
                                    "e": {
                                      "docs": {},
                                      "f": {
                                        "docs": {},
                                        "a": {
                                          "docs": {},
                                          "u": {
                                            "docs": {},
                                            "l": {
                                              "docs": {},
                                              "t": {
                                                "docs": {
                                                  "Light.html#glslBuildDataDefault": {
                                                    "ref": "Light.html#glslBuildDataDefault",
                                                    "tf": 670
                                                  },
                                                  "Solid.html#glslBuildDataDefault": {
                                                    "ref": "Solid.html#glslBuildDataDefault",
                                                    "tf": 670
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "(": {
              "docs": {},
              "n": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "v": {
              "docs": {},
              "e": {
                "docs": {
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 0.9615384615384616
                  }
                },
                "n": {
                  "docs": {
                    "Isometry.html#set": {
                      "ref": "Isometry.html#set",
                      "tf": 10
                    },
                    "Isometry.html#makeTranslation": {
                      "ref": "Isometry.html#makeTranslation",
                      "tf": 4.166666666666666
                    },
                    "Isometry.html#makeInvTranslation": {
                      "ref": "Isometry.html#makeInvTranslation",
                      "tf": 4.166666666666666
                    },
                    "Isometry.html#copy": {
                      "ref": "Isometry.html#copy",
                      "tf": 10
                    },
                    "Point.html#set": {
                      "ref": "Point.html#set",
                      "tf": 10
                    },
                    "Point.html#applyIsometry": {
                      "ref": "Point.html#applyIsometry",
                      "tf": 10
                    },
                    "Point.html#copy": {
                      "ref": "Point.html#copy",
                      "tf": 10
                    },
                    "Position.html#multiply": {
                      "ref": "Position.html#multiply",
                      "tf": 3.571428571428571
                    },
                    "Position.html#premultiply": {
                      "ref": "Position.html#premultiply",
                      "tf": 3.571428571428571
                    },
                    "Position.html#getInverse": {
                      "ref": "Position.html#getInverse",
                      "tf": 8.333333333333332
                    },
                    "Position.html#flowFromOrigin": {
                      "ref": "Position.html#flowFromOrigin",
                      "tf": 3.3333333333333335
                    },
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 0.49504950495049505
                    },
                    "Position.html#copy": {
                      "ref": "Position.html#copy",
                      "tf": 10
                    },
                    "Vector.html#applyFacing": {
                      "ref": "Vector.html#applyFacing",
                      "tf": 2.631578947368421
                    },
                    "RelPosition.html#copy": {
                      "ref": "RelPosition.html#copy",
                      "tf": 10
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.4629629629629629
                    },
                    "module-Thurston-Thurston.html#setParams": {
                      "ref": "module-Thurston-Thurston.html#setParams",
                      "tf": 16.666666666666664
                    },
                    "module-Thurston-Thurston.html#setParam": {
                      "ref": "module-Thurston-Thurston.html#setParam",
                      "tf": 16.666666666666664
                    }
                  }
                }
              }
            }
          },
          "r": {
            "docs": {},
            "a": {
              "docs": {},
              "m": {
                "docs": {
                  "Isometry.html#reduceError": {
                    "ref": "Isometry.html#reduceError",
                    "tf": 5.555555555555555
                  }
                }
              },
              "d": {
                "docs": {},
                "i": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "ObjectThurston.html#glsl": {
                            "ref": "ObjectThurston.html#glsl",
                            "tf": 6.25
                          },
                          "Light.html#glsl": {
                            "ref": "Light.html#glsl",
                            "tf": 6.25
                          },
                          "Light.html#glslBuildData": {
                            "ref": "Light.html#glslBuildData",
                            "tf": 5
                          },
                          "Solid.html#glsl": {
                            "ref": "Solid.html#glsl",
                            "tf": 6.25
                          },
                          "Solid.html#glslBuildData": {
                            "ref": "Solid.html#glslBuildData",
                            "tf": 5
                          }
                        }
                      }
                    }
                  }
                }
              },
              "p": {
                "docs": {},
                "h": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "c": {
                      "docs": {
                        "module-Thurston-Thurston.html#gui": {
                          "ref": "module-Thurston-Thurston.html#gui",
                          "tf": 16.666666666666664
                        },
                        "module-Thurston-Thurston.html#initUI": {
                          "ref": "module-Thurston-Thurston.html#initUI",
                          "tf": 12.5
                        }
                      }
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "u": {
                "docs": {},
                "p": {
                  "docs": {
                    "Position.html#applyIsometry": {
                      "ref": "Position.html#applyIsometry",
                      "tf": 4.545454545454546
                    },
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 1.4184397163120568
                    }
                  }
                }
              }
            }
          },
          "t": {
            "docs": {
              "Teleport.html#test": {
                "ref": "Teleport.html#test",
                "tf": 2.941176470588235
              }
            }
          },
          ",": {
            "docs": {},
            "m": {
              "docs": {
                "Position.html#multiply": {
                  "ref": "Position.html#multiply",
                  "tf": 3.571428571428571
                },
                "Position.html#premultiply": {
                  "ref": "Position.html#premultiply",
                  "tf": 3.571428571428571
                },
                "Position.html#flow": {
                  "ref": "Position.html#flow",
                  "tf": 0.9900990099009901
                },
                "KeyboardControls.html#update": {
                  "ref": "KeyboardControls.html#update",
                  "tf": 0.4629629629629629
                }
              }
            }
          },
          "'": {
            "docs": {},
            ",": {
              "docs": {},
              "m": {
                "docs": {
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.9900990099009901
                  }
                }
              }
            }
          },
          "g": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.9900990099009901
              }
            }
          },
          "o": {
            "docs": {
              "Subgroup.html": {
                "ref": "Subgroup.html",
                "tf": 0.3546099290780142
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.4629629629629629
              },
              "module-Thurston-Thurston.html#params": {
                "ref": "module-Thurston-Thurston.html#params",
                "tf": 3.571428571428571
              }
            },
            "e": {
              "docs": {
                "Position.html#flow": {
                  "ref": "Position.html#flow",
                  "tf": 0.49504950495049505
                },
                "Subgroup.html#glslBuildData": {
                  "ref": "Subgroup.html#glslBuildData",
                  "tf": 4.545454545454546
                }
              }
            }
          },
          "u": {
            "docs": {},
            "i": {
              "docs": {
                "module-Thurston-Thurston.html#gui": {
                  "ref": "module-Thurston-Thurston.html#gui",
                  "tf": 750
                }
              }
            }
          }
        },
        "i": {
          "docs": {},
          "n": {
            "docs": {},
            "d": {
              "docs": {},
              "e": {
                "docs": {
                  "Vector.html#applyMatrix4": {
                    "ref": "Vector.html#applyMatrix4",
                    "tf": 1.8518518518518516
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                },
                "x": {
                  "docs": {
                    "index.html": {
                      "ref": "index.html",
                      "tf": 1300
                    }
                  }
                },
                "p": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "d": {
                        "docs": {
                          "Vector.html#applyFacing": {
                            "ref": "Vector.html#applyFacing",
                            "tf": 2.631578947368421
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "v": {
              "docs": {
                "Teleport.html#inv": {
                  "ref": "Teleport.html#inv",
                  "tf": 700
                }
              },
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "s": {
                    "docs": {
                      "Isometry.html#getInverse": {
                        "ref": "Isometry.html#getInverse",
                        "tf": 10
                      },
                      "Teleport.html#inv": {
                        "ref": "Teleport.html#inv",
                        "tf": 16.666666666666664
                      },
                      "Position.html#getInverse": {
                        "ref": "Position.html#getInverse",
                        "tf": 8.333333333333332
                      },
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 0.49504950495049505
                      },
                      "RelPosition.html": {
                        "ref": "RelPosition.html",
                        "tf": 0.9615384615384616
                      },
                      "RelPosition.html#invCellBoost": {
                        "ref": "RelPosition.html#invCellBoost",
                        "tf": 25
                      }
                    }
                  }
                }
              },
              "c": {
                "docs": {},
                "e": {
                  "docs": {},
                  "l": {
                    "docs": {},
                    "l": {
                      "docs": {},
                      "b": {
                        "docs": {},
                        "o": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "t": {
                                "docs": {
                                  "RelPosition.html#invCellBoost": {
                                    "ref": "RelPosition.html#invCellBoost",
                                    "tf": 700
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "t": {
                "docs": {},
                "a": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "t": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "ObjectThurston.html": {
                            "ref": "ObjectThurston.html",
                            "tf": 4.545454545454546
                          },
                          "Solid.html": {
                            "ref": "Solid.html",
                            "tf": 5.263157894736842
                          }
                        }
                      }
                    },
                    "c": {
                      "docs": {
                        "ObjectThurston.html#uuid": {
                          "ref": "ObjectThurston.html#uuid",
                          "tf": 6.25
                        },
                        "Teleport.html#uuid": {
                          "ref": "Teleport.html#uuid",
                          "tf": 6.25
                        },
                        "Light.html#uuid": {
                          "ref": "Light.html#uuid",
                          "tf": 6.25
                        },
                        "Solid.html#uuid": {
                          "ref": "Solid.html#uuid",
                          "tf": 6.25
                        },
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.3546099290780142
                        }
                      }
                    }
                  }
                }
              },
              "i": {
                "docs": {},
                "d": {
                  "docs": {
                    "RelPosition.html#sbgp": {
                      "ref": "RelPosition.html#sbgp",
                      "tf": 8.333333333333332
                    }
                  }
                }
              },
              "p": {
                "docs": {},
                "i": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "VRControls.html": {
                        "ref": "VRControls.html",
                        "tf": 2.272727272727273
                      },
                      "KeyboardControls.html": {
                        "ref": "KeyboardControls.html",
                        "tf": 5.555555555555555
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "t": {
                "docs": {
                  "module-Thurston-Thurston.html#initHorizon": {
                    "ref": "module-Thurston-Thurston.html#initHorizon",
                    "tf": 5.555555555555555
                  }
                },
                "i": {
                  "docs": {
                    "Position.html#flowFromOrigin": {
                      "ref": "Position.html#flowFromOrigin",
                      "tf": 3.3333333333333335
                    },
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 0.49504950495049505
                    },
                    "module-Thurston-Thurston.html#initUI": {
                      "ref": "module-Thurston-Thurston.html#initUI",
                      "tf": 12.5
                    },
                    "module-Thurston-Thurston.html#initStats": {
                      "ref": "module-Thurston-Thurston.html#initStats",
                      "tf": 16.666666666666664
                    },
                    "module-Thurston-Thurston.html#run": {
                      "ref": "module-Thurston-Thurston.html#run",
                      "tf": 5
                    }
                  }
                },
                "u": {
                  "docs": {},
                  "i": {
                    "docs": {
                      "module-Thurston-Thurston.html#initUI": {
                        "ref": "module-Thurston-Thurston.html#initUI",
                        "tf": 700
                      }
                    }
                  }
                },
                "t": {
                  "docs": {},
                  "h": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "e": {
                        "docs": {},
                        "e": {
                          "docs": {},
                          "j": {
                            "docs": {
                              "module-Thurston-Thurston.html#initThreeJS": {
                                "ref": "module-Thurston-Thurston.html#initThreeJS",
                                "tf": 750
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "s": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "module-Thurston-Thurston.html#initStats": {
                            "ref": "module-Thurston-Thurston.html#initStats",
                            "tf": 700
                          }
                        }
                      }
                    }
                  }
                },
                "h": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "i": {
                        "docs": {},
                        "z": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "n": {
                              "docs": {
                                "module-Thurston-Thurston.html#initHorizon": {
                                  "ref": "module-Thurston-Thurston.html#initHorizon",
                                  "tf": 683.3333333333334
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "h": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Solid.html": {
                          "ref": "Solid.html",
                          "tf": 2.631578947368421
                        }
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "e": {
                "docs": {},
                "g": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.3546099290780142
                    }
                  }
                },
                "r": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "c": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "module-Thurston-Thurston.html#params": {
                            "ref": "module-Thurston-Thurston.html#params",
                            "tf": 3.571428571428571
                          }
                        }
                      }
                    }
                  },
                  "f": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "c": {
                        "docs": {
                          "module-Thurston-Thurston.html#gui": {
                            "ref": "module-Thurston-Thurston.html#gui",
                            "tf": 16.666666666666664
                          },
                          "module-Thurston-Thurston.html#initUI": {
                            "ref": "module-Thurston-Thurston.html#initUI",
                            "tf": 12.5
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "f": {
              "docs": {},
              "o": {
                "docs": {
                  "KeyboardControls.html#infos": {
                    "ref": "KeyboardControls.html#infos",
                    "tf": 710
                  },
                  "module-Thurston-Thurston.html#infos": {
                    "ref": "module-Thurston-Thurston.html#infos",
                    "tf": 758.3333333333334
                  }
                }
              }
            }
          },
          "s": {
            "docs": {},
            "o": {
              "docs": {},
              "m": {
                "docs": {
                  "Isometry.html#multiply": {
                    "ref": "Isometry.html#multiply",
                    "tf": 37.5
                  },
                  "Isometry.html#premultiply": {
                    "ref": "Isometry.html#premultiply",
                    "tf": 37.5
                  },
                  "Isometry.html#getInverse": {
                    "ref": "Isometry.html#getInverse",
                    "tf": 35
                  },
                  "Isometry.html#equals": {
                    "ref": "Isometry.html#equals",
                    "tf": 31.25
                  },
                  "Isometry.html#copy": {
                    "ref": "Isometry.html#copy",
                    "tf": 25
                  },
                  "Point.html#applyIsometry": {
                    "ref": "Point.html#applyIsometry",
                    "tf": 25
                  },
                  "Teleport.html#isom": {
                    "ref": "Teleport.html#isom",
                    "tf": 700
                  },
                  "Position.html#setBoost": {
                    "ref": "Position.html#setBoost",
                    "tf": 33.33333333333333
                  },
                  "Position.html#applyIsometry": {
                    "ref": "Position.html#applyIsometry",
                    "tf": 37.878787878787875
                  }
                },
                "e": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "Isometry.html": {
                            "ref": "Isometry.html",
                            "tf": 1925
                          },
                          "Isometry.html#set": {
                            "ref": "Isometry.html#set",
                            "tf": 35
                          },
                          "Isometry.html#reduceError": {
                            "ref": "Isometry.html#reduceError",
                            "tf": 38.888888888888886
                          },
                          "Isometry.html#multiply": {
                            "ref": "Isometry.html#multiply",
                            "tf": 31.25
                          },
                          "Isometry.html#premultiply": {
                            "ref": "Isometry.html#premultiply",
                            "tf": 31.25
                          },
                          "Isometry.html#getInverse": {
                            "ref": "Isometry.html#getInverse",
                            "tf": 35
                          },
                          "Isometry.html#makeTranslation": {
                            "ref": "Isometry.html#makeTranslation",
                            "tf": 29.166666666666664
                          },
                          "Isometry.html#makeInvTranslation": {
                            "ref": "Isometry.html#makeInvTranslation",
                            "tf": 29.166666666666664
                          },
                          "Isometry.html#equals": {
                            "ref": "Isometry.html#equals",
                            "tf": 6.25
                          },
                          "Isometry.html#clone": {
                            "ref": "Isometry.html#clone",
                            "tf": 43.33333333333333
                          },
                          "Isometry.html#copy": {
                            "ref": "Isometry.html#copy",
                            "tf": 45
                          },
                          "Isometry.html#toGLSL": {
                            "ref": "Isometry.html#toGLSL",
                            "tf": 4.545454545454546
                          },
                          "Point.html#applyIsometry": {
                            "ref": "Point.html#applyIsometry",
                            "tf": 10
                          },
                          "Teleport.html#isom": {
                            "ref": "Teleport.html#isom",
                            "tf": 66.66666666666666
                          },
                          "Teleport.html#inv": {
                            "ref": "Teleport.html#inv",
                            "tf": 66.66666666666666
                          },
                          "Position.html#boost": {
                            "ref": "Position.html#boost",
                            "tf": 66.66666666666666
                          },
                          "Position.html#applyIsometry": {
                            "ref": "Position.html#applyIsometry",
                            "tf": 4.545454545454546
                          },
                          "RelPosition.html": {
                            "ref": "RelPosition.html",
                            "tf": 1.9230769230769231
                          },
                          "RelPosition.html#cellBoost": {
                            "ref": "RelPosition.html#cellBoost",
                            "tf": 60
                          },
                          "RelPosition.html#invCellBoost": {
                            "ref": "RelPosition.html#invCellBoost",
                            "tf": 50
                          },
                          "RelPosition.html#sbgp": {
                            "ref": "RelPosition.html#sbgp",
                            "tf": 8.333333333333332
                          },
                          "Subgroup.html": {
                            "ref": "Subgroup.html",
                            "tf": 0.3546099290780142
                          }
                        }
                      },
                      "y": {
                        "docs": {},
                        "#": {
                          "docs": {},
                          "b": {
                            "docs": {},
                            "u": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "d": {
                                    "docs": {
                                      "Isometry.html#build": {
                                        "ref": "Isometry.html#build",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "s": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "t": {
                                "docs": {
                                  "Isometry.html#set": {
                                    "ref": "Isometry.html#set",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          },
                          "r": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "d": {
                                "docs": {},
                                "u": {
                                  "docs": {},
                                  "c": {
                                    "docs": {},
                                    "e": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "r": {
                                          "docs": {},
                                          "r": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "r": {
                                                "docs": {
                                                  "Isometry.html#reduceError": {
                                                    "ref": "Isometry.html#reduceError",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "m": {
                            "docs": {},
                            "u": {
                              "docs": {},
                              "l": {
                                "docs": {},
                                "t": {
                                  "docs": {},
                                  "i": {
                                    "docs": {},
                                    "p": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "i": {
                                          "docs": {
                                            "Isometry.html#multiply": {
                                              "ref": "Isometry.html#multiply",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            "a": {
                              "docs": {},
                              "k": {
                                "docs": {},
                                "e": {
                                  "docs": {},
                                  "t": {
                                    "docs": {},
                                    "r": {
                                      "docs": {},
                                      "a": {
                                        "docs": {},
                                        "n": {
                                          "docs": {},
                                          "s": {
                                            "docs": {},
                                            "l": {
                                              "docs": {
                                                "Isometry.html#makeTranslation": {
                                                  "ref": "Isometry.html#makeTranslation",
                                                  "tf": 1150
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  },
                                  "i": {
                                    "docs": {},
                                    "n": {
                                      "docs": {},
                                      "v": {
                                        "docs": {},
                                        "t": {
                                          "docs": {},
                                          "r": {
                                            "docs": {},
                                            "a": {
                                              "docs": {},
                                              "n": {
                                                "docs": {},
                                                "s": {
                                                  "docs": {},
                                                  "l": {
                                                    "docs": {
                                                      "Isometry.html#makeInvTranslation": {
                                                        "ref": "Isometry.html#makeInvTranslation",
                                                        "tf": 1150
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "p": {
                            "docs": {},
                            "r": {
                              "docs": {},
                              "e": {
                                "docs": {},
                                "m": {
                                  "docs": {},
                                  "u": {
                                    "docs": {},
                                    "l": {
                                      "docs": {},
                                      "t": {
                                        "docs": {},
                                        "i": {
                                          "docs": {},
                                          "p": {
                                            "docs": {},
                                            "l": {
                                              "docs": {},
                                              "i": {
                                                "docs": {
                                                  "Isometry.html#premultiply": {
                                                    "ref": "Isometry.html#premultiply",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "g": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "t": {
                                "docs": {},
                                "i": {
                                  "docs": {},
                                  "n": {
                                    "docs": {},
                                    "v": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "r": {
                                          "docs": {},
                                          "s": {
                                            "docs": {
                                              "Isometry.html#getInverse": {
                                                "ref": "Isometry.html#getInverse",
                                                "tf": 1150
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "e": {
                            "docs": {},
                            "q": {
                              "docs": {},
                              "u": {
                                "docs": {
                                  "Isometry.html#equals": {
                                    "ref": "Isometry.html#equals",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          },
                          "c": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "o": {
                                "docs": {},
                                "n": {
                                  "docs": {
                                    "Isometry.html#clone": {
                                      "ref": "Isometry.html#clone",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            },
                            "o": {
                              "docs": {},
                              "p": {
                                "docs": {},
                                "i": {
                                  "docs": {
                                    "Isometry.html#copy": {
                                      "ref": "Isometry.html#copy",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "t": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "g": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "s": {
                                    "docs": {},
                                    "l": {
                                      "docs": {
                                        "Isometry.html#toGLSL": {
                                          "ref": "Isometry.html#toGLSL",
                                          "tf": 1150
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "i": {
                "docs": {},
                "g": {
                  "docs": {},
                  "h": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "ObjectThurston.html#isLight": {
                          "ref": "ObjectThurston.html#isLight",
                          "tf": 700
                        },
                        "Light.html#isLight": {
                          "ref": "Light.html#isLight",
                          "tf": 700
                        },
                        "Solid.html#isLight": {
                          "ref": "Solid.html#isLight",
                          "tf": 700
                        }
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "o": {
                "docs": {},
                "l": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "d": {
                      "docs": {
                        "ObjectThurston.html#isSolid": {
                          "ref": "ObjectThurston.html#isSolid",
                          "tf": 700
                        },
                        "Light.html#isSolid": {
                          "ref": "Light.html#isSolid",
                          "tf": 700
                        },
                        "Solid.html#isSolid": {
                          "ref": "Solid.html#isSolid",
                          "tf": 700
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "d": {
            "docs": {
              "ObjectThurston.html#name": {
                "ref": "ObjectThurston.html#name",
                "tf": 6.666666666666667
              },
              "Position.html#flowFromOrigin": {
                "ref": "Position.html#flowFromOrigin",
                "tf": 6.666666666666667
              },
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.9900990099009901
              },
              "Light.html#name": {
                "ref": "Light.html#name",
                "tf": 6.666666666666667
              },
              "Solid.html#name": {
                "ref": "Solid.html#name",
                "tf": 6.666666666666667
              }
            },
            "e": {
              "docs": {},
              "n": {
                "docs": {},
                "t": {
                  "docs": {
                    "Isometry.html#build": {
                      "ref": "Isometry.html#build",
                      "tf": 8.333333333333332
                    }
                  }
                }
              },
              "a": {
                "docs": {
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 0.9615384615384616
                  }
                }
              }
            }
          },
          ".": {
            "docs": {
              "Isometry.html#multiply": {
                "ref": "Isometry.html#multiply",
                "tf": 6.25
              },
              "Isometry.html#premultiply": {
                "ref": "Isometry.html#premultiply",
                "tf": 6.25
              },
              "ObjectThurston.html#local": {
                "ref": "ObjectThurston.html#local",
                "tf": 7.142857142857142
              },
              "Position.html#multiply": {
                "ref": "Position.html#multiply",
                "tf": 3.571428571428571
              },
              "Position.html#premultiply": {
                "ref": "Position.html#premultiply",
                "tf": 3.571428571428571
              },
              "Light.html#local": {
                "ref": "Light.html#local",
                "tf": 7.142857142857142
              },
              "Solid.html#local": {
                "ref": "Solid.html#local",
                "tf": 7.142857142857142
              },
              "RelPosition.html#localPoint": {
                "ref": "RelPosition.html#localPoint",
                "tf": 7.142857142857142
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 1.8518518518518516
              }
            }
          },
          "t": {
            "docs": {},
            "e": {
              "docs": {},
              "m": {
                "docs": {
                  "ObjectThurston.html#glsl": {
                    "ref": "ObjectThurston.html#glsl",
                    "tf": 6.25
                  },
                  "ObjectThurston.html#global": {
                    "ref": "ObjectThurston.html#global",
                    "tf": 12.5
                  },
                  "ObjectThurston.html#local": {
                    "ref": "ObjectThurston.html#local",
                    "tf": 7.142857142857142
                  },
                  "ObjectThurston.html#shaderSource": {
                    "ref": "ObjectThurston.html#shaderSource",
                    "tf": 10
                  },
                  "ObjectThurston.html#className": {
                    "ref": "ObjectThurston.html#className",
                    "tf": 5
                  },
                  "ObjectThurston.html#name": {
                    "ref": "ObjectThurston.html#name",
                    "tf": 6.666666666666667
                  },
                  "ObjectThurston.html#isLight": {
                    "ref": "ObjectThurston.html#isLight",
                    "tf": 25
                  },
                  "ObjectThurston.html#isSolid": {
                    "ref": "ObjectThurston.html#isSolid",
                    "tf": 25
                  },
                  "ObjectThurston.html#toGLSL": {
                    "ref": "ObjectThurston.html#toGLSL",
                    "tf": 12.5
                  },
                  "Light.html#glsl": {
                    "ref": "Light.html#glsl",
                    "tf": 6.25
                  },
                  "Light.html#global": {
                    "ref": "Light.html#global",
                    "tf": 12.5
                  },
                  "Light.html#local": {
                    "ref": "Light.html#local",
                    "tf": 7.142857142857142
                  },
                  "Light.html#shaderSource": {
                    "ref": "Light.html#shaderSource",
                    "tf": 10
                  },
                  "Light.html#className": {
                    "ref": "Light.html#className",
                    "tf": 5
                  },
                  "Light.html#name": {
                    "ref": "Light.html#name",
                    "tf": 6.666666666666667
                  },
                  "Light.html#isLight": {
                    "ref": "Light.html#isLight",
                    "tf": 25
                  },
                  "Light.html#isSolid": {
                    "ref": "Light.html#isSolid",
                    "tf": 25
                  },
                  "Light.html#glslBuildData": {
                    "ref": "Light.html#glslBuildData",
                    "tf": 5
                  },
                  "Solid.html#glsl": {
                    "ref": "Solid.html#glsl",
                    "tf": 6.25
                  },
                  "Solid.html#global": {
                    "ref": "Solid.html#global",
                    "tf": 12.5
                  },
                  "Solid.html#local": {
                    "ref": "Solid.html#local",
                    "tf": 7.142857142857142
                  },
                  "Solid.html#shaderSource": {
                    "ref": "Solid.html#shaderSource",
                    "tf": 10
                  },
                  "Solid.html#className": {
                    "ref": "Solid.html#className",
                    "tf": 5
                  },
                  "Solid.html#name": {
                    "ref": "Solid.html#name",
                    "tf": 6.666666666666667
                  },
                  "Solid.html#isLight": {
                    "ref": "Solid.html#isLight",
                    "tf": 25
                  },
                  "Solid.html#isSolid": {
                    "ref": "Solid.html#isSolid",
                    "tf": 25
                  },
                  "Solid.html#glslBuildData": {
                    "ref": "Solid.html#glslBuildData",
                    "tf": 5
                  },
                  "module-Thurston-Thurston.html#addItem": {
                    "ref": "module-Thurston-Thurston.html#addItem",
                    "tf": 16.666666666666664
                  },
                  "module-Thurston-Thurston.html#addItems": {
                    "ref": "module-Thurston-Thurston.html#addItems",
                    "tf": 12.5
                  },
                  "module-Thurston-Thurston.html#buildShaderDataBackground": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                    "tf": 5.555555555555555
                  },
                  "module-Thurston-Thurston.html#buildShaderDataItems": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                    "tf": 5
                  },
                  "module-Thurston-Thurston.html#buildShaderFragment": {
                    "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                    "tf": 4.166666666666666
                  }
                },
                "'": {
                  "docs": {
                    "ObjectThurston.html#point": {
                      "ref": "ObjectThurston.html#point",
                      "tf": 12.5
                    },
                    "Light.html#point": {
                      "ref": "Light.html#point",
                      "tf": 12.5
                    },
                    "Solid.html#point": {
                      "ref": "Solid.html#point",
                      "tf": 12.5
                    }
                  }
                }
              }
            }
          },
          "m": {
            "docs": {},
            "p": {
              "docs": {},
              "l": {
                "docs": {},
                "i": {
                  "docs": {},
                  "c": {
                    "docs": {},
                    "i": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Vector.html#applyMatrix4": {
                            "ref": "Vector.html#applyMatrix4",
                            "tf": 3.7037037037037033
                          },
                          "RelPosition.html": {
                            "ref": "RelPosition.html",
                            "tf": 0.9615384615384616
                          }
                        }
                      }
                    }
                  }
                },
                "e": {
                  "docs": {},
                  "m": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "n": {
                        "docs": {},
                        "t": {
                          "docs": {
                            "Subgroup.html": {
                              "ref": "Subgroup.html",
                              "tf": 0.7092198581560284
                            },
                            "Subgroup.html#shaderSource": {
                              "ref": "Subgroup.html#shaderSource",
                              "tf": 4.166666666666666
                            },
                            "VRControls.html": {
                              "ref": "VRControls.html",
                              "tf": 2.272727272727273
                            },
                            "KeyboardControls.html": {
                              "ref": "KeyboardControls.html",
                              "tf": 5.555555555555555
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "o": {
                "docs": {},
                "r": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              }
            },
            "a": {
              "docs": {},
              "g": {
                "docs": {
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 0.9615384615384616
                  }
                }
              }
            }
          },
          "g": {
            "docs": {},
            "n": {
              "docs": {},
              "o": {
                "docs": {},
                "r": {
                  "docs": {
                    "RelPosition.html#localPoint": {
                      "ref": "RelPosition.html#localPoint",
                      "tf": 7.142857142857142
                    }
                  }
                }
              }
            }
          }
        },
        "n": {
          "docs": {},
          "o": {
            "docs": {},
            "n": {
              "docs": {
                "index.html": {
                  "ref": "index.html",
                  "tf": 200
                },
                "module-Thurston-Thurston.html#_solids": {
                  "ref": "module-Thurston-Thurston.html#_solids",
                  "tf": 10
                },
                "module-Thurston-Thurston.html#_lights": {
                  "ref": "module-Thurston-Thurston.html#_lights",
                  "tf": 10
                },
                "module-Thurston-Thurston.html#chaseCamera": {
                  "ref": "module-Thurston-Thurston.html#chaseCamera",
                  "tf": 2
                }
              }
            },
            "r": {
              "docs": {},
              "m": {
                "docs": {
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.49504950495049505
                  },
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 2.380952380952381
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "e": {
                "docs": {
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              }
            },
            "w": {
              "docs": {
                "KeyboardControls.html#update": {
                  "ref": "KeyboardControls.html#update",
                  "tf": 0.4629629629629629
                }
              }
            }
          },
          "u": {
            "docs": {},
            "m": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {
                    "Isometry.html#reduceError": {
                      "ref": "Isometry.html#reduceError",
                      "tf": 5.555555555555555
                    },
                    "Position.html#reduceErrorBoost": {
                      "ref": "Position.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "Position.html#reduceErrorFacing": {
                      "ref": "Position.html#reduceErrorFacing",
                      "tf": 8.333333333333332
                    },
                    "Position.html#reduceError": {
                      "ref": "Position.html#reduceError",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorBoost": {
                      "ref": "RelPosition.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorFacing": {
                      "ref": "RelPosition.html#reduceErrorFacing",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorLocal": {
                      "ref": "RelPosition.html#reduceErrorLocal",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorCellBoost": {
                      "ref": "RelPosition.html#reduceErrorCellBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceError": {
                      "ref": "RelPosition.html#reduceError",
                      "tf": 8.333333333333332
                    }
                  }
                }
              },
              "b": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Light.html#maxDirs": {
                        "ref": "Light.html#maxDirs",
                        "tf": 8.333333333333332
                      },
                      "Material.html#ambient": {
                        "ref": "Material.html#ambient",
                        "tf": 50
                      },
                      "Material.html#diffuse": {
                        "ref": "Material.html#diffuse",
                        "tf": 50
                      },
                      "Material.html#specular": {
                        "ref": "Material.html#specular",
                        "tf": 50
                      },
                      "Material.html#shininess": {
                        "ref": "Material.html#shininess",
                        "tf": 50
                      },
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 1.0638297872340425
                      },
                      "module-Thurston-Thurston.html#_maxLightDirs": {
                        "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                        "tf": 39.58333333333333
                      },
                      "module-Thurston-Thurston.html#maxLightDirs": {
                        "ref": "module-Thurston-Thurston.html#maxLightDirs",
                        "tf": 62.5
                      }
                    }
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "l": {
              "docs": {
                "Isometry.html#makeTranslation": {
                  "ref": "Isometry.html#makeTranslation",
                  "tf": 4.166666666666666
                },
                "Isometry.html#makeInvTranslation": {
                  "ref": "Isometry.html#makeInvTranslation",
                  "tf": 4.166666666666666
                },
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.7092198581560284
                }
              }
            }
          },
          "e": {
            "docs": {},
            "w": {
              "docs": {
                "Isometry.html#clone": {
                  "ref": "Isometry.html#clone",
                  "tf": 10
                },
                "Point.html#clone": {
                  "ref": "Point.html#clone",
                  "tf": 10
                },
                "Position.html#flow": {
                  "ref": "Position.html#flow",
                  "tf": 0.9900990099009901
                },
                "Position.html#clone": {
                  "ref": "Position.html#clone",
                  "tf": 10
                },
                "RelPosition.html#clone": {
                  "ref": "RelPosition.html#clone",
                  "tf": 10
                },
                "module-Thurston-Thurston.html#registerParam": {
                  "ref": "module-Thurston-Thurston.html#registerParam",
                  "tf": 12.5
                }
              }
            },
            "v": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {
                    "ObjectThurston.html": {
                      "ref": "ObjectThurston.html",
                      "tf": 4.545454545454546
                    },
                    "Solid.html": {
                      "ref": "Solid.html",
                      "tf": 2.631578947368421
                    }
                  }
                }
              }
            },
            "e": {
              "docs": {},
              "d": {
                "docs": {
                  "Teleport.html": {
                    "ref": "Teleport.html",
                    "tf": 1.9230769230769231
                  },
                  "Teleport.html#test": {
                    "ref": "Teleport.html#test",
                    "tf": 5.88235294117647
                  },
                  "RelPosition.html#teleport": {
                    "ref": "RelPosition.html#teleport",
                    "tf": 5.555555555555555
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  },
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "m": {
              "docs": {},
              "e": {
                "docs": {
                  "ObjectThurston.html#className": {
                    "ref": "ObjectThurston.html#className",
                    "tf": 10
                  },
                  "ObjectThurston.html#name": {
                    "ref": "ObjectThurston.html#name",
                    "tf": 706.6666666666666
                  },
                  "Teleport.html#name": {
                    "ref": "Teleport.html#name",
                    "tf": 704.5454545454545
                  },
                  "Light.html#className": {
                    "ref": "Light.html#className",
                    "tf": 10
                  },
                  "Light.html#name": {
                    "ref": "Light.html#name",
                    "tf": 706.6666666666666
                  },
                  "Solid.html": {
                    "ref": "Solid.html",
                    "tf": 5.263157894736842
                  },
                  "Solid.html#className": {
                    "ref": "Solid.html#className",
                    "tf": 10
                  },
                  "Solid.html#name": {
                    "ref": "Solid.html#name",
                    "tf": 706.6666666666666
                  },
                  "module-Thurston-Thurston.html#registerParam": {
                    "ref": "module-Thurston-Thurston.html#registerParam",
                    "tf": 20
                  },
                  "module-Thurston-Thurston.html#appendTitle": {
                    "ref": "module-Thurston-Thurston.html#appendTitle",
                    "tf": 10
                  }
                }
              }
            }
          }
        },
        "p": {
          "docs": {
            "RelPosition.html": {
              "ref": "RelPosition.html",
              "tf": 1.9230769230769231
            },
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 0.4629629629629629
            }
          },
          "e": {
            "docs": {},
            "r": {
              "docs": {},
              "s": {
                "docs": {},
                "o": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "index.html": {
                        "ref": "index.html",
                        "tf": 14
                      }
                    }
                  }
                },
                "p": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "c": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Vector.html#applyMatrix4": {
                            "ref": "Vector.html#applyMatrix4",
                            "tf": 1.8518518518518516
                          }
                        },
                        "i": {
                          "docs": {},
                          "v": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "c": {
                                "docs": {},
                                "a": {
                                  "docs": {},
                                  "m": {
                                    "docs": {},
                                    "e": {
                                      "docs": {},
                                      "r": {
                                        "docs": {},
                                        "a": {
                                          "docs": {
                                            "module-Thurston-Thurston.html#_camera": {
                                              "ref": "module-Thurston-Thurston.html#_camera",
                                              "tf": 33.33333333333333
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "f": {
                "docs": {},
                "o": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "m": {
                      "docs": {
                        "Teleport.html#glsl": {
                          "ref": "Teleport.html#glsl",
                          "tf": 6.25
                        },
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.7092198581560284
                        },
                        "Subgroup.html#glslBuildData": {
                          "ref": "Subgroup.html#glslBuildData",
                          "tf": 4.545454545454546
                        },
                        "module-Thurston-Thurston.html#stats": {
                          "ref": "module-Thurston-Thurston.html#stats",
                          "tf": 25
                        },
                        "module-Thurston-Thurston.html#initStats": {
                          "ref": "module-Thurston-Thurston.html#initStats",
                          "tf": 16.666666666666664
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "s": {
              "docs": {},
              "s": {
                "docs": {
                  "Isometry.html#build": {
                    "ref": "Isometry.html#build",
                    "tf": 8.333333333333332
                  },
                  "Point.html#build": {
                    "ref": "Point.html#build",
                    "tf": 7.142857142857142
                  },
                  "module-Thurston-Thurston.html#registerParam": {
                    "ref": "module-Thurston-Thurston.html#registerParam",
                    "tf": 20
                  },
                  "module-Thurston-Thurston.html#buildShaderDataConstants": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                    "tf": 10
                  },
                  "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                    "tf": 10
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "h": {
                "docs": {
                  "ObjectThurston.html#shaderSource": {
                    "ref": "ObjectThurston.html#shaderSource",
                    "tf": 10
                  },
                  "Light.html#shaderSource": {
                    "ref": "Light.html#shaderSource",
                    "tf": 10
                  },
                  "Solid.html#shaderSource": {
                    "ref": "Solid.html#shaderSource",
                    "tf": 10
                  },
                  "Subgroup.html#shaderSource": {
                    "ref": "Subgroup.html#shaderSource",
                    "tf": 4.166666666666666
                  }
                }
              }
            },
            "r": {
              "docs": {
                "RelPosition.html#cellBoost": {
                  "ref": "RelPosition.html#cellBoost",
                  "tf": 10
                }
              },
              "t": {
                "docs": {
                  "Position.html#setBoost": {
                    "ref": "Position.html#setBoost",
                    "tf": 12.5
                  },
                  "Position.html#setFacing": {
                    "ref": "Position.html#setFacing",
                    "tf": 12.5
                  },
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 0.9615384615384616
                  }
                }
              },
              "a": {
                "docs": {},
                "m": {
                  "docs": {
                    "module-Thurston-Thurston.html#params": {
                      "ref": "module-Thurston-Thurston.html#params",
                      "tf": 703.5714285714286
                    },
                    "module-Thurston-Thurston.html#registerParam": {
                      "ref": "module-Thurston-Thurston.html#registerParam",
                      "tf": 12.5
                    },
                    "module-Thurston-Thurston.html#setParams": {
                      "ref": "module-Thurston-Thurston.html#setParams",
                      "tf": 33.33333333333333
                    }
                  },
                  "e": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "module-Thurston-Thurston.html#params": {
                          "ref": "module-Thurston-Thurston.html#params",
                          "tf": 3.571428571428571
                        },
                        "module-Thurston-Thurston.html#registerParam": {
                          "ref": "module-Thurston-Thurston.html#registerParam",
                          "tf": 12.5
                        },
                        "module-Thurston-Thurston.html#buildShaderDataConstants": {
                          "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                          "tf": 10
                        },
                        "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                          "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                          "tf": 10
                        }
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "r": {
                "docs": {
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 0.9615384615384616
                  }
                }
              }
            },
            "g": {
              "docs": {},
              "e": {
                "docs": {
                  "module-Thurston-Thurston.html#appendTitle": {
                    "ref": "module-Thurston-Thurston.html#appendTitle",
                    "tf": 10
                  }
                }
              }
            }
          },
          "r": {
            "docs": {},
            "e": {
              "docs": {},
              "m": {
                "docs": {},
                "u": {
                  "docs": {},
                  "l": {
                    "docs": {},
                    "t": {
                      "docs": {},
                      "i": {
                        "docs": {},
                        "p": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "i": {
                              "docs": {
                                "Isometry.html#premultiply": {
                                  "ref": "Isometry.html#premultiply",
                                  "tf": 675
                                },
                                "Position.html#premultiply": {
                                  "ref": "Position.html#premultiply",
                                  "tf": 683.3333333333334
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "f": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Isometry.html#makeTranslation": {
                        "ref": "Isometry.html#makeTranslation",
                        "tf": 4.166666666666666
                      },
                      "Isometry.html#makeInvTranslation": {
                        "ref": "Isometry.html#makeInvTranslation",
                        "tf": 4.166666666666666
                      }
                    }
                  }
                }
              },
              "s": {
                "docs": {},
                "s": {
                  "docs": {
                    "KeyboardControls.html#infos": {
                      "ref": "KeyboardControls.html#infos",
                      "tf": 10
                    },
                    "KeyboardControls.html#onKeyDown": {
                      "ref": "KeyboardControls.html#onKeyDown",
                      "tf": 12.5
                    },
                    "KeyboardControls.html#onKeyUp": {
                      "ref": "KeyboardControls.html#onKeyUp",
                      "tf": 12.5
                    },
                    "module-Thurston-Thurston.html#infos": {
                      "ref": "module-Thurston-Thurston.html#infos",
                      "tf": 8.333333333333332
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "m": {
                "docs": {},
                "i": {
                  "docs": {},
                  "s": {
                    "docs": {
                      "module-Thurston-Thurston.html#run": {
                        "ref": "module-Thurston-Thurston.html#run",
                        "tf": 5
                      }
                    },
                    "e": {
                      "docs": {},
                      ".": {
                        "docs": {},
                        "&": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "t": {
                              "docs": {},
                              ";": {
                                "docs": {},
                                "d": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "c": {
                                      "docs": {},
                                      "u": {
                                        "docs": {},
                                        "m": {
                                          "docs": {},
                                          "e": {
                                            "docs": {},
                                            "n": {
                                              "docs": {},
                                              "t": {
                                                "docs": {},
                                                "&": {
                                                  "docs": {},
                                                  "g": {
                                                    "docs": {},
                                                    "t": {
                                                      "docs": {
                                                        "ObjectThurston.html#loadGLSLTemplate": {
                                                          "ref": "ObjectThurston.html#loadGLSLTemplate",
                                                          "tf": 33.33333333333333
                                                        },
                                                        "ObjectThurston.html#loadGLSLDefaultTemplate": {
                                                          "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                                                          "tf": 33.33333333333333
                                                        },
                                                        "Light.html#loadGLSLTemplate": {
                                                          "ref": "Light.html#loadGLSLTemplate",
                                                          "tf": 33.33333333333333
                                                        },
                                                        "Light.html#loadGLSLDefaultTemplate": {
                                                          "ref": "Light.html#loadGLSLDefaultTemplate",
                                                          "tf": 33.33333333333333
                                                        },
                                                        "Solid.html#loadGLSLTemplate": {
                                                          "ref": "Solid.html#loadGLSLTemplate",
                                                          "tf": 33.33333333333333
                                                        },
                                                        "Solid.html#loadGLSLDefaultTemplate": {
                                                          "ref": "Solid.html#loadGLSLDefaultTemplate",
                                                          "tf": 33.33333333333333
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "v": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "i": {
                                      "docs": {},
                                      "d": {
                                        "docs": {},
                                        "&": {
                                          "docs": {},
                                          "g": {
                                            "docs": {},
                                            "t": {
                                              "docs": {
                                                "Light.html#glslBuildData": {
                                                  "ref": "Light.html#glslBuildData",
                                                  "tf": 25
                                                },
                                                "Light.html#glslBuildDataDefault": {
                                                  "ref": "Light.html#glslBuildDataDefault",
                                                  "tf": 20
                                                },
                                                "Solid.html#glslBuildData": {
                                                  "ref": "Solid.html#glslBuildData",
                                                  "tf": 25
                                                },
                                                "Solid.html#glslBuildDataDefault": {
                                                  "ref": "Solid.html#glslBuildDataDefault",
                                                  "tf": 20
                                                },
                                                "Subgroup.html#glslBuildData": {
                                                  "ref": "Subgroup.html#glslBuildData",
                                                  "tf": 33.33333333333333
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "a": {
                                  "docs": {},
                                  "r": {
                                    "docs": {},
                                    "r": {
                                      "docs": {},
                                      "a": {
                                        "docs": {},
                                        "y": {
                                          "docs": {},
                                          ".": {
                                            "docs": {},
                                            "&": {
                                              "docs": {},
                                              "l": {
                                                "docs": {},
                                                "t": {
                                                  "docs": {},
                                                  ";": {
                                                    "docs": {},
                                                    "s": {
                                                      "docs": {},
                                                      "t": {
                                                        "docs": {},
                                                        "r": {
                                                          "docs": {},
                                                          "i": {
                                                            "docs": {},
                                                            "n": {
                                                              "docs": {},
                                                              "g": {
                                                                "docs": {},
                                                                "&": {
                                                                  "docs": {},
                                                                  "g": {
                                                                    "docs": {},
                                                                    "t": {
                                                                      "docs": {},
                                                                      ";": {
                                                                        "docs": {},
                                                                        "&": {
                                                                          "docs": {},
                                                                          "g": {
                                                                            "docs": {},
                                                                            "t": {
                                                                              "docs": {
                                                                                "module-Thurston-Thurston.html#buildShaderDataBackground": {
                                                                                  "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                                                                                  "tf": 33.33333333333333
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "{": {
                                  "docs": {},
                                  "s": {
                                    "docs": {},
                                    "o": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "i": {
                                          "docs": {},
                                          "d": {
                                            "docs": {
                                              "module-Thurston-Thurston.html#buildShaderDataItems": {
                                                "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                                                "tf": 16.666666666666664
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "t": {
                                  "docs": {},
                                  "h": {
                                    "docs": {},
                                    "u": {
                                      "docs": {},
                                      "r": {
                                        "docs": {},
                                        "s": {
                                          "docs": {},
                                          "t": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "n": {
                                                "docs": {},
                                                "&": {
                                                  "docs": {},
                                                  "g": {
                                                    "docs": {},
                                                    "t": {
                                                      "docs": {
                                                        "module-Thurston-Thurston.html#initHorizon": {
                                                          "ref": "module-Thurston-Thurston.html#initHorizon",
                                                          "tf": 33.33333333333333
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "c": {
                "docs": {},
                "e": {
                  "docs": {},
                  "d": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "r": {
                        "docs": {
                          "Position.html#flow": {
                            "ref": "Position.html#flow",
                            "tf": 0.49504950495049505
                          }
                        }
                      }
                    }
                  }
                }
              },
              "b": {
                "docs": {},
                "a": {
                  "docs": {},
                  "b": {
                    "docs": {},
                    "l": {
                      "docs": {
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.7092198581560284
                        }
                      }
                    }
                  }
                }
              },
              "d": {
                "docs": {},
                "u": {
                  "docs": {},
                  "c": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 1.0638297872340425
                        }
                      }
                    }
                  }
                }
              },
              "x": {
                "docs": {},
                "i": {
                  "docs": {
                    "module-Thurston-Thurston.html#params": {
                      "ref": "module-Thurston-Thurston.html#params",
                      "tf": 3.571428571428571
                    }
                  }
                }
              },
              "p": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "t": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "module-Thurston-Thurston.html#buildShaderDataItems": {
                            "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                            "tf": 5
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "v": {
                "docs": {},
                "a": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "Teleport.html#name": {
                        "ref": "Teleport.html#name",
                        "tf": 4.545454545454546
                      }
                    }
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "i": {
              "docs": {},
              "n": {
                "docs": {},
                "t": {
                  "docs": {
                    "Isometry.html#makeTranslation": {
                      "ref": "Isometry.html#makeTranslation",
                      "tf": 29.166666666666664
                    },
                    "Isometry.html#makeInvTranslation": {
                      "ref": "Isometry.html#makeInvTranslation",
                      "tf": 29.166666666666664
                    },
                    "Point.html": {
                      "ref": "Point.html",
                      "tf": 1925
                    },
                    "Point.html#set": {
                      "ref": "Point.html#set",
                      "tf": 35
                    },
                    "Point.html#applyIsometry": {
                      "ref": "Point.html#applyIsometry",
                      "tf": 35
                    },
                    "Point.html#equals": {
                      "ref": "Point.html#equals",
                      "tf": 37.5
                    },
                    "Point.html#clone": {
                      "ref": "Point.html#clone",
                      "tf": 43.33333333333333
                    },
                    "Point.html#copy": {
                      "ref": "Point.html#copy",
                      "tf": 70
                    },
                    "Point.html#toGLSL": {
                      "ref": "Point.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "ObjectThurston.html#point": {
                      "ref": "ObjectThurston.html#point",
                      "tf": 762.5
                    },
                    "Teleport.html": {
                      "ref": "Teleport.html",
                      "tf": 1.9230769230769231
                    },
                    "Teleport.html#test": {
                      "ref": "Teleport.html#test",
                      "tf": 2.941176470588235
                    },
                    "Position.html#point": {
                      "ref": "Position.html#point",
                      "tf": 766.6666666666666
                    },
                    "Light.html": {
                      "ref": "Light.html",
                      "tf": 10
                    },
                    "Light.html#maxDirs": {
                      "ref": "Light.html#maxDirs",
                      "tf": 8.333333333333332
                    },
                    "Light.html#point": {
                      "ref": "Light.html#point",
                      "tf": 762.5
                    },
                    "Solid.html#point": {
                      "ref": "Solid.html#point",
                      "tf": 762.5
                    },
                    "Vector.html#applyMatrix4": {
                      "ref": "Vector.html#applyMatrix4",
                      "tf": 1.8518518518518516
                    },
                    "RelPosition.html#localPoint": {
                      "ref": "RelPosition.html#localPoint",
                      "tf": 57.14285714285714
                    },
                    "RelPosition.html#point": {
                      "ref": "RelPosition.html#point",
                      "tf": 758.3333333333334
                    },
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.3546099290780142
                    }
                  },
                  "#": {
                    "docs": {},
                    "b": {
                      "docs": {},
                      "u": {
                        "docs": {},
                        "i": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "d": {
                              "docs": {
                                "Point.html#build": {
                                  "ref": "Point.html#build",
                                  "tf": 1150
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "s": {
                      "docs": {},
                      "e": {
                        "docs": {},
                        "t": {
                          "docs": {
                            "Point.html#set": {
                              "ref": "Point.html#set",
                              "tf": 1150
                            }
                          }
                        }
                      }
                    },
                    "a": {
                      "docs": {},
                      "p": {
                        "docs": {},
                        "p": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "y": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "s": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "m": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "t": {
                                          "docs": {},
                                          "r": {
                                            "docs": {},
                                            "i": {
                                              "docs": {
                                                "Point.html#applyIsometry": {
                                                  "ref": "Point.html#applyIsometry",
                                                  "tf": 1150
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "e": {
                      "docs": {},
                      "q": {
                        "docs": {},
                        "u": {
                          "docs": {
                            "Point.html#equals": {
                              "ref": "Point.html#equals",
                              "tf": 1150
                            }
                          }
                        }
                      }
                    },
                    "c": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "o": {
                          "docs": {},
                          "n": {
                            "docs": {
                              "Point.html#clone": {
                                "ref": "Point.html#clone",
                                "tf": 1150
                              }
                            }
                          }
                        }
                      },
                      "o": {
                        "docs": {},
                        "p": {
                          "docs": {},
                          "i": {
                            "docs": {
                              "Point.html#copy": {
                                "ref": "Point.html#copy",
                                "tf": 1150
                              }
                            }
                          }
                        }
                      }
                    },
                    "t": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "g": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "l": {
                                "docs": {
                                  "Point.html#toGLSL": {
                                    "ref": "Point.html#toGLSL",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "i": {
                "docs": {},
                "t": {
                  "docs": {
                    "ObjectThurston.html#position": {
                      "ref": "ObjectThurston.html#position",
                      "tf": 775
                    },
                    "ObjectThurston.html#point": {
                      "ref": "ObjectThurston.html#point",
                      "tf": 12.5
                    },
                    "Position.html": {
                      "ref": "Position.html",
                      "tf": 1900
                    },
                    "Position.html#boost": {
                      "ref": "Position.html#boost",
                      "tf": 16.666666666666664
                    },
                    "Position.html#facing": {
                      "ref": "Position.html#facing",
                      "tf": 16.666666666666664
                    },
                    "Position.html#setBoost": {
                      "ref": "Position.html#setBoost",
                      "tf": 45.83333333333333
                    },
                    "Position.html#setFacing": {
                      "ref": "Position.html#setFacing",
                      "tf": 45.83333333333333
                    },
                    "Position.html#reduceErrorBoost": {
                      "ref": "Position.html#reduceErrorBoost",
                      "tf": 50
                    },
                    "Position.html#reduceErrorFacing": {
                      "ref": "Position.html#reduceErrorFacing",
                      "tf": 50
                    },
                    "Position.html#reduceError": {
                      "ref": "Position.html#reduceError",
                      "tf": 58.33333333333333
                    },
                    "Position.html#applyIsometry": {
                      "ref": "Position.html#applyIsometry",
                      "tf": 42.42424242424242
                    },
                    "Position.html#applyFacing": {
                      "ref": "Position.html#applyFacing",
                      "tf": 39.58333333333333
                    },
                    "Position.html#multiply": {
                      "ref": "Position.html#multiply",
                      "tf": 73.8095238095238
                    },
                    "Position.html#premultiply": {
                      "ref": "Position.html#premultiply",
                      "tf": 73.8095238095238
                    },
                    "Position.html#getInverse": {
                      "ref": "Position.html#getInverse",
                      "tf": 83.33333333333331
                    },
                    "Position.html#flowFromOrigin": {
                      "ref": "Position.html#flowFromOrigin",
                      "tf": 31.666666666666668
                    },
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 36.79867986798679
                    },
                    "Position.html#equals": {
                      "ref": "Position.html#equals",
                      "tf": 53.33333333333333
                    },
                    "Position.html#clone": {
                      "ref": "Position.html#clone",
                      "tf": 60
                    },
                    "Position.html#copy": {
                      "ref": "Position.html#copy",
                      "tf": 76.66666666666666
                    },
                    "Position.html#toGLSL": {
                      "ref": "Position.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Light.html#position": {
                      "ref": "Light.html#position",
                      "tf": 775
                    },
                    "Light.html#point": {
                      "ref": "Light.html#point",
                      "tf": 12.5
                    },
                    "Solid.html#position": {
                      "ref": "Solid.html#position",
                      "tf": 775
                    },
                    "Solid.html#point": {
                      "ref": "Solid.html#point",
                      "tf": 12.5
                    },
                    "Vector.html#applyFacing": {
                      "ref": "Vector.html#applyFacing",
                      "tf": 35.964912280701746
                    },
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 5.769230769230769
                    },
                    "RelPosition.html#local": {
                      "ref": "RelPosition.html#local",
                      "tf": 75
                    },
                    "RelPosition.html#sbgp": {
                      "ref": "RelPosition.html#sbgp",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceError": {
                      "ref": "RelPosition.html#reduceError",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#applyFacing": {
                      "ref": "RelPosition.html#applyFacing",
                      "tf": 6.25
                    },
                    "RelPosition.html#flow": {
                      "ref": "RelPosition.html#flow",
                      "tf": 4.761904761904762
                    },
                    "RelPosition.html#equals": {
                      "ref": "RelPosition.html#equals",
                      "tf": 45.83333333333333
                    },
                    "RelPosition.html#clone": {
                      "ref": "RelPosition.html#clone",
                      "tf": 10
                    },
                    "RelPosition.html#copy": {
                      "ref": "RelPosition.html#copy",
                      "tf": 53.33333333333333
                    },
                    "RelPosition.html#toGLSL": {
                      "ref": "RelPosition.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "VRControls.html#update": {
                      "ref": "VRControls.html#update",
                      "tf": 16.666666666666664
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 1.8518518518518516
                    },
                    "module-Thurston-Thurston.html#chaseCamera": {
                      "ref": "module-Thurston-Thurston.html#chaseCamera",
                      "tf": 6
                    },
                    "module-Thurston-Thurston.html#getEyePositions": {
                      "ref": "module-Thurston-Thurston.html#getEyePositions",
                      "tf": 10
                    }
                  },
                  "i": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "n": {
                        "docs": {},
                        "#": {
                          "docs": {},
                          "b": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "o": {
                                "docs": {},
                                "s": {
                                  "docs": {},
                                  "t": {
                                    "docs": {
                                      "Position.html#boost": {
                                        "ref": "Position.html#boost",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "f": {
                            "docs": {},
                            "a": {
                              "docs": {},
                              "c": {
                                "docs": {
                                  "Position.html#facing": {
                                    "ref": "Position.html#facing",
                                    "tf": 1150
                                  }
                                }
                              }
                            },
                            "l": {
                              "docs": {},
                              "o": {
                                "docs": {},
                                "w": {
                                  "docs": {
                                    "Position.html#flow": {
                                      "ref": "Position.html#flow",
                                      "tf": 1150
                                    }
                                  },
                                  "f": {
                                    "docs": {},
                                    "r": {
                                      "docs": {},
                                      "o": {
                                        "docs": {},
                                        "m": {
                                          "docs": {},
                                          "o": {
                                            "docs": {},
                                            "r": {
                                              "docs": {},
                                              "i": {
                                                "docs": {},
                                                "g": {
                                                  "docs": {},
                                                  "i": {
                                                    "docs": {},
                                                    "n": {
                                                      "docs": {
                                                        "Position.html#flowFromOrigin": {
                                                          "ref": "Position.html#flowFromOrigin",
                                                          "tf": 1150
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "p": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "n": {
                                  "docs": {},
                                  "t": {
                                    "docs": {
                                      "Position.html#point": {
                                        "ref": "Position.html#point",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            "r": {
                              "docs": {},
                              "e": {
                                "docs": {},
                                "m": {
                                  "docs": {},
                                  "u": {
                                    "docs": {},
                                    "l": {
                                      "docs": {},
                                      "t": {
                                        "docs": {},
                                        "i": {
                                          "docs": {},
                                          "p": {
                                            "docs": {},
                                            "l": {
                                              "docs": {},
                                              "i": {
                                                "docs": {
                                                  "Position.html#premultiply": {
                                                    "ref": "Position.html#premultiply",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "s": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "t": {
                                "docs": {},
                                "b": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "o": {
                                      "docs": {},
                                      "s": {
                                        "docs": {},
                                        "t": {
                                          "docs": {
                                            "Position.html#setBoost": {
                                              "ref": "Position.html#setBoost",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "f": {
                                  "docs": {},
                                  "a": {
                                    "docs": {},
                                    "c": {
                                      "docs": {
                                        "Position.html#setFacing": {
                                          "ref": "Position.html#setFacing",
                                          "tf": 1150
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "r": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "d": {
                                "docs": {},
                                "u": {
                                  "docs": {},
                                  "c": {
                                    "docs": {},
                                    "e": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "r": {
                                          "docs": {},
                                          "r": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "r": {
                                                "docs": {
                                                  "Position.html#reduceError": {
                                                    "ref": "Position.html#reduceError",
                                                    "tf": 1150
                                                  }
                                                },
                                                "b": {
                                                  "docs": {},
                                                  "o": {
                                                    "docs": {},
                                                    "o": {
                                                      "docs": {},
                                                      "s": {
                                                        "docs": {},
                                                        "t": {
                                                          "docs": {
                                                            "Position.html#reduceErrorBoost": {
                                                              "ref": "Position.html#reduceErrorBoost",
                                                              "tf": 1150
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                },
                                                "f": {
                                                  "docs": {},
                                                  "a": {
                                                    "docs": {},
                                                    "c": {
                                                      "docs": {
                                                        "Position.html#reduceErrorFacing": {
                                                          "ref": "Position.html#reduceErrorFacing",
                                                          "tf": 1150
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "a": {
                            "docs": {},
                            "p": {
                              "docs": {},
                              "p": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "y": {
                                    "docs": {},
                                    "i": {
                                      "docs": {},
                                      "s": {
                                        "docs": {},
                                        "o": {
                                          "docs": {},
                                          "m": {
                                            "docs": {},
                                            "e": {
                                              "docs": {},
                                              "t": {
                                                "docs": {},
                                                "r": {
                                                  "docs": {},
                                                  "i": {
                                                    "docs": {
                                                      "Position.html#applyIsometry": {
                                                        "ref": "Position.html#applyIsometry",
                                                        "tf": 1150
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "f": {
                                      "docs": {},
                                      "a": {
                                        "docs": {},
                                        "c": {
                                          "docs": {
                                            "Position.html#applyFacing": {
                                              "ref": "Position.html#applyFacing",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "m": {
                            "docs": {},
                            "u": {
                              "docs": {},
                              "l": {
                                "docs": {},
                                "t": {
                                  "docs": {},
                                  "i": {
                                    "docs": {},
                                    "p": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "i": {
                                          "docs": {
                                            "Position.html#multiply": {
                                              "ref": "Position.html#multiply",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "g": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "t": {
                                "docs": {},
                                "i": {
                                  "docs": {},
                                  "n": {
                                    "docs": {},
                                    "v": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "r": {
                                          "docs": {},
                                          "s": {
                                            "docs": {
                                              "Position.html#getInverse": {
                                                "ref": "Position.html#getInverse",
                                                "tf": 1150
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "e": {
                            "docs": {},
                            "q": {
                              "docs": {},
                              "u": {
                                "docs": {
                                  "Position.html#equals": {
                                    "ref": "Position.html#equals",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          },
                          "c": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "o": {
                                "docs": {},
                                "n": {
                                  "docs": {
                                    "Position.html#clone": {
                                      "ref": "Position.html#clone",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            },
                            "o": {
                              "docs": {},
                              "p": {
                                "docs": {},
                                "i": {
                                  "docs": {
                                    "Position.html#copy": {
                                      "ref": "Position.html#copy",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "t": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "g": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "s": {
                                    "docs": {},
                                    "l": {
                                      "docs": {
                                        "Position.html#toGLSL": {
                                          "ref": "Position.html#toGLSL",
                                          "tf": 1150
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "s": {
                "docs": {},
                "i": {
                  "docs": {},
                  "b": {
                    "docs": {},
                    "l": {
                      "docs": {
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.7092198581560284
                        }
                      }
                    }
                  }
                }
              }
            },
            "p": {
              "docs": {},
              "u": {
                "docs": {},
                "l": {
                  "docs": {
                    "module-Thurston-Thurston.html#buildShaderFragment": {
                      "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                      "tf": 2.083333333333333
                    }
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "r": {
              "docs": {},
              "p": {
                "docs": {},
                "o": {
                  "docs": {},
                  "s": {
                    "docs": {
                      "Isometry.html#equals": {
                        "ref": "Isometry.html#equals",
                        "tf": 6.25
                      },
                      "Point.html#equals": {
                        "ref": "Point.html#equals",
                        "tf": 6.25
                      },
                      "Vector.html#toLog": {
                        "ref": "Vector.html#toLog",
                        "tf": 4.545454545454546
                      },
                      "RelPosition.html#equals": {
                        "ref": "RelPosition.html#equals",
                        "tf": 6.25
                      }
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "l": {
                "docs": {
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.9900990099009901
                  },
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 2.380952380952381
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "e": {
              "docs": {},
              "c": {
                "docs": {
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 0.9615384615384616
                  }
                }
              }
            }
          },
          "l": {
            "docs": {},
            "a": {
              "docs": {},
              "y": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            }
          }
        },
        "r": {
          "docs": {},
          "e": {
            "docs": {},
            "a": {
              "docs": {},
              "d": {
                "docs": {},
                "m": {
                  "docs": {
                    "index.html": {
                      "ref": "index.html",
                      "tf": 110
                    }
                  }
                },
                "a": {
                  "docs": {},
                  "b": {
                    "docs": {},
                    "l": {
                      "docs": {
                        "Vector.html#toLog": {
                          "ref": "Vector.html#toLog",
                          "tf": 4.545454545454546
                        }
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "u": {
                "docs": {},
                "r": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "Isometry.html#build": {
                        "ref": "Isometry.html#build",
                        "tf": 8.333333333333332
                      },
                      "Isometry.html#makeTranslation": {
                        "ref": "Isometry.html#makeTranslation",
                        "tf": 4.166666666666666
                      },
                      "Isometry.html#makeInvTranslation": {
                        "ref": "Isometry.html#makeInvTranslation",
                        "tf": 4.166666666666666
                      },
                      "Isometry.html#clone": {
                        "ref": "Isometry.html#clone",
                        "tf": 10
                      },
                      "Isometry.html#toGLSL": {
                        "ref": "Isometry.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "Point.html#build": {
                        "ref": "Point.html#build",
                        "tf": 7.142857142857142
                      },
                      "Point.html#clone": {
                        "ref": "Point.html#clone",
                        "tf": 10
                      },
                      "Point.html#toGLSL": {
                        "ref": "Point.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "ObjectThurston.html#shaderSource": {
                        "ref": "ObjectThurston.html#shaderSource",
                        "tf": 10
                      },
                      "ObjectThurston.html#toGLSL": {
                        "ref": "ObjectThurston.html#toGLSL",
                        "tf": 6.25
                      },
                      "ObjectThurston.html#loadGLSLTemplate": {
                        "ref": "ObjectThurston.html#loadGLSLTemplate",
                        "tf": 5
                      },
                      "ObjectThurston.html#loadGLSLDefaultTemplate": {
                        "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                        "tf": 5
                      },
                      "Teleport.html#test": {
                        "ref": "Teleport.html#test",
                        "tf": 2.941176470588235
                      },
                      "Position.html#point": {
                        "ref": "Position.html#point",
                        "tf": 16.666666666666664
                      },
                      "Position.html#multiply": {
                        "ref": "Position.html#multiply",
                        "tf": 3.571428571428571
                      },
                      "Position.html#premultiply": {
                        "ref": "Position.html#premultiply",
                        "tf": 3.571428571428571
                      },
                      "Position.html#clone": {
                        "ref": "Position.html#clone",
                        "tf": 10
                      },
                      "Position.html#toGLSL": {
                        "ref": "Position.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "Light.html#shaderSource": {
                        "ref": "Light.html#shaderSource",
                        "tf": 10
                      },
                      "Light.html#maxDirs": {
                        "ref": "Light.html#maxDirs",
                        "tf": 8.333333333333332
                      },
                      "Light.html#toGLSL": {
                        "ref": "Light.html#toGLSL",
                        "tf": 6.25
                      },
                      "Light.html#loadGLSLTemplate": {
                        "ref": "Light.html#loadGLSLTemplate",
                        "tf": 5
                      },
                      "Light.html#loadGLSLDefaultTemplate": {
                        "ref": "Light.html#loadGLSLDefaultTemplate",
                        "tf": 5
                      },
                      "Solid.html#shaderSource": {
                        "ref": "Solid.html#shaderSource",
                        "tf": 10
                      },
                      "Solid.html#toGLSL": {
                        "ref": "Solid.html#toGLSL",
                        "tf": 6.25
                      },
                      "Solid.html#loadGLSLTemplate": {
                        "ref": "Solid.html#loadGLSLTemplate",
                        "tf": 5
                      },
                      "Solid.html#loadGLSLDefaultTemplate": {
                        "ref": "Solid.html#loadGLSLDefaultTemplate",
                        "tf": 5
                      },
                      "Vector.html#toLog": {
                        "ref": "Vector.html#toLog",
                        "tf": 4.545454545454546
                      },
                      "Vector.html#toGLSL": {
                        "ref": "Vector.html#toGLSL",
                        "tf": 4.166666666666666
                      },
                      "RelPosition.html#clone": {
                        "ref": "RelPosition.html#clone",
                        "tf": 10
                      },
                      "RelPosition.html#toGLSL": {
                        "ref": "RelPosition.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "Material.html#toGLSL": {
                        "ref": "Material.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "module-Thurston-Thurston.html#getEyePositions": {
                        "ref": "module-Thurston-Thurston.html#getEyePositions",
                        "tf": 3.3333333333333335
                      },
                      "module-Thurston-Thurston.html#buildShaderDataBackground": {
                        "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                        "tf": 5.555555555555555
                      },
                      "module-Thurston-Thurston.html#buildShaderDataItems": {
                        "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                        "tf": 5
                      }
                    }
                  }
                }
              }
            },
            "d": {
              "docs": {},
              "u": {
                "docs": {},
                "c": {
                  "docs": {
                    "Isometry.html#reduceError": {
                      "ref": "Isometry.html#reduceError",
                      "tf": 5.555555555555555
                    },
                    "Position.html#reduceErrorBoost": {
                      "ref": "Position.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "Position.html#reduceErrorFacing": {
                      "ref": "Position.html#reduceErrorFacing",
                      "tf": 8.333333333333332
                    },
                    "Position.html#reduceError": {
                      "ref": "Position.html#reduceError",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorBoost": {
                      "ref": "RelPosition.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorFacing": {
                      "ref": "RelPosition.html#reduceErrorFacing",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorLocal": {
                      "ref": "RelPosition.html#reduceErrorLocal",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorCellBoost": {
                      "ref": "RelPosition.html#reduceErrorCellBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceError": {
                      "ref": "RelPosition.html#reduceError",
                      "tf": 8.333333333333332
                    }
                  },
                  "e": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "r": {
                        "docs": {},
                        "r": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "r": {
                              "docs": {
                                "Isometry.html#reduceError": {
                                  "ref": "Isometry.html#reduceError",
                                  "tf": 683.3333333333334
                                },
                                "Position.html#reduceError": {
                                  "ref": "Position.html#reduceError",
                                  "tf": 700
                                },
                                "RelPosition.html#reduceError": {
                                  "ref": "RelPosition.html#reduceError",
                                  "tf": 700
                                }
                              },
                              "b": {
                                "docs": {},
                                "o": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "s": {
                                      "docs": {},
                                      "t": {
                                        "docs": {
                                          "Position.html#reduceErrorBoost": {
                                            "ref": "Position.html#reduceErrorBoost",
                                            "tf": 700
                                          },
                                          "RelPosition.html#reduceErrorBoost": {
                                            "ref": "RelPosition.html#reduceErrorBoost",
                                            "tf": 700
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "f": {
                                "docs": {},
                                "a": {
                                  "docs": {},
                                  "c": {
                                    "docs": {
                                      "Position.html#reduceErrorFacing": {
                                        "ref": "Position.html#reduceErrorFacing",
                                        "tf": 700
                                      },
                                      "RelPosition.html#reduceErrorFacing": {
                                        "ref": "RelPosition.html#reduceErrorFacing",
                                        "tf": 700
                                      }
                                    }
                                  }
                                }
                              },
                              "l": {
                                "docs": {},
                                "o": {
                                  "docs": {},
                                  "c": {
                                    "docs": {
                                      "RelPosition.html#reduceErrorLocal": {
                                        "ref": "RelPosition.html#reduceErrorLocal",
                                        "tf": 700
                                      }
                                    }
                                  }
                                }
                              },
                              "c": {
                                "docs": {},
                                "e": {
                                  "docs": {},
                                  "l": {
                                    "docs": {},
                                    "l": {
                                      "docs": {},
                                      "b": {
                                        "docs": {},
                                        "o": {
                                          "docs": {},
                                          "o": {
                                            "docs": {},
                                            "s": {
                                              "docs": {},
                                              "t": {
                                                "docs": {
                                                  "RelPosition.html#reduceErrorCellBoost": {
                                                    "ref": "RelPosition.html#reduceErrorCellBoost",
                                                    "tf": 700
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "p": {
              "docs": {},
              "l": {
                "docs": {},
                "a": {
                  "docs": {},
                  "c": {
                    "docs": {
                      "Isometry.html#multiply": {
                        "ref": "Isometry.html#multiply",
                        "tf": 6.25
                      },
                      "Isometry.html#premultiply": {
                        "ref": "Isometry.html#premultiply",
                        "tf": 6.25
                      },
                      "Position.html#flowFromOrigin": {
                        "ref": "Position.html#flowFromOrigin",
                        "tf": 3.3333333333333335
                      }
                    }
                  }
                }
              },
              "r": {
                "docs": {},
                "e": {
                  "docs": {},
                  "s": {
                    "docs": {
                      "Vector.html#applyMatrix4": {
                        "ref": "Vector.html#applyMatrix4",
                        "tf": 1.8518518518518516
                      },
                      "RelPosition.html": {
                        "ref": "RelPosition.html",
                        "tf": 3.8461538461538463
                      },
                      "KeyboardControls.html#update": {
                        "ref": "KeyboardControls.html#update",
                        "tf": 0.4629629629629629
                      }
                    },
                    "e": {
                      "docs": {},
                      "n": {
                        "docs": {},
                        "t": {
                          "docs": {
                            "Subgroup.html": {
                              "ref": "Subgroup.html",
                              "tf": 1.4184397163120568
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "c": {
              "docs": {},
              "e": {
                "docs": {},
                "i": {
                  "docs": {},
                  "v": {
                    "docs": {
                      "ObjectThurston.html#name": {
                        "ref": "ObjectThurston.html#name",
                        "tf": 3.3333333333333335
                      },
                      "Light.html#name": {
                        "ref": "Light.html#name",
                        "tf": 3.3333333333333335
                      },
                      "Solid.html#name": {
                        "ref": "Solid.html#name",
                        "tf": 3.3333333333333335
                      }
                    }
                  }
                }
              },
              "r": {
                "docs": {},
                "e": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "ObjectThurston.html#toGLSL": {
                          "ref": "ObjectThurston.html#toGLSL",
                          "tf": 6.25
                        },
                        "Light.html#toGLSL": {
                          "ref": "Light.html#toGLSL",
                          "tf": 6.25
                        },
                        "Solid.html#toGLSL": {
                          "ref": "Solid.html#toGLSL",
                          "tf": 6.25
                        },
                        "Vector.html#toGLSL": {
                          "ref": "Vector.html#toGLSL",
                          "tf": 4.166666666666666
                        }
                      }
                    }
                  }
                }
              }
            },
            "f": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {
                    "Position.html#flowFromOrigin": {
                      "ref": "Position.html#flowFromOrigin",
                      "tf": 3.3333333333333335
                    },
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 0.49504950495049505
                    },
                    "Vector.html": {
                      "ref": "Vector.html",
                      "tf": 3.8461538461538463
                    },
                    "Vector.html#applyFacing": {
                      "ref": "Vector.html#applyFacing",
                      "tf": 5.263157894736842
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.4629629629629629
                    }
                  }
                }
              },
              "l": {
                "docs": {},
                "e": {
                  "docs": {},
                  "c": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Material.html#ambient": {
                          "ref": "Material.html#ambient",
                          "tf": 16.666666666666664
                        },
                        "Material.html#diffuse": {
                          "ref": "Material.html#diffuse",
                          "tf": 16.666666666666664
                        },
                        "Material.html#specular": {
                          "ref": "Material.html#specular",
                          "tf": 16.666666666666664
                        },
                        "Material.html#shininess": {
                          "ref": "Material.html#shininess",
                          "tf": 16.666666666666664
                        }
                      }
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {
                "Light.html#glslBuildData": {
                  "ref": "Light.html#glslBuildData",
                  "tf": 5
                },
                "Solid.html#glslBuildData": {
                  "ref": "Solid.html#glslBuildData",
                  "tf": 5
                },
                "RelPosition.html": {
                  "ref": "RelPosition.html",
                  "tf": 1.9230769230769231
                }
              },
              "p": {
                "docs": {},
                "o": {
                  "docs": {},
                  "s": {
                    "docs": {},
                    "i": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "RelPosition.html": {
                            "ref": "RelPosition.html",
                            "tf": 1900
                          },
                          "RelPosition.html#reduceErrorBoost": {
                            "ref": "RelPosition.html#reduceErrorBoost",
                            "tf": 50
                          },
                          "RelPosition.html#reduceErrorFacing": {
                            "ref": "RelPosition.html#reduceErrorFacing",
                            "tf": 50
                          },
                          "RelPosition.html#reduceErrorLocal": {
                            "ref": "RelPosition.html#reduceErrorLocal",
                            "tf": 50
                          },
                          "RelPosition.html#reduceErrorCellBoost": {
                            "ref": "RelPosition.html#reduceErrorCellBoost",
                            "tf": 50
                          },
                          "RelPosition.html#reduceError": {
                            "ref": "RelPosition.html#reduceError",
                            "tf": 50
                          },
                          "RelPosition.html#applyFacing": {
                            "ref": "RelPosition.html#applyFacing",
                            "tf": 33.33333333333333
                          },
                          "RelPosition.html#teleport": {
                            "ref": "RelPosition.html#teleport",
                            "tf": 50
                          },
                          "RelPosition.html#flow": {
                            "ref": "RelPosition.html#flow",
                            "tf": 33.33333333333333
                          },
                          "RelPosition.html#clone": {
                            "ref": "RelPosition.html#clone",
                            "tf": 50
                          },
                          "RelPosition.html#copy": {
                            "ref": "RelPosition.html#copy",
                            "tf": 33.33333333333333
                          }
                        },
                        "i": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "n": {
                              "docs": {},
                              "#": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "c": {
                                      "docs": {
                                        "RelPosition.html#local": {
                                          "ref": "RelPosition.html#local",
                                          "tf": 1150
                                        }
                                      },
                                      "a": {
                                        "docs": {},
                                        "l": {
                                          "docs": {},
                                          "p": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "i": {
                                                "docs": {},
                                                "n": {
                                                  "docs": {},
                                                  "t": {
                                                    "docs": {
                                                      "RelPosition.html#localPoint": {
                                                        "ref": "RelPosition.html#localPoint",
                                                        "tf": 1150
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "c": {
                                  "docs": {},
                                  "e": {
                                    "docs": {},
                                    "l": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "b": {
                                          "docs": {},
                                          "o": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "s": {
                                                "docs": {},
                                                "t": {
                                                  "docs": {
                                                    "RelPosition.html#cellBoost": {
                                                      "ref": "RelPosition.html#cellBoost",
                                                      "tf": 1150
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  },
                                  "l": {
                                    "docs": {},
                                    "o": {
                                      "docs": {},
                                      "n": {
                                        "docs": {
                                          "RelPosition.html#clone": {
                                            "ref": "RelPosition.html#clone",
                                            "tf": 1150
                                          }
                                        }
                                      }
                                    }
                                  },
                                  "o": {
                                    "docs": {},
                                    "p": {
                                      "docs": {},
                                      "i": {
                                        "docs": {
                                          "RelPosition.html#copy": {
                                            "ref": "RelPosition.html#copy",
                                            "tf": 1150
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "i": {
                                  "docs": {},
                                  "n": {
                                    "docs": {},
                                    "v": {
                                      "docs": {},
                                      "c": {
                                        "docs": {},
                                        "e": {
                                          "docs": {},
                                          "l": {
                                            "docs": {},
                                            "l": {
                                              "docs": {},
                                              "b": {
                                                "docs": {},
                                                "o": {
                                                  "docs": {},
                                                  "o": {
                                                    "docs": {},
                                                    "s": {
                                                      "docs": {},
                                                      "t": {
                                                        "docs": {
                                                          "RelPosition.html#invCellBoost": {
                                                            "ref": "RelPosition.html#invCellBoost",
                                                            "tf": 1150
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "s": {
                                  "docs": {},
                                  "b": {
                                    "docs": {},
                                    "g": {
                                      "docs": {},
                                      "p": {
                                        "docs": {
                                          "RelPosition.html#sbgp": {
                                            "ref": "RelPosition.html#sbgp",
                                            "tf": 1150
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "p": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "i": {
                                      "docs": {},
                                      "n": {
                                        "docs": {},
                                        "t": {
                                          "docs": {
                                            "RelPosition.html#point": {
                                              "ref": "RelPosition.html#point",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "r": {
                                  "docs": {},
                                  "e": {
                                    "docs": {},
                                    "d": {
                                      "docs": {},
                                      "u": {
                                        "docs": {},
                                        "c": {
                                          "docs": {},
                                          "e": {
                                            "docs": {},
                                            "e": {
                                              "docs": {},
                                              "r": {
                                                "docs": {},
                                                "r": {
                                                  "docs": {},
                                                  "o": {
                                                    "docs": {},
                                                    "r": {
                                                      "docs": {
                                                        "RelPosition.html#reduceError": {
                                                          "ref": "RelPosition.html#reduceError",
                                                          "tf": 1150
                                                        }
                                                      },
                                                      "b": {
                                                        "docs": {},
                                                        "o": {
                                                          "docs": {},
                                                          "o": {
                                                            "docs": {},
                                                            "s": {
                                                              "docs": {},
                                                              "t": {
                                                                "docs": {
                                                                  "RelPosition.html#reduceErrorBoost": {
                                                                    "ref": "RelPosition.html#reduceErrorBoost",
                                                                    "tf": 1150
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      },
                                                      "f": {
                                                        "docs": {},
                                                        "a": {
                                                          "docs": {},
                                                          "c": {
                                                            "docs": {
                                                              "RelPosition.html#reduceErrorFacing": {
                                                                "ref": "RelPosition.html#reduceErrorFacing",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      },
                                                      "l": {
                                                        "docs": {},
                                                        "o": {
                                                          "docs": {},
                                                          "c": {
                                                            "docs": {
                                                              "RelPosition.html#reduceErrorLocal": {
                                                                "ref": "RelPosition.html#reduceErrorLocal",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      },
                                                      "c": {
                                                        "docs": {},
                                                        "e": {
                                                          "docs": {},
                                                          "l": {
                                                            "docs": {},
                                                            "l": {
                                                              "docs": {},
                                                              "b": {
                                                                "docs": {},
                                                                "o": {
                                                                  "docs": {},
                                                                  "o": {
                                                                    "docs": {},
                                                                    "s": {
                                                                      "docs": {},
                                                                      "t": {
                                                                        "docs": {
                                                                          "RelPosition.html#reduceErrorCellBoost": {
                                                                            "ref": "RelPosition.html#reduceErrorCellBoost",
                                                                            "tf": 1150
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "a": {
                                  "docs": {},
                                  "p": {
                                    "docs": {},
                                    "p": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "y": {
                                          "docs": {},
                                          "f": {
                                            "docs": {},
                                            "a": {
                                              "docs": {},
                                              "c": {
                                                "docs": {
                                                  "RelPosition.html#applyFacing": {
                                                    "ref": "RelPosition.html#applyFacing",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "t": {
                                  "docs": {},
                                  "e": {
                                    "docs": {},
                                    "l": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "p": {
                                          "docs": {},
                                          "o": {
                                            "docs": {},
                                            "r": {
                                              "docs": {},
                                              "t": {
                                                "docs": {
                                                  "RelPosition.html#teleport": {
                                                    "ref": "RelPosition.html#teleport",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  },
                                  "o": {
                                    "docs": {},
                                    "g": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "s": {
                                          "docs": {},
                                          "l": {
                                            "docs": {
                                              "RelPosition.html#toGLSL": {
                                                "ref": "RelPosition.html#toGLSL",
                                                "tf": 1150
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "f": {
                                  "docs": {},
                                  "l": {
                                    "docs": {},
                                    "o": {
                                      "docs": {},
                                      "w": {
                                        "docs": {
                                          "RelPosition.html#flow": {
                                            "ref": "RelPosition.html#flow",
                                            "tf": 1150
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "e": {
                                  "docs": {},
                                  "q": {
                                    "docs": {},
                                    "u": {
                                      "docs": {
                                        "RelPosition.html#equals": {
                                          "ref": "RelPosition.html#equals",
                                          "tf": 1150
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "d": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "module-Thurston-Thurston.html#_renderer": {
                        "ref": "module-Thurston-Thurston.html#_renderer",
                        "tf": 16.666666666666664
                      },
                      "module-Thurston.html": {
                        "ref": "module-Thurston.html",
                        "tf": 5.555555555555555
                      }
                    }
                  }
                }
              }
            },
            "g": {
              "docs": {},
              "i": {
                "docs": {},
                "s": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "module-Thurston-Thurston.html#registerParam": {
                        "ref": "module-Thurston-Thurston.html#registerParam",
                        "tf": 12.5
                      },
                      "module-Thurston-Thurston.html#addEventListeners": {
                        "ref": "module-Thurston-Thurston.html#addEventListeners",
                        "tf": 16.666666666666664
                      }
                    },
                    "e": {
                      "docs": {},
                      "r": {
                        "docs": {},
                        "p": {
                          "docs": {},
                          "a": {
                            "docs": {},
                            "r": {
                              "docs": {},
                              "a": {
                                "docs": {},
                                "m": {
                                  "docs": {
                                    "module-Thurston-Thurston.html#registerParam": {
                                      "ref": "module-Thurston-Thurston.html#registerParam",
                                      "tf": 670
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "q": {
              "docs": {},
              "u": {
                "docs": {},
                "i": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "module-Thurston-Thurston.html#buildShaderDataBackground": {
                        "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                        "tf": 5.555555555555555
                      }
                    }
                  }
                }
              }
            },
            "v": {
              "docs": {},
              "i": {
                "docs": {},
                "e": {
                  "docs": {},
                  "w": {
                    "docs": {
                      "module-Thurston-Thurston.html#buildShaderDataItems": {
                        "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                        "tf": 5
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "i": {
                "docs": {},
                "z": {
                  "docs": {
                    "module-Thurston-Thurston.html#onWindowResize": {
                      "ref": "module-Thurston-Thurston.html#onWindowResize",
                      "tf": 16.666666666666664
                    }
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "g": {
              "docs": {},
              "h": {
                "docs": {},
                "t": {
                  "docs": {
                    "Isometry.html#premultiply": {
                      "ref": "Isometry.html#premultiply",
                      "tf": 6.25
                    },
                    "Position.html#applyFacing": {
                      "ref": "Position.html#applyFacing",
                      "tf": 6.25
                    },
                    "Position.html#multiply": {
                      "ref": "Position.html#multiply",
                      "tf": 3.571428571428571
                    },
                    "RelPosition.html#applyFacing": {
                      "ref": "RelPosition.html#applyFacing",
                      "tf": 6.25
                    },
                    "module-Thurston-Thurston.html#getEyePositions": {
                      "ref": "module-Thurston-Thurston.html#getEyePositions",
                      "tf": 3.3333333333333335
                    }
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "t": {
              "docs": {},
              "a": {
                "docs": {},
                "t": {
                  "docs": {
                    "Position.html#applyFacing": {
                      "ref": "Position.html#applyFacing",
                      "tf": 6.25
                    },
                    "Vector.html#applyFacing": {
                      "ref": "Vector.html#applyFacing",
                      "tf": 2.631578947368421
                    },
                    "RelPosition.html#applyFacing": {
                      "ref": "RelPosition.html#applyFacing",
                      "tf": 6.25
                    },
                    "VRControls.html": {
                      "ref": "VRControls.html",
                      "tf": 2.272727272727273
                    },
                    "KeyboardControls.html#updateRotationVector": {
                      "ref": "KeyboardControls.html#updateRotationVector",
                      "tf": 16.666666666666664
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.4629629629629629
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "e": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            },
            "u": {
              "docs": {},
              "t": {
                "docs": {},
                "i": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "module-Thurston-Thurston.html#buildShaderFragment": {
                        "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                        "tf": 2.083333333333333
                      }
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "n": {
              "docs": {},
              "g": {
                "docs": {
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 0.9615384615384616
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "n": {
              "docs": {
                "module-Thurston-Thurston.html#run": {
                  "ref": "module-Thurston-Thurston.html#run",
                  "tf": 750
                }
              }
            }
          }
        },
        "t": {
          "docs": {},
          "h": {
            "docs": {},
            "u": {
              "docs": {
                "Vector.html#applyMatrix4": {
                  "ref": "Vector.html#applyMatrix4",
                  "tf": 1.8518518518518516
                },
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.3546099290780142
                }
              },
              "r": {
                "docs": {},
                "s": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "n": {
                        "docs": {
                          "module-Thurston-Thurston.html": {
                            "ref": "module-Thurston-Thurston.html",
                            "tf": 500
                          },
                          "module-Thurston-Thurston.html#registerParam": {
                            "ref": "module-Thurston-Thurston.html#registerParam",
                            "tf": 20
                          },
                          "module-Thurston-Thurston.html#setParams": {
                            "ref": "module-Thurston-Thurston.html#setParams",
                            "tf": 33.33333333333333
                          },
                          "module-Thurston-Thurston.html#setParam": {
                            "ref": "module-Thurston-Thurston.html#setParam",
                            "tf": 25
                          },
                          "module-Thurston-Thurston.html#addItem": {
                            "ref": "module-Thurston-Thurston.html#addItem",
                            "tf": 50
                          },
                          "module-Thurston-Thurston.html#addItems": {
                            "ref": "module-Thurston-Thurston.html#addItems",
                            "tf": 50
                          },
                          "module-Thurston-Thurston.html#initUI": {
                            "ref": "module-Thurston-Thurston.html#initUI",
                            "tf": 50
                          },
                          "module-Thurston-Thurston.html#initStats": {
                            "ref": "module-Thurston-Thurston.html#initStats",
                            "tf": 50
                          },
                          "module-Thurston.html": {
                            "ref": "module-Thurston.html",
                            "tf": 605.5555555555555
                          }
                        },
                        "'": {
                          "docs": {
                            "index.html": {
                              "ref": "index.html",
                              "tf": 14
                            }
                          }
                        },
                        "~": {
                          "docs": {},
                          "t": {
                            "docs": {},
                            "h": {
                              "docs": {},
                              "u": {
                                "docs": {},
                                "r": {
                                  "docs": {},
                                  "s": {
                                    "docs": {},
                                    "t": {
                                      "docs": {},
                                      "o": {
                                        "docs": {},
                                        "n": {
                                          "docs": {
                                            "module-Thurston-Thurston.html": {
                                              "ref": "module-Thurston-Thurston.html",
                                              "tf": 100
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "e": {
                "docs": {},
                "e": {
                  "docs": {},
                  ".": {
                    "docs": {},
                    "j": {
                      "docs": {
                        "Vector.html": {
                          "ref": "Vector.html",
                          "tf": 3.8461538461538463
                        },
                        "Vector.html#toLog": {
                          "ref": "Vector.html#toLog",
                          "tf": 4.545454545454546
                        },
                        "Vector.html#applyMatrix4": {
                          "ref": "Vector.html#applyMatrix4",
                          "tf": 3.7037037037037033
                        },
                        "Vector.html#toGLSL": {
                          "ref": "Vector.html#toGLSL",
                          "tf": 4.166666666666666
                        },
                        "VRControls.html": {
                          "ref": "VRControls.html",
                          "tf": 2.272727272727273
                        },
                        "KeyboardControls.html": {
                          "ref": "KeyboardControls.html",
                          "tf": 5.555555555555555
                        },
                        "KeyboardControls.html#update": {
                          "ref": "KeyboardControls.html#update",
                          "tf": 0.4629629629629629
                        },
                        "module-Thurston-Thurston.html#_renderer": {
                          "ref": "module-Thurston-Thurston.html#_renderer",
                          "tf": 16.666666666666664
                        },
                        "module-Thurston-Thurston.html#_camera": {
                          "ref": "module-Thurston-Thurston.html#_camera",
                          "tf": 25
                        },
                        "module-Thurston-Thurston.html#_scene": {
                          "ref": "module-Thurston-Thurston.html#_scene",
                          "tf": 16.666666666666664
                        },
                        "module-Thurston-Thurston.html#chaseCamera": {
                          "ref": "module-Thurston-Thurston.html#chaseCamera",
                          "tf": 2
                        },
                        "module-Thurston-Thurston.html#initThreeJS": {
                          "ref": "module-Thurston-Thurston.html#initThreeJS",
                          "tf": 16.666666666666664
                        },
                        "module-Thurston-Thurston.html#initHorizon": {
                          "ref": "module-Thurston-Thurston.html#initHorizon",
                          "tf": 5.555555555555555
                        }
                      }
                    }
                  }
                }
              },
              "o": {
                "docs": {},
                "u": {
                  "docs": {},
                  "g": {
                    "docs": {},
                    "h": {
                      "docs": {
                        "Subgroup.html#glslBuildData": {
                          "ref": "Subgroup.html#glslBuildData",
                          "tf": 4.545454545454546
                        },
                        "module-Thurston-Thurston.html#params": {
                          "ref": "module-Thurston-Thurston.html#params",
                          "tf": 3.571428571428571
                        }
                      }
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "s": {
                "docs": {},
                "e": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 1.0638297872340425
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "s": {
                "docs": {},
                ".": {
                  "docs": {},
                  "s": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "b": {
                        "docs": {},
                        "g": {
                          "docs": {},
                          "r": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "u": {
                                "docs": {},
                                "p": {
                                  "docs": {},
                                  ".": {
                                    "docs": {},
                                    "g": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "s": {
                                          "docs": {},
                                          "l": {
                                            "docs": {},
                                            "b": {
                                              "docs": {},
                                              "u": {
                                                "docs": {},
                                                "i": {
                                                  "docs": {},
                                                  "l": {
                                                    "docs": {},
                                                    "d": {
                                                      "docs": {},
                                                      "d": {
                                                        "docs": {},
                                                        "a": {
                                                          "docs": {},
                                                          "t": {
                                                            "docs": {},
                                                            "a": {
                                                              "docs": {
                                                                "module-Thurston-Thurston.html#buildShaderFragment": {
                                                                  "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                                                  "tf": 2.083333333333333
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "y": {
            "docs": {},
            "p": {
              "docs": {},
              "i": {
                "docs": {},
                "c": {
                  "docs": {
                    "Isometry.html#reduceError": {
                      "ref": "Isometry.html#reduceError",
                      "tf": 5.555555555555555
                    },
                    "Isometry.html#makeTranslation": {
                      "ref": "Isometry.html#makeTranslation",
                      "tf": 4.166666666666666
                    },
                    "Isometry.html#makeInvTranslation": {
                      "ref": "Isometry.html#makeInvTranslation",
                      "tf": 4.166666666666666
                    }
                  }
                }
              },
              "e": {
                "docs": {
                  "module-Thurston-Thurston.html#registerParam": {
                    "ref": "module-Thurston-Thurston.html#registerParam",
                    "tf": 20
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "g": {
              "docs": {},
              "l": {
                "docs": {},
                "s": {
                  "docs": {},
                  "l": {
                    "docs": {
                      "Isometry.html#toGLSL": {
                        "ref": "Isometry.html#toGLSL",
                        "tf": 683.3333333333334
                      },
                      "Point.html#toGLSL": {
                        "ref": "Point.html#toGLSL",
                        "tf": 683.3333333333334
                      },
                      "ObjectThurston.html#toGLSL": {
                        "ref": "ObjectThurston.html#toGLSL",
                        "tf": 700
                      },
                      "Position.html#toGLSL": {
                        "ref": "Position.html#toGLSL",
                        "tf": 700
                      },
                      "Light.html#toGLSL": {
                        "ref": "Light.html#toGLSL",
                        "tf": 700
                      },
                      "Solid.html#toGLSL": {
                        "ref": "Solid.html#toGLSL",
                        "tf": 700
                      },
                      "Vector.html#toGLSL": {
                        "ref": "Vector.html#toGLSL",
                        "tf": 700
                      },
                      "RelPosition.html#toGLSL": {
                        "ref": "RelPosition.html#toGLSL",
                        "tf": 700
                      },
                      "Material.html#toGLSL": {
                        "ref": "Material.html#toGLSL",
                        "tf": 700
                      }
                    }
                  }
                }
              },
              "e": {
                "docs": {},
                "t": {
                  "docs": {},
                  "h": {
                    "docs": {
                      "module-Thurston-Thurston.html#run": {
                        "ref": "module-Thurston-Thurston.html#run",
                        "tf": 5
                      }
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "o": {
                "docs": {},
                "g": {
                  "docs": {
                    "Vector.html#toLog": {
                      "ref": "Vector.html#toLog",
                      "tf": 700
                    }
                  }
                }
              }
            },
            "w": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.3546099290780142
                }
              }
            }
          },
          "r": {
            "docs": {},
            "a": {
              "docs": {},
              "n": {
                "docs": {},
                "s": {
                  "docs": {},
                  "l": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Point.html#applyIsometry": {
                            "ref": "Point.html#applyIsometry",
                            "tf": 10
                          },
                          "Position.html#applyIsometry": {
                            "ref": "Position.html#applyIsometry",
                            "tf": 4.545454545454546
                          }
                        }
                      }
                    }
                  }
                }
              },
              "c": {
                "docs": {},
                "k": {
                  "docs": {
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 0.9615384615384616
                    }
                  }
                }
              }
            },
            "u": {
              "docs": {},
              "e": {
                "docs": {
                  "ObjectThurston.html#global": {
                    "ref": "ObjectThurston.html#global",
                    "tf": 12.5
                  },
                  "ObjectThurston.html#local": {
                    "ref": "ObjectThurston.html#local",
                    "tf": 7.142857142857142
                  },
                  "Teleport.html#test": {
                    "ref": "Teleport.html#test",
                    "tf": 2.941176470588235
                  },
                  "Light.html#global": {
                    "ref": "Light.html#global",
                    "tf": 12.5
                  },
                  "Light.html#local": {
                    "ref": "Light.html#local",
                    "tf": 7.142857142857142
                  },
                  "Solid.html#global": {
                    "ref": "Solid.html#global",
                    "tf": 12.5
                  },
                  "Solid.html#local": {
                    "ref": "Solid.html#local",
                    "tf": 7.142857142857142
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "m": {
              "docs": {},
              "e": {
                "docs": {
                  "ObjectThurston.html#name": {
                    "ref": "ObjectThurston.html#name",
                    "tf": 3.3333333333333335
                  },
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.49504950495049505
                  },
                  "Light.html#name": {
                    "ref": "Light.html#name",
                    "tf": 3.3333333333333335
                  },
                  "Solid.html#name": {
                    "ref": "Solid.html#name",
                    "tf": 3.3333333333333335
                  },
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 2.380952380952381
                  },
                  "module-Thurston-Thurston.html#_clock": {
                    "ref": "module-Thurston-Thurston.html#_clock",
                    "tf": 7.142857142857142
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "l": {
                "docs": {
                  "module-Thurston-Thurston.html#appendTitle": {
                    "ref": "module-Thurston-Thurston.html#appendTitle",
                    "tf": 10
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "l": {
              "docs": {},
              "e": {
                "docs": {},
                "p": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Teleport.html": {
                            "ref": "Teleport.html",
                            "tf": 1905.7692307692307
                          },
                          "Teleport.html#test": {
                            "ref": "Teleport.html#test",
                            "tf": 5.88235294117647
                          },
                          "Teleport.html#isom": {
                            "ref": "Teleport.html#isom",
                            "tf": 16.666666666666664
                          },
                          "Teleport.html#inv": {
                            "ref": "Teleport.html#inv",
                            "tf": 16.666666666666664
                          },
                          "RelPosition.html#teleport": {
                            "ref": "RelPosition.html#teleport",
                            "tf": 705.5555555555555
                          },
                          "Subgroup.html": {
                            "ref": "Subgroup.html",
                            "tf": 1.4184397163120568
                          },
                          "Subgroup.html#teleports": {
                            "ref": "Subgroup.html#teleports",
                            "tf": 705.5555555555555
                          },
                          "Subgroup.html#shaderSource": {
                            "ref": "Subgroup.html#shaderSource",
                            "tf": 8.333333333333332
                          },
                          "Subgroup.html#glslBuildData": {
                            "ref": "Subgroup.html#glslBuildData",
                            "tf": 4.545454545454546
                          }
                        },
                        "#": {
                          "docs": {},
                          "t": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "s": {
                                "docs": {},
                                "t": {
                                  "docs": {
                                    "Teleport.html#test": {
                                      "ref": "Teleport.html#test",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "i": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "o": {
                                "docs": {},
                                "m": {
                                  "docs": {
                                    "Teleport.html#isom": {
                                      "ref": "Teleport.html#isom",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            },
                            "n": {
                              "docs": {},
                              "v": {
                                "docs": {
                                  "Teleport.html#inv": {
                                    "ref": "Teleport.html#inv",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          },
                          "u": {
                            "docs": {},
                            "u": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "d": {
                                  "docs": {
                                    "Teleport.html#uuid": {
                                      "ref": "Teleport.html#uuid",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "n": {
                            "docs": {},
                            "a": {
                              "docs": {},
                              "m": {
                                "docs": {
                                  "Teleport.html#name": {
                                    "ref": "Teleport.html#name",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          },
                          "g": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "s": {
                                "docs": {},
                                "l": {
                                  "docs": {
                                    "Teleport.html#glsl": {
                                      "ref": "Teleport.html#glsl",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "t": {
                "docs": {
                  "Teleport.html": {
                    "ref": "Teleport.html",
                    "tf": 1.9230769230769231
                  },
                  "Teleport.html#test": {
                    "ref": "Teleport.html#test",
                    "tf": 708.8235294117648
                  },
                  "Teleport.html#glsl": {
                    "ref": "Teleport.html#glsl",
                    "tf": 6.25
                  },
                  "Subgroup.html#shaderSource": {
                    "ref": "Subgroup.html#shaderSource",
                    "tf": 4.166666666666666
                  },
                  "Subgroup.html#glslBuildData": {
                    "ref": "Subgroup.html#glslBuildData",
                    "tf": 4.545454545454546
                  }
                }
              }
            },
            "m": {
              "docs": {},
              "p": {
                "docs": {},
                "l": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Light.html#glslBuildDataDefault": {
                          "ref": "Light.html#glslBuildDataDefault",
                          "tf": 6.25
                        },
                        "Solid.html#glslBuildDataDefault": {
                          "ref": "Solid.html#glslBuildDataDefault",
                          "tf": 6.25
                        },
                        "module-Thurston-Thurston.html#buildShaderVertex": {
                          "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                          "tf": 10
                        },
                        "module-Thurston-Thurston.html#buildShaderFragment": {
                          "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                          "tf": 4.166666666666666
                        }
                      }
                    }
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "m": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "n": {
              "docs": {},
              "g": {
                "docs": {},
                "e": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Position.html#flow": {
                          "ref": "Position.html#flow",
                          "tf": 0.49504950495049505
                        },
                        "Vector.html": {
                          "ref": "Vector.html",
                          "tf": 3.8461538461538463
                        },
                        "KeyboardControls.html#update": {
                          "ref": "KeyboardControls.html#update",
                          "tf": 0.4629629629629629
                        }
                      }
                    }
                  }
                }
              }
            },
            "k": {
              "docs": {},
              "e": {
                "docs": {
                  "RelPosition.html#point": {
                    "ref": "RelPosition.html#point",
                    "tf": 8.333333333333332
                  }
                }
              }
            }
          },
          "w": {
            "docs": {},
            "o": {
              "docs": {
                "RelPosition.html": {
                  "ref": "RelPosition.html",
                  "tf": 0.9615384615384616
                },
                "module-Thurston-Thurston.html#_clock": {
                  "ref": "module-Thurston-Thurston.html#_clock",
                  "tf": 7.142857142857142
                }
              }
            }
          }
        },
        "v": {
          "1": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.49504950495049505
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.9259259259259258
              }
            },
            ",": {
              "docs": {},
              "v": {
                "2": {
                  "docs": {},
                  ",": {
                    "docs": {},
                    "v": {
                      "3": {
                        "docs": {
                          "KeyboardControls.html#update": {
                            "ref": "KeyboardControls.html#update",
                            "tf": 0.4629629629629629
                          }
                        }
                      },
                      "docs": {}
                    }
                  }
                },
                "docs": {}
              }
            }
          },
          "2": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.49504950495049505
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.9259259259259258
              }
            }
          },
          "3": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.49504950495049505
              },
              "KeyboardControls.html#update": {
                "ref": "KeyboardControls.html#update",
                "tf": 0.9259259259259258
              }
            }
          },
          "docs": {
            "Position.html#flowFromOrigin": {
              "ref": "Position.html#flowFromOrigin",
              "tf": 28.333333333333332
            },
            "Position.html#flow": {
              "ref": "Position.html#flow",
              "tf": 35.31353135313531
            },
            "RelPosition.html#flow": {
              "ref": "RelPosition.html#flow",
              "tf": 38.09523809523809
            },
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 1.3888888888888888
            }
          },
          "r": {
            "docs": {
              "index.html": {
                "ref": "index.html",
                "tf": 200
              },
              "VRControls.html": {
                "ref": "VRControls.html",
                "tf": 2.272727272727273
              },
              "module-Thurston-Thurston.html#chaseCamera": {
                "ref": "module-Thurston-Thurston.html#chaseCamera",
                "tf": 2
              },
              "module-Thurston-Thurston.html#getEyePositions": {
                "ref": "module-Thurston-Thurston.html#getEyePositions",
                "tf": 3.3333333333333335
              }
            },
            "c": {
              "docs": {},
              "o": {
                "docs": {},
                "n": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "l": {
                          "docs": {
                            "VRControls.html": {
                              "ref": "VRControls.html",
                              "tf": 1900
                            }
                          },
                          "s": {
                            "docs": {},
                            "#": {
                              "docs": {},
                              "u": {
                                "docs": {},
                                "p": {
                                  "docs": {},
                                  "d": {
                                    "docs": {
                                      "VRControls.html#update": {
                                        "ref": "VRControls.html#update",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              },
                              "o": {
                                "docs": {},
                                "n": {
                                  "docs": {},
                                  "s": {
                                    "docs": {},
                                    "e": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "e": {
                                          "docs": {},
                                          "c": {
                                            "docs": {},
                                            "t": {
                                              "docs": {},
                                              "s": {
                                                "docs": {},
                                                "t": {
                                                  "docs": {},
                                                  "a": {
                                                    "docs": {},
                                                    "r": {
                                                      "docs": {},
                                                      "t": {
                                                        "docs": {
                                                          "VRControls.html#onSelectStart": {
                                                            "ref": "VRControls.html#onSelectStart",
                                                            "tf": 1150
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              "e": {
                                                "docs": {},
                                                "n": {
                                                  "docs": {},
                                                  "d": {
                                                    "docs": {
                                                      "VRControls.html#onSelectEnd": {
                                                        "ref": "VRControls.html#onSelectEnd",
                                                        "tf": 1150
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "q": {
                                      "docs": {},
                                      "u": {
                                        "docs": {},
                                        "e": {
                                          "docs": {},
                                          "e": {
                                            "docs": {},
                                            "z": {
                                              "docs": {},
                                              "e": {
                                                "docs": {},
                                                "s": {
                                                  "docs": {},
                                                  "t": {
                                                    "docs": {},
                                                    "a": {
                                                      "docs": {},
                                                      "r": {
                                                        "docs": {},
                                                        "t": {
                                                          "docs": {
                                                            "VRControls.html#onSqueezeStart": {
                                                              "ref": "VRControls.html#onSqueezeStart",
                                                              "tf": 1150
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                },
                                                "e": {
                                                  "docs": {},
                                                  "n": {
                                                    "docs": {},
                                                    "d": {
                                                      "docs": {
                                                        "VRControls.html#onSqueezeEnd": {
                                                          "ref": "VRControls.html#onSqueezeEnd",
                                                          "tf": 1150
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "r": {
              "docs": {},
              "s": {
                "docs": {},
                "i": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "Teleport.html#name": {
                          "ref": "Teleport.html#name",
                          "tf": 4.545454545454546
                        },
                        "Vector.html#toLog": {
                          "ref": "Vector.html#toLog",
                          "tf": 4.545454545454546
                        }
                      }
                    }
                  }
                }
              },
              "t": {
                "docs": {},
                "e": {
                  "docs": {},
                  "x": {
                    "docs": {
                      "module-Thurston-Thurston.html#buildShaderVertex": {
                        "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                        "tf": 10
                      }
                    }
                  }
                }
              }
            },
            "c": {
              "3": {
                "docs": {
                  "Vector.html#toGLSL": {
                    "ref": "Vector.html#toGLSL",
                    "tf": 4.166666666666666
                  }
                }
              },
              "docs": {},
              "t": {
                "docs": {},
                "o": {
                  "docs": {},
                  "r": {
                    "3": {
                      "docs": {
                        "Vector.html#toLog": {
                          "ref": "Vector.html#toLog",
                          "tf": 4.545454545454546
                        },
                        "Vector.html#applyMatrix4": {
                          "ref": "Vector.html#applyMatrix4",
                          "tf": 35.18518518518518
                        },
                        "Vector.html#toGLSL": {
                          "ref": "Vector.html#toGLSL",
                          "tf": 4.166666666666666
                        }
                      }
                    },
                    "docs": {
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 0.49504950495049505
                      },
                      "Vector.html": {
                        "ref": "Vector.html",
                        "tf": 1907.6923076923076
                      },
                      "Vector.html#toLog": {
                        "ref": "Vector.html#toLog",
                        "tf": 4.545454545454546
                      },
                      "Vector.html#applyMatrix4": {
                        "ref": "Vector.html#applyMatrix4",
                        "tf": 3.7037037037037033
                      },
                      "Vector.html#applyFacing": {
                        "ref": "Vector.html#applyFacing",
                        "tf": 38.59649122807017
                      },
                      "Vector.html#toGLSL": {
                        "ref": "Vector.html#toGLSL",
                        "tf": 4.166666666666666
                      },
                      "KeyboardControls.html#updateMovementVector": {
                        "ref": "KeyboardControls.html#updateMovementVector",
                        "tf": 16.666666666666664
                      },
                      "KeyboardControls.html#updateRotationVector": {
                        "ref": "KeyboardControls.html#updateRotationVector",
                        "tf": 16.666666666666664
                      },
                      "KeyboardControls.html#update": {
                        "ref": "KeyboardControls.html#update",
                        "tf": 0.4629629629629629
                      }
                    },
                    "#": {
                      "docs": {},
                      "t": {
                        "docs": {},
                        "o": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "g": {
                                "docs": {
                                  "Vector.html#toLog": {
                                    "ref": "Vector.html#toLog",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          },
                          "g": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "s": {
                                "docs": {},
                                "l": {
                                  "docs": {
                                    "Vector.html#toGLSL": {
                                      "ref": "Vector.html#toGLSL",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      "a": {
                        "docs": {},
                        "p": {
                          "docs": {},
                          "p": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "y": {
                                "docs": {},
                                "m": {
                                  "docs": {},
                                  "a": {
                                    "docs": {},
                                    "t": {
                                      "docs": {},
                                      "r": {
                                        "docs": {},
                                        "i": {
                                          "docs": {},
                                          "x": {
                                            "4": {
                                              "docs": {
                                                "Vector.html#applyMatrix4": {
                                                  "ref": "Vector.html#applyMatrix4",
                                                  "tf": 1150
                                                }
                                              }
                                            },
                                            "docs": {}
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                "f": {
                                  "docs": {},
                                  "a": {
                                    "docs": {},
                                    "c": {
                                      "docs": {
                                        "Vector.html#applyFacing": {
                                          "ref": "Vector.html#applyFacing",
                                          "tf": 1150
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "l": {
              "docs": {},
              "u": {
                "docs": {
                  "module-Thurston-Thurston.html#setParam": {
                    "ref": "module-Thurston-Thurston.html#setParam",
                    "tf": 25
                  },
                  "module-Thurston-Thurston.html#setKeyboard": {
                    "ref": "module-Thurston-Thurston.html#setKeyboard",
                    "tf": 50
                  }
                }
              }
            }
          }
        },
        "d": {
          "docs": {},
          "o": {
            "docs": {},
            "c": {
              "docs": {},
              "u": {
                "docs": {},
                "m": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "global.html": {
                            "ref": "global.html",
                            "tf": 35
                          },
                          "list_class.html": {
                            "ref": "list_class.html",
                            "tf": 35
                          },
                          "list_module.html": {
                            "ref": "list_module.html",
                            "tf": 35
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "m": {
              "docs": {
                "ObjectThurston.html#loadGLSLTemplate": {
                  "ref": "ObjectThurston.html#loadGLSLTemplate",
                  "tf": 5
                },
                "ObjectThurston.html#loadGLSLDefaultTemplate": {
                  "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                  "tf": 5
                },
                "Light.html#loadGLSLTemplate": {
                  "ref": "Light.html#loadGLSLTemplate",
                  "tf": 5
                },
                "Light.html#loadGLSLDefaultTemplate": {
                  "ref": "Light.html#loadGLSLDefaultTemplate",
                  "tf": 5
                },
                "Solid.html#loadGLSLTemplate": {
                  "ref": "Solid.html#loadGLSLTemplate",
                  "tf": 5
                },
                "Solid.html#loadGLSLDefaultTemplate": {
                  "ref": "Solid.html#loadGLSLDefaultTemplate",
                  "tf": 5
                }
              },
              "a": {
                "docs": {},
                "i": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "Teleport.html": {
                        "ref": "Teleport.html",
                        "tf": 1.9230769230769231
                      },
                      "RelPosition.html": {
                        "ref": "RelPosition.html",
                        "tf": 0.9615384615384616
                      },
                      "RelPosition.html#sbgp": {
                        "ref": "RelPosition.html#sbgp",
                        "tf": 8.333333333333332
                      },
                      "RelPosition.html#teleport": {
                        "ref": "RelPosition.html#teleport",
                        "tf": 5.555555555555555
                      },
                      "RelPosition.html#flow": {
                        "ref": "RelPosition.html#flow",
                        "tf": 2.380952380952381
                      },
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "e": {
                "docs": {
                  "module-Thurston-Thurston.html#chaseCamera": {
                    "ref": "module-Thurston-Thurston.html#chaseCamera",
                    "tf": 2
                  },
                  "module-Thurston-Thurston.html#initHorizon": {
                    "ref": "module-Thurston-Thurston.html#initHorizon",
                    "tf": 5.555555555555555
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "t": {
              "docs": {},
              "a": {
                "docs": {
                  "Isometry.html#set": {
                    "ref": "Isometry.html#set",
                    "tf": 35
                  },
                  "Point.html#set": {
                    "ref": "Point.html#set",
                    "tf": 35
                  },
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.49504950495049505
                  },
                  "Vector.html#applyMatrix4": {
                    "ref": "Vector.html#applyMatrix4",
                    "tf": 1.8518518518518516
                  },
                  "module-Thurston-Thurston.html#infos": {
                    "ref": "module-Thurston-Thurston.html#infos",
                    "tf": 8.333333333333332
                  },
                  "module-Thurston-Thurston.html#buildShaderFragment": {
                    "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                    "tf": 2.083333333333333
                  }
                }
              },
              "e": {
                "docs": {
                  "module-Thurston-Thurston.html#params": {
                    "ref": "module-Thurston-Thurston.html#params",
                    "tf": 3.571428571428571
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "b": {
              "docs": {},
              "u": {
                "docs": {},
                "g": {
                  "docs": {
                    "Isometry.html#equals": {
                      "ref": "Isometry.html#equals",
                      "tf": 6.25
                    },
                    "Point.html#equals": {
                      "ref": "Point.html#equals",
                      "tf": 6.25
                    },
                    "Vector.html#toLog": {
                      "ref": "Vector.html#toLog",
                      "tf": 4.545454545454546
                    },
                    "RelPosition.html#equals": {
                      "ref": "RelPosition.html#equals",
                      "tf": 6.25
                    }
                  }
                }
              }
            },
            "c": {
              "docs": {},
              "l": {
                "docs": {},
                "a": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "ObjectThurston.html#glsl": {
                        "ref": "ObjectThurston.html#glsl",
                        "tf": 6.25
                      },
                      "Light.html#glsl": {
                        "ref": "Light.html#glsl",
                        "tf": 6.25
                      },
                      "Light.html#glslBuildData": {
                        "ref": "Light.html#glslBuildData",
                        "tf": 5
                      },
                      "Solid.html#glsl": {
                        "ref": "Solid.html#glsl",
                        "tf": 6.25
                      },
                      "Solid.html#glslBuildData": {
                        "ref": "Solid.html#glslBuildData",
                        "tf": 5
                      }
                    }
                  }
                }
              },
              "i": {
                "docs": {},
                "d": {
                  "docs": {
                    "Teleport.html": {
                      "ref": "Teleport.html",
                      "tf": 1.9230769230769231
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "c": {
                "docs": {},
                "r": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "b": {
                      "docs": {
                        "Teleport.html": {
                          "ref": "Teleport.html",
                          "tf": 1.9230769230769231
                        },
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.7092198581560284
                        }
                      }
                    },
                    "p": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Subgroup.html#teleports": {
                            "ref": "Subgroup.html#teleports",
                            "tf": 5.555555555555555
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "f": {
              "docs": {},
              "a": {
                "docs": {},
                "u": {
                  "docs": {},
                  "l": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Light.html#glslBuildDataDefault": {
                          "ref": "Light.html#glslBuildDataDefault",
                          "tf": 6.25
                        },
                        "Solid.html#glslBuildDataDefault": {
                          "ref": "Solid.html#glslBuildDataDefault",
                          "tf": 6.25
                        }
                      }
                    }
                  }
                }
              },
              "i": {
                "docs": {},
                "n": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.7092198581560284
                    },
                    "module-Thurston-Thurston.html#subgroup": {
                      "ref": "module-Thurston-Thurston.html#subgroup",
                      "tf": 10
                    },
                    "module-Thurston.html": {
                      "ref": "module-Thurston.html",
                      "tf": 5.555555555555555
                    }
                  }
                }
              }
            },
            "p": {
              "docs": {},
              "e": {
                "docs": {},
                "n": {
                  "docs": {},
                  "d": {
                    "docs": {
                      "Vector.html#applyFacing": {
                        "ref": "Vector.html#applyFacing",
                        "tf": 2.631578947368421
                      }
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "t": {
                "docs": {},
                "a": {
                  "docs": {
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 50
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "o": {
                "docs": {},
                "t": {
                  "docs": {
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.9259259259259258
                    }
                  }
                }
              }
            }
          },
          "y": {
            "docs": {},
            "n": {
              "docs": {},
              "a": {
                "docs": {},
                "m": {
                  "docs": {
                    "Isometry.html#toGLSL": {
                      "ref": "Isometry.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Point.html#toGLSL": {
                      "ref": "Point.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Position.html#toGLSL": {
                      "ref": "Position.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "RelPosition.html#toGLSL": {
                      "ref": "RelPosition.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Material.html#toGLSL": {
                      "ref": "Material.html#toGLSL",
                      "tf": 4.545454545454546
                    }
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "r": {
              "docs": {},
              "e": {
                "docs": {},
                "c": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "Position.html#flowFromOrigin": {
                        "ref": "Position.html#flowFromOrigin",
                        "tf": 3.3333333333333335
                      },
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 0.9900990099009901
                      },
                      "Light.html#maxDirs": {
                        "ref": "Light.html#maxDirs",
                        "tf": 8.333333333333332
                      },
                      "RelPosition.html#flow": {
                        "ref": "RelPosition.html#flow",
                        "tf": 2.380952380952381
                      },
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.7092198581560284
                      },
                      "VRControls.html": {
                        "ref": "VRControls.html",
                        "tf": 2.272727272727273
                      },
                      "KeyboardControls.html#update": {
                        "ref": "KeyboardControls.html#update",
                        "tf": 1.3888888888888888
                      },
                      "module-Thurston-Thurston.html#_maxLightDirs": {
                        "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                        "tf": 6.25
                      },
                      "module-Thurston-Thurston.html#maxLightDirs": {
                        "ref": "module-Thurston-Thurston.html#maxLightDirs",
                        "tf": 12.5
                      }
                    },
                    "l": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "ObjectThurston.html": {
                            "ref": "ObjectThurston.html",
                            "tf": 4.545454545454546
                          },
                          "Solid.html": {
                            "ref": "Solid.html",
                            "tf": 2.631578947368421
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "t": {
                "docs": {},
                "a": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "c": {
                      "docs": {
                        "ObjectThurston.html#glsl": {
                          "ref": "ObjectThurston.html#glsl",
                          "tf": 6.25
                        },
                        "Light.html#glsl": {
                          "ref": "Light.html#glsl",
                          "tf": 6.25
                        },
                        "Light.html#glslBuildData": {
                          "ref": "Light.html#glslBuildData",
                          "tf": 5
                        },
                        "Solid.html#glsl": {
                          "ref": "Solid.html#glsl",
                          "tf": 6.25
                        },
                        "Solid.html#glslBuildData": {
                          "ref": "Solid.html#glslBuildData",
                          "tf": 5
                        }
                      }
                    }
                  }
                }
              },
              "c": {
                "docs": {},
                "r": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Teleport.html": {
                          "ref": "Teleport.html",
                          "tf": 3.8461538461538463
                        },
                        "RelPosition.html": {
                          "ref": "RelPosition.html",
                          "tf": 0.9615384615384616
                        },
                        "RelPosition.html#cellBoost": {
                          "ref": "RelPosition.html#cellBoost",
                          "tf": 10
                        },
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 1.0638297872340425
                        },
                        "Subgroup.html#glslBuildData": {
                          "ref": "Subgroup.html#glslBuildData",
                          "tf": 4.545454545454546
                        },
                        "module-Thurston-Thurston.html#subgroup": {
                          "ref": "module-Thurston-Thurston.html#subgroup",
                          "tf": 10
                        }
                      }
                    }
                  }
                }
              },
              "p": {
                "docs": {},
                "l": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "y": {
                      "docs": {
                        "module-Thurston-Thurston.html#infos": {
                          "ref": "module-Thurston-Thurston.html#infos",
                          "tf": 8.333333333333332
                        }
                      }
                    }
                  }
                }
              }
            },
            "m": {
              "docs": {},
              "e": {
                "docs": {},
                "n": {
                  "docs": {},
                  "s": {
                    "docs": {
                      "Vector.html#applyMatrix4": {
                        "ref": "Vector.html#applyMatrix4",
                        "tf": 1.8518518518518516
                      }
                    }
                  }
                }
              }
            },
            "v": {
              "docs": {},
              "i": {
                "docs": {},
                "d": {
                  "docs": {
                    "Vector.html#applyMatrix4": {
                      "ref": "Vector.html#applyMatrix4",
                      "tf": 1.8518518518518516
                    }
                  }
                }
              }
            },
            "f": {
              "docs": {},
              "f": {
                "docs": {},
                "u": {
                  "docs": {},
                  "s": {
                    "docs": {
                      "Material.html#diffuse": {
                        "ref": "Material.html#diffuse",
                        "tf": 716.6666666666666
                      }
                    }
                  }
                }
              }
            }
          },
          "_": {
            "docs": {},
            "o": {
              "docs": {
                "Position.html#flow": {
                  "ref": "Position.html#flow",
                  "tf": 0.9900990099009901
                }
              },
              "g": {
                "docs": {
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.49504950495049505
                  },
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 1.3888888888888888
                  }
                }
              }
            }
          },
          "r": {
            "docs": {},
            "a": {
              "docs": {},
              "g": {
                "docs": {
                  "VRControls.html": {
                    "ref": "VRControls.html",
                    "tf": 2.272727272727273
                  }
                }
              }
            }
          }
        },
        "c": {
          "docs": {},
          "l": {
            "docs": {},
            "a": {
              "docs": {},
              "s": {
                "docs": {},
                "s": {
                  "docs": {
                    "list_class.html": {
                      "ref": "list_class.html",
                      "tf": 635
                    },
                    "Isometry.html": {
                      "ref": "Isometry.html",
                      "tf": 110
                    },
                    "Point.html": {
                      "ref": "Point.html",
                      "tf": 110
                    },
                    "ObjectThurston.html": {
                      "ref": "ObjectThurston.html",
                      "tf": 119.0909090909091
                    },
                    "ObjectThurston.html#className": {
                      "ref": "ObjectThurston.html#className",
                      "tf": 5
                    },
                    "Teleport.html": {
                      "ref": "Teleport.html",
                      "tf": 110
                    },
                    "Position.html": {
                      "ref": "Position.html",
                      "tf": 110
                    },
                    "Light.html": {
                      "ref": "Light.html",
                      "tf": 120
                    },
                    "Light.html#className": {
                      "ref": "Light.html#className",
                      "tf": 5
                    },
                    "Solid.html": {
                      "ref": "Solid.html",
                      "tf": 120.52631578947368
                    },
                    "Solid.html#className": {
                      "ref": "Solid.html#className",
                      "tf": 5
                    },
                    "Vector.html": {
                      "ref": "Vector.html",
                      "tf": 110
                    },
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 110
                    },
                    "Material.html": {
                      "ref": "Material.html",
                      "tf": 110
                    },
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 110
                    },
                    "Subgroup.html#teleports": {
                      "ref": "Subgroup.html#teleports",
                      "tf": 5.555555555555555
                    },
                    "VRControls.html": {
                      "ref": "VRControls.html",
                      "tf": 110
                    },
                    "KeyboardControls.html": {
                      "ref": "KeyboardControls.html",
                      "tf": 110
                    },
                    "module-Thurston-Thurston.html": {
                      "ref": "module-Thurston-Thurston.html",
                      "tf": 118.33333333333333
                    }
                  },
                  "n": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "m": {
                        "docs": {
                          "ObjectThurston.html#className": {
                            "ref": "ObjectThurston.html#className",
                            "tf": 750
                          },
                          "Light.html#className": {
                            "ref": "Light.html#className",
                            "tf": 750
                          },
                          "Solid.html#className": {
                            "ref": "Solid.html#className",
                            "tf": 750
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "n": {
                "docs": {},
                "e": {
                  "docs": {
                    "Isometry.html#clone": {
                      "ref": "Isometry.html#clone",
                      "tf": 683.3333333333334
                    },
                    "Point.html#clone": {
                      "ref": "Point.html#clone",
                      "tf": 683.3333333333334
                    },
                    "Position.html#clone": {
                      "ref": "Position.html#clone",
                      "tf": 700
                    },
                    "RelPosition.html#clone": {
                      "ref": "RelPosition.html#clone",
                      "tf": 700
                    }
                  }
                }
              },
              "c": {
                "docs": {},
                "k": {
                  "docs": {
                    "module-Thurston-Thurston.html#_clock": {
                      "ref": "module-Thurston-Thurston.html#_clock",
                      "tf": 40.47619047619047
                    }
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "n": {
              "docs": {},
              "s": {
                "docs": {},
                "t": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "c": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "r": {
                              "docs": {
                                "Isometry.html#build": {
                                  "ref": "Isometry.html#build",
                                  "tf": 8.333333333333332
                                },
                                "Point.html#build": {
                                  "ref": "Point.html#build",
                                  "tf": 7.142857142857142
                                },
                                "module-Thurston-Thurston.html#initHorizon": {
                                  "ref": "module-Thurston-Thurston.html#initHorizon",
                                  "tf": 5.555555555555555
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  "a": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Material.html#ambient": {
                            "ref": "Material.html#ambient",
                            "tf": 16.666666666666664
                          },
                          "Material.html#diffuse": {
                            "ref": "Material.html#diffuse",
                            "tf": 16.666666666666664
                          },
                          "Material.html#specular": {
                            "ref": "Material.html#specular",
                            "tf": 16.666666666666664
                          },
                          "Material.html#shininess": {
                            "ref": "Material.html#shininess",
                            "tf": 16.666666666666664
                          },
                          "module-Thurston-Thurston.html#buildShaderDataConstants": {
                            "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                            "tf": 10
                          },
                          "module-Thurston-Thurston.html#buildShaderFragment": {
                            "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                            "tf": 2.083333333333333
                          }
                        }
                      }
                    }
                  }
                },
                "i": {
                  "docs": {},
                  "d": {
                    "docs": {
                      "Vector.html#applyMatrix4": {
                        "ref": "Vector.html#applyMatrix4",
                        "tf": 1.8518518518518516
                      }
                    }
                  }
                }
              },
              "t": {
                "docs": {},
                "a": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "ObjectThurston.html#loadGLSLTemplate": {
                          "ref": "ObjectThurston.html#loadGLSLTemplate",
                          "tf": 5
                        },
                        "ObjectThurston.html#loadGLSLDefaultTemplate": {
                          "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                          "tf": 5
                        },
                        "Light.html#loadGLSLTemplate": {
                          "ref": "Light.html#loadGLSLTemplate",
                          "tf": 5
                        },
                        "Light.html#loadGLSLDefaultTemplate": {
                          "ref": "Light.html#loadGLSLDefaultTemplate",
                          "tf": 5
                        },
                        "Solid.html#loadGLSLTemplate": {
                          "ref": "Solid.html#loadGLSLTemplate",
                          "tf": 5
                        },
                        "Solid.html#loadGLSLDefaultTemplate": {
                          "ref": "Solid.html#loadGLSLDefaultTemplate",
                          "tf": 5
                        }
                      }
                    }
                  }
                },
                "r": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "l": {
                      "docs": {
                        "VRControls.html": {
                          "ref": "VRControls.html",
                          "tf": 6.8181818181818175
                        },
                        "KeyboardControls.html": {
                          "ref": "KeyboardControls.html",
                          "tf": 5.555555555555555
                        },
                        "KeyboardControls.html#keyboard": {
                          "ref": "KeyboardControls.html#keyboard",
                          "tf": 16.666666666666664
                        },
                        "module-Thurston-Thurston.html#_keyboardControls": {
                          "ref": "module-Thurston-Thurston.html#_keyboardControls",
                          "tf": 25
                        },
                        "module-Thurston-Thurston.html#setKeyboard": {
                          "ref": "module-Thurston-Thurston.html#setKeyboard",
                          "tf": 12.5
                        }
                      }
                    }
                  }
                }
              }
            },
            "p": {
              "docs": {},
              "i": {
                "docs": {
                  "Isometry.html#clone": {
                    "ref": "Isometry.html#clone",
                    "tf": 10
                  },
                  "Isometry.html#copy": {
                    "ref": "Isometry.html#copy",
                    "tf": 675
                  },
                  "Point.html#clone": {
                    "ref": "Point.html#clone",
                    "tf": 10
                  },
                  "Point.html#copy": {
                    "ref": "Point.html#copy",
                    "tf": 675
                  },
                  "Position.html#clone": {
                    "ref": "Position.html#clone",
                    "tf": 10
                  },
                  "Position.html#copy": {
                    "ref": "Position.html#copy",
                    "tf": 683.3333333333334
                  },
                  "RelPosition.html#clone": {
                    "ref": "RelPosition.html#clone",
                    "tf": 10
                  },
                  "RelPosition.html#copy": {
                    "ref": "RelPosition.html#copy",
                    "tf": 683.3333333333334
                  }
                }
              }
            },
            "d": {
              "docs": {},
              "e": {
                "docs": {
                  "Isometry.html#toGLSL": {
                    "ref": "Isometry.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Point.html#toGLSL": {
                    "ref": "Point.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "ObjectThurston.html#glsl": {
                    "ref": "ObjectThurston.html#glsl",
                    "tf": 6.25
                  },
                  "ObjectThurston.html#shaderSource": {
                    "ref": "ObjectThurston.html#shaderSource",
                    "tf": 10
                  },
                  "ObjectThurston.html#toGLSL": {
                    "ref": "ObjectThurston.html#toGLSL",
                    "tf": 6.25
                  },
                  "ObjectThurston.html#loadGLSLTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "ObjectThurston.html#loadGLSLDefaultTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Teleport.html#glsl": {
                    "ref": "Teleport.html#glsl",
                    "tf": 6.25
                  },
                  "Position.html#toGLSL": {
                    "ref": "Position.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Light.html#glsl": {
                    "ref": "Light.html#glsl",
                    "tf": 6.25
                  },
                  "Light.html#shaderSource": {
                    "ref": "Light.html#shaderSource",
                    "tf": 10
                  },
                  "Light.html#toGLSL": {
                    "ref": "Light.html#toGLSL",
                    "tf": 6.25
                  },
                  "Light.html#glslBuildData": {
                    "ref": "Light.html#glslBuildData",
                    "tf": 5
                  },
                  "Light.html#loadGLSLTemplate": {
                    "ref": "Light.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Light.html#loadGLSLDefaultTemplate": {
                    "ref": "Light.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Solid.html#glsl": {
                    "ref": "Solid.html#glsl",
                    "tf": 6.25
                  },
                  "Solid.html#shaderSource": {
                    "ref": "Solid.html#shaderSource",
                    "tf": 10
                  },
                  "Solid.html#toGLSL": {
                    "ref": "Solid.html#toGLSL",
                    "tf": 6.25
                  },
                  "Solid.html#glslBuildData": {
                    "ref": "Solid.html#glslBuildData",
                    "tf": 5
                  },
                  "Solid.html#loadGLSLTemplate": {
                    "ref": "Solid.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Solid.html#loadGLSLDefaultTemplate": {
                    "ref": "Solid.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Vector.html#toGLSL": {
                    "ref": "Vector.html#toGLSL",
                    "tf": 4.166666666666666
                  },
                  "RelPosition.html#toGLSL": {
                    "ref": "RelPosition.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Material.html#toGLSL": {
                    "ref": "Material.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Subgroup.html#glslBuildData": {
                    "ref": "Subgroup.html#glslBuildData",
                    "tf": 4.545454545454546
                  },
                  "module-Thurston-Thurston.html#buildShaderDataBackground": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                    "tf": 5.555555555555555
                  }
                }
              }
            },
            "m": {
              "docs": {},
              "p": {
                "docs": {},
                "u": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "ObjectThurston.html#name": {
                        "ref": "ObjectThurston.html#name",
                        "tf": 3.3333333333333335
                      },
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 0.49504950495049505
                      },
                      "Light.html#name": {
                        "ref": "Light.html#name",
                        "tf": 3.3333333333333335
                      },
                      "Solid.html#name": {
                        "ref": "Solid.html#name",
                        "tf": 3.3333333333333335
                      },
                      "module-Thurston-Thurston.html#_maxLightDirs": {
                        "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                        "tf": 6.25
                      },
                      "module-Thurston-Thurston.html#getEyePositions": {
                        "ref": "module-Thurston-Thurston.html#getEyePositions",
                        "tf": 3.3333333333333335
                      }
                    }
                  }
                },
                "o": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "Position.html#boost": {
                        "ref": "Position.html#boost",
                        "tf": 16.666666666666664
                      },
                      "Position.html#facing": {
                        "ref": "Position.html#facing",
                        "tf": 16.666666666666664
                      },
                      "Vector.html#applyFacing": {
                        "ref": "Vector.html#applyFacing",
                        "tf": 2.631578947368421
                      },
                      "RelPosition.html#cellBoost": {
                        "ref": "RelPosition.html#cellBoost",
                        "tf": 10
                      },
                      "RelPosition.html#sbgp": {
                        "ref": "RelPosition.html#sbgp",
                        "tf": 8.333333333333332
                      }
                    }
                  }
                },
                "a": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "o": {
                "docs": {},
                "r": {
                  "docs": {
                    "Light.html#color": {
                      "ref": "Light.html#color",
                      "tf": 775
                    },
                    "Material.html#color": {
                      "ref": "Material.html#color",
                      "tf": 775
                    }
                  }
                }
              },
              "l": {
                "docs": {},
                "e": {
                  "docs": {},
                  "c": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "module-Thurston-Thurston.html#buildShaderDataConstants": {
                          "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                          "tf": 10
                        },
                        "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                          "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                          "tf": 10
                        }
                      }
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "r": {
                "docs": {},
                "d": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "Vector.html#applyMatrix4": {
                          "ref": "Vector.html#applyMatrix4",
                          "tf": 1.8518518518518516
                        },
                        "Vector.html#applyFacing": {
                          "ref": "Vector.html#applyFacing",
                          "tf": 2.631578947368421
                        },
                        "RelPosition.html": {
                          "ref": "RelPosition.html",
                          "tf": 0.9615384615384616
                        }
                      }
                    }
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "r": {
                "docs": {},
                "e": {
                  "docs": {},
                  "s": {
                    "docs": {},
                    "p": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "n": {
                          "docs": {},
                          "d": {
                            "docs": {
                              "KeyboardControls.html#update": {
                                "ref": "KeyboardControls.html#update",
                                "tf": 0.4629629629629629
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "n": {
                "docs": {},
                "c": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "d": {
                      "docs": {
                        "module-Thurston-Thurston.html#getEyePositions": {
                          "ref": "module-Thurston-Thurston.html#getEyePositions",
                          "tf": 3.3333333333333335
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "r": {
              "docs": {},
              "r": {
                "docs": {},
                "e": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Isometry.html#set": {
                          "ref": "Isometry.html#set",
                          "tf": 10
                        },
                        "Isometry.html#reduceError": {
                          "ref": "Isometry.html#reduceError",
                          "tf": 5.555555555555555
                        },
                        "Isometry.html#multiply": {
                          "ref": "Isometry.html#multiply",
                          "tf": 6.25
                        },
                        "Isometry.html#premultiply": {
                          "ref": "Isometry.html#premultiply",
                          "tf": 6.25
                        },
                        "Isometry.html#getInverse": {
                          "ref": "Isometry.html#getInverse",
                          "tf": 10
                        },
                        "Isometry.html#equals": {
                          "ref": "Isometry.html#equals",
                          "tf": 6.25
                        },
                        "Isometry.html#clone": {
                          "ref": "Isometry.html#clone",
                          "tf": 10
                        },
                        "Isometry.html#copy": {
                          "ref": "Isometry.html#copy",
                          "tf": 10
                        },
                        "Point.html#set": {
                          "ref": "Point.html#set",
                          "tf": 10
                        },
                        "Point.html#applyIsometry": {
                          "ref": "Point.html#applyIsometry",
                          "tf": 10
                        },
                        "Point.html#equals": {
                          "ref": "Point.html#equals",
                          "tf": 6.25
                        },
                        "Point.html#clone": {
                          "ref": "Point.html#clone",
                          "tf": 10
                        },
                        "Point.html#copy": {
                          "ref": "Point.html#copy",
                          "tf": 10
                        },
                        "Position.html#reduceErrorBoost": {
                          "ref": "Position.html#reduceErrorBoost",
                          "tf": 8.333333333333332
                        },
                        "Position.html#reduceErrorFacing": {
                          "ref": "Position.html#reduceErrorFacing",
                          "tf": 8.333333333333332
                        },
                        "Position.html#reduceError": {
                          "ref": "Position.html#reduceError",
                          "tf": 8.333333333333332
                        },
                        "Position.html#applyIsometry": {
                          "ref": "Position.html#applyIsometry",
                          "tf": 4.545454545454546
                        },
                        "Position.html#multiply": {
                          "ref": "Position.html#multiply",
                          "tf": 3.571428571428571
                        },
                        "Position.html#premultiply": {
                          "ref": "Position.html#premultiply",
                          "tf": 3.571428571428571
                        },
                        "Position.html#getInverse": {
                          "ref": "Position.html#getInverse",
                          "tf": 8.333333333333332
                        },
                        "Position.html#flowFromOrigin": {
                          "ref": "Position.html#flowFromOrigin",
                          "tf": 3.3333333333333335
                        },
                        "Position.html#flow": {
                          "ref": "Position.html#flow",
                          "tf": 0.9900990099009901
                        },
                        "Position.html#equals": {
                          "ref": "Position.html#equals",
                          "tf": 10
                        },
                        "Position.html#clone": {
                          "ref": "Position.html#clone",
                          "tf": 10
                        },
                        "Position.html#copy": {
                          "ref": "Position.html#copy",
                          "tf": 10
                        },
                        "Vector.html#applyFacing": {
                          "ref": "Vector.html#applyFacing",
                          "tf": 2.631578947368421
                        },
                        "RelPosition.html#reduceErrorBoost": {
                          "ref": "RelPosition.html#reduceErrorBoost",
                          "tf": 8.333333333333332
                        },
                        "RelPosition.html#reduceErrorFacing": {
                          "ref": "RelPosition.html#reduceErrorFacing",
                          "tf": 8.333333333333332
                        },
                        "RelPosition.html#reduceErrorLocal": {
                          "ref": "RelPosition.html#reduceErrorLocal",
                          "tf": 8.333333333333332
                        },
                        "RelPosition.html#reduceErrorCellBoost": {
                          "ref": "RelPosition.html#reduceErrorCellBoost",
                          "tf": 8.333333333333332
                        },
                        "RelPosition.html#reduceError": {
                          "ref": "RelPosition.html#reduceError",
                          "tf": 8.333333333333332
                        },
                        "RelPosition.html#flow": {
                          "ref": "RelPosition.html#flow",
                          "tf": 2.380952380952381
                        },
                        "RelPosition.html#equals": {
                          "ref": "RelPosition.html#equals",
                          "tf": 6.25
                        },
                        "RelPosition.html#clone": {
                          "ref": "RelPosition.html#clone",
                          "tf": 10
                        },
                        "RelPosition.html#copy": {
                          "ref": "RelPosition.html#copy",
                          "tf": 10
                        },
                        "KeyboardControls.html#update": {
                          "ref": "KeyboardControls.html#update",
                          "tf": 0.9259259259259258
                        },
                        "module-Thurston-Thurston.html#getEyePositions": {
                          "ref": "module-Thurston-Thurston.html#getEyePositions",
                          "tf": 3.3333333333333335
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "h": {
            "docs": {},
            "e": {
              "docs": {},
              "c": {
                "docs": {},
                "k": {
                  "docs": {
                    "Isometry.html#equals": {
                      "ref": "Isometry.html#equals",
                      "tf": 6.25
                    },
                    "Point.html#equals": {
                      "ref": "Point.html#equals",
                      "tf": 6.25
                    },
                    "Position.html#equals": {
                      "ref": "Position.html#equals",
                      "tf": 10
                    },
                    "RelPosition.html#equals": {
                      "ref": "RelPosition.html#equals",
                      "tf": 6.25
                    },
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.3546099290780142
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "s": {
                "docs": {},
                "e": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "Vector.html#applyFacing": {
                        "ref": "Vector.html#applyFacing",
                        "tf": 2.631578947368421
                      }
                    }
                  }
                }
              }
            },
            "a": {
              "docs": {},
              "n": {
                "docs": {},
                "g": {
                  "docs": {
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.4629629629629629
                    },
                    "module-Thurston-Thurston.html#chaseCamera": {
                      "ref": "module-Thurston-Thurston.html#chaseCamera",
                      "tf": 2
                    }
                  }
                }
              },
              "s": {
                "docs": {},
                "e": {
                  "docs": {},
                  "c": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "m": {
                        "docs": {},
                        "e": {
                          "docs": {},
                          "r": {
                            "docs": {},
                            "a": {
                              "docs": {
                                "module-Thurston-Thurston.html#chaseCamera": {
                                  "ref": "module-Thurston-Thurston.html#chaseCamera",
                                  "tf": 750
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "r": {
            "docs": {},
            "e": {
              "docs": {},
              "a": {
                "docs": {},
                "t": {
                  "docs": {
                    "Isometry.html#toGLSL": {
                      "ref": "Isometry.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Point.html#toGLSL": {
                      "ref": "Point.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Position.html#toGLSL": {
                      "ref": "Position.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "RelPosition.html#toGLSL": {
                      "ref": "RelPosition.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Material.html#toGLSL": {
                      "ref": "Material.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "module-Thurston-Thurston.html": {
                      "ref": "module-Thurston-Thurston.html",
                      "tf": 8.333333333333332
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "s": {
              "docs": {},
              "e": {
                "docs": {
                  "ObjectThurston.html#className": {
                    "ref": "ObjectThurston.html#className",
                    "tf": 5
                  },
                  "Light.html#className": {
                    "ref": "Light.html#className",
                    "tf": 5
                  },
                  "Solid.html#className": {
                    "ref": "Solid.html#className",
                    "tf": 5
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "l": {
                "docs": {
                  "ObjectThurston.html#name": {
                    "ref": "ObjectThurston.html#name",
                    "tf": 6.666666666666667
                  },
                  "Light.html#name": {
                    "ref": "Light.html#name",
                    "tf": 6.666666666666667
                  },
                  "Solid.html#name": {
                    "ref": "Solid.html#name",
                    "tf": 6.666666666666667
                  },
                  "KeyboardControls.html#infos": {
                    "ref": "KeyboardControls.html#infos",
                    "tf": 10
                  },
                  "module-Thurston-Thurston.html#_clock": {
                    "ref": "module-Thurston-Thurston.html#_clock",
                    "tf": 7.142857142857142
                  }
                }
              }
            },
            "m": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "a": {
                    "docs": {
                      "KeyboardControls.html#update": {
                        "ref": "KeyboardControls.html#update",
                        "tf": 1.8518518518518516
                      },
                      "module-Thurston-Thurston.html#_camera": {
                        "ref": "module-Thurston-Thurston.html#_camera",
                        "tf": 25
                      },
                      "module-Thurston-Thurston.html#chaseCamera": {
                        "ref": "module-Thurston-Thurston.html#chaseCamera",
                        "tf": 2
                      }
                    }
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "l": {
              "docs": {},
              "l": {
                "docs": {
                  "RelPosition.html#localPoint": {
                    "ref": "RelPosition.html#localPoint",
                    "tf": 7.142857142857142
                  },
                  "RelPosition.html#point": {
                    "ref": "RelPosition.html#point",
                    "tf": 8.333333333333332
                  }
                },
                "b": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "s": {
                        "docs": {},
                        "t": {
                          "docs": {
                            "RelPosition.html": {
                              "ref": "RelPosition.html",
                              "tf": 1.9230769230769231
                            },
                            "RelPosition.html#cellBoost": {
                              "ref": "RelPosition.html#cellBoost",
                              "tf": 700
                            },
                            "RelPosition.html#invCellBoost": {
                              "ref": "RelPosition.html#invCellBoost",
                              "tf": 25
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "l": {
          "docs": {},
          "i": {
            "docs": {},
            "s": {
              "docs": {},
              "t": {
                "docs": {
                  "list_class.html": {
                    "ref": "list_class.html",
                    "tf": 110
                  },
                  "list_module.html": {
                    "ref": "list_module.html",
                    "tf": 110
                  },
                  "Light.html#glslBuildDataDefault": {
                    "ref": "Light.html#glslBuildDataDefault",
                    "tf": 6.25
                  },
                  "Solid.html#glslBuildDataDefault": {
                    "ref": "Solid.html#glslBuildDataDefault",
                    "tf": 6.25
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  },
                  "Subgroup.html#teleports": {
                    "ref": "Subgroup.html#teleports",
                    "tf": 5.555555555555555
                  },
                  "module-Thurston-Thurston.html#params": {
                    "ref": "module-Thurston-Thurston.html#params",
                    "tf": 7.142857142857142
                  },
                  "module-Thurston-Thurston.html#_solids": {
                    "ref": "module-Thurston-Thurston.html#_solids",
                    "tf": 10
                  },
                  "module-Thurston-Thurston.html#_lights": {
                    "ref": "module-Thurston-Thurston.html#_lights",
                    "tf": 10
                  },
                  "module-Thurston-Thurston.html#_maxLightDirs": {
                    "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                    "tf": 6.25
                  },
                  "module-Thurston-Thurston.html#addItems": {
                    "ref": "module-Thurston-Thurston.html#addItems",
                    "tf": 12.5
                  },
                  "module-Thurston-Thurston.html#buildShaderDataBackground": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                    "tf": 5.555555555555555
                  },
                  "module-Thurston-Thurston.html#buildShaderDataItems": {
                    "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                    "tf": 5
                  }
                },
                ":": {
                  "docs": {},
                  "c": {
                    "docs": {},
                    "l": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "s": {
                            "docs": {
                              "list_class.html": {
                                "ref": "list_class.html",
                                "tf": 1300
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  "m": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "d": {
                        "docs": {},
                        "u": {
                          "docs": {},
                          "l": {
                            "docs": {
                              "list_module.html": {
                                "ref": "list_module.html",
                                "tf": 1300
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Subgroup.html#shaderSource": {
                        "ref": "Subgroup.html#shaderSource",
                        "tf": 4.166666666666666
                      }
                    }
                  },
                  "n": {
                    "docs": {
                      "module-Thurston-Thurston.html#addEventListeners": {
                        "ref": "module-Thurston-Thurston.html#addEventListeners",
                        "tf": 16.666666666666664
                      }
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "e": {
                "docs": {
                  "Point.html#toGLSL": {
                    "ref": "Point.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Position.html#toGLSL": {
                    "ref": "Position.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "RelPosition.html#toGLSL": {
                    "ref": "RelPosition.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Material.html#toGLSL": {
                    "ref": "Material.html#toGLSL",
                    "tf": 4.545454545454546
                  }
                },
                "a": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Vector.html": {
                        "ref": "Vector.html",
                        "tf": 3.8461538461538463
                      }
                    }
                  }
                }
              }
            },
            "g": {
              "docs": {},
              "h": {
                "docs": {},
                "t": {
                  "docs": {
                    "ObjectThurston.html": {
                      "ref": "ObjectThurston.html",
                      "tf": 4.545454545454546
                    },
                    "ObjectThurston.html#isLight": {
                      "ref": "ObjectThurston.html#isLight",
                      "tf": 25
                    },
                    "Light.html": {
                      "ref": "Light.html",
                      "tf": 1910
                    },
                    "Light.html#color": {
                      "ref": "Light.html#color",
                      "tf": 25
                    },
                    "Light.html#isLight": {
                      "ref": "Light.html#isLight",
                      "tf": 25
                    },
                    "Light.html#toGLSL": {
                      "ref": "Light.html#toGLSL",
                      "tf": 12.5
                    },
                    "Solid.html#isLight": {
                      "ref": "Solid.html#isLight",
                      "tf": 25
                    },
                    "module-Thurston-Thurston.html#_lights": {
                      "ref": "module-Thurston-Thurston.html#_lights",
                      "tf": 10
                    },
                    "module-Thurston-Thurston.html#_maxLightDirs": {
                      "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                      "tf": 12.5
                    },
                    "module-Thurston-Thurston.html#maxLightDirs": {
                      "ref": "module-Thurston-Thurston.html#maxLightDirs",
                      "tf": 12.5
                    },
                    "module-Thurston-Thurston.html#buildShaderDataItems": {
                      "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                      "tf": 21.666666666666664
                    }
                  },
                  "#": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "u": {
                        "docs": {},
                        "i": {
                          "docs": {},
                          "d": {
                            "docs": {
                              "Light.html#uuid": {
                                "ref": "Light.html#uuid",
                                "tf": 1150
                              }
                            }
                          }
                        }
                      }
                    },
                    "g": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "l": {
                            "docs": {
                              "Light.html#glsl": {
                                "ref": "Light.html#glsl",
                                "tf": 1150
                              }
                            },
                            "b": {
                              "docs": {},
                              "u": {
                                "docs": {},
                                "i": {
                                  "docs": {},
                                  "l": {
                                    "docs": {},
                                    "d": {
                                      "docs": {},
                                      "d": {
                                        "docs": {},
                                        "a": {
                                          "docs": {},
                                          "t": {
                                            "docs": {},
                                            "a": {
                                              "docs": {
                                                "Light.html#glslBuildData": {
                                                  "ref": "Light.html#glslBuildData",
                                                  "tf": 1150
                                                }
                                              },
                                              "d": {
                                                "docs": {},
                                                "e": {
                                                  "docs": {},
                                                  "f": {
                                                    "docs": {},
                                                    "a": {
                                                      "docs": {},
                                                      "u": {
                                                        "docs": {},
                                                        "l": {
                                                          "docs": {},
                                                          "t": {
                                                            "docs": {
                                                              "Light.html#glslBuildDataDefault": {
                                                                "ref": "Light.html#glslBuildDataDefault",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "o": {
                          "docs": {},
                          "b": {
                            "docs": {
                              "Light.html#global": {
                                "ref": "Light.html#global",
                                "tf": 1150
                              }
                            }
                          }
                        }
                      }
                    },
                    "p": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "t": {
                              "docs": {
                                "Light.html#position": {
                                  "ref": "Light.html#position",
                                  "tf": 1150
                                }
                              }
                            }
                          }
                        },
                        "i": {
                          "docs": {},
                          "n": {
                            "docs": {},
                            "t": {
                              "docs": {
                                "Light.html#point": {
                                  "ref": "Light.html#point",
                                  "tf": 1150
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "l": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "c": {
                          "docs": {
                            "Light.html#local": {
                              "ref": "Light.html#local",
                              "tf": 1150
                            }
                          }
                        },
                        "a": {
                          "docs": {},
                          "d": {
                            "docs": {},
                            "g": {
                              "docs": {},
                              "l": {
                                "docs": {},
                                "s": {
                                  "docs": {},
                                  "l": {
                                    "docs": {},
                                    "t": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "m": {
                                          "docs": {},
                                          "p": {
                                            "docs": {},
                                            "l": {
                                              "docs": {
                                                "Light.html#loadGLSLTemplate": {
                                                  "ref": "Light.html#loadGLSLTemplate",
                                                  "tf": 1150
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "d": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "f": {
                                          "docs": {},
                                          "a": {
                                            "docs": {},
                                            "u": {
                                              "docs": {},
                                              "l": {
                                                "docs": {},
                                                "t": {
                                                  "docs": {},
                                                  "t": {
                                                    "docs": {},
                                                    "e": {
                                                      "docs": {},
                                                      "m": {
                                                        "docs": {},
                                                        "p": {
                                                          "docs": {},
                                                          "l": {
                                                            "docs": {
                                                              "Light.html#loadGLSLDefaultTemplate": {
                                                                "ref": "Light.html#loadGLSLDefaultTemplate",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "s": {
                      "docs": {},
                      "h": {
                        "docs": {},
                        "a": {
                          "docs": {},
                          "d": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "r": {
                                "docs": {},
                                "s": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "u": {
                                      "docs": {},
                                      "r": {
                                        "docs": {},
                                        "c": {
                                          "docs": {
                                            "Light.html#shaderSource": {
                                              "ref": "Light.html#shaderSource",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "c": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "a": {
                          "docs": {},
                          "s": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "n": {
                                "docs": {},
                                "a": {
                                  "docs": {},
                                  "m": {
                                    "docs": {
                                      "Light.html#className": {
                                        "ref": "Light.html#className",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      "o": {
                        "docs": {},
                        "l": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "r": {
                              "docs": {
                                "Light.html#color": {
                                  "ref": "Light.html#color",
                                  "tf": 1150
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "m": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "x": {
                          "docs": {},
                          "d": {
                            "docs": {},
                            "i": {
                              "docs": {},
                              "r": {
                                "docs": {
                                  "Light.html#maxDirs": {
                                    "ref": "Light.html#maxDirs",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "n": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "m": {
                          "docs": {
                            "Light.html#name": {
                              "ref": "Light.html#name",
                              "tf": 1150
                            }
                          }
                        }
                      }
                    },
                    "i": {
                      "docs": {},
                      "s": {
                        "docs": {},
                        "l": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "g": {
                              "docs": {},
                              "h": {
                                "docs": {},
                                "t": {
                                  "docs": {
                                    "Light.html#isLight": {
                                      "ref": "Light.html#isLight",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "s": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "d": {
                                  "docs": {
                                    "Light.html#isSolid": {
                                      "ref": "Light.html#isSolid",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "t": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "g": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "l": {
                                "docs": {
                                  "Light.html#toGLSL": {
                                    "ref": "Light.html#toGLSL",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "t": {
            "docs": {},
            ";": {
              "docs": {},
              "a": {
                "docs": {},
                "b": {
                  "docs": {},
                  "s": {
                    "docs": {},
                    "t": {
                      "docs": {},
                      "r": {
                        "docs": {},
                        "a": {
                          "docs": {},
                          "c": {
                            "docs": {},
                            "t": {
                              "docs": {},
                              "&": {
                                "docs": {},
                                "g": {
                                  "docs": {},
                                  "t": {
                                    "docs": {
                                      "Isometry.html#build": {
                                        "ref": "Isometry.html#build",
                                        "tf": 50
                                      },
                                      "Isometry.html#set": {
                                        "ref": "Isometry.html#set",
                                        "tf": 25
                                      },
                                      "Isometry.html#reduceError": {
                                        "ref": "Isometry.html#reduceError",
                                        "tf": 33.33333333333333
                                      },
                                      "Isometry.html#multiply": {
                                        "ref": "Isometry.html#multiply",
                                        "tf": 25
                                      },
                                      "Isometry.html#premultiply": {
                                        "ref": "Isometry.html#premultiply",
                                        "tf": 25
                                      },
                                      "Isometry.html#getInverse": {
                                        "ref": "Isometry.html#getInverse",
                                        "tf": 25
                                      },
                                      "Isometry.html#makeTranslation": {
                                        "ref": "Isometry.html#makeTranslation",
                                        "tf": 25
                                      },
                                      "Isometry.html#makeInvTranslation": {
                                        "ref": "Isometry.html#makeInvTranslation",
                                        "tf": 25
                                      },
                                      "Isometry.html#equals": {
                                        "ref": "Isometry.html#equals",
                                        "tf": 25
                                      },
                                      "Isometry.html#clone": {
                                        "ref": "Isometry.html#clone",
                                        "tf": 33.33333333333333
                                      },
                                      "Isometry.html#copy": {
                                        "ref": "Isometry.html#copy",
                                        "tf": 25
                                      },
                                      "Isometry.html#toGLSL": {
                                        "ref": "Isometry.html#toGLSL",
                                        "tf": 33.33333333333333
                                      },
                                      "Point.html#build": {
                                        "ref": "Point.html#build",
                                        "tf": 50
                                      },
                                      "Point.html#set": {
                                        "ref": "Point.html#set",
                                        "tf": 25
                                      },
                                      "Point.html#applyIsometry": {
                                        "ref": "Point.html#applyIsometry",
                                        "tf": 25
                                      },
                                      "Point.html#equals": {
                                        "ref": "Point.html#equals",
                                        "tf": 25
                                      },
                                      "Point.html#clone": {
                                        "ref": "Point.html#clone",
                                        "tf": 33.33333333333333
                                      },
                                      "Point.html#copy": {
                                        "ref": "Point.html#copy",
                                        "tf": 25
                                      },
                                      "Point.html#toGLSL": {
                                        "ref": "Point.html#toGLSL",
                                        "tf": 33.33333333333333
                                      },
                                      "ObjectThurston.html": {
                                        "ref": "ObjectThurston.html",
                                        "tf": 50
                                      },
                                      "Position.html#flowFromOrigin": {
                                        "ref": "Position.html#flowFromOrigin",
                                        "tf": 25
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "s": {
                  "docs": {},
                  "y": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "c": {
                        "docs": {},
                        "&": {
                          "docs": {},
                          "g": {
                            "docs": {},
                            "t": {
                              "docs": {
                                "ObjectThurston.html#loadGLSLTemplate": {
                                  "ref": "ObjectThurston.html#loadGLSLTemplate",
                                  "tf": 33.33333333333333
                                },
                                "ObjectThurston.html#loadGLSLDefaultTemplate": {
                                  "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                                  "tf": 33.33333333333333
                                },
                                "Light.html#glslBuildData": {
                                  "ref": "Light.html#glslBuildData",
                                  "tf": 25
                                },
                                "Light.html#glslBuildDataDefault": {
                                  "ref": "Light.html#glslBuildDataDefault",
                                  "tf": 20
                                },
                                "Light.html#loadGLSLTemplate": {
                                  "ref": "Light.html#loadGLSLTemplate",
                                  "tf": 33.33333333333333
                                },
                                "Light.html#loadGLSLDefaultTemplate": {
                                  "ref": "Light.html#loadGLSLDefaultTemplate",
                                  "tf": 33.33333333333333
                                },
                                "Solid.html#glslBuildData": {
                                  "ref": "Solid.html#glslBuildData",
                                  "tf": 25
                                },
                                "Solid.html#glslBuildDataDefault": {
                                  "ref": "Solid.html#glslBuildDataDefault",
                                  "tf": 20
                                },
                                "Solid.html#loadGLSLTemplate": {
                                  "ref": "Solid.html#loadGLSLTemplate",
                                  "tf": 33.33333333333333
                                },
                                "Solid.html#loadGLSLDefaultTemplate": {
                                  "ref": "Solid.html#loadGLSLDefaultTemplate",
                                  "tf": 33.33333333333333
                                },
                                "Subgroup.html#glslBuildData": {
                                  "ref": "Subgroup.html#glslBuildData",
                                  "tf": 33.33333333333333
                                },
                                "module-Thurston-Thurston.html#buildShaderVertex": {
                                  "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                                  "tf": 33.33333333333333
                                },
                                "module-Thurston-Thurston.html#buildShaderDataBackground": {
                                  "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                                  "tf": 33.33333333333333
                                },
                                "module-Thurston-Thurston.html#buildShaderDataItems": {
                                  "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                                  "tf": 16.666666666666664
                                },
                                "module-Thurston-Thurston.html#buildShaderFragment": {
                                  "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                  "tf": 33.33333333333333
                                },
                                "module-Thurston-Thurston.html#initHorizon": {
                                  "ref": "module-Thurston-Thurston.html#initHorizon",
                                  "tf": 33.33333333333333
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "p": {
                "docs": {},
                "r": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "v": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "&": {
                              "docs": {},
                              "g": {
                                "docs": {},
                                "t": {
                                  "docs": {
                                    "module-Thurston-Thurston.html#_renderer": {
                                      "ref": "module-Thurston-Thurston.html#_renderer",
                                      "tf": 33.33333333333333
                                    },
                                    "module-Thurston-Thurston.html#_camera": {
                                      "ref": "module-Thurston-Thurston.html#_camera",
                                      "tf": 33.33333333333333
                                    },
                                    "module-Thurston-Thurston.html#_scene": {
                                      "ref": "module-Thurston-Thurston.html#_scene",
                                      "tf": 33.33333333333333
                                    },
                                    "module-Thurston-Thurston.html#_solids": {
                                      "ref": "module-Thurston-Thurston.html#_solids",
                                      "tf": 33.33333333333333
                                    },
                                    "module-Thurston-Thurston.html#_lights": {
                                      "ref": "module-Thurston-Thurston.html#_lights",
                                      "tf": 33.33333333333333
                                    },
                                    "module-Thurston-Thurston.html#_maxLightDirs": {
                                      "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                                      "tf": 33.33333333333333
                                    },
                                    "module-Thurston-Thurston.html#_keyboardControls": {
                                      "ref": "module-Thurston-Thurston.html#_keyboardControls",
                                      "tf": 33.33333333333333
                                    },
                                    "module-Thurston-Thurston.html#_clock": {
                                      "ref": "module-Thurston-Thurston.html#_clock",
                                      "tf": 33.33333333333333
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "f": {
              "docs": {},
              "t": {
                "docs": {
                  "Isometry.html#multiply": {
                    "ref": "Isometry.html#multiply",
                    "tf": 6.25
                  },
                  "Position.html#applyIsometry": {
                    "ref": "Position.html#applyIsometry",
                    "tf": 4.545454545454546
                  },
                  "Position.html#premultiply": {
                    "ref": "Position.html#premultiply",
                    "tf": 3.571428571428571
                  },
                  "module-Thurston-Thurston.html#getEyePositions": {
                    "ref": "module-Thurston-Thurston.html#getEyePositions",
                    "tf": 3.3333333333333335
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "t": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "ObjectThurston.html#className": {
                        "ref": "ObjectThurston.html#className",
                        "tf": 5
                      },
                      "Light.html#className": {
                        "ref": "Light.html#className",
                        "tf": 5
                      },
                      "Solid.html#className": {
                        "ref": "Solid.html#className",
                        "tf": 5
                      }
                    }
                  }
                }
              }
            },
            "v": {
              "docs": {},
              "e": {
                "docs": {},
                "l": {
                  "docs": {
                    "Teleport.html#glsl": {
                      "ref": "Teleport.html#glsl",
                      "tf": 6.25
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "g": {
                "docs": {},
                "t": {
                  "docs": {},
                  "h": {
                    "docs": {
                      "Vector.html": {
                        "ref": "Vector.html",
                        "tf": 3.8461538461538463
                      }
                    }
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "c": {
              "docs": {},
              "a": {
                "docs": {},
                "l": {
                  "docs": {
                    "ObjectThurston.html#local": {
                      "ref": "ObjectThurston.html#local",
                      "tf": 707.1428571428571
                    },
                    "Light.html#local": {
                      "ref": "Light.html#local",
                      "tf": 707.1428571428571
                    },
                    "Solid.html#local": {
                      "ref": "Solid.html#local",
                      "tf": 707.1428571428571
                    },
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 0.9615384615384616
                    },
                    "RelPosition.html#local": {
                      "ref": "RelPosition.html#local",
                      "tf": 725
                    },
                    "RelPosition.html#localPoint": {
                      "ref": "RelPosition.html#localPoint",
                      "tf": 7.142857142857142
                    },
                    "RelPosition.html#teleport": {
                      "ref": "RelPosition.html#teleport",
                      "tf": 5.555555555555555
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.4629629629629629
                    }
                  },
                  "p": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "i": {
                        "docs": {},
                        "n": {
                          "docs": {},
                          "t": {
                            "docs": {
                              "RelPosition.html#localPoint": {
                                "ref": "RelPosition.html#localPoint",
                                "tf": 700
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "t": {
                  "docs": {
                    "Position.html": {
                      "ref": "Position.html",
                      "tf": 10
                    }
                  }
                }
              }
            },
            "w": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {
                    "ObjectThurston.html#className": {
                      "ref": "ObjectThurston.html#className",
                      "tf": 5
                    },
                    "Light.html#className": {
                      "ref": "Light.html#className",
                      "tf": 5
                    },
                    "Solid.html#className": {
                      "ref": "Solid.html#className",
                      "tf": 5
                    }
                  }
                }
              }
            },
            "a": {
              "docs": {},
              "d": {
                "docs": {
                  "ObjectThurston.html#loadGLSLTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "ObjectThurston.html#loadGLSLDefaultTemplate": {
                    "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Light.html#loadGLSLTemplate": {
                    "ref": "Light.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Light.html#loadGLSLDefaultTemplate": {
                    "ref": "Light.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  },
                  "Solid.html#loadGLSLTemplate": {
                    "ref": "Solid.html#loadGLSLTemplate",
                    "tf": 5
                  },
                  "Solid.html#loadGLSLDefaultTemplate": {
                    "ref": "Solid.html#loadGLSLDefaultTemplate",
                    "tf": 5
                  }
                },
                "g": {
                  "docs": {},
                  "l": {
                    "docs": {},
                    "s": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "m": {
                              "docs": {},
                              "p": {
                                "docs": {},
                                "l": {
                                  "docs": {
                                    "ObjectThurston.html#loadGLSLTemplate": {
                                      "ref": "ObjectThurston.html#loadGLSLTemplate",
                                      "tf": 683.3333333333334
                                    },
                                    "Light.html#loadGLSLTemplate": {
                                      "ref": "Light.html#loadGLSLTemplate",
                                      "tf": 683.3333333333334
                                    },
                                    "Solid.html#loadGLSLTemplate": {
                                      "ref": "Solid.html#loadGLSLTemplate",
                                      "tf": 683.3333333333334
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "d": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "f": {
                              "docs": {},
                              "a": {
                                "docs": {},
                                "u": {
                                  "docs": {},
                                  "l": {
                                    "docs": {},
                                    "t": {
                                      "docs": {},
                                      "t": {
                                        "docs": {},
                                        "e": {
                                          "docs": {},
                                          "m": {
                                            "docs": {},
                                            "p": {
                                              "docs": {},
                                              "l": {
                                                "docs": {
                                                  "ObjectThurston.html#loadGLSLDefaultTemplate": {
                                                    "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                                                    "tf": 683.3333333333334
                                                  },
                                                  "Light.html#loadGLSLDefaultTemplate": {
                                                    "ref": "Light.html#loadGLSLDefaultTemplate",
                                                    "tf": 683.3333333333334
                                                  },
                                                  "Solid.html#loadGLSLDefaultTemplate": {
                                                    "ref": "Solid.html#loadGLSLDefaultTemplate",
                                                    "tf": 683.3333333333334
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "k": {
                "docs": {
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              }
            },
            "g": {
              "docs": {
                "module-Thurston-Thurston.html#infos": {
                  "ref": "module-Thurston-Thurston.html#infos",
                  "tf": 8.333333333333332
                }
              }
            }
          },
          "a": {
            "docs": {},
            "t": {
              "docs": {},
              "t": {
                "docs": {},
                "i": {
                  "docs": {},
                  "c": {
                    "docs": {
                      "RelPosition.html": {
                        "ref": "RelPosition.html",
                        "tf": 0.9615384615384616
                      },
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 2.127659574468085
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "m": {
          "0": {
            "docs": {
              "Position.html#multiply": {
                "ref": "Position.html#multiply",
                "tf": 3.571428571428571
              },
              "Position.html#premultiply": {
                "ref": "Position.html#premultiply",
                "tf": 3.571428571428571
              }
            }
          },
          "docs": {
            "Position.html#applyFacing": {
              "ref": "Position.html#applyFacing",
              "tf": 6.25
            },
            "Position.html#multiply": {
              "ref": "Position.html#multiply",
              "tf": 3.571428571428571
            },
            "Position.html#premultiply": {
              "ref": "Position.html#premultiply",
              "tf": 3.571428571428571
            },
            "Position.html#flow": {
              "ref": "Position.html#flow",
              "tf": 3.4653465346534658
            },
            "Vector.html#applyMatrix4": {
              "ref": "Vector.html#applyMatrix4",
              "tf": 35.18518518518518
            },
            "RelPosition.html#applyFacing": {
              "ref": "RelPosition.html#applyFacing",
              "tf": 6.25
            },
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 1.8518518518518516
            }
          },
          "o": {
            "docs": {},
            "d": {
              "docs": {},
              "u": {
                "docs": {},
                "l": {
                  "docs": {
                    "list_module.html": {
                      "ref": "list_module.html",
                      "tf": 635
                    },
                    "module-Thurston.html": {
                      "ref": "module-Thurston.html",
                      "tf": 115.55555555555556
                    }
                  },
                  "e": {
                    "docs": {},
                    ":": {
                      "docs": {},
                      "t": {
                        "docs": {},
                        "h": {
                          "docs": {},
                          "u": {
                            "docs": {},
                            "r": {
                              "docs": {},
                              "s": {
                                "docs": {},
                                "t": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "n": {
                                      "docs": {
                                        "module-Thurston.html": {
                                          "ref": "module-Thurston.html",
                                          "tf": 1300
                                        }
                                      },
                                      "~": {
                                        "docs": {},
                                        "t": {
                                          "docs": {},
                                          "h": {
                                            "docs": {},
                                            "u": {
                                              "docs": {},
                                              "r": {
                                                "docs": {},
                                                "s": {
                                                  "docs": {},
                                                  "t": {
                                                    "docs": {},
                                                    "o": {
                                                      "docs": {},
                                                      "n": {
                                                        "docs": {
                                                          "module-Thurston-Thurston.html": {
                                                            "ref": "module-Thurston-Thurston.html",
                                                            "tf": 1300
                                                          }
                                                        },
                                                        "#": {
                                                          "docs": {},
                                                          "g": {
                                                            "docs": {},
                                                            "e": {
                                                              "docs": {},
                                                              "o": {
                                                                "docs": {},
                                                                "m": {
                                                                  "docs": {
                                                                    "module-Thurston-Thurston.html#geom": {
                                                                      "ref": "module-Thurston-Thurston.html#geom",
                                                                      "tf": 1150
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              "t": {
                                                                "docs": {},
                                                                "e": {
                                                                  "docs": {},
                                                                  "y": {
                                                                    "docs": {},
                                                                    "e": {
                                                                      "docs": {},
                                                                      "p": {
                                                                        "docs": {},
                                                                        "o": {
                                                                          "docs": {},
                                                                          "s": {
                                                                            "docs": {},
                                                                            "i": {
                                                                              "docs": {},
                                                                              "t": {
                                                                                "docs": {
                                                                                  "module-Thurston-Thurston.html#getEyePositions": {
                                                                                    "ref": "module-Thurston-Thurston.html#getEyePositions",
                                                                                    "tf": 1150
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "u": {
                                                              "docs": {},
                                                              "i": {
                                                                "docs": {
                                                                  "module-Thurston-Thurston.html#gui": {
                                                                    "ref": "module-Thurston-Thurston.html#gui",
                                                                    "tf": 1150
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "s": {
                                                            "docs": {},
                                                            "u": {
                                                              "docs": {},
                                                              "b": {
                                                                "docs": {},
                                                                "g": {
                                                                  "docs": {},
                                                                  "r": {
                                                                    "docs": {},
                                                                    "o": {
                                                                      "docs": {},
                                                                      "u": {
                                                                        "docs": {},
                                                                        "p": {
                                                                          "docs": {
                                                                            "module-Thurston-Thurston.html#subgroup": {
                                                                              "ref": "module-Thurston-Thurston.html#subgroup",
                                                                              "tf": 1150
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "t": {
                                                              "docs": {},
                                                              "a": {
                                                                "docs": {},
                                                                "t": {
                                                                  "docs": {
                                                                    "module-Thurston-Thurston.html#stats": {
                                                                      "ref": "module-Thurston-Thurston.html#stats",
                                                                      "tf": 1150
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "e": {
                                                              "docs": {},
                                                              "t": {
                                                                "docs": {},
                                                                "p": {
                                                                  "docs": {},
                                                                  "a": {
                                                                    "docs": {},
                                                                    "r": {
                                                                      "docs": {},
                                                                      "a": {
                                                                        "docs": {},
                                                                        "m": {
                                                                          "docs": {
                                                                            "module-Thurston-Thurston.html#setParams": {
                                                                              "ref": "module-Thurston-Thurston.html#setParams",
                                                                              "tf": 1150
                                                                            },
                                                                            "module-Thurston-Thurston.html#setParam": {
                                                                              "ref": "module-Thurston-Thurston.html#setParam",
                                                                              "tf": 1150
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                },
                                                                "k": {
                                                                  "docs": {},
                                                                  "e": {
                                                                    "docs": {},
                                                                    "y": {
                                                                      "docs": {},
                                                                      "b": {
                                                                        "docs": {},
                                                                        "o": {
                                                                          "docs": {},
                                                                          "a": {
                                                                            "docs": {},
                                                                            "r": {
                                                                              "docs": {},
                                                                              "d": {
                                                                                "docs": {
                                                                                  "module-Thurston-Thurston.html#setKeyboard": {
                                                                                    "ref": "module-Thurston-Thurston.html#setKeyboard",
                                                                                    "tf": 1150
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "p": {
                                                            "docs": {},
                                                            "a": {
                                                              "docs": {},
                                                              "r": {
                                                                "docs": {},
                                                                "a": {
                                                                  "docs": {},
                                                                  "m": {
                                                                    "docs": {
                                                                      "module-Thurston-Thurston.html#params": {
                                                                        "ref": "module-Thurston-Thurston.html#params",
                                                                        "tf": 1150
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "_": {
                                                            "docs": {},
                                                            "r": {
                                                              "docs": {},
                                                              "e": {
                                                                "docs": {},
                                                                "n": {
                                                                  "docs": {},
                                                                  "d": {
                                                                    "docs": {},
                                                                    "e": {
                                                                      "docs": {},
                                                                      "r": {
                                                                        "docs": {
                                                                          "module-Thurston-Thurston.html#_renderer": {
                                                                            "ref": "module-Thurston-Thurston.html#_renderer",
                                                                            "tf": 1150
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "c": {
                                                              "docs": {},
                                                              "a": {
                                                                "docs": {},
                                                                "m": {
                                                                  "docs": {},
                                                                  "e": {
                                                                    "docs": {},
                                                                    "r": {
                                                                      "docs": {},
                                                                      "a": {
                                                                        "docs": {
                                                                          "module-Thurston-Thurston.html#_camera": {
                                                                            "ref": "module-Thurston-Thurston.html#_camera",
                                                                            "tf": 1150
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              "l": {
                                                                "docs": {},
                                                                "o": {
                                                                  "docs": {},
                                                                  "c": {
                                                                    "docs": {},
                                                                    "k": {
                                                                      "docs": {
                                                                        "module-Thurston-Thurston.html#_clock": {
                                                                          "ref": "module-Thurston-Thurston.html#_clock",
                                                                          "tf": 1150
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "s": {
                                                              "docs": {},
                                                              "c": {
                                                                "docs": {},
                                                                "e": {
                                                                  "docs": {},
                                                                  "n": {
                                                                    "docs": {
                                                                      "module-Thurston-Thurston.html#_scene": {
                                                                        "ref": "module-Thurston-Thurston.html#_scene",
                                                                        "tf": 1150
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              "o": {
                                                                "docs": {},
                                                                "l": {
                                                                  "docs": {},
                                                                  "i": {
                                                                    "docs": {},
                                                                    "d": {
                                                                      "docs": {
                                                                        "module-Thurston-Thurston.html#_solids": {
                                                                          "ref": "module-Thurston-Thurston.html#_solids",
                                                                          "tf": 1150
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "l": {
                                                              "docs": {},
                                                              "i": {
                                                                "docs": {},
                                                                "g": {
                                                                  "docs": {},
                                                                  "h": {
                                                                    "docs": {},
                                                                    "t": {
                                                                      "docs": {
                                                                        "module-Thurston-Thurston.html#_lights": {
                                                                          "ref": "module-Thurston-Thurston.html#_lights",
                                                                          "tf": 1150
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "m": {
                                                              "docs": {},
                                                              "a": {
                                                                "docs": {},
                                                                "x": {
                                                                  "docs": {},
                                                                  "l": {
                                                                    "docs": {},
                                                                    "i": {
                                                                      "docs": {},
                                                                      "g": {
                                                                        "docs": {},
                                                                        "h": {
                                                                          "docs": {},
                                                                          "t": {
                                                                            "docs": {},
                                                                            "d": {
                                                                              "docs": {},
                                                                              "i": {
                                                                                "docs": {},
                                                                                "r": {
                                                                                  "docs": {
                                                                                    "module-Thurston-Thurston.html#_maxLightDirs": {
                                                                                      "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                                                                                      "tf": 1150
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "k": {
                                                              "docs": {},
                                                              "e": {
                                                                "docs": {},
                                                                "y": {
                                                                  "docs": {},
                                                                  "b": {
                                                                    "docs": {},
                                                                    "o": {
                                                                      "docs": {},
                                                                      "a": {
                                                                        "docs": {},
                                                                        "r": {
                                                                          "docs": {},
                                                                          "d": {
                                                                            "docs": {},
                                                                            "c": {
                                                                              "docs": {},
                                                                              "o": {
                                                                                "docs": {},
                                                                                "n": {
                                                                                  "docs": {},
                                                                                  "t": {
                                                                                    "docs": {},
                                                                                    "r": {
                                                                                      "docs": {},
                                                                                      "o": {
                                                                                        "docs": {},
                                                                                        "l": {
                                                                                          "docs": {
                                                                                            "module-Thurston-Thurston.html#_keyboardControls": {
                                                                                              "ref": "module-Thurston-Thurston.html#_keyboardControls",
                                                                                              "tf": 1150
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "m": {
                                                            "docs": {},
                                                            "a": {
                                                              "docs": {},
                                                              "x": {
                                                                "docs": {},
                                                                "l": {
                                                                  "docs": {},
                                                                  "i": {
                                                                    "docs": {},
                                                                    "g": {
                                                                      "docs": {},
                                                                      "h": {
                                                                        "docs": {},
                                                                        "t": {
                                                                          "docs": {},
                                                                          "d": {
                                                                            "docs": {},
                                                                            "i": {
                                                                              "docs": {},
                                                                              "r": {
                                                                                "docs": {
                                                                                  "module-Thurston-Thurston.html#maxLightDirs": {
                                                                                    "ref": "module-Thurston-Thurston.html#maxLightDirs",
                                                                                    "tf": 1150
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "c": {
                                                            "docs": {},
                                                            "h": {
                                                              "docs": {},
                                                              "a": {
                                                                "docs": {},
                                                                "s": {
                                                                  "docs": {},
                                                                  "e": {
                                                                    "docs": {},
                                                                    "c": {
                                                                      "docs": {},
                                                                      "a": {
                                                                        "docs": {},
                                                                        "m": {
                                                                          "docs": {},
                                                                          "e": {
                                                                            "docs": {},
                                                                            "r": {
                                                                              "docs": {},
                                                                              "a": {
                                                                                "docs": {
                                                                                  "module-Thurston-Thurston.html#chaseCamera": {
                                                                                    "ref": "module-Thurston-Thurston.html#chaseCamera",
                                                                                    "tf": 1150
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "i": {
                                                            "docs": {},
                                                            "n": {
                                                              "docs": {},
                                                              "f": {
                                                                "docs": {},
                                                                "o": {
                                                                  "docs": {
                                                                    "module-Thurston-Thurston.html#infos": {
                                                                      "ref": "module-Thurston-Thurston.html#infos",
                                                                      "tf": 1150
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              "i": {
                                                                "docs": {},
                                                                "t": {
                                                                  "docs": {},
                                                                  "u": {
                                                                    "docs": {},
                                                                    "i": {
                                                                      "docs": {
                                                                        "module-Thurston-Thurston.html#initUI": {
                                                                          "ref": "module-Thurston-Thurston.html#initUI",
                                                                          "tf": 1150
                                                                        }
                                                                      }
                                                                    }
                                                                  },
                                                                  "t": {
                                                                    "docs": {},
                                                                    "h": {
                                                                      "docs": {},
                                                                      "r": {
                                                                        "docs": {},
                                                                        "e": {
                                                                          "docs": {},
                                                                          "e": {
                                                                            "docs": {},
                                                                            "j": {
                                                                              "docs": {
                                                                                "module-Thurston-Thurston.html#initThreeJS": {
                                                                                  "ref": "module-Thurston-Thurston.html#initThreeJS",
                                                                                  "tf": 1150
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  },
                                                                  "s": {
                                                                    "docs": {},
                                                                    "t": {
                                                                      "docs": {},
                                                                      "a": {
                                                                        "docs": {},
                                                                        "t": {
                                                                          "docs": {
                                                                            "module-Thurston-Thurston.html#initStats": {
                                                                              "ref": "module-Thurston-Thurston.html#initStats",
                                                                              "tf": 1150
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  },
                                                                  "h": {
                                                                    "docs": {},
                                                                    "o": {
                                                                      "docs": {},
                                                                      "r": {
                                                                        "docs": {},
                                                                        "i": {
                                                                          "docs": {},
                                                                          "z": {
                                                                            "docs": {},
                                                                            "o": {
                                                                              "docs": {},
                                                                              "n": {
                                                                                "docs": {
                                                                                  "module-Thurston-Thurston.html#initHorizon": {
                                                                                    "ref": "module-Thurston-Thurston.html#initHorizon",
                                                                                    "tf": 1150
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "r": {
                                                            "docs": {},
                                                            "e": {
                                                              "docs": {},
                                                              "g": {
                                                                "docs": {},
                                                                "i": {
                                                                  "docs": {},
                                                                  "s": {
                                                                    "docs": {},
                                                                    "t": {
                                                                      "docs": {},
                                                                      "e": {
                                                                        "docs": {},
                                                                        "r": {
                                                                          "docs": {},
                                                                          "p": {
                                                                            "docs": {},
                                                                            "a": {
                                                                              "docs": {},
                                                                              "r": {
                                                                                "docs": {},
                                                                                "a": {
                                                                                  "docs": {},
                                                                                  "m": {
                                                                                    "docs": {
                                                                                      "module-Thurston-Thurston.html#registerParam": {
                                                                                        "ref": "module-Thurston-Thurston.html#registerParam",
                                                                                        "tf": 1150
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "u": {
                                                              "docs": {},
                                                              "n": {
                                                                "docs": {
                                                                  "module-Thurston-Thurston.html#run": {
                                                                    "ref": "module-Thurston-Thurston.html#run",
                                                                    "tf": 1150
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "a": {
                                                            "docs": {},
                                                            "d": {
                                                              "docs": {},
                                                              "d": {
                                                                "docs": {},
                                                                "i": {
                                                                  "docs": {},
                                                                  "t": {
                                                                    "docs": {},
                                                                    "e": {
                                                                      "docs": {},
                                                                      "m": {
                                                                        "docs": {
                                                                          "module-Thurston-Thurston.html#addItem": {
                                                                            "ref": "module-Thurston-Thurston.html#addItem",
                                                                            "tf": 1150
                                                                          },
                                                                          "module-Thurston-Thurston.html#addItems": {
                                                                            "ref": "module-Thurston-Thurston.html#addItems",
                                                                            "tf": 1150
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                },
                                                                "e": {
                                                                  "docs": {},
                                                                  "v": {
                                                                    "docs": {},
                                                                    "e": {
                                                                      "docs": {},
                                                                      "n": {
                                                                        "docs": {},
                                                                        "t": {
                                                                          "docs": {},
                                                                          "l": {
                                                                            "docs": {},
                                                                            "i": {
                                                                              "docs": {},
                                                                              "s": {
                                                                                "docs": {},
                                                                                "t": {
                                                                                  "docs": {},
                                                                                  "e": {
                                                                                    "docs": {},
                                                                                    "n": {
                                                                                      "docs": {
                                                                                        "module-Thurston-Thurston.html#addEventListeners": {
                                                                                          "ref": "module-Thurston-Thurston.html#addEventListeners",
                                                                                          "tf": 1150
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "p": {
                                                              "docs": {},
                                                              "p": {
                                                                "docs": {},
                                                                "e": {
                                                                  "docs": {},
                                                                  "n": {
                                                                    "docs": {},
                                                                    "d": {
                                                                      "docs": {},
                                                                      "t": {
                                                                        "docs": {},
                                                                        "i": {
                                                                          "docs": {},
                                                                          "t": {
                                                                            "docs": {},
                                                                            "l": {
                                                                              "docs": {
                                                                                "module-Thurston-Thurston.html#appendTitle": {
                                                                                  "ref": "module-Thurston-Thurston.html#appendTitle",
                                                                                  "tf": 1150
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            },
                                                            "n": {
                                                              "docs": {},
                                                              "i": {
                                                                "docs": {},
                                                                "m": {
                                                                  "docs": {
                                                                    "module-Thurston-Thurston.html#animate": {
                                                                      "ref": "module-Thurston-Thurston.html#animate",
                                                                      "tf": 1150
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "b": {
                                                            "docs": {},
                                                            "u": {
                                                              "docs": {},
                                                              "i": {
                                                                "docs": {},
                                                                "l": {
                                                                  "docs": {},
                                                                  "d": {
                                                                    "docs": {},
                                                                    "s": {
                                                                      "docs": {},
                                                                      "h": {
                                                                        "docs": {},
                                                                        "a": {
                                                                          "docs": {},
                                                                          "d": {
                                                                            "docs": {},
                                                                            "e": {
                                                                              "docs": {},
                                                                              "r": {
                                                                                "docs": {},
                                                                                "v": {
                                                                                  "docs": {},
                                                                                  "e": {
                                                                                    "docs": {},
                                                                                    "r": {
                                                                                      "docs": {},
                                                                                      "t": {
                                                                                        "docs": {},
                                                                                        "e": {
                                                                                          "docs": {},
                                                                                          "x": {
                                                                                            "docs": {
                                                                                              "module-Thurston-Thurston.html#buildShaderVertex": {
                                                                                                "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                                                                                                "tf": 1150
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                },
                                                                                "d": {
                                                                                  "docs": {},
                                                                                  "a": {
                                                                                    "docs": {},
                                                                                    "t": {
                                                                                      "docs": {},
                                                                                      "a": {
                                                                                        "docs": {},
                                                                                        "c": {
                                                                                          "docs": {},
                                                                                          "o": {
                                                                                            "docs": {},
                                                                                            "n": {
                                                                                              "docs": {},
                                                                                              "s": {
                                                                                                "docs": {},
                                                                                                "t": {
                                                                                                  "docs": {
                                                                                                    "module-Thurston-Thurston.html#buildShaderDataConstants": {
                                                                                                      "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                                                                                                      "tf": 1150
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        },
                                                                                        "u": {
                                                                                          "docs": {},
                                                                                          "n": {
                                                                                            "docs": {},
                                                                                            "i": {
                                                                                              "docs": {},
                                                                                              "f": {
                                                                                                "docs": {},
                                                                                                "o": {
                                                                                                  "docs": {},
                                                                                                  "r": {
                                                                                                    "docs": {},
                                                                                                    "m": {
                                                                                                      "docs": {
                                                                                                        "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                                                                                                          "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                                                                                                          "tf": 1150
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        },
                                                                                        "b": {
                                                                                          "docs": {},
                                                                                          "a": {
                                                                                            "docs": {},
                                                                                            "c": {
                                                                                              "docs": {},
                                                                                              "k": {
                                                                                                "docs": {},
                                                                                                "g": {
                                                                                                  "docs": {},
                                                                                                  "r": {
                                                                                                    "docs": {},
                                                                                                    "o": {
                                                                                                      "docs": {},
                                                                                                      "u": {
                                                                                                        "docs": {},
                                                                                                        "n": {
                                                                                                          "docs": {},
                                                                                                          "d": {
                                                                                                            "docs": {
                                                                                                              "module-Thurston-Thurston.html#buildShaderDataBackground": {
                                                                                                                "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                                                                                                                "tf": 1150
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        },
                                                                                        "i": {
                                                                                          "docs": {},
                                                                                          "t": {
                                                                                            "docs": {},
                                                                                            "e": {
                                                                                              "docs": {},
                                                                                              "m": {
                                                                                                "docs": {
                                                                                                  "module-Thurston-Thurston.html#buildShaderDataItems": {
                                                                                                    "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                                                                                                    "tf": 1150
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                },
                                                                                "f": {
                                                                                  "docs": {},
                                                                                  "r": {
                                                                                    "docs": {},
                                                                                    "a": {
                                                                                      "docs": {},
                                                                                      "g": {
                                                                                        "docs": {
                                                                                          "module-Thurston-Thurston.html#buildShaderFragment": {
                                                                                            "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                                                                            "tf": 1150
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          },
                                                          "o": {
                                                            "docs": {},
                                                            "n": {
                                                              "docs": {},
                                                              "w": {
                                                                "docs": {},
                                                                "i": {
                                                                  "docs": {},
                                                                  "n": {
                                                                    "docs": {},
                                                                    "d": {
                                                                      "docs": {},
                                                                      "o": {
                                                                        "docs": {},
                                                                        "w": {
                                                                          "docs": {},
                                                                          "r": {
                                                                            "docs": {},
                                                                            "e": {
                                                                              "docs": {},
                                                                              "s": {
                                                                                "docs": {
                                                                                  "module-Thurston-Thurston.html#onWindowResize": {
                                                                                    "ref": "module-Thurston-Thurston.html#onWindowResize",
                                                                                    "tf": 1150
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "e": {
                "docs": {
                  "module-Thurston-Thurston.html#getEyePositions": {
                    "ref": "module-Thurston-Thurston.html#getEyePositions",
                    "tf": 3.3333333333333335
                  }
                }
              }
            },
            "v": {
              "docs": {},
              "e": {
                "docs": {
                  "Teleport.html": {
                    "ref": "Teleport.html",
                    "tf": 1.9230769230769231
                  },
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.49504950495049505
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  },
                  "VRControls.html": {
                    "ref": "VRControls.html",
                    "tf": 2.272727272727273
                  },
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  },
                  "module-Thurston-Thurston.html#chaseCamera": {
                    "ref": "module-Thurston-Thurston.html#chaseCamera",
                    "tf": 4
                  }
                },
                "m": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "KeyboardControls.html#updateMovementVector": {
                            "ref": "KeyboardControls.html#updateMovementVector",
                            "tf": 16.666666666666664
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "e": {
                "docs": {
                  "module-Thurston-Thurston.html#run": {
                    "ref": "module-Thurston-Thurston.html#run",
                    "tf": 5
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "l": {
              "docs": {},
              "t": {
                "docs": {},
                "i": {
                  "docs": {},
                  "p": {
                    "docs": {},
                    "l": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "Isometry.html#multiply": {
                            "ref": "Isometry.html#multiply",
                            "tf": 681.25
                          },
                          "Isometry.html#premultiply": {
                            "ref": "Isometry.html#premultiply",
                            "tf": 6.25
                          },
                          "Position.html#multiply": {
                            "ref": "Position.html#multiply",
                            "tf": 686.9047619047619
                          },
                          "Position.html#premultiply": {
                            "ref": "Position.html#premultiply",
                            "tf": 3.571428571428571
                          },
                          "Position.html#flow": {
                            "ref": "Position.html#flow",
                            "tf": 0.49504950495049505
                          },
                          "Vector.html#applyMatrix4": {
                            "ref": "Vector.html#applyMatrix4",
                            "tf": 1.8518518518518516
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "k": {
              "docs": {},
              "e": {
                "docs": {
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 2.380952380952381
                  }
                },
                "t": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "n": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "l": {
                            "docs": {
                              "Isometry.html#makeTranslation": {
                                "ref": "Isometry.html#makeTranslation",
                                "tf": 675
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "i": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "v": {
                      "docs": {},
                      "t": {
                        "docs": {},
                        "r": {
                          "docs": {},
                          "a": {
                            "docs": {},
                            "n": {
                              "docs": {},
                              "s": {
                                "docs": {},
                                "l": {
                                  "docs": {
                                    "Isometry.html#makeInvTranslation": {
                                      "ref": "Isometry.html#makeInvTranslation",
                                      "tf": 675
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "n": {
                "docs": {},
                "l": {
                  "docs": {},
                  "i": {
                    "docs": {
                      "Isometry.html#equals": {
                        "ref": "Isometry.html#equals",
                        "tf": 6.25
                      },
                      "Point.html#equals": {
                        "ref": "Point.html#equals",
                        "tf": 6.25
                      },
                      "RelPosition.html#equals": {
                        "ref": "RelPosition.html#equals",
                        "tf": 6.25
                      }
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "i": {
                "docs": {},
                "f": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "l": {
                      "docs": {},
                      "d": {
                        "docs": {},
                        "/": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "r": {
                              "docs": {},
                              "b": {
                                "docs": {},
                                "i": {
                                  "docs": {},
                                  "f": {
                                    "docs": {},
                                    "o": {
                                      "docs": {},
                                      "l": {
                                        "docs": {},
                                        "d": {
                                          "docs": {
                                            "ObjectThurston.html#local": {
                                              "ref": "ObjectThurston.html#local",
                                              "tf": 7.142857142857142
                                            },
                                            "Light.html#local": {
                                              "ref": "Light.html#local",
                                              "tf": 7.142857142857142
                                            },
                                            "Solid.html#local": {
                                              "ref": "Solid.html#local",
                                              "tf": 7.142857142857142
                                            },
                                            "module-Thurston-Thurston.html#subgroup": {
                                              "ref": "module-Thurston-Thurston.html#subgroup",
                                              "tf": 10
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "u": {
                "docs": {},
                "a": {
                  "docs": {},
                  "l": {
                    "docs": {
                      "module-Thurston-Thurston.html#chaseCamera": {
                        "ref": "module-Thurston-Thurston.html#chaseCamera",
                        "tf": 2
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "r": {
                "docs": {},
                "i": {
                  "docs": {},
                  "x": {
                    "4": {
                      "docs": {
                        "Position.html#facing": {
                          "ref": "Position.html#facing",
                          "tf": 50
                        },
                        "KeyboardControls.html#update": {
                          "ref": "KeyboardControls.html#update",
                          "tf": 0.4629629629629629
                        }
                      }
                    },
                    "docs": {
                      "Position.html#applyFacing": {
                        "ref": "Position.html#applyFacing",
                        "tf": 33.33333333333333
                      },
                      "RelPosition.html#applyFacing": {
                        "ref": "RelPosition.html#applyFacing",
                        "tf": 33.33333333333333
                      }
                    }
                  },
                  "c": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.7092198581560284
                      }
                    }
                  }
                }
              },
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "i": {
                    "docs": {
                      "Solid.html#material": {
                        "ref": "Solid.html#material",
                        "tf": 775
                      },
                      "Material.html": {
                        "ref": "Material.html",
                        "tf": 1916.6666666666667
                      },
                      "Material.html#color": {
                        "ref": "Material.html#color",
                        "tf": 25
                      },
                      "Material.html#toGLSL": {
                        "ref": "Material.html#toGLSL",
                        "tf": 4.545454545454546
                      }
                    },
                    "a": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "#": {
                          "docs": {},
                          "c": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "l": {
                                "docs": {},
                                "o": {
                                  "docs": {},
                                  "r": {
                                    "docs": {
                                      "Material.html#color": {
                                        "ref": "Material.html#color",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "a": {
                            "docs": {},
                            "m": {
                              "docs": {},
                              "b": {
                                "docs": {},
                                "i": {
                                  "docs": {
                                    "Material.html#ambient": {
                                      "ref": "Material.html#ambient",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "d": {
                            "docs": {},
                            "i": {
                              "docs": {},
                              "f": {
                                "docs": {},
                                "f": {
                                  "docs": {},
                                  "u": {
                                    "docs": {},
                                    "s": {
                                      "docs": {
                                        "Material.html#diffuse": {
                                          "ref": "Material.html#diffuse",
                                          "tf": 1150
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "s": {
                            "docs": {},
                            "p": {
                              "docs": {},
                              "e": {
                                "docs": {},
                                "c": {
                                  "docs": {},
                                  "u": {
                                    "docs": {},
                                    "l": {
                                      "docs": {},
                                      "a": {
                                        "docs": {},
                                        "r": {
                                          "docs": {
                                            "Material.html#specular": {
                                              "ref": "Material.html#specular",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            "h": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "n": {
                                  "docs": {},
                                  "i": {
                                    "docs": {
                                      "Material.html#shininess": {
                                        "ref": "Material.html#shininess",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "t": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "g": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "s": {
                                    "docs": {},
                                    "l": {
                                      "docs": {
                                        "Material.html#toGLSL": {
                                          "ref": "Material.html#toGLSL",
                                          "tf": 1150
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "t": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Subgroup.html#teleports": {
                        "ref": "Subgroup.html#teleports",
                        "tf": 5.555555555555555
                      }
                    }
                  }
                }
              }
            },
            "x": {
              "docs": {},
              "d": {
                "docs": {},
                "i": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Light.html#maxDirs": {
                        "ref": "Light.html#maxDirs",
                        "tf": 750
                      }
                    }
                  }
                }
              },
              "i": {
                "docs": {},
                "m": {
                  "docs": {
                    "Light.html#maxDirs": {
                      "ref": "Light.html#maxDirs",
                      "tf": 8.333333333333332
                    },
                    "module-Thurston-Thurston.html#_maxLightDirs": {
                      "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                      "tf": 6.25
                    },
                    "module-Thurston-Thurston.html#maxLightDirs": {
                      "ref": "module-Thurston-Thurston.html#maxLightDirs",
                      "tf": 12.5
                    }
                  }
                }
              },
              "l": {
                "docs": {},
                "i": {
                  "docs": {},
                  "g": {
                    "docs": {},
                    "h": {
                      "docs": {},
                      "t": {
                        "docs": {},
                        "d": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "r": {
                              "docs": {
                                "module-Thurston-Thurston.html#maxLightDirs": {
                                  "ref": "module-Thurston-Thurston.html#maxLightDirs",
                                  "tf": 700
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "m": {
              "docs": {},
              "b": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "ObjectThurston.html#uuid": {
                        "ref": "ObjectThurston.html#uuid",
                        "tf": 110
                      },
                      "ObjectThurston.html#glsl": {
                        "ref": "ObjectThurston.html#glsl",
                        "tf": 110
                      },
                      "ObjectThurston.html#position": {
                        "ref": "ObjectThurston.html#position",
                        "tf": 110
                      },
                      "ObjectThurston.html#global": {
                        "ref": "ObjectThurston.html#global",
                        "tf": 110
                      },
                      "ObjectThurston.html#local": {
                        "ref": "ObjectThurston.html#local",
                        "tf": 110
                      },
                      "ObjectThurston.html#shaderSource": {
                        "ref": "ObjectThurston.html#shaderSource",
                        "tf": 110
                      },
                      "ObjectThurston.html#className": {
                        "ref": "ObjectThurston.html#className",
                        "tf": 110
                      },
                      "ObjectThurston.html#name": {
                        "ref": "ObjectThurston.html#name",
                        "tf": 110
                      },
                      "ObjectThurston.html#point": {
                        "ref": "ObjectThurston.html#point",
                        "tf": 110
                      },
                      "Teleport.html#test": {
                        "ref": "Teleport.html#test",
                        "tf": 110
                      },
                      "Teleport.html#isom": {
                        "ref": "Teleport.html#isom",
                        "tf": 110
                      },
                      "Teleport.html#inv": {
                        "ref": "Teleport.html#inv",
                        "tf": 110
                      },
                      "Teleport.html#uuid": {
                        "ref": "Teleport.html#uuid",
                        "tf": 110
                      },
                      "Teleport.html#name": {
                        "ref": "Teleport.html#name",
                        "tf": 110
                      },
                      "Teleport.html#glsl": {
                        "ref": "Teleport.html#glsl",
                        "tf": 110
                      },
                      "Position.html#boost": {
                        "ref": "Position.html#boost",
                        "tf": 110
                      },
                      "Position.html#facing": {
                        "ref": "Position.html#facing",
                        "tf": 110
                      },
                      "Position.html#point": {
                        "ref": "Position.html#point",
                        "tf": 110
                      },
                      "Light.html#uuid": {
                        "ref": "Light.html#uuid",
                        "tf": 110
                      },
                      "Light.html#glsl": {
                        "ref": "Light.html#glsl",
                        "tf": 110
                      },
                      "Light.html#position": {
                        "ref": "Light.html#position",
                        "tf": 110
                      },
                      "Light.html#global": {
                        "ref": "Light.html#global",
                        "tf": 110
                      },
                      "Light.html#local": {
                        "ref": "Light.html#local",
                        "tf": 110
                      },
                      "Light.html#shaderSource": {
                        "ref": "Light.html#shaderSource",
                        "tf": 110
                      },
                      "Light.html#className": {
                        "ref": "Light.html#className",
                        "tf": 110
                      },
                      "Light.html#color": {
                        "ref": "Light.html#color",
                        "tf": 110
                      },
                      "Light.html#maxDirs": {
                        "ref": "Light.html#maxDirs",
                        "tf": 110
                      },
                      "Light.html#name": {
                        "ref": "Light.html#name",
                        "tf": 110
                      },
                      "Light.html#point": {
                        "ref": "Light.html#point",
                        "tf": 110
                      },
                      "Solid.html#uuid": {
                        "ref": "Solid.html#uuid",
                        "tf": 110
                      },
                      "Solid.html#glsl": {
                        "ref": "Solid.html#glsl",
                        "tf": 110
                      },
                      "Solid.html#position": {
                        "ref": "Solid.html#position",
                        "tf": 110
                      },
                      "Solid.html#global": {
                        "ref": "Solid.html#global",
                        "tf": 110
                      },
                      "Solid.html#local": {
                        "ref": "Solid.html#local",
                        "tf": 110
                      },
                      "Solid.html#material": {
                        "ref": "Solid.html#material",
                        "tf": 110
                      },
                      "Solid.html#shaderSource": {
                        "ref": "Solid.html#shaderSource",
                        "tf": 110
                      },
                      "Solid.html#className": {
                        "ref": "Solid.html#className",
                        "tf": 110
                      },
                      "Solid.html#name": {
                        "ref": "Solid.html#name",
                        "tf": 110
                      },
                      "Solid.html#point": {
                        "ref": "Solid.html#point",
                        "tf": 110
                      },
                      "RelPosition.html#local": {
                        "ref": "RelPosition.html#local",
                        "tf": 110
                      },
                      "RelPosition.html#cellBoost": {
                        "ref": "RelPosition.html#cellBoost",
                        "tf": 110
                      },
                      "RelPosition.html#invCellBoost": {
                        "ref": "RelPosition.html#invCellBoost",
                        "tf": 110
                      },
                      "RelPosition.html#sbgp": {
                        "ref": "RelPosition.html#sbgp",
                        "tf": 110
                      },
                      "RelPosition.html#localPoint": {
                        "ref": "RelPosition.html#localPoint",
                        "tf": 110
                      },
                      "RelPosition.html#point": {
                        "ref": "RelPosition.html#point",
                        "tf": 110
                      },
                      "Material.html#color": {
                        "ref": "Material.html#color",
                        "tf": 110
                      },
                      "Material.html#ambient": {
                        "ref": "Material.html#ambient",
                        "tf": 110
                      },
                      "Material.html#diffuse": {
                        "ref": "Material.html#diffuse",
                        "tf": 110
                      },
                      "Material.html#specular": {
                        "ref": "Material.html#specular",
                        "tf": 110
                      },
                      "Material.html#shininess": {
                        "ref": "Material.html#shininess",
                        "tf": 110
                      },
                      "Subgroup.html#teleports": {
                        "ref": "Subgroup.html#teleports",
                        "tf": 110
                      },
                      "Subgroup.html#shaderSource": {
                        "ref": "Subgroup.html#shaderSource",
                        "tf": 110
                      },
                      "VRControls.html#update": {
                        "ref": "VRControls.html#update",
                        "tf": 110
                      },
                      "KeyboardControls.html#keyboard": {
                        "ref": "KeyboardControls.html#keyboard",
                        "tf": 110
                      },
                      "KeyboardControls.html#infos": {
                        "ref": "KeyboardControls.html#infos",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#geom": {
                        "ref": "module-Thurston-Thurston.html#geom",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#subgroup": {
                        "ref": "module-Thurston-Thurston.html#subgroup",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#params": {
                        "ref": "module-Thurston-Thurston.html#params",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_renderer": {
                        "ref": "module-Thurston-Thurston.html#_renderer",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_camera": {
                        "ref": "module-Thurston-Thurston.html#_camera",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_scene": {
                        "ref": "module-Thurston-Thurston.html#_scene",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_solids": {
                        "ref": "module-Thurston-Thurston.html#_solids",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_lights": {
                        "ref": "module-Thurston-Thurston.html#_lights",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_maxLightDirs": {
                        "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_keyboardControls": {
                        "ref": "module-Thurston-Thurston.html#_keyboardControls",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#_clock": {
                        "ref": "module-Thurston-Thurston.html#_clock",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#gui": {
                        "ref": "module-Thurston-Thurston.html#gui",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#stats": {
                        "ref": "module-Thurston-Thurston.html#stats",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#maxLightDirs": {
                        "ref": "module-Thurston-Thurston.html#maxLightDirs",
                        "tf": 110
                      },
                      "module-Thurston-Thurston.html#chaseCamera": {
                        "ref": "module-Thurston-Thurston.html#chaseCamera",
                        "tf": 110
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "h": {
                "docs": {},
                "o": {
                  "docs": {},
                  "d": {
                    "docs": {
                      "Vector.html#toLog": {
                        "ref": "Vector.html#toLog",
                        "tf": 4.545454545454546
                      },
                      "Vector.html#applyFacing": {
                        "ref": "Vector.html#applyFacing",
                        "tf": 2.631578947368421
                      },
                      "Vector.html#toGLSL": {
                        "ref": "Vector.html#toGLSL",
                        "tf": 4.166666666666666
                      },
                      "RelPosition.html#flow": {
                        "ref": "RelPosition.html#flow",
                        "tf": 2.380952380952381
                      }
                    }
                  }
                }
              }
            },
            "a": {
              "docs": {},
              "s": {
                "docs": {},
                "u": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "module-Thurston-Thurston.html#_clock": {
                        "ref": "module-Thurston-Thurston.html#_clock",
                        "tf": 7.142857142857142
                      }
                    }
                  }
                }
              }
            }
          },
          "'": {
            "docs": {},
            "m": {
              "docs": {
                "Position.html#flow": {
                  "ref": "Position.html#flow",
                  "tf": 0.49504950495049505
                }
              }
            }
          }
        },
        "a": {
          "docs": {},
          "r": {
            "docs": {},
            "g": {
              "docs": {},
              "u": {
                "docs": {},
                "m": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Isometry.html#build": {
                            "ref": "Isometry.html#build",
                            "tf": 8.333333333333332
                          },
                          "Point.html#build": {
                            "ref": "Point.html#build",
                            "tf": 7.142857142857142
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "a": {
                "docs": {},
                "y": {
                  "docs": {},
                  ".": {
                    "docs": {},
                    "&": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          ";": {
                            "docs": {},
                            "t": {
                              "docs": {},
                              "e": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "e": {
                                    "docs": {},
                                    "p": {
                                      "docs": {},
                                      "o": {
                                        "docs": {},
                                        "r": {
                                          "docs": {},
                                          "t": {
                                            "docs": {},
                                            "&": {
                                              "docs": {},
                                              "g": {
                                                "docs": {},
                                                "t": {
                                                  "docs": {
                                                    "Subgroup.html#teleports": {
                                                      "ref": "Subgroup.html#teleports",
                                                      "tf": 50
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            "s": {
                              "docs": {},
                              "o": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "i": {
                                    "docs": {},
                                    "d": {
                                      "docs": {},
                                      "&": {
                                        "docs": {},
                                        "g": {
                                          "docs": {},
                                          "t": {
                                            "docs": {
                                              "module-Thurston-Thurston.html#_solids": {
                                                "ref": "module-Thurston-Thurston.html#_solids",
                                                "tf": 33.33333333333333
                                              },
                                              "module-Thurston-Thurston.html#buildShaderDataItems": {
                                                "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                                                "tf": 16.666666666666664
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            "l": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "g": {
                                  "docs": {},
                                  "h": {
                                    "docs": {},
                                    "t": {
                                      "docs": {},
                                      "&": {
                                        "docs": {},
                                        "g": {
                                          "docs": {},
                                          "t": {
                                            "docs": {
                                              "module-Thurston-Thurston.html#_lights": {
                                                "ref": "module-Thurston-Thurston.html#_lights",
                                                "tf": 33.33333333333333
                                              }
                                            },
                                            ";": {
                                              "docs": {},
                                              "}": {
                                                "docs": {},
                                                "&": {
                                                  "docs": {},
                                                  "g": {
                                                    "docs": {},
                                                    "t": {
                                                      "docs": {
                                                        "module-Thurston-Thurston.html#buildShaderDataItems": {
                                                          "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                                                          "tf": 16.666666666666664
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            "o": {
                              "docs": {},
                              "b": {
                                "docs": {},
                                "j": {
                                  "docs": {},
                                  "e": {
                                    "docs": {},
                                    "c": {
                                      "docs": {},
                                      "t": {
                                        "docs": {},
                                        "&": {
                                          "docs": {},
                                          "g": {
                                            "docs": {},
                                            "t": {
                                              "docs": {
                                                "module-Thurston-Thurston.html#buildShaderDataConstants": {
                                                  "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                                                  "tf": 50
                                                },
                                                "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                                                  "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                                                  "tf": 50
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "p": {
            "docs": {},
            "p": {
              "docs": {},
              "l": {
                "docs": {},
                "y": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "s": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "m": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "t": {
                              "docs": {},
                              "r": {
                                "docs": {},
                                "i": {
                                  "docs": {
                                    "Point.html#applyIsometry": {
                                      "ref": "Point.html#applyIsometry",
                                      "tf": 675
                                    },
                                    "Position.html#applyIsometry": {
                                      "ref": "Position.html#applyIsometry",
                                      "tf": 683.3333333333334
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  "f": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "c": {
                        "docs": {
                          "Position.html#applyFacing": {
                            "ref": "Position.html#applyFacing",
                            "tf": 683.3333333333334
                          },
                          "Vector.html#applyFacing": {
                            "ref": "Vector.html#applyFacing",
                            "tf": 683.3333333333334
                          },
                          "RelPosition.html#applyFacing": {
                            "ref": "RelPosition.html#applyFacing",
                            "tf": 683.3333333333334
                          }
                        }
                      }
                    }
                  },
                  "m": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "t": {
                        "docs": {},
                        "r": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "x": {
                              "4": {
                                "docs": {
                                  "Vector.html#applyMatrix4": {
                                    "ref": "Vector.html#applyMatrix4",
                                    "tf": 685.1851851851852
                                  }
                                }
                              },
                              "docs": {}
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "i": {
                  "docs": {
                    "Teleport.html#isom": {
                      "ref": "Teleport.html#isom",
                      "tf": 16.666666666666664
                    },
                    "RelPosition.html#teleport": {
                      "ref": "RelPosition.html#teleport",
                      "tf": 5.555555555555555
                    }
                  }
                }
              },
              "e": {
                "docs": {},
                "n": {
                  "docs": {},
                  "d": {
                    "docs": {},
                    "t": {
                      "docs": {},
                      "i": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          "l": {
                            "docs": {
                              "module-Thurston-Thurston.html#appendTitle": {
                                "ref": "module-Thurston-Thurston.html#appendTitle",
                                "tf": 750
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "s": {
            "docs": {},
            "s": {
              "docs": {},
              "i": {
                "docs": {},
                "g": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "ObjectThurston.html#uuid": {
                        "ref": "ObjectThurston.html#uuid",
                        "tf": 6.25
                      },
                      "Teleport.html#uuid": {
                        "ref": "Teleport.html#uuid",
                        "tf": 6.25
                      },
                      "Teleport.html#name": {
                        "ref": "Teleport.html#name",
                        "tf": 4.545454545454546
                      },
                      "Light.html#uuid": {
                        "ref": "Light.html#uuid",
                        "tf": 6.25
                      },
                      "Solid.html#uuid": {
                        "ref": "Solid.html#uuid",
                        "tf": 6.25
                      }
                    }
                  }
                }
              },
              "u": {
                "docs": {},
                "m": {
                  "docs": {
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 0.49504950495049505
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.9259259259259258
                    }
                  }
                }
              },
              "o": {
                "docs": {},
                "c": {
                  "docs": {},
                  "i": {
                    "docs": {
                      "Subgroup.html#glslBuildData": {
                        "ref": "Subgroup.html#glslBuildData",
                        "tf": 4.545454545454546
                      }
                    }
                  }
                }
              }
            },
            "y": {
              "docs": {},
              "n": {
                "docs": {},
                "c": {
                  "docs": {
                    "module-Thurston-Thurston.html#initHorizon": {
                      "ref": "module-Thurston-Thurston.html#initHorizon",
                      "tf": 5.555555555555555
                    },
                    "module-Thurston-Thurston.html#run": {
                      "ref": "module-Thurston-Thurston.html#run",
                      "tf": 5
                    }
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "t": {
              "docs": {},
              "o": {
                "docs": {},
                "m": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "ObjectThurston.html#uuid": {
                          "ref": "ObjectThurston.html#uuid",
                          "tf": 6.25
                        },
                        "Teleport.html#uuid": {
                          "ref": "Teleport.html#uuid",
                          "tf": 6.25
                        },
                        "Teleport.html#name": {
                          "ref": "Teleport.html#name",
                          "tf": 4.545454545454546
                        },
                        "Teleport.html#glsl": {
                          "ref": "Teleport.html#glsl",
                          "tf": 6.25
                        },
                        "Light.html#uuid": {
                          "ref": "Light.html#uuid",
                          "tf": 6.25
                        },
                        "Solid.html#uuid": {
                          "ref": "Solid.html#uuid",
                          "tf": 6.25
                        },
                        "module-Thurston-Thurston.html#params": {
                          "ref": "module-Thurston-Thurston.html#params",
                          "tf": 3.571428571428571
                        },
                        "module-Thurston-Thurston.html#_maxLightDirs": {
                          "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                          "tf": 6.25
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "c": {
            "docs": {},
            "t": {
              "docs": {},
              "i": {
                "docs": {},
                "o": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "Position.html#applyIsometry": {
                        "ref": "Position.html#applyIsometry",
                        "tf": 4.545454545454546
                      },
                      "Position.html#applyFacing": {
                        "ref": "Position.html#applyFacing",
                        "tf": 6.25
                      },
                      "RelPosition.html#applyFacing": {
                        "ref": "RelPosition.html#applyFacing",
                        "tf": 6.25
                      },
                      "module-Thurston-Thurston.html#onWindowResize": {
                        "ref": "module-Thurston-Thurston.html#onWindowResize",
                        "tf": 16.666666666666664
                      }
                    }
                  }
                }
              },
              "u": {
                "docs": {},
                "a": {
                  "docs": {},
                  "l": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              }
            },
            "c": {
              "docs": {},
              "o": {
                "docs": {},
                "u": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "RelPosition.html#point": {
                          "ref": "RelPosition.html#point",
                          "tf": 8.333333333333332
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "l": {
            "docs": {},
            "g": {
              "docs": {},
              "e": {
                "docs": {},
                "b": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "a": {
                      "docs": {
                        "Vector.html": {
                          "ref": "Vector.html",
                          "tf": 3.8461538461538463
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "v": {
            "docs": {},
            "a": {
              "docs": {},
              "i": {
                "docs": {},
                "l": {
                  "docs": {
                    "Vector.html": {
                      "ref": "Vector.html",
                      "tf": 3.8461538461538463
                    }
                  }
                }
              }
            }
          },
          "d": {
            "docs": {
              "module-Thurston-Thurston.html#addItem": {
                "ref": "module-Thurston-Thurston.html#addItem",
                "tf": 16.666666666666664
              },
              "module-Thurston-Thurston.html#addItems": {
                "ref": "module-Thurston-Thurston.html#addItems",
                "tf": 12.5
              }
            },
            "d": {
              "docs": {
                "Vector.html#toLog": {
                  "ref": "Vector.html#toLog",
                  "tf": 4.545454545454546
                },
                "Vector.html#toGLSL": {
                  "ref": "Vector.html#toGLSL",
                  "tf": 4.166666666666666
                },
                "module-Thurston-Thurston.html#appendTitle": {
                  "ref": "module-Thurston-Thurston.html#appendTitle",
                  "tf": 10
                }
              },
              "i": {
                "docs": {},
                "t": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "m": {
                      "docs": {
                        "module-Thurston-Thurston.html#addItem": {
                          "ref": "module-Thurston-Thurston.html#addItem",
                          "tf": 700
                        },
                        "module-Thurston-Thurston.html#addItems": {
                          "ref": "module-Thurston-Thurston.html#addItems",
                          "tf": 700
                        }
                      }
                    }
                  }
                }
              },
              "e": {
                "docs": {},
                "v": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {},
                        "l": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "t": {
                                "docs": {},
                                "e": {
                                  "docs": {},
                                  "n": {
                                    "docs": {
                                      "module-Thurston-Thurston.html#addEventListeners": {
                                        "ref": "module-Thurston-Thurston.html#addEventListeners",
                                        "tf": 750
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "v": {
              "docs": {},
              "a": {
                "docs": {},
                "n": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "g": {
                        "docs": {
                          "Subgroup.html": {
                            "ref": "Subgroup.html",
                            "tf": 0.3546099290780142
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "m": {
            "docs": {},
            "b": {
              "docs": {},
              "i": {
                "docs": {},
                "e": {
                  "docs": {},
                  "n": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Material.html#ambient": {
                          "ref": "Material.html#ambient",
                          "tf": 716.6666666666666
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "b": {
            "docs": {},
            "e": {
              "docs": {},
              "l": {
                "docs": {},
                "i": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "Subgroup.html": {
                          "ref": "Subgroup.html",
                          "tf": 0.3546099290780142
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "t": {
            "docs": {},
            "t": {
              "docs": {},
              "a": {
                "docs": {},
                "c": {
                  "docs": {},
                  "h": {
                    "docs": {
                      "KeyboardControls.html#update": {
                        "ref": "KeyboardControls.html#update",
                        "tf": 0.4629629629629629
                      }
                    }
                  }
                }
              }
            }
          },
          "n": {
            "docs": {},
            "i": {
              "docs": {},
              "m": {
                "docs": {
                  "module-Thurston-Thurston.html#_clock": {
                    "ref": "module-Thurston-Thurston.html#_clock",
                    "tf": 7.142857142857142
                  },
                  "module-Thurston-Thurston.html#animate": {
                    "ref": "module-Thurston-Thurston.html#animate",
                    "tf": 775
                  },
                  "module-Thurston-Thurston.html#run": {
                    "ref": "module-Thurston-Thurston.html#run",
                    "tf": 5
                  }
                }
              }
            }
          }
        },
        "b": {
          "docs": {},
          "u": {
            "docs": {},
            "i": {
              "docs": {},
              "l": {
                "docs": {},
                "d": {
                  "docs": {
                    "Isometry.html#build": {
                      "ref": "Isometry.html#build",
                      "tf": 700
                    },
                    "Isometry.html#toGLSL": {
                      "ref": "Isometry.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Point.html#build": {
                      "ref": "Point.html#build",
                      "tf": 700
                    },
                    "Point.html#toGLSL": {
                      "ref": "Point.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Teleport.html#name": {
                      "ref": "Teleport.html#name",
                      "tf": 4.545454545454546
                    },
                    "Position.html#toGLSL": {
                      "ref": "Position.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Light.html#glslBuildData": {
                      "ref": "Light.html#glslBuildData",
                      "tf": 5
                    },
                    "Light.html#glslBuildDataDefault": {
                      "ref": "Light.html#glslBuildDataDefault",
                      "tf": 6.25
                    },
                    "Solid.html#glslBuildData": {
                      "ref": "Solid.html#glslBuildData",
                      "tf": 5
                    },
                    "Solid.html#glslBuildDataDefault": {
                      "ref": "Solid.html#glslBuildDataDefault",
                      "tf": 6.25
                    },
                    "RelPosition.html#toGLSL": {
                      "ref": "RelPosition.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Material.html#toGLSL": {
                      "ref": "Material.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "Subgroup.html#glslBuildData": {
                      "ref": "Subgroup.html#glslBuildData",
                      "tf": 4.545454545454546
                    },
                    "module-Thurston-Thurston.html#buildShaderVertex": {
                      "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                      "tf": 10
                    },
                    "module-Thurston-Thurston.html#buildShaderFragment": {
                      "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                      "tf": 4.166666666666666
                    }
                  },
                  "s": {
                    "docs": {},
                    "h": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "d": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "r": {
                              "docs": {},
                              "v": {
                                "docs": {},
                                "e": {
                                  "docs": {},
                                  "r": {
                                    "docs": {},
                                    "t": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "x": {
                                          "docs": {
                                            "module-Thurston-Thurston.html#buildShaderVertex": {
                                              "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                                              "tf": 683.3333333333334
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "d": {
                                "docs": {},
                                "a": {
                                  "docs": {},
                                  "t": {
                                    "docs": {},
                                    "a": {
                                      "docs": {},
                                      "c": {
                                        "docs": {},
                                        "o": {
                                          "docs": {},
                                          "n": {
                                            "docs": {},
                                            "s": {
                                              "docs": {},
                                              "t": {
                                                "docs": {
                                                  "module-Thurston-Thurston.html#buildShaderDataConstants": {
                                                    "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                                                    "tf": 700
                                                  },
                                                  "module-Thurston-Thurston.html#buildShaderFragment": {
                                                    "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                                    "tf": 2.083333333333333
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "u": {
                                        "docs": {},
                                        "n": {
                                          "docs": {},
                                          "i": {
                                            "docs": {},
                                            "f": {
                                              "docs": {},
                                              "o": {
                                                "docs": {},
                                                "r": {
                                                  "docs": {},
                                                  "m": {
                                                    "docs": {
                                                      "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                                                        "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                                                        "tf": 700
                                                      },
                                                      "module-Thurston-Thurston.html#buildShaderFragment": {
                                                        "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                                        "tf": 2.083333333333333
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "b": {
                                        "docs": {},
                                        "a": {
                                          "docs": {},
                                          "c": {
                                            "docs": {},
                                            "k": {
                                              "docs": {},
                                              "g": {
                                                "docs": {},
                                                "r": {
                                                  "docs": {},
                                                  "o": {
                                                    "docs": {},
                                                    "u": {
                                                      "docs": {},
                                                      "n": {
                                                        "docs": {},
                                                        "d": {
                                                          "docs": {
                                                            "module-Thurston-Thurston.html#buildShaderDataBackground": {
                                                              "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                                                              "tf": 683.3333333333334
                                                            },
                                                            "module-Thurston-Thurston.html#buildShaderFragment": {
                                                              "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                                              "tf": 2.083333333333333
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "i": {
                                        "docs": {},
                                        "t": {
                                          "docs": {},
                                          "e": {
                                            "docs": {},
                                            "m": {
                                              "docs": {
                                                "module-Thurston-Thurston.html#buildShaderDataItems": {
                                                  "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                                                  "tf": 666.6666666666666
                                                },
                                                "module-Thurston-Thurston.html#buildShaderFragment": {
                                                  "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                                  "tf": 2.083333333333333
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              "f": {
                                "docs": {},
                                "r": {
                                  "docs": {},
                                  "a": {
                                    "docs": {},
                                    "g": {
                                      "docs": {
                                        "module-Thurston-Thurston.html#buildShaderFragment": {
                                          "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                          "tf": 683.3333333333334
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "t": {
                  "docs": {
                    "Solid.html": {
                      "ref": "Solid.html",
                      "tf": 2.631578947368421
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "t": {
                "docs": {},
                "o": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "VRControls.html": {
                        "ref": "VRControls.html",
                        "tf": 4.545454545454546
                      }
                    }
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "o": {
              "docs": {
                "RelPosition.html#teleport": {
                  "ref": "RelPosition.html#teleport",
                  "tf": 5.555555555555555
                }
              },
              "l": {
                "docs": {},
                "e": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "Isometry.html#equals": {
                          "ref": "Isometry.html#equals",
                          "tf": 25
                        },
                        "Point.html#equals": {
                          "ref": "Point.html#equals",
                          "tf": 25
                        },
                        "ObjectThurston.html#global": {
                          "ref": "ObjectThurston.html#global",
                          "tf": 50
                        },
                        "ObjectThurston.html#local": {
                          "ref": "ObjectThurston.html#local",
                          "tf": 50
                        },
                        "ObjectThurston.html#isLight": {
                          "ref": "ObjectThurston.html#isLight",
                          "tf": 50
                        },
                        "ObjectThurston.html#isSolid": {
                          "ref": "ObjectThurston.html#isSolid",
                          "tf": 50
                        },
                        "Teleport.html#test": {
                          "ref": "Teleport.html#test",
                          "tf": 2.941176470588235
                        },
                        "Position.html#equals": {
                          "ref": "Position.html#equals",
                          "tf": 33.33333333333333
                        },
                        "Light.html#global": {
                          "ref": "Light.html#global",
                          "tf": 50
                        },
                        "Light.html#local": {
                          "ref": "Light.html#local",
                          "tf": 50
                        },
                        "Light.html#isLight": {
                          "ref": "Light.html#isLight",
                          "tf": 50
                        },
                        "Light.html#isSolid": {
                          "ref": "Light.html#isSolid",
                          "tf": 50
                        },
                        "Solid.html#global": {
                          "ref": "Solid.html#global",
                          "tf": 50
                        },
                        "Solid.html#local": {
                          "ref": "Solid.html#local",
                          "tf": 50
                        },
                        "Solid.html#isLight": {
                          "ref": "Solid.html#isLight",
                          "tf": 50
                        },
                        "Solid.html#isSolid": {
                          "ref": "Solid.html#isSolid",
                          "tf": 50
                        },
                        "RelPosition.html#equals": {
                          "ref": "RelPosition.html#equals",
                          "tf": 33.33333333333333
                        }
                      }
                    }
                  }
                }
              },
              "s": {
                "docs": {},
                "t": {
                  "docs": {
                    "Position.html#boost": {
                      "ref": "Position.html#boost",
                      "tf": 700
                    },
                    "Position.html#setBoost": {
                      "ref": "Position.html#setBoost",
                      "tf": 12.5
                    },
                    "Position.html#reduceErrorBoost": {
                      "ref": "Position.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#cellBoost": {
                      "ref": "RelPosition.html#cellBoost",
                      "tf": 10
                    },
                    "RelPosition.html#localPoint": {
                      "ref": "RelPosition.html#localPoint",
                      "tf": 7.142857142857142
                    },
                    "RelPosition.html#point": {
                      "ref": "RelPosition.html#point",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorBoost": {
                      "ref": "RelPosition.html#reduceErrorBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#reduceErrorCellBoost": {
                      "ref": "RelPosition.html#reduceErrorCellBoost",
                      "tf": 8.333333333333332
                    },
                    "RelPosition.html#flow": {
                      "ref": "RelPosition.html#flow",
                      "tf": 2.380952380952381
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.9259259259259258
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "h": {
                "docs": {
                  "Teleport.html": {
                    "ref": "Teleport.html",
                    "tf": 1.9230769230769231
                  },
                  "module-Thurston-Thurston.html#chaseCamera": {
                    "ref": "module-Thurston-Thurston.html#chaseCamera",
                    "tf": 2
                  },
                  "module-Thurston-Thurston.html#getEyePositions": {
                    "ref": "module-Thurston-Thurston.html#getEyePositions",
                    "tf": 3.3333333333333335
                  }
                }
              }
            },
            "u": {
              "docs": {},
              "n": {
                "docs": {},
                "d": {
                  "docs": {
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 0.9615384615384616
                    }
                  }
                }
              }
            }
          },
          "l": {
            "docs": {},
            "o": {
              "docs": {},
              "c": {
                "docs": {},
                "k": {
                  "docs": {
                    "Isometry.html#toGLSL": {
                      "ref": "Isometry.html#toGLSL",
                      "tf": 4.545454545454546
                    },
                    "ObjectThurston.html#toGLSL": {
                      "ref": "ObjectThurston.html#toGLSL",
                      "tf": 6.25
                    },
                    "ObjectThurston.html#loadGLSLTemplate": {
                      "ref": "ObjectThurston.html#loadGLSLTemplate",
                      "tf": 5
                    },
                    "ObjectThurston.html#loadGLSLDefaultTemplate": {
                      "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                      "tf": 5
                    },
                    "Light.html#toGLSL": {
                      "ref": "Light.html#toGLSL",
                      "tf": 6.25
                    },
                    "Light.html#glslBuildDataDefault": {
                      "ref": "Light.html#glslBuildDataDefault",
                      "tf": 32.5
                    },
                    "Light.html#loadGLSLTemplate": {
                      "ref": "Light.html#loadGLSLTemplate",
                      "tf": 5
                    },
                    "Light.html#loadGLSLDefaultTemplate": {
                      "ref": "Light.html#loadGLSLDefaultTemplate",
                      "tf": 5
                    },
                    "Solid.html#toGLSL": {
                      "ref": "Solid.html#toGLSL",
                      "tf": 6.25
                    },
                    "Solid.html#glslBuildDataDefault": {
                      "ref": "Solid.html#glslBuildDataDefault",
                      "tf": 32.5
                    },
                    "Solid.html#loadGLSLTemplate": {
                      "ref": "Solid.html#loadGLSLTemplate",
                      "tf": 5
                    },
                    "Solid.html#loadGLSLDefaultTemplate": {
                      "ref": "Solid.html#loadGLSLDefaultTemplate",
                      "tf": 5
                    },
                    "Vector.html#toGLSL": {
                      "ref": "Vector.html#toGLSL",
                      "tf": 4.166666666666666
                    },
                    "module-Thurston-Thurston.html#buildShaderDataBackground": {
                      "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                      "tf": 5.555555555555555
                    }
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "f": {
              "docs": {},
              "o": {
                "docs": {},
                "r": {
                  "docs": {
                    "ObjectThurston.html#name": {
                      "ref": "ObjectThurston.html#name",
                      "tf": 3.3333333333333335
                    },
                    "Light.html#name": {
                      "ref": "Light.html#name",
                      "tf": 3.3333333333333335
                    },
                    "Solid.html#name": {
                      "ref": "Solid.html#name",
                      "tf": 3.3333333333333335
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "w": {
                "docs": {},
                "e": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "module-Thurston-Thurston.html#_clock": {
                          "ref": "module-Thurston-Thurston.html#_clock",
                          "tf": 7.142857142857142
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "c": {
              "docs": {},
              "k": {
                "docs": {
                  "Teleport.html": {
                    "ref": "Teleport.html",
                    "tf": 1.9230769230769231
                  },
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 1.4851485148514851
                  },
                  "RelPosition.html#teleport": {
                    "ref": "RelPosition.html#teleport",
                    "tf": 5.555555555555555
                  },
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 2.380952380952381
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                },
                "g": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "u": {
                        "docs": {},
                        "n": {
                          "docs": {},
                          "d": {
                            "docs": {
                              "module-Thurston-Thurston.html#buildShaderDataBackground": {
                                "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                                "tf": 5.555555555555555
                              },
                              "module-Thurston-Thurston.html#buildShaderFragment": {
                                "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                                "tf": 2.083333333333333
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "d": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.3546099290780142
                }
              }
            }
          },
          "r": {
            "docs": {},
            "i": {
              "docs": {},
              "c": {
                "docs": {},
                "k": {
                  "docs": {
                    "Teleport.html": {
                      "ref": "Teleport.html",
                      "tf": 1.9230769230769231
                    }
                  }
                }
              },
              "n": {
                "docs": {},
                "g": {
                  "docs": {
                    "RelPosition.html#teleport": {
                      "ref": "RelPosition.html#teleport",
                      "tf": 5.555555555555555
                    }
                  }
                }
              }
            }
          }
        },
        "s": {
          "docs": {},
          "e": {
            "docs": {},
            "t": {
              "docs": {
                "Isometry.html#set": {
                  "ref": "Isometry.html#set",
                  "tf": 685
                },
                "Isometry.html#getInverse": {
                  "ref": "Isometry.html#getInverse",
                  "tf": 10
                },
                "Isometry.html#copy": {
                  "ref": "Isometry.html#copy",
                  "tf": 10
                },
                "Point.html#set": {
                  "ref": "Point.html#set",
                  "tf": 675
                },
                "Point.html#copy": {
                  "ref": "Point.html#copy",
                  "tf": 10
                },
                "Teleport.html": {
                  "ref": "Teleport.html",
                  "tf": 1.9230769230769231
                },
                "Position.html#setBoost": {
                  "ref": "Position.html#setBoost",
                  "tf": 12.5
                },
                "Position.html#setFacing": {
                  "ref": "Position.html#setFacing",
                  "tf": 12.5
                },
                "Position.html#applyIsometry": {
                  "ref": "Position.html#applyIsometry",
                  "tf": 4.545454545454546
                },
                "Position.html#applyFacing": {
                  "ref": "Position.html#applyFacing",
                  "tf": 6.25
                },
                "Position.html#getInverse": {
                  "ref": "Position.html#getInverse",
                  "tf": 8.333333333333332
                },
                "Position.html#copy": {
                  "ref": "Position.html#copy",
                  "tf": 10
                },
                "RelPosition.html#applyFacing": {
                  "ref": "RelPosition.html#applyFacing",
                  "tf": 6.25
                },
                "RelPosition.html#copy": {
                  "ref": "RelPosition.html#copy",
                  "tf": 10
                },
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.3546099290780142
                },
                "module-Thurston-Thurston.html#setParams": {
                  "ref": "module-Thurston-Thurston.html#setParams",
                  "tf": 16.666666666666664
                },
                "module-Thurston-Thurston.html#setParam": {
                  "ref": "module-Thurston-Thurston.html#setParam",
                  "tf": 16.666666666666664
                },
                "module-Thurston-Thurston.html#setKeyboard": {
                  "ref": "module-Thurston-Thurston.html#setKeyboard",
                  "tf": 12.5
                }
              },
              "u": {
                "docs": {},
                "p": {
                  "docs": {
                    "Teleport.html#glsl": {
                      "ref": "Teleport.html#glsl",
                      "tf": 6.25
                    },
                    "module-Thurston-Thurston.html#initThreeJS": {
                      "ref": "module-Thurston-Thurston.html#initThreeJS",
                      "tf": 16.666666666666664
                    },
                    "module-Thurston-Thurston.html#buildShaderDataItems": {
                      "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                      "tf": 5
                    }
                  }
                }
              },
              "b": {
                "docs": {},
                "o": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "s": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Position.html#setBoost": {
                            "ref": "Position.html#setBoost",
                            "tf": 683.3333333333334
                          }
                        }
                      }
                    }
                  }
                }
              },
              "f": {
                "docs": {},
                "a": {
                  "docs": {},
                  "c": {
                    "docs": {
                      "Position.html#setFacing": {
                        "ref": "Position.html#setFacing",
                        "tf": 683.3333333333334
                      }
                    }
                  }
                }
              },
              "p": {
                "docs": {},
                "a": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "m": {
                        "docs": {
                          "module-Thurston-Thurston.html#setParams": {
                            "ref": "module-Thurston-Thurston.html#setParams",
                            "tf": 683.3333333333334
                          },
                          "module-Thurston-Thurston.html#setParam": {
                            "ref": "module-Thurston-Thurston.html#setParam",
                            "tf": 675
                          }
                        }
                      }
                    }
                  }
                }
              },
              "k": {
                "docs": {},
                "e": {
                  "docs": {},
                  "y": {
                    "docs": {},
                    "b": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "a": {
                          "docs": {},
                          "r": {
                            "docs": {},
                            "d": {
                              "docs": {
                                "module-Thurston-Thurston.html#setKeyboard": {
                                  "ref": "module-Thurston-Thurston.html#setKeyboard",
                                  "tf": 700
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "n": {
              "docs": {},
              "d": {
                "docs": {
                  "Isometry.html#makeTranslation": {
                    "ref": "Isometry.html#makeTranslation",
                    "tf": 4.166666666666666
                  },
                  "Isometry.html#makeInvTranslation": {
                    "ref": "Isometry.html#makeInvTranslation",
                    "tf": 4.166666666666666
                  },
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.49504950495049505
                  }
                }
              }
            },
            "e": {
              "docs": {
                "Subgroup.html#teleports": {
                  "ref": "Subgroup.html#teleports",
                  "tf": 5.555555555555555
                }
              },
              "n": {
                "docs": {
                  "Teleport.html": {
                    "ref": "Teleport.html",
                    "tf": 1.9230769230769231
                  },
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  },
                  "module-Thurston-Thurston.html#initHorizon": {
                    "ref": "module-Thurston-Thurston.html#initHorizon",
                    "tf": 5.555555555555555
                  }
                }
              },
              "m": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  }
                }
              }
            },
            "m": {
              "docs": {},
              "i": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.7092198581560284
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "e": {
                "docs": {},
                "c": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "VRControls.html": {
                        "ref": "VRControls.html",
                        "tf": 2.272727272727273
                      },
                      "VRControls.html#onSelectStart": {
                        "ref": "VRControls.html#onSelectStart",
                        "tf": 10
                      },
                      "VRControls.html#onSelectEnd": {
                        "ref": "VRControls.html#onSelectEnd",
                        "tf": 10
                      }
                    }
                  }
                }
              }
            }
          },
          "c": {
            "docs": {},
            "h": {
              "docs": {},
              "m": {
                "docs": {},
                "i": {
                  "docs": {},
                  "d": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "Isometry.html#reduceError": {
                          "ref": "Isometry.html#reduceError",
                          "tf": 5.555555555555555
                        }
                      }
                    }
                  }
                }
              }
            },
            "e": {
              "docs": {},
              "n": {
                "docs": {},
                "e": {
                  "docs": {
                    "ObjectThurston.html": {
                      "ref": "ObjectThurston.html",
                      "tf": 4.545454545454546
                    },
                    "Light.html": {
                      "ref": "Light.html",
                      "tf": 10
                    },
                    "Solid.html": {
                      "ref": "Solid.html",
                      "tf": 2.631578947368421
                    },
                    "Material.html": {
                      "ref": "Material.html",
                      "tf": 16.666666666666664
                    },
                    "VRControls.html": {
                      "ref": "VRControls.html",
                      "tf": 2.272727272727273
                    },
                    "module-Thurston-Thurston.html": {
                      "ref": "module-Thurston-Thurston.html",
                      "tf": 8.333333333333332
                    },
                    "module-Thurston-Thurston.html#_scene": {
                      "ref": "module-Thurston-Thurston.html#_scene",
                      "tf": 49.99999999999999
                    },
                    "module-Thurston-Thurston.html#_solids": {
                      "ref": "module-Thurston-Thurston.html#_solids",
                      "tf": 10
                    },
                    "module-Thurston-Thurston.html#_lights": {
                      "ref": "module-Thurston-Thurston.html#_lights",
                      "tf": 10
                    },
                    "module-Thurston-Thurston.html#chaseCamera": {
                      "ref": "module-Thurston-Thurston.html#chaseCamera",
                      "tf": 2
                    },
                    "module-Thurston-Thurston.html#addItem": {
                      "ref": "module-Thurston-Thurston.html#addItem",
                      "tf": 16.666666666666664
                    },
                    "module-Thurston-Thurston.html#addItems": {
                      "ref": "module-Thurston-Thurston.html#addItems",
                      "tf": 12.5
                    },
                    "module-Thurston-Thurston.html#initThreeJS": {
                      "ref": "module-Thurston-Thurston.html#initThreeJS",
                      "tf": 16.666666666666664
                    },
                    "module-Thurston-Thurston.html#buildShaderDataItems": {
                      "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                      "tf": 5
                    },
                    "module-Thurston.html": {
                      "ref": "module-Thurston.html",
                      "tf": 5.555555555555555
                    }
                  }
                }
              }
            }
          },
          "l": {
            "2": {
              "docs": {
                "Isometry.html#makeTranslation": {
                  "ref": "Isometry.html#makeTranslation",
                  "tf": 4.166666666666666
                },
                "Isometry.html#makeInvTranslation": {
                  "ref": "Isometry.html#makeInvTranslation",
                  "tf": 4.166666666666666
                }
              }
            },
            "docs": {},
            "(": {
              "2": {
                "docs": {},
                ",": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              },
              "docs": {}
            }
          },
          "o": {
            "docs": {},
            "l": {
              "docs": {
                "Isometry.html#makeTranslation": {
                  "ref": "Isometry.html#makeTranslation",
                  "tf": 4.166666666666666
                },
                "Isometry.html#makeInvTranslation": {
                  "ref": "Isometry.html#makeInvTranslation",
                  "tf": 4.166666666666666
                },
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.7092198581560284
                }
              },
              "i": {
                "docs": {},
                "d": {
                  "docs": {
                    "ObjectThurston.html": {
                      "ref": "ObjectThurston.html",
                      "tf": 4.545454545454546
                    },
                    "ObjectThurston.html#isSolid": {
                      "ref": "ObjectThurston.html#isSolid",
                      "tf": 25
                    },
                    "Solid.html": {
                      "ref": "Solid.html",
                      "tf": 1902.6315789473683
                    },
                    "Solid.html#material": {
                      "ref": "Solid.html#material",
                      "tf": 25
                    },
                    "Solid.html#toGLSL": {
                      "ref": "Solid.html#toGLSL",
                      "tf": 12.5
                    },
                    "module-Thurston-Thurston.html#_solids": {
                      "ref": "module-Thurston-Thurston.html#_solids",
                      "tf": 10
                    },
                    "module-Thurston-Thurston.html#buildShaderDataItems": {
                      "ref": "module-Thurston-Thurston.html#buildShaderDataItems",
                      "tf": 5
                    }
                  },
                  "#": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "u": {
                        "docs": {},
                        "i": {
                          "docs": {},
                          "d": {
                            "docs": {
                              "Solid.html#uuid": {
                                "ref": "Solid.html#uuid",
                                "tf": 1150
                              }
                            }
                          }
                        }
                      }
                    },
                    "g": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "l": {
                            "docs": {
                              "Solid.html#glsl": {
                                "ref": "Solid.html#glsl",
                                "tf": 1150
                              }
                            },
                            "b": {
                              "docs": {},
                              "u": {
                                "docs": {},
                                "i": {
                                  "docs": {},
                                  "l": {
                                    "docs": {},
                                    "d": {
                                      "docs": {},
                                      "d": {
                                        "docs": {},
                                        "a": {
                                          "docs": {},
                                          "t": {
                                            "docs": {},
                                            "a": {
                                              "docs": {
                                                "Solid.html#glslBuildData": {
                                                  "ref": "Solid.html#glslBuildData",
                                                  "tf": 1150
                                                }
                                              },
                                              "d": {
                                                "docs": {},
                                                "e": {
                                                  "docs": {},
                                                  "f": {
                                                    "docs": {},
                                                    "a": {
                                                      "docs": {},
                                                      "u": {
                                                        "docs": {},
                                                        "l": {
                                                          "docs": {},
                                                          "t": {
                                                            "docs": {
                                                              "Solid.html#glslBuildDataDefault": {
                                                                "ref": "Solid.html#glslBuildDataDefault",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "o": {
                          "docs": {},
                          "b": {
                            "docs": {
                              "Solid.html#global": {
                                "ref": "Solid.html#global",
                                "tf": 1150
                              }
                            }
                          }
                        }
                      }
                    },
                    "p": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "t": {
                              "docs": {
                                "Solid.html#position": {
                                  "ref": "Solid.html#position",
                                  "tf": 1150
                                }
                              }
                            }
                          }
                        },
                        "i": {
                          "docs": {},
                          "n": {
                            "docs": {},
                            "t": {
                              "docs": {
                                "Solid.html#point": {
                                  "ref": "Solid.html#point",
                                  "tf": 1150
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "l": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "c": {
                          "docs": {
                            "Solid.html#local": {
                              "ref": "Solid.html#local",
                              "tf": 1150
                            }
                          }
                        },
                        "a": {
                          "docs": {},
                          "d": {
                            "docs": {},
                            "g": {
                              "docs": {},
                              "l": {
                                "docs": {},
                                "s": {
                                  "docs": {},
                                  "l": {
                                    "docs": {},
                                    "t": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "m": {
                                          "docs": {},
                                          "p": {
                                            "docs": {},
                                            "l": {
                                              "docs": {
                                                "Solid.html#loadGLSLTemplate": {
                                                  "ref": "Solid.html#loadGLSLTemplate",
                                                  "tf": 1150
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    "d": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "f": {
                                          "docs": {},
                                          "a": {
                                            "docs": {},
                                            "u": {
                                              "docs": {},
                                              "l": {
                                                "docs": {},
                                                "t": {
                                                  "docs": {},
                                                  "t": {
                                                    "docs": {},
                                                    "e": {
                                                      "docs": {},
                                                      "m": {
                                                        "docs": {},
                                                        "p": {
                                                          "docs": {},
                                                          "l": {
                                                            "docs": {
                                                              "Solid.html#loadGLSLDefaultTemplate": {
                                                                "ref": "Solid.html#loadGLSLDefaultTemplate",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "m": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "r": {
                              "docs": {},
                              "i": {
                                "docs": {
                                  "Solid.html#material": {
                                    "ref": "Solid.html#material",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "s": {
                      "docs": {},
                      "h": {
                        "docs": {},
                        "a": {
                          "docs": {},
                          "d": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "r": {
                                "docs": {},
                                "s": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "u": {
                                      "docs": {},
                                      "r": {
                                        "docs": {},
                                        "c": {
                                          "docs": {
                                            "Solid.html#shaderSource": {
                                              "ref": "Solid.html#shaderSource",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "c": {
                      "docs": {},
                      "l": {
                        "docs": {},
                        "a": {
                          "docs": {},
                          "s": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "n": {
                                "docs": {},
                                "a": {
                                  "docs": {},
                                  "m": {
                                    "docs": {
                                      "Solid.html#className": {
                                        "ref": "Solid.html#className",
                                        "tf": 1150
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "n": {
                      "docs": {},
                      "a": {
                        "docs": {},
                        "m": {
                          "docs": {
                            "Solid.html#name": {
                              "ref": "Solid.html#name",
                              "tf": 1150
                            }
                          }
                        }
                      }
                    },
                    "i": {
                      "docs": {},
                      "s": {
                        "docs": {},
                        "l": {
                          "docs": {},
                          "i": {
                            "docs": {},
                            "g": {
                              "docs": {},
                              "h": {
                                "docs": {},
                                "t": {
                                  "docs": {
                                    "Solid.html#isLight": {
                                      "ref": "Solid.html#isLight",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "s": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "d": {
                                  "docs": {
                                    "Solid.html#isSolid": {
                                      "ref": "Solid.html#isSolid",
                                      "tf": 1150
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "t": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "g": {
                          "docs": {},
                          "l": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "l": {
                                "docs": {
                                  "Solid.html#toGLSL": {
                                    "ref": "Solid.html#toGLSL",
                                    "tf": 1150
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "m": {
              "docs": {},
              "e": {
                "docs": {},
                "w": {
                  "docs": {},
                  "h": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "r": {
                        "docs": {
                          "module-Thurston-Thurston.html#chaseCamera": {
                            "ref": "module-Thurston-Thurston.html#chaseCamera",
                            "tf": 2
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "m": {
              "docs": {},
              "e": {
                "docs": {
                  "Isometry.html#equals": {
                    "ref": "Isometry.html#equals",
                    "tf": 6.25
                  },
                  "Isometry.html#toGLSL": {
                    "ref": "Isometry.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Point.html#equals": {
                    "ref": "Point.html#equals",
                    "tf": 6.25
                  },
                  "Point.html#toGLSL": {
                    "ref": "Point.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "ObjectThurston.html#toGLSL": {
                    "ref": "ObjectThurston.html#toGLSL",
                    "tf": 6.25
                  },
                  "Position.html#equals": {
                    "ref": "Position.html#equals",
                    "tf": 10
                  },
                  "Position.html#toGLSL": {
                    "ref": "Position.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Light.html#toGLSL": {
                    "ref": "Light.html#toGLSL",
                    "tf": 6.25
                  },
                  "Solid.html#toGLSL": {
                    "ref": "Solid.html#toGLSL",
                    "tf": 6.25
                  },
                  "Vector.html#toGLSL": {
                    "ref": "Vector.html#toGLSL",
                    "tf": 4.166666666666666
                  },
                  "RelPosition.html#equals": {
                    "ref": "RelPosition.html#equals",
                    "tf": 6.25
                  },
                  "RelPosition.html#toGLSL": {
                    "ref": "RelPosition.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Material.html#toGLSL": {
                    "ref": "Material.html#toGLSL",
                    "tf": 4.545454545454546
                  },
                  "Subgroup.html#shaderSource": {
                    "ref": "Subgroup.html#shaderSource",
                    "tf": 4.166666666666666
                  }
                }
              }
            },
            "y": {
              "docs": {
                "Teleport.html#test": {
                  "ref": "Teleport.html#test",
                  "tf": 2.941176470588235
                }
              }
            }
          },
          "h": {
            "docs": {},
            "a": {
              "docs": {},
              "d": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {
                      "Isometry.html#toGLSL": {
                        "ref": "Isometry.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "Point.html#toGLSL": {
                        "ref": "Point.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "ObjectThurston.html#shaderSource": {
                        "ref": "ObjectThurston.html#shaderSource",
                        "tf": 10
                      },
                      "Position.html#toGLSL": {
                        "ref": "Position.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "Light.html#shaderSource": {
                        "ref": "Light.html#shaderSource",
                        "tf": 10
                      },
                      "Solid.html#shaderSource": {
                        "ref": "Solid.html#shaderSource",
                        "tf": 10
                      },
                      "RelPosition.html#toGLSL": {
                        "ref": "RelPosition.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "Material.html#toGLSL": {
                        "ref": "Material.html#toGLSL",
                        "tf": 4.545454545454546
                      },
                      "module-Thurston-Thurston.html#buildShaderVertex": {
                        "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                        "tf": 10
                      },
                      "module-Thurston-Thurston.html#buildShaderDataConstants": {
                        "ref": "module-Thurston-Thurston.html#buildShaderDataConstants",
                        "tf": 10
                      },
                      "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                        "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                        "tf": 10
                      },
                      "module-Thurston-Thurston.html#buildShaderFragment": {
                        "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                        "tf": 2.083333333333333
                      },
                      "module-Thurston-Thurston.html#initHorizon": {
                        "ref": "module-Thurston-Thurston.html#initHorizon",
                        "tf": 5.555555555555555
                      }
                    },
                    "s": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "u": {
                          "docs": {},
                          "r": {
                            "docs": {},
                            "c": {
                              "docs": {
                                "ObjectThurston.html#shaderSource": {
                                  "ref": "ObjectThurston.html#shaderSource",
                                  "tf": 750
                                },
                                "Light.html#shaderSource": {
                                  "ref": "Light.html#shaderSource",
                                  "tf": 750
                                },
                                "Solid.html#shaderSource": {
                                  "ref": "Solid.html#shaderSource",
                                  "tf": 750
                                },
                                "Subgroup.html#shaderSource": {
                                  "ref": "Subgroup.html#shaderSource",
                                  "tf": 700
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "u": {
                "docs": {},
                "l": {
                  "docs": {},
                  "d": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "'": {
                        "docs": {},
                        "t": {
                          "docs": {
                            "ObjectThurston.html#uuid": {
                              "ref": "ObjectThurston.html#uuid",
                              "tf": 6.25
                            },
                            "Teleport.html#uuid": {
                              "ref": "Teleport.html#uuid",
                              "tf": 6.25
                            },
                            "Teleport.html#name": {
                              "ref": "Teleport.html#name",
                              "tf": 4.545454545454546
                            },
                            "Light.html#uuid": {
                              "ref": "Light.html#uuid",
                              "tf": 6.25
                            },
                            "Solid.html#uuid": {
                              "ref": "Solid.html#uuid",
                              "tf": 6.25
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "n": {
                "docs": {},
                "i": {
                  "docs": {
                    "Material.html#shininess": {
                      "ref": "Material.html#shininess",
                      "tf": 716.6666666666666
                    }
                  }
                }
              }
            }
          },
          "t": {
            "docs": {},
            "r": {
              "docs": {},
              "i": {
                "docs": {},
                "n": {
                  "docs": {},
                  "g": {
                    "docs": {
                      "Isometry.html#toGLSL": {
                        "ref": "Isometry.html#toGLSL",
                        "tf": 33.33333333333333
                      },
                      "Point.html#toGLSL": {
                        "ref": "Point.html#toGLSL",
                        "tf": 33.33333333333333
                      },
                      "ObjectThurston.html#uuid": {
                        "ref": "ObjectThurston.html#uuid",
                        "tf": 50
                      },
                      "ObjectThurston.html#name": {
                        "ref": "ObjectThurston.html#name",
                        "tf": 50
                      },
                      "ObjectThurston.html#toGLSL": {
                        "ref": "ObjectThurston.html#toGLSL",
                        "tf": 50
                      },
                      "Teleport.html#uuid": {
                        "ref": "Teleport.html#uuid",
                        "tf": 50
                      },
                      "Teleport.html#name": {
                        "ref": "Teleport.html#name",
                        "tf": 50
                      },
                      "Teleport.html#glsl": {
                        "ref": "Teleport.html#glsl",
                        "tf": 50
                      },
                      "Position.html#toGLSL": {
                        "ref": "Position.html#toGLSL",
                        "tf": 50
                      },
                      "Light.html#uuid": {
                        "ref": "Light.html#uuid",
                        "tf": 50
                      },
                      "Light.html#name": {
                        "ref": "Light.html#name",
                        "tf": 50
                      },
                      "Light.html#toGLSL": {
                        "ref": "Light.html#toGLSL",
                        "tf": 50
                      },
                      "Solid.html#uuid": {
                        "ref": "Solid.html#uuid",
                        "tf": 50
                      },
                      "Solid.html#name": {
                        "ref": "Solid.html#name",
                        "tf": 50
                      },
                      "Solid.html#toGLSL": {
                        "ref": "Solid.html#toGLSL",
                        "tf": 50
                      },
                      "Vector.html#toLog": {
                        "ref": "Vector.html#toLog",
                        "tf": 50
                      },
                      "Vector.html#toGLSL": {
                        "ref": "Vector.html#toGLSL",
                        "tf": 50
                      },
                      "RelPosition.html#toGLSL": {
                        "ref": "RelPosition.html#toGLSL",
                        "tf": 50
                      },
                      "Material.html#toGLSL": {
                        "ref": "Material.html#toGLSL",
                        "tf": 50
                      },
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      },
                      "Subgroup.html#shaderSource": {
                        "ref": "Subgroup.html#shaderSource",
                        "tf": 50
                      },
                      "KeyboardControls.html#keyboard": {
                        "ref": "KeyboardControls.html#keyboard",
                        "tf": 50
                      },
                      "module-Thurston-Thurston.html#buildShaderVertex": {
                        "ref": "module-Thurston-Thurston.html#buildShaderVertex",
                        "tf": 33.33333333333333
                      },
                      "module-Thurston-Thurston.html#buildShaderFragment": {
                        "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                        "tf": 33.33333333333333
                      }
                    }
                  }
                }
              },
              "a": {
                "docs": {},
                "i": {
                  "docs": {},
                  "g": {
                    "docs": {},
                    "h": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "Subgroup.html": {
                            "ref": "Subgroup.html",
                            "tf": 0.3546099290780142
                          }
                        },
                        "f": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "r": {
                              "docs": {},
                              "w": {
                                "docs": {},
                                "a": {
                                  "docs": {},
                                  "r": {
                                    "docs": {},
                                    "d": {
                                      "docs": {
                                        "Subgroup.html": {
                                          "ref": "Subgroup.html",
                                          "tf": 0.3546099290780142
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                "t": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "g": {
                      "docs": {},
                      "i": {
                        "docs": {
                          "KeyboardControls.html#update": {
                            "ref": "KeyboardControls.html#update",
                            "tf": 0.4629629629629629
                          }
                        }
                      }
                    }
                  }
                }
              },
              "u": {
                "docs": {},
                "c": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "r": {
                        "docs": {
                          "Subgroup.html": {
                            "ref": "Subgroup.html",
                            "tf": 0.7092198581560284
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "a": {
              "docs": {},
              "y": {
                "docs": {
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 2.380952380952381
                  }
                }
              },
              "r": {
                "docs": {},
                "t": {
                  "docs": {
                    "VRControls.html#onSelectStart": {
                      "ref": "VRControls.html#onSelectStart",
                      "tf": 10
                    },
                    "VRControls.html#onSqueezeStart": {
                      "ref": "VRControls.html#onSqueezeStart",
                      "tf": 10
                    }
                  }
                }
              },
              "t": {
                "docs": {
                  "module-Thurston-Thurston.html#stats": {
                    "ref": "module-Thurston-Thurston.html#stats",
                    "tf": 775
                  },
                  "module-Thurston-Thurston.html#initStats": {
                    "ref": "module-Thurston-Thurston.html#initStats",
                    "tf": 16.666666666666664
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "l": {
                "docs": {},
                "l": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.3546099290780142
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "p": {
                "docs": {
                  "VRControls.html#onSelectEnd": {
                    "ref": "VRControls.html#onSelectEnd",
                    "tf": 10
                  },
                  "VRControls.html#onSqueezeEnd": {
                    "ref": "VRControls.html#onSqueezeEnd",
                    "tf": 10
                  }
                }
              }
            }
          },
          "p": {
            "docs": {},
            "a": {
              "docs": {},
              "c": {
                "docs": {},
                "e": {
                  "docs": {
                    "Point.html#build": {
                      "ref": "Point.html#build",
                      "tf": 7.142857142857142
                    },
                    "Position.html#flow": {
                      "ref": "Position.html#flow",
                      "tf": 0.49504950495049505
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 0.4629629629629629
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "i": {
                "docs": {},
                "t": {
                  "docs": {
                    "RelPosition.html": {
                      "ref": "RelPosition.html",
                      "tf": 0.9615384615384616
                    }
                  }
                }
              }
            },
            "e": {
              "docs": {},
              "c": {
                "docs": {},
                "u": {
                  "docs": {},
                  "l": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "r": {
                        "docs": {
                          "Material.html#specular": {
                            "ref": "Material.html#specular",
                            "tf": 716.6666666666666
                          }
                        }
                      }
                    }
                  }
                },
                "i": {
                  "docs": {},
                  "f": {
                    "docs": {},
                    "i": {
                      "docs": {
                        "module-Thurston-Thurston.html": {
                          "ref": "module-Thurston-Thurston.html",
                          "tf": 8.333333333333332
                        }
                      }
                    }
                  }
                }
              }
            },
            "h": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "e": {
                    "docs": {
                      "module-Thurston-Thurston.html#chaseCamera": {
                        "ref": "module-Thurston-Thurston.html#chaseCamera",
                        "tf": 2
                      }
                    }
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "g": {
              "docs": {},
              "n": {
                "docs": {
                  "ObjectThurston.html#glsl": {
                    "ref": "ObjectThurston.html#glsl",
                    "tf": 6.25
                  },
                  "Light.html#glsl": {
                    "ref": "Light.html#glsl",
                    "tf": 6.25
                  },
                  "Light.html#glslBuildData": {
                    "ref": "Light.html#glslBuildData",
                    "tf": 5
                  },
                  "Solid.html#glsl": {
                    "ref": "Solid.html#glsl",
                    "tf": 6.25
                  },
                  "Solid.html#glslBuildData": {
                    "ref": "Solid.html#glslBuildData",
                    "tf": 5
                  }
                },
                "a": {
                  "docs": {},
                  "t": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "r": {
                        "docs": {
                          "Teleport.html#test": {
                            "ref": "Teleport.html#test",
                            "tf": 2.941176470588235
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "m": {
              "docs": {},
              "p": {
                "docs": {},
                "l": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "c": {
                      "docs": {
                        "RelPosition.html": {
                          "ref": "RelPosition.html",
                          "tf": 0.9615384615384616
                        }
                      }
                    }
                  }
                }
              },
              "i": {
                "docs": {},
                "l": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "r": {
                      "docs": {
                        "KeyboardControls.html#update": {
                          "ref": "KeyboardControls.html#update",
                          "tf": 0.4629629629629629
                        }
                      }
                    }
                  }
                }
              },
              "u": {
                "docs": {},
                "l": {
                  "docs": {
                    "module-Thurston-Thurston.html#animate": {
                      "ref": "module-Thurston-Thurston.html#animate",
                      "tf": 25
                    }
                  }
                }
              }
            },
            "d": {
              "docs": {},
              "e": {
                "docs": {
                  "Subgroup.html#shaderSource": {
                    "ref": "Subgroup.html#shaderSource",
                    "tf": 4.166666666666666
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "b": {
              "docs": {},
              "g": {
                "docs": {},
                "r": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "u": {
                      "docs": {},
                      "p": {
                        "docs": {
                          "Teleport.html": {
                            "ref": "Teleport.html",
                            "tf": 3.8461538461538463
                          },
                          "Teleport.html#glsl": {
                            "ref": "Teleport.html#glsl",
                            "tf": 6.25
                          },
                          "RelPosition.html": {
                            "ref": "RelPosition.html",
                            "tf": 0.9615384615384616
                          },
                          "RelPosition.html#sbgp": {
                            "ref": "RelPosition.html#sbgp",
                            "tf": 50
                          },
                          "Subgroup.html": {
                            "ref": "Subgroup.html",
                            "tf": 1901.4184397163122
                          },
                          "Subgroup.html#teleports": {
                            "ref": "Subgroup.html#teleports",
                            "tf": 5.555555555555555
                          },
                          "Subgroup.html#glslBuildData": {
                            "ref": "Subgroup.html#glslBuildData",
                            "tf": 4.545454545454546
                          },
                          "KeyboardControls.html#update": {
                            "ref": "KeyboardControls.html#update",
                            "tf": 0.4629629629629629
                          },
                          "module-Thurston-Thurston.html#subgroup": {
                            "ref": "module-Thurston-Thurston.html#subgroup",
                            "tf": 760
                          },
                          "module-Thurston-Thurston.html#buildShaderDataBackground": {
                            "ref": "module-Thurston-Thurston.html#buildShaderDataBackground",
                            "tf": 5.555555555555555
                          },
                          "module-Thurston-Thurston.html#buildShaderFragment": {
                            "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                            "tf": 4.166666666666666
                          }
                        },
                        "#": {
                          "docs": {},
                          "t": {
                            "docs": {},
                            "e": {
                              "docs": {},
                              "l": {
                                "docs": {},
                                "e": {
                                  "docs": {},
                                  "p": {
                                    "docs": {},
                                    "o": {
                                      "docs": {},
                                      "r": {
                                        "docs": {},
                                        "t": {
                                          "docs": {
                                            "Subgroup.html#teleports": {
                                              "ref": "Subgroup.html#teleports",
                                              "tf": 1150
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "s": {
                            "docs": {},
                            "h": {
                              "docs": {},
                              "a": {
                                "docs": {},
                                "d": {
                                  "docs": {},
                                  "e": {
                                    "docs": {},
                                    "r": {
                                      "docs": {},
                                      "s": {
                                        "docs": {},
                                        "o": {
                                          "docs": {},
                                          "u": {
                                            "docs": {},
                                            "r": {
                                              "docs": {},
                                              "c": {
                                                "docs": {
                                                  "Subgroup.html#shaderSource": {
                                                    "ref": "Subgroup.html#shaderSource",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "g": {
                            "docs": {},
                            "l": {
                              "docs": {},
                              "s": {
                                "docs": {},
                                "l": {
                                  "docs": {},
                                  "b": {
                                    "docs": {},
                                    "u": {
                                      "docs": {},
                                      "i": {
                                        "docs": {},
                                        "l": {
                                          "docs": {},
                                          "d": {
                                            "docs": {},
                                            "d": {
                                              "docs": {},
                                              "a": {
                                                "docs": {},
                                                "t": {
                                                  "docs": {},
                                                  "a": {
                                                    "docs": {
                                                      "Subgroup.html#glslBuildData": {
                                                        "ref": "Subgroup.html#glslBuildData",
                                                        "tf": 1150
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "e": {
                "docs": {
                  "RelPosition.html#flow": {
                    "ref": "RelPosition.html#flow",
                    "tf": 2.380952380952381
                  }
                }
              }
            }
          },
          "b": {
            "docs": {},
            "g": {
              "docs": {},
              "p": {
                "docs": {
                  "RelPosition.html#sbgp": {
                    "ref": "RelPosition.html#sbgp",
                    "tf": 700
                  }
                }
              }
            }
          },
          "^": {
            "2": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.7092198581560284
                }
              }
            },
            "3": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.7092198581560284
                }
              }
            },
            "docs": {}
          },
          "y": {
            "docs": {},
            "m": {
              "docs": {},
              "b": {
                "docs": {},
                "o": {
                  "docs": {},
                  "l": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.7092198581560284
                      }
                    }
                  }
                }
              }
            }
          },
          "q": {
            "docs": {},
            "u": {
              "docs": {},
              "e": {
                "docs": {},
                "e": {
                  "docs": {},
                  "z": {
                    "docs": {
                      "VRControls.html": {
                        "ref": "VRControls.html",
                        "tf": 2.272727272727273
                      },
                      "VRControls.html#onSqueezeStart": {
                        "ref": "VRControls.html#onSqueezeStart",
                        "tf": 10
                      },
                      "VRControls.html#onSqueezeEnd": {
                        "ref": "VRControls.html#onSqueezeEnd",
                        "tf": 10
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "o": {
          "docs": {},
          "r": {
            "docs": {},
            "i": {
              "docs": {},
              "g": {
                "docs": {},
                "i": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "Isometry.html#makeTranslation": {
                        "ref": "Isometry.html#makeTranslation",
                        "tf": 4.166666666666666
                      },
                      "Isometry.html#makeInvTranslation": {
                        "ref": "Isometry.html#makeInvTranslation",
                        "tf": 4.166666666666666
                      },
                      "Point.html#build": {
                        "ref": "Point.html#build",
                        "tf": 7.142857142857142
                      },
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 1.4851485148514851
                      },
                      "Vector.html": {
                        "ref": "Vector.html",
                        "tf": 3.8461538461538463
                      },
                      "RelPosition.html#flow": {
                        "ref": "RelPosition.html#flow",
                        "tf": 2.380952380952381
                      },
                      "KeyboardControls.html#update": {
                        "ref": "KeyboardControls.html#update",
                        "tf": 0.4629629629629629
                      }
                    }
                  }
                }
              },
              "e": {
                "docs": {},
                "n": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "KeyboardControls.html#update": {
                        "ref": "KeyboardControls.html#update",
                        "tf": 0.9259259259259258
                      }
                    }
                  }
                }
              }
            },
            "d": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 0.7092198581560284
                    },
                    "Subgroup.html#teleports": {
                      "ref": "Subgroup.html#teleports",
                      "tf": 5.555555555555555
                    },
                    "Subgroup.html#shaderSource": {
                      "ref": "Subgroup.html#shaderSource",
                      "tf": 4.166666666666666
                    }
                  }
                }
              }
            }
          },
          "b": {
            "docs": {},
            "j": {
              "docs": {},
              "e": {
                "docs": {},
                "c": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "ObjectThurston.html": {
                        "ref": "ObjectThurston.html",
                        "tf": 4.545454545454546
                      },
                      "ObjectThurston.html#uuid": {
                        "ref": "ObjectThurston.html#uuid",
                        "tf": 6.25
                      },
                      "ObjectThurston.html#glsl": {
                        "ref": "ObjectThurston.html#glsl",
                        "tf": 50
                      },
                      "ObjectThurston.html#position": {
                        "ref": "ObjectThurston.html#position",
                        "tf": 25
                      },
                      "Teleport.html#uuid": {
                        "ref": "Teleport.html#uuid",
                        "tf": 6.25
                      },
                      "Position.html": {
                        "ref": "Position.html",
                        "tf": 10
                      },
                      "Light.html#uuid": {
                        "ref": "Light.html#uuid",
                        "tf": 6.25
                      },
                      "Light.html#glsl": {
                        "ref": "Light.html#glsl",
                        "tf": 50
                      },
                      "Light.html#position": {
                        "ref": "Light.html#position",
                        "tf": 25
                      },
                      "Light.html#isSolid": {
                        "ref": "Light.html#isSolid",
                        "tf": 25
                      },
                      "Solid.html": {
                        "ref": "Solid.html",
                        "tf": 7.894736842105263
                      },
                      "Solid.html#uuid": {
                        "ref": "Solid.html#uuid",
                        "tf": 6.25
                      },
                      "Solid.html#glsl": {
                        "ref": "Solid.html#glsl",
                        "tf": 50
                      },
                      "Solid.html#position": {
                        "ref": "Solid.html#position",
                        "tf": 25
                      },
                      "Solid.html#isSolid": {
                        "ref": "Solid.html#isSolid",
                        "tf": 25
                      },
                      "Material.html": {
                        "ref": "Material.html",
                        "tf": 16.666666666666664
                      },
                      "module-Thurston-Thurston.html#geom": {
                        "ref": "module-Thurston-Thurston.html#geom",
                        "tf": 50
                      },
                      "module-Thurston-Thurston.html#params": {
                        "ref": "module-Thurston-Thurston.html#params",
                        "tf": 53.57142857142857
                      }
                    },
                    "t": {
                      "docs": {},
                      "h": {
                        "docs": {},
                        "u": {
                          "docs": {},
                          "r": {
                            "docs": {},
                            "s": {
                              "docs": {},
                              "t": {
                                "docs": {},
                                "o": {
                                  "docs": {},
                                  "n": {
                                    "docs": {
                                      "ObjectThurston.html": {
                                        "ref": "ObjectThurston.html",
                                        "tf": 1850
                                      }
                                    },
                                    "#": {
                                      "docs": {},
                                      "u": {
                                        "docs": {},
                                        "u": {
                                          "docs": {},
                                          "i": {
                                            "docs": {},
                                            "d": {
                                              "docs": {
                                                "ObjectThurston.html#uuid": {
                                                  "ref": "ObjectThurston.html#uuid",
                                                  "tf": 1150
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "g": {
                                        "docs": {},
                                        "l": {
                                          "docs": {},
                                          "s": {
                                            "docs": {},
                                            "l": {
                                              "docs": {
                                                "ObjectThurston.html#glsl": {
                                                  "ref": "ObjectThurston.html#glsl",
                                                  "tf": 1150
                                                }
                                              }
                                            }
                                          },
                                          "o": {
                                            "docs": {},
                                            "b": {
                                              "docs": {
                                                "ObjectThurston.html#global": {
                                                  "ref": "ObjectThurston.html#global",
                                                  "tf": 1150
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "p": {
                                        "docs": {},
                                        "o": {
                                          "docs": {},
                                          "s": {
                                            "docs": {},
                                            "i": {
                                              "docs": {},
                                              "t": {
                                                "docs": {
                                                  "ObjectThurston.html#position": {
                                                    "ref": "ObjectThurston.html#position",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "i": {
                                            "docs": {},
                                            "n": {
                                              "docs": {},
                                              "t": {
                                                "docs": {
                                                  "ObjectThurston.html#point": {
                                                    "ref": "ObjectThurston.html#point",
                                                    "tf": 1150
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "l": {
                                        "docs": {},
                                        "o": {
                                          "docs": {},
                                          "c": {
                                            "docs": {
                                              "ObjectThurston.html#local": {
                                                "ref": "ObjectThurston.html#local",
                                                "tf": 1150
                                              }
                                            }
                                          },
                                          "a": {
                                            "docs": {},
                                            "d": {
                                              "docs": {},
                                              "g": {
                                                "docs": {},
                                                "l": {
                                                  "docs": {},
                                                  "s": {
                                                    "docs": {},
                                                    "l": {
                                                      "docs": {},
                                                      "t": {
                                                        "docs": {},
                                                        "e": {
                                                          "docs": {},
                                                          "m": {
                                                            "docs": {},
                                                            "p": {
                                                              "docs": {},
                                                              "l": {
                                                                "docs": {
                                                                  "ObjectThurston.html#loadGLSLTemplate": {
                                                                    "ref": "ObjectThurston.html#loadGLSLTemplate",
                                                                    "tf": 1150
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      },
                                                      "d": {
                                                        "docs": {},
                                                        "e": {
                                                          "docs": {},
                                                          "f": {
                                                            "docs": {},
                                                            "a": {
                                                              "docs": {},
                                                              "u": {
                                                                "docs": {},
                                                                "l": {
                                                                  "docs": {},
                                                                  "t": {
                                                                    "docs": {},
                                                                    "t": {
                                                                      "docs": {},
                                                                      "e": {
                                                                        "docs": {},
                                                                        "m": {
                                                                          "docs": {},
                                                                          "p": {
                                                                            "docs": {},
                                                                            "l": {
                                                                              "docs": {
                                                                                "ObjectThurston.html#loadGLSLDefaultTemplate": {
                                                                                  "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                                                                                  "tf": 1150
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "s": {
                                        "docs": {},
                                        "h": {
                                          "docs": {},
                                          "a": {
                                            "docs": {},
                                            "d": {
                                              "docs": {},
                                              "e": {
                                                "docs": {},
                                                "r": {
                                                  "docs": {},
                                                  "s": {
                                                    "docs": {},
                                                    "o": {
                                                      "docs": {},
                                                      "u": {
                                                        "docs": {},
                                                        "r": {
                                                          "docs": {},
                                                          "c": {
                                                            "docs": {
                                                              "ObjectThurston.html#shaderSource": {
                                                                "ref": "ObjectThurston.html#shaderSource",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "c": {
                                        "docs": {},
                                        "l": {
                                          "docs": {},
                                          "a": {
                                            "docs": {},
                                            "s": {
                                              "docs": {},
                                              "s": {
                                                "docs": {},
                                                "n": {
                                                  "docs": {},
                                                  "a": {
                                                    "docs": {},
                                                    "m": {
                                                      "docs": {
                                                        "ObjectThurston.html#className": {
                                                          "ref": "ObjectThurston.html#className",
                                                          "tf": 1150
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "n": {
                                        "docs": {},
                                        "a": {
                                          "docs": {},
                                          "m": {
                                            "docs": {
                                              "ObjectThurston.html#name": {
                                                "ref": "ObjectThurston.html#name",
                                                "tf": 1150
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "i": {
                                        "docs": {},
                                        "s": {
                                          "docs": {},
                                          "l": {
                                            "docs": {},
                                            "i": {
                                              "docs": {},
                                              "g": {
                                                "docs": {},
                                                "h": {
                                                  "docs": {},
                                                  "t": {
                                                    "docs": {
                                                      "ObjectThurston.html#isLight": {
                                                        "ref": "ObjectThurston.html#isLight",
                                                        "tf": 1150
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "s": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "l": {
                                                "docs": {},
                                                "i": {
                                                  "docs": {},
                                                  "d": {
                                                    "docs": {
                                                      "ObjectThurston.html#isSolid": {
                                                        "ref": "ObjectThurston.html#isSolid",
                                                        "tf": 1150
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      "t": {
                                        "docs": {},
                                        "o": {
                                          "docs": {},
                                          "g": {
                                            "docs": {},
                                            "l": {
                                              "docs": {},
                                              "s": {
                                                "docs": {},
                                                "l": {
                                                  "docs": {
                                                    "ObjectThurston.html#toGLSL": {
                                                      "ref": "ObjectThurston.html#toGLSL",
                                                      "tf": 1150
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "s": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "v": {
                    "docs": {
                      "Position.html": {
                        "ref": "Position.html",
                        "tf": 10
                      },
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 0.9900990099009901
                      },
                      "module-Thurston-Thurston.html#getEyePositions": {
                        "ref": "module-Thurston-Thurston.html#getEyePositions",
                        "tf": 3.3333333333333335
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "a": {
                "docs": {},
                "i": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "Position.html#flowFromOrigin": {
                        "ref": "Position.html#flowFromOrigin",
                        "tf": 3.3333333333333335
                      },
                      "Position.html#flow": {
                        "ref": "Position.html#flow",
                        "tf": 0.9900990099009901
                      }
                    }
                  }
                }
              }
            },
            "v": {
              "docs": {},
              "i": {
                "docs": {},
                "o": {
                  "docs": {},
                  "u": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.3546099290780142
                      }
                    }
                  }
                }
              }
            }
          },
          "t": {
            "docs": {},
            "h": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "w": {
                    "docs": {},
                    "i": {
                      "docs": {},
                      "s": {
                        "docs": {
                          "Teleport.html#test": {
                            "ref": "Teleport.html#test",
                            "tf": 2.941176470588235
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "(": {
            "3": {
              "docs": {
                "Position.html#facing": {
                  "ref": "Position.html#facing",
                  "tf": 16.666666666666664
                },
                "Position.html#applyFacing": {
                  "ref": "Position.html#applyFacing",
                  "tf": 6.25
                },
                "RelPosition.html#applyFacing": {
                  "ref": "RelPosition.html#applyFacing",
                  "tf": 6.25
                },
                "KeyboardControls.html#update": {
                  "ref": "KeyboardControls.html#update",
                  "tf": 0.9259259259259258
                }
              }
            },
            "docs": {}
          },
          "n": {
            "docs": {
              "Position.html#flowFromOrigin": {
                "ref": "Position.html#flowFromOrigin",
                "tf": 3.3333333333333335
              },
              "Position.html#copy": {
                "ref": "Position.html#copy",
                "tf": 10
              },
              "Subgroup.html": {
                "ref": "Subgroup.html",
                "tf": 0.3546099290780142
              },
              "module-Thurston-Thurston.html#chaseCamera": {
                "ref": "module-Thurston-Thurston.html#chaseCamera",
                "tf": 2
              },
              "module-Thurston.html": {
                "ref": "module-Thurston.html",
                "tf": 5.555555555555555
              }
            },
            "s": {
              "docs": {},
              "e": {
                "docs": {},
                "l": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "c": {
                      "docs": {},
                      "t": {
                        "docs": {},
                        "s": {
                          "docs": {},
                          "t": {
                            "docs": {},
                            "a": {
                              "docs": {},
                              "r": {
                                "docs": {},
                                "t": {
                                  "docs": {
                                    "VRControls.html#onSelectStart": {
                                      "ref": "VRControls.html#onSelectStart",
                                      "tf": 750
                                    }
                                  }
                                }
                              }
                            }
                          }
                        },
                        "e": {
                          "docs": {},
                          "n": {
                            "docs": {},
                            "d": {
                              "docs": {
                                "VRControls.html#onSelectEnd": {
                                  "ref": "VRControls.html#onSelectEnd",
                                  "tf": 750
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "q": {
                "docs": {},
                "u": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "z": {
                        "docs": {},
                        "e": {
                          "docs": {},
                          "s": {
                            "docs": {},
                            "t": {
                              "docs": {},
                              "a": {
                                "docs": {},
                                "r": {
                                  "docs": {},
                                  "t": {
                                    "docs": {
                                      "VRControls.html#onSqueezeStart": {
                                        "ref": "VRControls.html#onSqueezeStart",
                                        "tf": 750
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          "e": {
                            "docs": {},
                            "n": {
                              "docs": {},
                              "d": {
                                "docs": {
                                  "VRControls.html#onSqueezeEnd": {
                                    "ref": "VRControls.html#onSqueezeEnd",
                                    "tf": 750
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "k": {
              "docs": {},
              "e": {
                "docs": {},
                "y": {
                  "docs": {},
                  "d": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "w": {
                        "docs": {},
                        "n": {
                          "docs": {
                            "KeyboardControls.html#onKeyDown": {
                              "ref": "KeyboardControls.html#onKeyDown",
                              "tf": 700
                            }
                          }
                        }
                      }
                    }
                  },
                  "u": {
                    "docs": {},
                    "p": {
                      "docs": {
                        "KeyboardControls.html#onKeyUp": {
                          "ref": "KeyboardControls.html#onKeyUp",
                          "tf": 700
                        }
                      }
                    }
                  }
                }
              }
            },
            "w": {
              "docs": {},
              "i": {
                "docs": {},
                "n": {
                  "docs": {},
                  "d": {
                    "docs": {},
                    "o": {
                      "docs": {},
                      "w": {
                        "docs": {},
                        "r": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "s": {
                              "docs": {
                                "module-Thurston-Thurston.html#onWindowResize": {
                                  "ref": "module-Thurston-Thurston.html#onWindowResize",
                                  "tf": 700
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "v": {
            "docs": {},
            "e": {
              "docs": {},
              "r": {
                "docs": {},
                "l": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "d": {
                        "docs": {
                          "Vector.html#applyMatrix4": {
                            "ref": "Vector.html#applyMatrix4",
                            "tf": 1.8518518518518516
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "p": {
            "docs": {},
            "e": {
              "docs": {},
              "n": {
                "docs": {},
                "g": {
                  "docs": {},
                  "l": {
                    "docs": {
                      "Subgroup.html": {
                        "ref": "Subgroup.html",
                        "tf": 0.7092198581560284
                      }
                    }
                  }
                }
              }
            },
            "t": {
              "docs": {},
              "i": {
                "docs": {},
                "o": {
                  "docs": {},
                  "n": {
                    "docs": {
                      "module-Thurston-Thurston.html#setParams": {
                        "ref": "module-Thurston-Thurston.html#setParams",
                        "tf": 16.666666666666664
                      },
                      "module-Thurston-Thurston.html#setParam": {
                        "ref": "module-Thurston-Thurston.html#setParam",
                        "tf": 16.666666666666664
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "u": {
          "1": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.49504950495049505
              }
            }
          },
          "2": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.49504950495049505
              }
            }
          },
          "3": {
            "docs": {
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.49504950495049505
              }
            }
          },
          "docs": {
            "Position.html#flow": {
              "ref": "Position.html#flow",
              "tf": 1.4851485148514851
            },
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 0.9259259259259258
            }
          },
          "s": {
            "docs": {
              "Isometry.html#toGLSL": {
                "ref": "Isometry.html#toGLSL",
                "tf": 4.545454545454546
              },
              "Point.html#toGLSL": {
                "ref": "Point.html#toGLSL",
                "tf": 4.545454545454546
              },
              "ObjectThurston.html#className": {
                "ref": "ObjectThurston.html#className",
                "tf": 5
              },
              "Position.html#flow": {
                "ref": "Position.html#flow",
                "tf": 0.49504950495049505
              },
              "Position.html#toGLSL": {
                "ref": "Position.html#toGLSL",
                "tf": 4.545454545454546
              },
              "Light.html#className": {
                "ref": "Light.html#className",
                "tf": 5
              },
              "Light.html#glslBuildDataDefault": {
                "ref": "Light.html#glslBuildDataDefault",
                "tf": 6.25
              },
              "Solid.html#className": {
                "ref": "Solid.html#className",
                "tf": 5
              },
              "Solid.html#glslBuildDataDefault": {
                "ref": "Solid.html#glslBuildDataDefault",
                "tf": 6.25
              },
              "RelPosition.html#toGLSL": {
                "ref": "RelPosition.html#toGLSL",
                "tf": 4.545454545454546
              },
              "Material.html#toGLSL": {
                "ref": "Material.html#toGLSL",
                "tf": 4.545454545454546
              },
              "Subgroup.html": {
                "ref": "Subgroup.html",
                "tf": 0.3546099290780142
              },
              "VRControls.html": {
                "ref": "VRControls.html",
                "tf": 6.8181818181818175
              },
              "KeyboardControls.html": {
                "ref": "KeyboardControls.html",
                "tf": 5.555555555555555
              },
              "KeyboardControls.html#keyboard": {
                "ref": "KeyboardControls.html#keyboard",
                "tf": 16.666666666666664
              },
              "module-Thurston-Thurston.html": {
                "ref": "module-Thurston-Thurston.html",
                "tf": 8.333333333333332
              },
              "module-Thurston-Thurston.html#_renderer": {
                "ref": "module-Thurston-Thurston.html#_renderer",
                "tf": 16.666666666666664
              },
              "module-Thurston-Thurston.html#setKeyboard": {
                "ref": "module-Thurston-Thurston.html#setKeyboard",
                "tf": 12.5
              },
              "module-Thurston-Thurston.html#buildShaderFragment": {
                "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                "tf": 2.083333333333333
              },
              "module-Thurston.html": {
                "ref": "module-Thurston.html",
                "tf": 5.555555555555555
              }
            },
            "e": {
              "docs": {},
              "r": {
                "docs": {
                  "VRControls.html#onSelectStart": {
                    "ref": "VRControls.html#onSelectStart",
                    "tf": 10
                  },
                  "VRControls.html#onSelectEnd": {
                    "ref": "VRControls.html#onSelectEnd",
                    "tf": 10
                  },
                  "VRControls.html#onSqueezeStart": {
                    "ref": "VRControls.html#onSqueezeStart",
                    "tf": 10
                  },
                  "VRControls.html#onSqueezeEnd": {
                    "ref": "VRControls.html#onSqueezeEnd",
                    "tf": 10
                  },
                  "module-Thurston-Thurston.html#gui": {
                    "ref": "module-Thurston-Thurston.html#gui",
                    "tf": 16.666666666666664
                  },
                  "module-Thurston-Thurston.html#initUI": {
                    "ref": "module-Thurston-Thurston.html#initUI",
                    "tf": 12.5
                  }
                }
              }
            }
          },
          "p": {
            "docs": {
              "module-Thurston-Thurston.html#params": {
                "ref": "module-Thurston-Thurston.html#params",
                "tf": 3.571428571428571
              }
            },
            "d": {
              "docs": {},
              "a": {
                "docs": {},
                "t": {
                  "docs": {
                    "Point.html#set": {
                      "ref": "Point.html#set",
                      "tf": 10
                    },
                    "VRControls.html#update": {
                      "ref": "VRControls.html#update",
                      "tf": 716.6666666666666
                    },
                    "KeyboardControls.html#updateMovementVector": {
                      "ref": "KeyboardControls.html#updateMovementVector",
                      "tf": 16.666666666666664
                    },
                    "KeyboardControls.html#updateRotationVector": {
                      "ref": "KeyboardControls.html#updateRotationVector",
                      "tf": 16.666666666666664
                    },
                    "KeyboardControls.html#update": {
                      "ref": "KeyboardControls.html#update",
                      "tf": 700.4629629629629
                    },
                    "module-Thurston-Thurston.html#chaseCamera": {
                      "ref": "module-Thurston-Thurston.html#chaseCamera",
                      "tf": 6
                    }
                  },
                  "e": {
                    "docs": {},
                    "m": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "v": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "m": {
                              "docs": {},
                              "e": {
                                "docs": {},
                                "n": {
                                  "docs": {},
                                  "t": {
                                    "docs": {},
                                    "v": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "c": {
                                          "docs": {},
                                          "t": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "r": {
                                                "docs": {
                                                  "KeyboardControls.html#updateMovementVector": {
                                                    "ref": "KeyboardControls.html#updateMovementVector",
                                                    "tf": 750
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    "r": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          "a": {
                            "docs": {},
                            "t": {
                              "docs": {},
                              "i": {
                                "docs": {},
                                "o": {
                                  "docs": {},
                                  "n": {
                                    "docs": {},
                                    "v": {
                                      "docs": {},
                                      "e": {
                                        "docs": {},
                                        "c": {
                                          "docs": {},
                                          "t": {
                                            "docs": {},
                                            "o": {
                                              "docs": {},
                                              "r": {
                                                "docs": {
                                                  "KeyboardControls.html#updateRotationVector": {
                                                    "ref": "KeyboardControls.html#updateRotationVector",
                                                    "tf": 750
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "i": {
              "docs": {},
              "d": {
                "docs": {
                  "ObjectThurston.html#uuid": {
                    "ref": "ObjectThurston.html#uuid",
                    "tf": 706.25
                  },
                  "Teleport.html#uuid": {
                    "ref": "Teleport.html#uuid",
                    "tf": 706.25
                  },
                  "Teleport.html#name": {
                    "ref": "Teleport.html#name",
                    "tf": 4.545454545454546
                  },
                  "Light.html#uuid": {
                    "ref": "Light.html#uuid",
                    "tf": 706.25
                  },
                  "Solid.html#uuid": {
                    "ref": "Solid.html#uuid",
                    "tf": 706.25
                  }
                }
              }
            }
          },
          "n": {
            "docs": {},
            "d": {
              "docs": {},
              "e": {
                "docs": {},
                "r": {
                  "docs": {},
                  "l": {
                    "docs": {},
                    "i": {
                      "docs": {
                        "ObjectThurston.html#point": {
                          "ref": "ObjectThurston.html#point",
                          "tf": 12.5
                        },
                        "Position.html#point": {
                          "ref": "Position.html#point",
                          "tf": 16.666666666666664
                        },
                        "Light.html#point": {
                          "ref": "Light.html#point",
                          "tf": 12.5
                        },
                        "Solid.html#point": {
                          "ref": "Solid.html#point",
                          "tf": 12.5
                        },
                        "RelPosition.html": {
                          "ref": "RelPosition.html",
                          "tf": 0.9615384615384616
                        },
                        "RelPosition.html#localPoint": {
                          "ref": "RelPosition.html#localPoint",
                          "tf": 7.142857142857142
                        },
                        "RelPosition.html#point": {
                          "ref": "RelPosition.html#point",
                          "tf": 8.333333333333332
                        },
                        "module-Thurston-Thurston.html#geom": {
                          "ref": "module-Thurston-Thurston.html#geom",
                          "tf": 25
                        },
                        "module-Thurston-Thurston.html#_scene": {
                          "ref": "module-Thurston-Thurston.html#_scene",
                          "tf": 16.666666666666664
                        }
                      }
                    }
                  },
                  "s": {
                    "docs": {},
                    "t": {
                      "docs": {},
                      "o": {
                        "docs": {},
                        "o": {
                          "docs": {},
                          "d": {
                            "docs": {
                              "KeyboardControls.html#update": {
                                "ref": "KeyboardControls.html#update",
                                "tf": 0.4629629629629629
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "i": {
              "docs": {},
              "q": {
                "docs": {},
                "u": {
                  "docs": {
                    "Teleport.html#name": {
                      "ref": "Teleport.html#name",
                      "tf": 4.545454545454546
                    }
                  }
                }
              },
              "f": {
                "docs": {},
                "o": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "m": {
                      "docs": {
                        "module-Thurston-Thurston.html#params": {
                          "ref": "module-Thurston-Thurston.html#params",
                          "tf": 3.571428571428571
                        },
                        "module-Thurston-Thurston.html#buildShaderDataUniforms": {
                          "ref": "module-Thurston-Thurston.html#buildShaderDataUniforms",
                          "tf": 10
                        },
                        "module-Thurston-Thurston.html#buildShaderFragment": {
                          "ref": "module-Thurston-Thurston.html#buildShaderFragment",
                          "tf": 2.083333333333333
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "q": {
          "docs": {},
          "u": {
            "docs": {},
            "o": {
              "docs": {},
              "t": {
                "docs": {},
                "i": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {},
                      "t": {
                        "docs": {
                          "ObjectThurston.html#local": {
                            "ref": "ObjectThurston.html#local",
                            "tf": 7.142857142857142
                          },
                          "Light.html#local": {
                            "ref": "Light.html#local",
                            "tf": 7.142857142857142
                          },
                          "Solid.html#local": {
                            "ref": "Solid.html#local",
                            "tf": 7.142857142857142
                          },
                          "module-Thurston-Thurston.html#subgroup": {
                            "ref": "module-Thurston-Thurston.html#subgroup",
                            "tf": 10
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "x": {
          "docs": {
            "Subgroup.html": {
              "ref": "Subgroup.html",
              "tf": 1.0638297872340425
            }
          },
          "m": {
            "docs": {},
            "l": {
              "docs": {
                "ObjectThurston.html#loadGLSLTemplate": {
                  "ref": "ObjectThurston.html#loadGLSLTemplate",
                  "tf": 10
                },
                "ObjectThurston.html#loadGLSLDefaultTemplate": {
                  "ref": "ObjectThurston.html#loadGLSLDefaultTemplate",
                  "tf": 10
                },
                "Light.html#loadGLSLTemplate": {
                  "ref": "Light.html#loadGLSLTemplate",
                  "tf": 10
                },
                "Light.html#loadGLSLDefaultTemplate": {
                  "ref": "Light.html#loadGLSLDefaultTemplate",
                  "tf": 10
                },
                "Solid.html#loadGLSLTemplate": {
                  "ref": "Solid.html#loadGLSLTemplate",
                  "tf": 10
                },
                "Solid.html#loadGLSLDefaultTemplate": {
                  "ref": "Solid.html#loadGLSLDefaultTemplate",
                  "tf": 10
                }
              }
            }
          }
        },
        "h": {
          "docs": {
            "RelPosition.html": {
              "ref": "RelPosition.html",
              "tf": 1.9230769230769231
            }
          },
          "e": {
            "docs": {},
            "n": {
              "docs": {},
              "c": {
                "docs": {
                  "Position.html#flow": {
                    "ref": "Position.html#flow",
                    "tf": 0.49504950495049505
                  }
                }
              }
            },
            "r": {
              "docs": {},
              "e": {
                "docs": {
                  "Vector.html#applyMatrix4": {
                    "ref": "Vector.html#applyMatrix4",
                    "tf": 1.8518518518518516
                  },
                  "module-Thurston-Thurston.html#chaseCamera": {
                    "ref": "module-Thurston-Thurston.html#chaseCamera",
                    "tf": 2
                  },
                  "module-Thurston-Thurston.html#run": {
                    "ref": "module-Thurston-Thurston.html#run",
                    "tf": 5
                  }
                }
              }
            },
            "a": {
              "docs": {},
              "d": {
                "docs": {},
                "s": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "t": {
                      "docs": {
                        "module-Thurston-Thurston.html#chaseCamera": {
                          "ref": "module-Thurston-Thurston.html#chaseCamera",
                          "tf": 2
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "u": {
            "docs": {},
            "m": {
              "docs": {},
              "a": {
                "docs": {},
                "n": {
                  "docs": {
                    "Vector.html#toLog": {
                      "ref": "Vector.html#toLog",
                      "tf": 4.545454545454546
                    }
                  }
                }
              }
            }
          },
          ",": {
            "docs": {},
            "p": {
              "docs": {
                "RelPosition.html": {
                  "ref": "RelPosition.html",
                  "tf": 0.9615384615384616
                }
              }
            }
          },
          "g": {
            "docs": {
              "RelPosition.html": {
                "ref": "RelPosition.html",
                "tf": 0.9615384615384616
              }
            }
          },
          "^": {
            "2": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.3546099290780142
                }
              }
            },
            "3": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.3546099290780142
                }
              }
            },
            "docs": {}
          },
          "a": {
            "docs": {},
            "n": {
              "docs": {},
              "d": {
                "docs": {},
                "l": {
                  "docs": {
                    "Subgroup.html": {
                      "ref": "Subgroup.html",
                      "tf": 1.0638297872340425
                    },
                    "module-Thurston-Thurston.html#run": {
                      "ref": "module-Thurston-Thurston.html#run",
                      "tf": 5
                    }
                  },
                  "e": {
                    "docs": {},
                    "r": {
                      "docs": {
                        "VRControls.html#onSelectStart": {
                          "ref": "VRControls.html#onSelectStart",
                          "tf": 10
                        },
                        "VRControls.html#onSelectEnd": {
                          "ref": "VRControls.html#onSelectEnd",
                          "tf": 10
                        },
                        "VRControls.html#onSqueezeStart": {
                          "ref": "VRControls.html#onSqueezeStart",
                          "tf": 10
                        },
                        "VRControls.html#onSqueezeEnd": {
                          "ref": "VRControls.html#onSqueezeEnd",
                          "tf": 10
                        },
                        "KeyboardControls.html#onKeyDown": {
                          "ref": "KeyboardControls.html#onKeyDown",
                          "tf": 12.5
                        },
                        "KeyboardControls.html#onKeyUp": {
                          "ref": "KeyboardControls.html#onKeyUp",
                          "tf": 12.5
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "r": {
              "docs": {},
              "i": {
                "docs": {},
                "z": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "module-Thurston-Thurston.html#chaseCamera": {
                          "ref": "module-Thurston-Thurston.html#chaseCamera",
                          "tf": 2
                        },
                        "module-Thurston-Thurston.html#initHorizon": {
                          "ref": "module-Thurston-Thurston.html#initHorizon",
                          "tf": 5.555555555555555
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "w": {
          "docs": {
            "Position.html#flow": {
              "ref": "Position.html#flow",
              "tf": 0.49504950495049505
            },
            "KeyboardControls.html#update": {
              "ref": "KeyboardControls.html#update",
              "tf": 1.3888888888888888
            }
          },
          "r": {
            "docs": {},
            "i": {
              "docs": {},
              "t": {
                "docs": {},
                "t": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "n": {
                      "docs": {
                        "Vector.html": {
                          "ref": "Vector.html",
                          "tf": 3.8461538461538463
                        },
                        "KeyboardControls.html#update": {
                          "ref": "KeyboardControls.html#update",
                          "tf": 0.4629629629629629
                        }
                      }
                    }
                  }
                }
              }
            },
            "a": {
              "docs": {},
              "p": {
                "docs": {
                  "module-Thurston-Thurston.html#run": {
                    "ref": "module-Thurston-Thurston.html#run",
                    "tf": 5
                  }
                }
              }
            }
          },
          "o": {
            "docs": {},
            "r": {
              "docs": {},
              "d": {
                "docs": {
                  "Subgroup.html": {
                    "ref": "Subgroup.html",
                    "tf": 0.3546099290780142
                  },
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              },
              "k": {
                "docs": {
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              }
            }
          },
          "a": {
            "docs": {},
            "n": {
              "docs": {},
              "t": {
                "docs": {
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              }
            }
          },
          "e": {
            "docs": {},
            "l": {
              "docs": {},
              "l": {
                "docs": {
                  "KeyboardControls.html#update": {
                    "ref": "KeyboardControls.html#update",
                    "tf": 0.4629629629629629
                  }
                }
              }
            },
            "b": {
              "docs": {},
              "g": {
                "docs": {},
                "l": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "e": {
                      "docs": {},
                      "n": {
                        "docs": {},
                        "d": {
                          "docs": {},
                          "e": {
                            "docs": {},
                            "r": {
                              "docs": {
                                "module-Thurston-Thurston.html#_renderer": {
                                  "ref": "module-Thurston-Thurston.html#_renderer",
                                  "tf": 33.33333333333333
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "i": {
            "docs": {},
            "n": {
              "docs": {},
              "d": {
                "docs": {},
                "o": {
                  "docs": {},
                  "w": {
                    "docs": {
                      "module-Thurston-Thurston.html#onWindowResize": {
                        "ref": "module-Thurston-Thurston.html#onWindowResize",
                        "tf": 16.666666666666664
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "j": {
          "docs": {},
          "a": {
            "docs": {},
            "v": {
              "docs": {},
              "a": {
                "docs": {},
                "s": {
                  "docs": {},
                  "c": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "i": {
                        "docs": {},
                        "p": {
                          "docs": {},
                          "t": {
                            "docs": {
                              "Solid.html": {
                                "ref": "Solid.html",
                                "tf": 2.631578947368421
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "k": {
          "docs": {},
          "e": {
            "docs": {},
            "e": {
              "docs": {},
              "p": {
                "docs": {
                  "RelPosition.html": {
                    "ref": "RelPosition.html",
                    "tf": 1.9230769230769231
                  },
                  "module-Thurston-Thurston.html#params": {
                    "ref": "module-Thurston-Thurston.html#params",
                    "tf": 3.571428571428571
                  }
                }
              }
            },
            "y": {
              "docs": {
                "KeyboardControls.html#infos": {
                  "ref": "KeyboardControls.html#infos",
                  "tf": 10
                },
                "KeyboardControls.html#onKeyDown": {
                  "ref": "KeyboardControls.html#onKeyDown",
                  "tf": 12.5
                },
                "KeyboardControls.html#onKeyUp": {
                  "ref": "KeyboardControls.html#onKeyUp",
                  "tf": 12.5
                },
                "module-Thurston-Thurston.html#infos": {
                  "ref": "module-Thurston-Thurston.html#infos",
                  "tf": 8.333333333333332
                },
                "module-Thurston-Thurston.html#setParam": {
                  "ref": "module-Thurston-Thurston.html#setParam",
                  "tf": 25
                }
              },
              "b": {
                "docs": {},
                "o": {
                  "docs": {},
                  "a": {
                    "docs": {},
                    "r": {
                      "docs": {},
                      "d": {
                        "docs": {
                          "KeyboardControls.html": {
                            "ref": "KeyboardControls.html",
                            "tf": 5.555555555555555
                          },
                          "KeyboardControls.html#keyboard": {
                            "ref": "KeyboardControls.html#keyboard",
                            "tf": 716.6666666666666
                          },
                          "module-Thurston-Thurston.html#_keyboardControls": {
                            "ref": "module-Thurston-Thurston.html#_keyboardControls",
                            "tf": 25
                          },
                          "module-Thurston-Thurston.html#setKeyboard": {
                            "ref": "module-Thurston-Thurston.html#setKeyboard",
                            "tf": 12.5
                          }
                        },
                        "c": {
                          "docs": {},
                          "o": {
                            "docs": {},
                            "n": {
                              "docs": {},
                              "t": {
                                "docs": {},
                                "r": {
                                  "docs": {},
                                  "o": {
                                    "docs": {},
                                    "l": {
                                      "docs": {
                                        "KeyboardControls.html": {
                                          "ref": "KeyboardControls.html",
                                          "tf": 1900
                                        },
                                        "module-Thurston-Thurston.html#_keyboardControls": {
                                          "ref": "module-Thurston-Thurston.html#_keyboardControls",
                                          "tf": 33.33333333333333
                                        }
                                      },
                                      "s": {
                                        "docs": {},
                                        "#": {
                                          "docs": {},
                                          "k": {
                                            "docs": {},
                                            "e": {
                                              "docs": {},
                                              "y": {
                                                "docs": {},
                                                "b": {
                                                  "docs": {},
                                                  "o": {
                                                    "docs": {},
                                                    "a": {
                                                      "docs": {},
                                                      "r": {
                                                        "docs": {},
                                                        "d": {
                                                          "docs": {
                                                            "KeyboardControls.html#keyboard": {
                                                              "ref": "KeyboardControls.html#keyboard",
                                                              "tf": 1150
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "i": {
                                            "docs": {},
                                            "n": {
                                              "docs": {},
                                              "f": {
                                                "docs": {},
                                                "o": {
                                                  "docs": {
                                                    "KeyboardControls.html#infos": {
                                                      "ref": "KeyboardControls.html#infos",
                                                      "tf": 1150
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "o": {
                                            "docs": {},
                                            "n": {
                                              "docs": {},
                                              "k": {
                                                "docs": {},
                                                "e": {
                                                  "docs": {},
                                                  "y": {
                                                    "docs": {},
                                                    "d": {
                                                      "docs": {},
                                                      "o": {
                                                        "docs": {},
                                                        "w": {
                                                          "docs": {},
                                                          "n": {
                                                            "docs": {
                                                              "KeyboardControls.html#onKeyDown": {
                                                                "ref": "KeyboardControls.html#onKeyDown",
                                                                "tf": 1150
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    },
                                                    "u": {
                                                      "docs": {},
                                                      "p": {
                                                        "docs": {
                                                          "KeyboardControls.html#onKeyUp": {
                                                            "ref": "KeyboardControls.html#onKeyUp",
                                                            "tf": 1150
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          },
                                          "u": {
                                            "docs": {},
                                            "p": {
                                              "docs": {},
                                              "d": {
                                                "docs": {
                                                  "KeyboardControls.html#update": {
                                                    "ref": "KeyboardControls.html#update",
                                                    "tf": 1150
                                                  }
                                                },
                                                "a": {
                                                  "docs": {},
                                                  "t": {
                                                    "docs": {},
                                                    "e": {
                                                      "docs": {},
                                                      "m": {
                                                        "docs": {},
                                                        "o": {
                                                          "docs": {},
                                                          "v": {
                                                            "docs": {},
                                                            "e": {
                                                              "docs": {},
                                                              "m": {
                                                                "docs": {},
                                                                "e": {
                                                                  "docs": {},
                                                                  "n": {
                                                                    "docs": {},
                                                                    "t": {
                                                                      "docs": {},
                                                                      "v": {
                                                                        "docs": {},
                                                                        "e": {
                                                                          "docs": {},
                                                                          "c": {
                                                                            "docs": {},
                                                                            "t": {
                                                                              "docs": {},
                                                                              "o": {
                                                                                "docs": {},
                                                                                "r": {
                                                                                  "docs": {
                                                                                    "KeyboardControls.html#updateMovementVector": {
                                                                                      "ref": "KeyboardControls.html#updateMovementVector",
                                                                                      "tf": 1150
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      },
                                                      "r": {
                                                        "docs": {},
                                                        "o": {
                                                          "docs": {},
                                                          "t": {
                                                            "docs": {},
                                                            "a": {
                                                              "docs": {},
                                                              "t": {
                                                                "docs": {},
                                                                "i": {
                                                                  "docs": {},
                                                                  "o": {
                                                                    "docs": {},
                                                                    "n": {
                                                                      "docs": {},
                                                                      "v": {
                                                                        "docs": {},
                                                                        "e": {
                                                                          "docs": {},
                                                                          "c": {
                                                                            "docs": {},
                                                                            "t": {
                                                                              "docs": {},
                                                                              "o": {
                                                                                "docs": {},
                                                                                "r": {
                                                                                  "docs": {
                                                                                    "KeyboardControls.html#updateRotationVector": {
                                                                                      "ref": "KeyboardControls.html#updateRotationVector",
                                                                                      "tf": 1150
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "z": {
          "docs": {
            "Subgroup.html": {
              "ref": "Subgroup.html",
              "tf": 0.7092198581560284
            }
          },
          "^": {
            "2": {
              "docs": {
                "Subgroup.html": {
                  "ref": "Subgroup.html",
                  "tf": 0.7092198581560284
                }
              }
            },
            "docs": {}
          }
        },
        "_": {
          "docs": {},
          "r": {
            "docs": {},
            "e": {
              "docs": {},
              "n": {
                "docs": {},
                "d": {
                  "docs": {},
                  "e": {
                    "docs": {},
                    "r": {
                      "docs": {
                        "module-Thurston-Thurston.html#_renderer": {
                          "ref": "module-Thurston-Thurston.html#_renderer",
                          "tf": 683.3333333333334
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "c": {
            "docs": {},
            "a": {
              "docs": {},
              "m": {
                "docs": {},
                "e": {
                  "docs": {},
                  "r": {
                    "docs": {},
                    "a": {
                      "docs": {
                        "module-Thurston-Thurston.html#_camera": {
                          "ref": "module-Thurston-Thurston.html#_camera",
                          "tf": 683.3333333333334
                        }
                      }
                    }
                  }
                }
              }
            },
            "l": {
              "docs": {},
              "o": {
                "docs": {},
                "c": {
                  "docs": {},
                  "k": {
                    "docs": {
                      "module-Thurston-Thurston.html#_clock": {
                        "ref": "module-Thurston-Thurston.html#_clock",
                        "tf": 683.3333333333334
                      }
                    }
                  }
                }
              }
            }
          },
          "s": {
            "docs": {},
            "c": {
              "docs": {},
              "e": {
                "docs": {},
                "n": {
                  "docs": {},
                  "e": {
                    "docs": {
                      "module-Thurston-Thurston.html#_scene": {
                        "ref": "module-Thurston-Thurston.html#_scene",
                        "tf": 683.3333333333334
                      }
                    }
                  }
                }
              }
            },
            "o": {
              "docs": {},
              "l": {
                "docs": {},
                "i": {
                  "docs": {},
                  "d": {
                    "docs": {
                      "module-Thurston-Thurston.html#_solids": {
                        "ref": "module-Thurston-Thurston.html#_solids",
                        "tf": 683.3333333333334
                      }
                    }
                  }
                }
              }
            }
          },
          "l": {
            "docs": {},
            "i": {
              "docs": {},
              "g": {
                "docs": {},
                "h": {
                  "docs": {},
                  "t": {
                    "docs": {
                      "module-Thurston-Thurston.html#_lights": {
                        "ref": "module-Thurston-Thurston.html#_lights",
                        "tf": 683.3333333333334
                      }
                    }
                  }
                }
              }
            }
          },
          "m": {
            "docs": {},
            "a": {
              "docs": {},
              "x": {
                "docs": {},
                "l": {
                  "docs": {},
                  "i": {
                    "docs": {},
                    "g": {
                      "docs": {},
                      "h": {
                        "docs": {},
                        "t": {
                          "docs": {},
                          "d": {
                            "docs": {},
                            "i": {
                              "docs": {},
                              "r": {
                                "docs": {
                                  "module-Thurston-Thurston.html#_maxLightDirs": {
                                    "ref": "module-Thurston-Thurston.html#_maxLightDirs",
                                    "tf": 683.3333333333334
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "k": {
            "docs": {},
            "e": {
              "docs": {},
              "y": {
                "docs": {},
                "b": {
                  "docs": {},
                  "o": {
                    "docs": {},
                    "a": {
                      "docs": {},
                      "r": {
                        "docs": {},
                        "d": {
                          "docs": {},
                          "c": {
                            "docs": {},
                            "o": {
                              "docs": {},
                              "n": {
                                "docs": {},
                                "t": {
                                  "docs": {},
                                  "r": {
                                    "docs": {},
                                    "o": {
                                      "docs": {},
                                      "l": {
                                        "docs": {
                                          "module-Thurston-Thurston.html#_keyboardControls": {
                                            "ref": "module-Thurston-Thurston.html#_keyboardControls",
                                            "tf": 683.3333333333334
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "length": 2114
    },
    "corpusTokens": [
      "0",
      "1",
      "3d",
      "4th",
      "_camera",
      "_clock",
      "_keyboardcontrol",
      "_light",
      "_maxlightdir",
      "_render",
      "_scene",
      "_solid",
      "abelian",
      "account",
      "action",
      "actual",
      "ad",
      "add",
      "addeventlisten",
      "additem",
      "advantag",
      "algebra",
      "ambient",
      "anim",
      "appendtitl",
      "appli",
      "applyfac",
      "applyisometri",
      "applymatrix4",
      "argument",
      "array.&lt;light&gt",
      "array.&lt;light&gt;}&gt",
      "array.&lt;object&gt",
      "array.&lt;solid&gt",
      "array.&lt;teleport&gt",
      "assign",
      "associ",
      "assum",
      "async",
      "attach",
      "automat",
      "avail",
      "back",
      "background",
      "bad",
      "befor",
      "between",
      "block",
      "boo",
      "boolean",
      "boost",
      "both",
      "bound",
      "brick",
      "bring",
      "build",
      "buildshaderdatabackground",
      "buildshaderdataconst",
      "buildshaderdataitem",
      "buildshaderdatauniform",
      "buildshaderfrag",
      "buildshadervertex",
      "built",
      "button",
      "call",
      "camera",
      "case",
      "cell",
      "cellboost",
      "chang",
      "chasecamera",
      "check",
      "chosen",
      "class",
      "classnam",
      "clock",
      "clone",
      "code",
      "coincid",
      "collect",
      "color",
      "compar",
      "compon",
      "comput",
      "consid",
      "constant",
      "constructor",
      "contain",
      "control",
      "coordin",
      "copi",
      "correspond",
      "creat",
      "current",
      "d_o",
      "d_og",
      "data",
      "date",
      "debug",
      "decid",
      "declar",
      "default",
      "defin",
      "delta",
      "denot",
      "depend",
      "describ",
      "descript",
      "diffus",
      "dimens",
      "direct",
      "directli",
      "discret",
      "display",
      "distanc",
      "divid",
      "document",
      "dom",
      "domain",
      "done",
      "drag",
      "dynam",
      "e",
      "e1",
      "e2",
      "e3",
      "e^3",
      "each",
      "easi",
      "edit",
      "eight",
      "element",
      "elementari",
      "encod",
      "equal",
      "error",
      "etc",
      "euclidean",
      "event",
      "eventu",
      "everyth",
      "explor",
      "extens",
      "ey",
      "f",
      "f1",
      "f2",
      "f3",
      "face",
      "fake",
      "fals",
      "field",
      "file",
      "find",
      "finit",
      "first",
      "flag",
      "fli",
      "flow",
      "flowfromorigin",
      "flycontrol",
      "follow",
      "form",
      "formal",
      "forward",
      "fragment",
      "frame",
      "function",
      "fundament",
      "g",
      "g',m",
      "g,m",
      "g0",
      "g0,m0",
      "gener",
      "geoemtri",
      "geom",
      "geometri",
      "get",
      "geteyeposit",
      "getinvers",
      "getter",
      "gg",
      "give",
      "given",
      "gl(n",
      "global",
      "glsl",
      "glslbuilddata",
      "glslbuilddatadefault",
      "go",
      "goe",
      "gradient",
      "gram",
      "graphic",
      "group",
      "gt",
      "gui",
      "h",
      "h,p",
      "h^2",
      "h^3",
      "handl",
      "handler",
      "headset",
      "henc",
      "here",
      "hg",
      "horizon",
      "human",
      "i.",
      "id",
      "idea",
      "ident",
      "ignor",
      "imag",
      "implement",
      "implicit",
      "import",
      "inde",
      "independ",
      "index",
      "info",
      "inherit",
      "init",
      "inithorizon",
      "initi",
      "initstat",
      "initthreej",
      "initui",
      "insid",
      "inspir",
      "instanc",
      "instanti",
      "integ",
      "interact",
      "interfac",
      "inv",
      "invcellboost",
      "invers",
      "islight",
      "isom",
      "isometri",
      "isometry#build",
      "isometry#clon",
      "isometry#copi",
      "isometry#equ",
      "isometry#getinvers",
      "isometry#makeinvtransl",
      "isometry#maketransl",
      "isometry#multipli",
      "isometry#premultipli",
      "isometry#reduceerror",
      "isometry#set",
      "isometry#toglsl",
      "issolid",
      "item",
      "item'",
      "javascript",
      "keep",
      "key",
      "keyboard",
      "keyboardcontrol",
      "keyboardcontrols#info",
      "keyboardcontrols#keyboard",
      "keyboardcontrols#onkeydown",
      "keyboardcontrols#onkeyup",
      "keyboardcontrols#upd",
      "keyboardcontrols#updatemovementvector",
      "keyboardcontrols#updaterotationvector",
      "lattic",
      "left",
      "length",
      "letter",
      "level",
      "light",
      "light#classnam",
      "light#color",
      "light#glob",
      "light#glsl",
      "light#glslbuilddata",
      "light#glslbuilddatadefault",
      "light#islight",
      "light#issolid",
      "light#loadglsldefaulttempl",
      "light#loadglsltempl",
      "light#loc",
      "light#maxdir",
      "light#nam",
      "light#point",
      "light#posit",
      "light#shadersourc",
      "light#toglsl",
      "light#uuid",
      "line",
      "linear",
      "list",
      "list:class",
      "list:modul",
      "listen",
      "lister",
      "load",
      "loadglsldefaulttempl",
      "loadglsltempl",
      "local",
      "localpoint",
      "locat",
      "log",
      "look",
      "lower",
      "lt;abstract&gt",
      "lt;async&gt",
      "lt;private&gt",
      "m",
      "m'm",
      "m0",
      "mainli",
      "make",
      "makeinvtransl",
      "maketransl",
      "manifold/orbifold",
      "manual",
      "materi",
      "material#ambi",
      "material#color",
      "material#diffus",
      "material#shini",
      "material#specular",
      "material#toglsl",
      "matric",
      "matrix",
      "matrix4",
      "matter",
      "maxdir",
      "maxim",
      "maxlightdir",
      "measur",
      "member",
      "method",
      "mode",
      "modul",
      "module:thurston",
      "module:thurston~thurston",
      "module:thurston~thurston#_camera",
      "module:thurston~thurston#_clock",
      "module:thurston~thurston#_keyboardcontrol",
      "module:thurston~thurston#_light",
      "module:thurston~thurston#_maxlightdir",
      "module:thurston~thurston#_render",
      "module:thurston~thurston#_scen",
      "module:thurston~thurston#_solid",
      "module:thurston~thurston#addeventlisten",
      "module:thurston~thurston#additem",
      "module:thurston~thurston#anim",
      "module:thurston~thurston#appendtitl",
      "module:thurston~thurston#buildshaderdatabackground",
      "module:thurston~thurston#buildshaderdataconst",
      "module:thurston~thurston#buildshaderdataitem",
      "module:thurston~thurston#buildshaderdatauniform",
      "module:thurston~thurston#buildshaderfrag",
      "module:thurston~thurston#buildshadervertex",
      "module:thurston~thurston#chasecamera",
      "module:thurston~thurston#geom",
      "module:thurston~thurston#geteyeposit",
      "module:thurston~thurston#gui",
      "module:thurston~thurston#info",
      "module:thurston~thurston#inithorizon",
      "module:thurston~thurston#initstat",
      "module:thurston~thurston#initthreej",
      "module:thurston~thurston#initui",
      "module:thurston~thurston#maxlightdir",
      "module:thurston~thurston#onwindowres",
      "module:thurston~thurston#param",
      "module:thurston~thurston#registerparam",
      "module:thurston~thurston#run",
      "module:thurston~thurston#setkeyboard",
      "module:thurston~thurston#setparam",
      "module:thurston~thurston#stat",
      "module:thurston~thurston#subgroup",
      "more",
      "move",
      "movement",
      "multipli",
      "name",
      "need",
      "never",
      "new",
      "nil",
      "non",
      "norm",
      "note",
      "now",
      "number",
      "numer",
      "o(3",
      "object",
      "objectthurston",
      "objectthurston#classnam",
      "objectthurston#glob",
      "objectthurston#glsl",
      "objectthurston#islight",
      "objectthurston#issolid",
      "objectthurston#loadglsldefaulttempl",
      "objectthurston#loadglsltempl",
      "objectthurston#loc",
      "objectthurston#nam",
      "objectthurston#point",
      "objectthurston#posit",
      "objectthurston#shadersourc",
      "objectthurston#toglsl",
      "objectthurston#uuid",
      "observ",
      "obtain",
      "obviou",
      "on",
      "onkeydown",
      "onkeyup",
      "onselectend",
      "onselectstart",
      "onsqueezeend",
      "onsqueezestart",
      "onwindowres",
      "opengl",
      "option",
      "order",
      "orient",
      "origin",
      "otherwis",
      "overload",
      "p",
      "page",
      "pair",
      "par",
      "param",
      "paramet",
      "part",
      "pass",
      "path",
      "perform",
      "person",
      "perspect",
      "perspectivecamera",
      "piec",
      "play",
      "point",
      "point#applyisometri",
      "point#build",
      "point#clon",
      "point#copi",
      "point#equ",
      "point#set",
      "point#toglsl",
      "popul",
      "posit",
      "position#applyfac",
      "position#applyisometri",
      "position#boost",
      "position#clon",
      "position#copi",
      "position#equ",
      "position#fac",
      "position#flow",
      "position#flowfromorigin",
      "position#getinvers",
      "position#multipli",
      "position#point",
      "position#premultipli",
      "position#reduceerror",
      "position#reduceerrorboost",
      "position#reduceerrorfac",
      "position#setboost",
      "position#setfac",
      "position#toglsl",
      "possibl",
      "prefer",
      "premultipli",
      "press",
      "privat",
      "probabl",
      "procedur",
      "product",
      "promis",
      "promise.&lt;array.&lt;string&gt;&gt",
      "promise.&lt;document&gt",
      "promise.&lt;thurston&gt",
      "promise.&lt;void&gt",
      "promise.&lt;{solid",
      "properti",
      "proxi",
      "pull",
      "purpos",
      "quotient",
      "rang",
      "readabl",
      "readm",
      "receiv",
      "recreat",
      "reduc",
      "reduceerror",
      "reduceerrorboost",
      "reduceerrorcellboost",
      "reduceerrorfac",
      "reduceerrorloc",
      "refer",
      "reflect",
      "regist",
      "registerparam",
      "rel",
      "relposit",
      "relposition#applyfac",
      "relposition#cellboost",
      "relposition#clon",
      "relposition#copi",
      "relposition#equ",
      "relposition#flow",
      "relposition#invcellboost",
      "relposition#loc",
      "relposition#localpoint",
      "relposition#point",
      "relposition#reduceerror",
      "relposition#reduceerrorboost",
      "relposition#reduceerrorcellboost",
      "relposition#reduceerrorfac",
      "relposition#reduceerrorloc",
      "relposition#sbgp",
      "relposition#teleport",
      "relposition#toglsl",
      "render",
      "replac",
      "repres",
      "represent",
      "requir",
      "resiz",
      "return",
      "review",
      "right",
      "role",
      "rotat",
      "routin",
      "run",
      "s^2",
      "s^3",
      "same",
      "say",
      "sbgp",
      "scene",
      "schmidt",
      "see",
      "seem",
      "seen",
      "select",
      "semi",
      "send",
      "set",
      "setboost",
      "setfac",
      "setkeyboard",
      "setparam",
      "setup",
      "shader",
      "shadersourc",
      "shini",
      "shouldn't",
      "side",
      "sign",
      "signatur",
      "similar",
      "simplic",
      "simul",
      "sl(2,r",
      "sl2",
      "sol",
      "solid",
      "solid#classnam",
      "solid#glob",
      "solid#glsl",
      "solid#glslbuilddata",
      "solid#glslbuilddatadefault",
      "solid#islight",
      "solid#issolid",
      "solid#loadglsldefaulttempl",
      "solid#loadglsltempl",
      "solid#loc",
      "solid#materi",
      "solid#nam",
      "solid#point",
      "solid#posit",
      "solid#shadersourc",
      "solid#toglsl",
      "solid#uuid",
      "somewher",
      "space",
      "specifi",
      "specular",
      "sphere",
      "split",
      "squeez",
      "start",
      "stat",
      "stay",
      "still",
      "stop",
      "straight",
      "straightforward",
      "strategi",
      "string",
      "structur",
      "subgroup",
      "subgroup#glslbuilddata",
      "subgroup#shadersourc",
      "subgroup#teleport",
      "sure",
      "symbol",
      "take",
      "tangent",
      "teleport",
      "teleport#glsl",
      "teleport#inv",
      "teleport#isom",
      "teleport#nam",
      "teleport#test",
      "teleport#uuid",
      "templat",
      "term",
      "test",
      "this.subgroup.glslbuilddata",
      "those",
      "three.j",
      "through",
      "thu",
      "thurston",
      "thurston'",
      "thurston~thurston",
      "time",
      "titl",
      "togeth",
      "toglsl",
      "tolog",
      "tow",
      "track",
      "translat",
      "true",
      "two",
      "type",
      "typic",
      "u",
      "u1",
      "u2",
      "u3",
      "underli",
      "understood",
      "uniform",
      "uniqu",
      "up",
      "updat",
      "updatemovementvector",
      "updaterotationvector",
      "us",
      "user",
      "uuid",
      "v",
      "v1",
      "v1,v2,v3",
      "v2",
      "v3",
      "valu",
      "vec3",
      "vector",
      "vector#applyfac",
      "vector#applymatrix4",
      "vector#toglsl",
      "vector#tolog",
      "vector3",
      "version",
      "vertex",
      "vr",
      "vrcontrol",
      "vrcontrols#onselectend",
      "vrcontrols#onselectstart",
      "vrcontrols#onsqueezeend",
      "vrcontrols#onsqueezestart",
      "vrcontrols#upd",
      "w",
      "want",
      "webglrender",
      "well",
      "window",
      "word",
      "work",
      "wrap",
      "written",
      "x",
      "xml",
      "z",
      "z^2"
    ],
    "pipeline": [
      "trimmer",
      "stopWordFilter",
      "stemmer"
    ]
  },
  "store": {
    "index.html": {
      "id": "index.html",
      "kind": "readme",
      "title": "Non-euclidean VR",
      "longname": "index",
      "name": "Non-euclidean VR",
      "tags": "index",
      "summary": "First person exploration of Thurston's geoemtries",
      "description": "",
      "body": ""
    },
    "global.html": {
      "id": "global.html",
      "kind": "global",
      "title": "Globals",
      "longname": "global",
      "name": "Globals",
      "tags": "global",
      "summary": "All documented globals.",
      "description": "",
      "body": ""
    },
    "list_class.html": {
      "id": "list_class.html",
      "kind": "list",
      "title": "Classes",
      "longname": "list:class",
      "name": "Classes",
      "tags": "list:class",
      "summary": "All documented classes.",
      "description": "",
      "body": ""
    },
    "list_module.html": {
      "id": "list_module.html",
      "kind": "list",
      "title": "Modules",
      "longname": "list:module",
      "name": "Modules",
      "tags": "list:module",
      "summary": "All documented modules.",
      "description": "",
      "body": ""
    },
    "Isometry.html": {
      "id": "Isometry.html",
      "kind": "class",
      "title": "Isometry",
      "longname": "Isometry",
      "name": "Isometry",
      "tags": "Isometry",
      "summary": "",
      "description": "Isometry of the geometry.",
      "body": ""
    },
    "Isometry.html#build": {
      "id": "Isometry.html#build",
      "kind": "function",
      "title": "&lt;abstract&gt; build()",
      "longname": "Isometry#build",
      "name": "build",
      "tags": "Isometry#build build",
      "summary": "",
      "description": "Fake constructor If no argument is passed, return the identity."
    },
    "Isometry.html#set": {
      "id": "Isometry.html#set",
      "kind": "function",
      "title": "&lt;abstract&gt; set( data ) → {Isometry}",
      "longname": "Isometry#set",
      "name": "set",
      "tags": "Isometry#set set",
      "summary": "",
      "description": "Set the current isometry with the given data."
    },
    "Isometry.html#reduceError": {
      "id": "Isometry.html#reduceError",
      "kind": "function",
      "title": "&lt;abstract&gt; reduceError() → {Isometry}",
      "longname": "Isometry#reduceError",
      "name": "reduceError",
      "tags": "Isometry#reduceError reduceError",
      "summary": "",
      "description": "Reduce the eventual numerical errors of the current isometry (typically Gram-Schmidt)."
    },
    "Isometry.html#multiply": {
      "id": "Isometry.html#multiply",
      "kind": "function",
      "title": "&lt;abstract&gt; multiply( isom ) → {Isometry}",
      "longname": "Isometry#multiply",
      "name": "multiply",
      "tags": "Isometry#multiply multiply",
      "summary": "",
      "description": "Multiply the current isometry by isom on the left, i.e. replace this by this * isom."
    },
    "Isometry.html#premultiply": {
      "id": "Isometry.html#premultiply",
      "kind": "function",
      "title": "&lt;abstract&gt; premultiply( isom ) → {Isometry}",
      "longname": "Isometry#premultiply",
      "name": "premultiply",
      "tags": "Isometry#premultiply premultiply",
      "summary": "",
      "description": "Multiply the current isometry by isom on the right, i.e. replace this by isom * this."
    },
    "Isometry.html#getInverse": {
      "id": "Isometry.html#getInverse",
      "kind": "function",
      "title": "&lt;abstract&gt; getInverse( isom ) → {Isometry}",
      "longname": "Isometry#getInverse",
      "name": "getInverse",
      "tags": "Isometry#getInverse getInverse",
      "summary": "",
      "description": "Set the current isometry to the inverse of isom."
    },
    "Isometry.html#makeTranslation": {
      "id": "Isometry.html#makeTranslation",
      "kind": "function",
      "title": "&lt;abstract&gt; makeTranslation( point ) → {Isometry}",
      "longname": "Isometry#makeTranslation",
      "name": "makeTranslation",
      "tags": "Isometry#makeTranslation makeTranslation",
      "summary": "",
      "description": "Return a preferred isometry sending the origin to the given point (typically in Nil, Sol, SL2, etc)."
    },
    "Isometry.html#makeInvTranslation": {
      "id": "Isometry.html#makeInvTranslation",
      "kind": "function",
      "title": "&lt;abstract&gt; makeInvTranslation( point ) → {Isometry}",
      "longname": "Isometry#makeInvTranslation",
      "name": "makeInvTranslation",
      "tags": "Isometry#makeInvTranslation makeInvTranslation",
      "summary": "",
      "description": "Return a preferred isometry sending the given point to the origin (typically in Nil, Sol, SL2, etc)."
    },
    "Isometry.html#equals": {
      "id": "Isometry.html#equals",
      "kind": "function",
      "title": "&lt;abstract&gt; equals( isom ) → {boolean}",
      "longname": "Isometry#equals",
      "name": "equals",
      "tags": "Isometry#equals equals",
      "summary": "",
      "description": "Check if the current isometry and isom are the same. Mainly for debugging purposes."
    },
    "Isometry.html#clone": {
      "id": "Isometry.html#clone",
      "kind": "function",
      "title": "&lt;abstract&gt; clone() → {Isometry}",
      "longname": "Isometry#clone",
      "name": "clone",
      "tags": "Isometry#clone clone",
      "summary": "",
      "description": "Return a new copy of the current isometry."
    },
    "Isometry.html#copy": {
      "id": "Isometry.html#copy",
      "kind": "function",
      "title": "&lt;abstract&gt; copy( isom ) → {Isometry}",
      "longname": "Isometry#copy",
      "name": "copy",
      "tags": "Isometry#copy copy",
      "summary": "",
      "description": "Set the current isometry with the given isometry"
    },
    "Isometry.html#toGLSL": {
      "id": "Isometry.html#toGLSL",
      "kind": "function",
      "title": "&lt;abstract&gt; toGLSL() → {string}",
      "longname": "Isometry#toGLSL",
      "name": "toGLSL",
      "tags": "Isometry#toGLSL toGLSL",
      "summary": "",
      "description": "Return a block of GLSL code creating the same isometry Used when dynamically building shaders."
    },
    "Point.html": {
      "id": "Point.html",
      "kind": "class",
      "title": "Point",
      "longname": "Point",
      "name": "Point",
      "tags": "Point",
      "summary": "",
      "description": "Point in the geometry.",
      "body": ""
    },
    "Point.html#build": {
      "id": "Point.html#build",
      "kind": "function",
      "title": "&lt;abstract&gt; build()",
      "longname": "Point#build",
      "name": "build",
      "tags": "Point#build build",
      "summary": "",
      "description": "Fake constructor. If no argument is passed, return the origin of the space."
    },
    "Point.html#set": {
      "id": "Point.html#set",
      "kind": "function",
      "title": "&lt;abstract&gt; set( data ) → {Point}",
      "longname": "Point#set",
      "name": "set",
      "tags": "Point#set set",
      "summary": "",
      "description": "Update the current point with the given data."
    },
    "Point.html#applyIsometry": {
      "id": "Point.html#applyIsometry",
      "kind": "function",
      "title": "&lt;abstract&gt; applyIsometry( isom ) → {Point}",
      "longname": "Point#applyIsometry",
      "name": "applyIsometry",
      "tags": "Point#applyIsometry applyIsometry",
      "summary": "",
      "description": "Translate the current point by the given isometry."
    },
    "Point.html#equals": {
      "id": "Point.html#equals",
      "kind": "function",
      "title": "&lt;abstract&gt; equals( point ) → {boolean}",
      "longname": "Point#equals",
      "name": "equals",
      "tags": "Point#equals equals",
      "summary": "",
      "description": "Check if the current point and point are the same. Mainly for debugging purposes."
    },
    "Point.html#clone": {
      "id": "Point.html#clone",
      "kind": "function",
      "title": "&lt;abstract&gt; clone() → {Point}",
      "longname": "Point#clone",
      "name": "clone",
      "tags": "Point#clone clone",
      "summary": "",
      "description": "Return a new copy of the current point."
    },
    "Point.html#copy": {
      "id": "Point.html#copy",
      "kind": "function",
      "title": "&lt;abstract&gt; copy( point ) → {Point}",
      "longname": "Point#copy",
      "name": "copy",
      "tags": "Point#copy copy",
      "summary": "",
      "description": "set the current point with the given point"
    },
    "Point.html#toGLSL": {
      "id": "Point.html#toGLSL",
      "kind": "function",
      "title": "&lt;abstract&gt; toGLSL() → {string}",
      "longname": "Point#toGLSL",
      "name": "toGLSL",
      "tags": "Point#toGLSL toGLSL",
      "summary": "",
      "description": "Return a line of GLSL code creating the same point. Used when dynamically building shaders."
    },
    "ObjectThurston.html": {
      "id": "ObjectThurston.html",
      "kind": "class",
      "title": "&lt;abstract&gt; ObjectThurston",
      "longname": "ObjectThurston",
      "name": "ObjectThurston",
      "tags": "ObjectThurston",
      "summary": "",
      "description": "Generic class for objects in the scene (solids, lights, etc) This class should never be instantiated directly.",
      "body": ""
    },
    "ObjectThurston.html#uuid": {
      "id": "ObjectThurston.html#uuid",
      "kind": "member",
      "title": "uuid :String",
      "longname": "ObjectThurston#uuid",
      "name": "uuid",
      "tags": "ObjectThurston#uuid uuid",
      "summary": "",
      "description": "UUID of this object instance. This gets automatically assigned, so this shouldn't be edited."
    },
    "ObjectThurston.html#glsl": {
      "id": "ObjectThurston.html#glsl",
      "kind": "member",
      "title": "glsl :Object",
      "longname": "ObjectThurston#glsl",
      "name": "glsl",
      "tags": "ObjectThurston#glsl glsl",
      "summary": "",
      "description": "The GLSL code for the item (declaration, signed distance function and gradient)"
    },
    "ObjectThurston.html#position": {
      "id": "ObjectThurston.html#position",
      "kind": "member",
      "title": "position :Position",
      "longname": "ObjectThurston#position",
      "name": "position",
      "tags": "ObjectThurston#position position",
      "summary": "",
      "description": "The position of the object"
    },
    "ObjectThurston.html#global": {
      "id": "ObjectThurston.html#global",
      "kind": "member",
      "title": "global :boolean",
      "longname": "ObjectThurston#global",
      "name": "global",
      "tags": "ObjectThurston#global global",
      "summary": "",
      "description": "Flag: true, if the item is global"
    },
    "ObjectThurston.html#local": {
      "id": "ObjectThurston.html#local",
      "kind": "member",
      "title": "local :boolean",
      "longname": "ObjectThurston#local",
      "name": "local",
      "tags": "ObjectThurston#local local",
      "summary": "",
      "description": "Flag: true, if the item is local (i.e. in a quotient manifold/orbifold)"
    },
    "ObjectThurston.html#shaderSource": {
      "id": "ObjectThurston.html#shaderSource",
      "kind": "member",
      "title": "shaderSource",
      "longname": "ObjectThurston#shaderSource",
      "name": "shaderSource",
      "tags": "ObjectThurston#shaderSource shaderSource",
      "summary": "",
      "description": "Return the path to the shader code of the item"
    },
    "ObjectThurston.html#className": {
      "id": "ObjectThurston.html#className",
      "kind": "member",
      "title": "className",
      "longname": "ObjectThurston#className",
      "name": "className",
      "tags": "ObjectThurston#className className",
      "summary": "",
      "description": "The name of the class (with first letter lower case). Useful to generate the name of items"
    },
    "ObjectThurston.html#name": {
      "id": "ObjectThurston.html#name",
      "kind": "member",
      "title": "name :string",
      "longname": "ObjectThurston#name",
      "name": "name",
      "tags": "ObjectThurston#name name",
      "summary": "",
      "description": "The name of the item. This name is computed (from the id) the first time the getter is called. This getter should not be called before the item has received an id."
    },
    "ObjectThurston.html#point": {
      "id": "ObjectThurston.html#point",
      "kind": "member",
      "title": "point :Point",
      "longname": "ObjectThurston#point",
      "name": "point",
      "tags": "ObjectThurston#point point",
      "summary": "",
      "description": "The underlying point of the item's position"
    },
    "ObjectThurston.html#isLight": {
      "id": "ObjectThurston.html#isLight",
      "kind": "function",
      "title": "isLight() → {boolean}",
      "longname": "ObjectThurston#isLight",
      "name": "isLight",
      "tags": "ObjectThurston#isLight isLight",
      "summary": "",
      "description": "Say if the item is a light"
    },
    "ObjectThurston.html#isSolid": {
      "id": "ObjectThurston.html#isSolid",
      "kind": "function",
      "title": "isSolid() → {boolean}",
      "longname": "ObjectThurston#isSolid",
      "name": "isSolid",
      "tags": "ObjectThurston#isSolid isSolid",
      "summary": "",
      "description": "Say if the item is an solid"
    },
    "ObjectThurston.html#toGLSL": {
      "id": "ObjectThurston.html#toGLSL",
      "kind": "function",
      "title": "toGLSL() → {string}",
      "longname": "ObjectThurston#toGLSL",
      "name": "toGLSL",
      "tags": "ObjectThurston#toGLSL toGLSL",
      "summary": "",
      "description": "Return a block of GLSL code recreating the same item as an Item"
    },
    "ObjectThurston.html#loadGLSLTemplate": {
      "id": "ObjectThurston.html#loadGLSLTemplate",
      "kind": "function",
      "title": "&lt;async&gt; loadGLSLTemplate() → {Promise.&lt;Document&gt;}",
      "longname": "ObjectThurston#loadGLSLTemplate",
      "name": "loadGLSLTemplate",
      "tags": "ObjectThurston#loadGLSLTemplate loadGLSLTemplate",
      "summary": "",
      "description": "Load the XML file containing the GLSL blocks of code. Return the XML as a DOM"
    },
    "ObjectThurston.html#loadGLSLDefaultTemplate": {
      "id": "ObjectThurston.html#loadGLSLDefaultTemplate",
      "kind": "function",
      "title": "&lt;async&gt; loadGLSLDefaultTemplate() → {Promise.&lt;Document&gt;}",
      "longname": "ObjectThurston#loadGLSLDefaultTemplate",
      "name": "loadGLSLDefaultTemplate",
      "tags": "ObjectThurston#loadGLSLDefaultTemplate loadGLSLDefaultTemplate",
      "summary": "",
      "description": "Load the XML file containing the GLSL blocks of code. Return the XML as a DOM"
    },
    "Teleport.html": {
      "id": "Teleport.html",
      "kind": "class",
      "title": "Teleport",
      "longname": "Teleport",
      "name": "Teleport",
      "tags": "Teleport",
      "summary": "",
      "description": "Elementary brick of a discrete subgroups. We describe a discrete subgroups by a set of generators. Each generator is seen as a \"teleportation\" (to move a point back in the fundamental domain). A Teleport encode both the generator, and the test to decide if a teleportation is needed.",
      "body": ""
    },
    "Teleport.html#test": {
      "id": "Teleport.html#test",
      "kind": "member",
      "title": "test :function",
      "longname": "Teleport#test",
      "name": "test",
      "tags": "Teleport#test test",
      "summary": "",
      "description": "A test saying if a teleportation is needed The test is a function with the signature Point -&gt; boolean The test returns true if a teleportation is needed and false otherwise."
    },
    "Teleport.html#isom": {
      "id": "Teleport.html#isom",
      "kind": "member",
      "title": "isom :Isometry",
      "longname": "Teleport#isom",
      "name": "isom",
      "tags": "Teleport#isom isom",
      "summary": "",
      "description": "The isometry to apply when teleporting"
    },
    "Teleport.html#inv": {
      "id": "Teleport.html#inv",
      "kind": "member",
      "title": "inv :Isometry",
      "longname": "Teleport#inv",
      "name": "inv",
      "tags": "Teleport#inv inv",
      "summary": "",
      "description": "The inverse of the teleporting isometry"
    },
    "Teleport.html#uuid": {
      "id": "Teleport.html#uuid",
      "kind": "member",
      "title": "uuid :String",
      "longname": "Teleport#uuid",
      "name": "uuid",
      "tags": "Teleport#uuid uuid",
      "summary": "",
      "description": "UUID of this object instance. This gets automatically assigned, so this shouldn't be edited."
    },
    "Teleport.html#name": {
      "id": "Teleport.html#name",
      "kind": "member",
      "title": "name :string",
      "longname": "Teleport#name",
      "name": "name",
      "tags": "Teleport#name name",
      "summary": "",
      "description": "A unique name, build from the uuid (private version). This gets automatically assigned, so this shouldn't be edited."
    },
    "Teleport.html#glsl": {
      "id": "Teleport.html#glsl",
      "kind": "member",
      "title": "glsl :string",
      "longname": "Teleport#glsl",
      "name": "glsl",
      "tags": "Teleport#glsl glsl",
      "summary": "",
      "description": "The GLSL code to perform the test. (To be automatically setup at the subgroup level.)"
    },
    "Position.html": {
      "id": "Position.html",
      "kind": "class",
      "title": "Position",
      "longname": "Position",
      "name": "Position",
      "tags": "Position",
      "summary": "",
      "description": "Location and facing (of the observer, an object, etc).",
      "body": ""
    },
    "Position.html#boost": {
      "id": "Position.html#boost",
      "kind": "member",
      "title": "boost :Isometry",
      "longname": "Position#boost",
      "name": "boost",
      "tags": "Position#boost boost",
      "summary": "",
      "description": "The isometry component of the position."
    },
    "Position.html#facing": {
      "id": "Position.html#facing",
      "kind": "member",
      "title": "facing :Matrix4",
      "longname": "Position#facing",
      "name": "facing",
      "tags": "Position#facing facing",
      "summary": "",
      "description": "The O(3) component of the position."
    },
    "Position.html#point": {
      "id": "Position.html#point",
      "kind": "member",
      "title": "point",
      "longname": "Position#point",
      "name": "point",
      "tags": "Position#point point",
      "summary": "",
      "description": "Return the underlying point"
    },
    "Position.html#setBoost": {
      "id": "Position.html#setBoost",
      "kind": "function",
      "title": "setBoost( isom ) → {Position}",
      "longname": "Position#setBoost",
      "name": "setBoost",
      "tags": "Position#setBoost setBoost",
      "summary": "",
      "description": "Set the boost part of the position."
    },
    "Position.html#setFacing": {
      "id": "Position.html#setFacing",
      "kind": "function",
      "title": "setFacing( facing ) → {Position}",
      "longname": "Position#setFacing",
      "name": "setFacing",
      "tags": "Position#setFacing setFacing",
      "summary": "",
      "description": "Set the facing part of the position."
    },
    "Position.html#reduceErrorBoost": {
      "id": "Position.html#reduceErrorBoost",
      "kind": "function",
      "title": "reduceErrorBoost() → {Position}",
      "longname": "Position#reduceErrorBoost",
      "name": "reduceErrorBoost",
      "tags": "Position#reduceErrorBoost reduceErrorBoost",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current boost."
    },
    "Position.html#reduceErrorFacing": {
      "id": "Position.html#reduceErrorFacing",
      "kind": "function",
      "title": "reduceErrorFacing() → {Position}",
      "longname": "Position#reduceErrorFacing",
      "name": "reduceErrorFacing",
      "tags": "Position#reduceErrorFacing reduceErrorFacing",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current facing."
    },
    "Position.html#reduceError": {
      "id": "Position.html#reduceError",
      "kind": "function",
      "title": "reduceError() → {Position}",
      "longname": "Position#reduceError",
      "name": "reduceError",
      "tags": "Position#reduceError reduceError",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current position."
    },
    "Position.html#applyIsometry": {
      "id": "Position.html#applyIsometry",
      "kind": "function",
      "title": "applyIsometry( isom ) → {Position}",
      "longname": "Position#applyIsometry",
      "name": "applyIsometry",
      "tags": "Position#applyIsometry applyIsometry",
      "summary": "",
      "description": "Translate the current position by isom (left action of the isometry group G on the set of positions)."
    },
    "Position.html#applyFacing": {
      "id": "Position.html#applyFacing",
      "kind": "function",
      "title": "applyFacing( matrix ) → {Position}",
      "longname": "Position#applyFacing",
      "name": "applyFacing",
      "tags": "Position#applyFacing applyFacing",
      "summary": "",
      "description": "Rotate the facing by m (right action of O(3) in the set of positions)."
    },
    "Position.html#multiply": {
      "id": "Position.html#multiply",
      "kind": "function",
      "title": "multiply( position ) → {Position}",
      "longname": "Position#multiply",
      "name": "multiply",
      "tags": "Position#multiply multiply",
      "summary": "",
      "description": "Multiply the current position (g0,m0) on the right by the given position (g,m), i.e. return (g0 * g, m * m0)"
    },
    "Position.html#premultiply": {
      "id": "Position.html#premultiply",
      "kind": "function",
      "title": "premultiply( position ) → {Position}",
      "longname": "Position#premultiply",
      "name": "premultiply",
      "tags": "Position#premultiply premultiply",
      "summary": "",
      "description": "Multiply the current position (g0,m0) on the left by the given position (g,m), i.e. return (g * g0, m0 * m)"
    },
    "Position.html#getInverse": {
      "id": "Position.html#getInverse",
      "kind": "function",
      "title": "getInverse( position ) → {Position}",
      "longname": "Position#getInverse",
      "name": "getInverse",
      "tags": "Position#getInverse getInverse",
      "summary": "",
      "description": "Set the current position with the inverse of the given position"
    },
    "Position.html#flowFromOrigin": {
      "id": "Position.html#flowFromOrigin",
      "kind": "function",
      "title": "&lt;abstract&gt; flowFromOrigin( v ) → {Position}",
      "longname": "Position#flowFromOrigin",
      "name": "flowFromOrigin",
      "tags": "Position#flowFromOrigin flowFromOrigin",
      "summary": "",
      "description": "Replace the current position, by the one obtained by flow the initial position (id, id) in the direction v (given in the reference frame)."
    },
    "Position.html#flow": {
      "id": "Position.html#flow",
      "kind": "function",
      "title": "flow( v ) → {Position}",
      "longname": "Position#flow",
      "name": "flow",
      "tags": "Position#flow flow",
      "summary": "",
      "description": "Flow the current position. v is the pull back at the origin by the position of the direction in which we flow The time by which we flow is the norm of v. The procedure goes as follows. Let e = (e1, e2, e3) be the reference frame in the tangent space at the origin. Assume that the current position is (g,m) The vector v = (v1, v2, v3) is given in the observer frame, that is v = d_og m u, where u = u1 . e1 + u2 . e2 + u3 . e3. We first pull back the data at the origin by the inverse of g. We compute the position (g',m') obtained from the initial position (id, id) by flowing in the direction w = m u. This position send the frame m e to d_o g' . m ' . m . e We move everything back using g, so that the new observer frame is d_o (gg') . m' . m e. Hence the new position (gg', m'm) is obtained by multiplying (g,m) and (g',m')"
    },
    "Position.html#equals": {
      "id": "Position.html#equals",
      "kind": "function",
      "title": "equals( position ) → {boolean}",
      "longname": "Position#equals",
      "name": "equals",
      "tags": "Position#equals equals",
      "summary": "",
      "description": "Check if the current position and position are the same."
    },
    "Position.html#clone": {
      "id": "Position.html#clone",
      "kind": "function",
      "title": "clone() → {Position}",
      "longname": "Position#clone",
      "name": "clone",
      "tags": "Position#clone clone",
      "summary": "",
      "description": "Return a new copy of the current position."
    },
    "Position.html#copy": {
      "id": "Position.html#copy",
      "kind": "function",
      "title": "copy( position ) → {Position}",
      "longname": "Position#copy",
      "name": "copy",
      "tags": "Position#copy copy",
      "summary": "",
      "description": "Set the current position with the given one."
    },
    "Position.html#toGLSL": {
      "id": "Position.html#toGLSL",
      "kind": "function",
      "title": "toGLSL() → {string}",
      "longname": "Position#toGLSL",
      "name": "toGLSL",
      "tags": "Position#toGLSL toGLSL",
      "summary": "",
      "description": "Return a line of GLSL code creating the same position. Used when dynamically building shaders."
    },
    "Light.html": {
      "id": "Light.html",
      "kind": "class",
      "title": "Light",
      "longname": "Light",
      "name": "Light",
      "tags": "Light",
      "summary": "",
      "description": "Generic class for point lights in the scene.",
      "body": ""
    },
    "Light.html#uuid": {
      "id": "Light.html#uuid",
      "kind": "member",
      "title": "uuid :String",
      "longname": "Light#uuid",
      "name": "uuid",
      "tags": "Light#uuid uuid",
      "summary": "",
      "description": "UUID of this object instance. This gets automatically assigned, so this shouldn't be edited."
    },
    "Light.html#glsl": {
      "id": "Light.html#glsl",
      "kind": "member",
      "title": "glsl :Object",
      "longname": "Light#glsl",
      "name": "glsl",
      "tags": "Light#glsl glsl",
      "summary": "",
      "description": "The GLSL code for the item (declaration, signed distance function and gradient)"
    },
    "Light.html#position": {
      "id": "Light.html#position",
      "kind": "member",
      "title": "position :Position",
      "longname": "Light#position",
      "name": "position",
      "tags": "Light#position position",
      "summary": "",
      "description": "The position of the object"
    },
    "Light.html#global": {
      "id": "Light.html#global",
      "kind": "member",
      "title": "global :boolean",
      "longname": "Light#global",
      "name": "global",
      "tags": "Light#global global",
      "summary": "",
      "description": "Flag: true, if the item is global"
    },
    "Light.html#local": {
      "id": "Light.html#local",
      "kind": "member",
      "title": "local :boolean",
      "longname": "Light#local",
      "name": "local",
      "tags": "Light#local local",
      "summary": "",
      "description": "Flag: true, if the item is local (i.e. in a quotient manifold/orbifold)"
    },
    "Light.html#shaderSource": {
      "id": "Light.html#shaderSource",
      "kind": "member",
      "title": "shaderSource",
      "longname": "Light#shaderSource",
      "name": "shaderSource",
      "tags": "Light#shaderSource shaderSource",
      "summary": "",
      "description": "Return the path to the shader code of the item"
    },
    "Light.html#className": {
      "id": "Light.html#className",
      "kind": "member",
      "title": "className",
      "longname": "Light#className",
      "name": "className",
      "tags": "Light#className className",
      "summary": "",
      "description": "The name of the class (with first letter lower case). Useful to generate the name of items"
    },
    "Light.html#color": {
      "id": "Light.html#color",
      "kind": "member",
      "title": "color :Color",
      "longname": "Light#color",
      "name": "color",
      "tags": "Light#color color",
      "summary": "",
      "description": "Color of the light"
    },
    "Light.html#maxDirs": {
      "id": "Light.html#maxDirs",
      "kind": "member",
      "title": "maxDirs",
      "longname": "Light#maxDirs",
      "name": "maxDirs",
      "tags": "Light#maxDirs maxDirs",
      "summary": "",
      "description": "Maximal number of directions returned at each point"
    },
    "Light.html#name": {
      "id": "Light.html#name",
      "kind": "member",
      "title": "name :string",
      "longname": "Light#name",
      "name": "name",
      "tags": "Light#name name",
      "summary": "",
      "description": "The name of the item. This name is computed (from the id) the first time the getter is called. This getter should not be called before the item has received an id."
    },
    "Light.html#point": {
      "id": "Light.html#point",
      "kind": "member",
      "title": "point :Point",
      "longname": "Light#point",
      "name": "point",
      "tags": "Light#point point",
      "summary": "",
      "description": "The underlying point of the item's position"
    },
    "Light.html#isLight": {
      "id": "Light.html#isLight",
      "kind": "function",
      "title": "isLight() → {boolean}",
      "longname": "Light#isLight",
      "name": "isLight",
      "tags": "Light#isLight isLight",
      "summary": "",
      "description": "Say if the item is a light"
    },
    "Light.html#isSolid": {
      "id": "Light.html#isSolid",
      "kind": "function",
      "title": "isSolid() → {boolean}",
      "longname": "Light#isSolid",
      "name": "isSolid",
      "tags": "Light#isSolid isSolid",
      "summary": "",
      "description": "Say if the item is an objects"
    },
    "Light.html#toGLSL": {
      "id": "Light.html#toGLSL",
      "kind": "function",
      "title": "toGLSL() → {string}",
      "longname": "Light#toGLSL",
      "name": "toGLSL",
      "tags": "Light#toGLSL toGLSL",
      "summary": "",
      "description": "Return a block of GLSL code recreating the same light as a Light"
    },
    "Light.html#glslBuildData": {
      "id": "Light.html#glslBuildData",
      "kind": "function",
      "title": "&lt;async&gt; glslBuildData( globals ) → {Promise.&lt;void&gt;}",
      "longname": "Light#glslBuildData",
      "name": "glslBuildData",
      "tags": "Light#glslBuildData glslBuildData",
      "summary": "",
      "description": "build the GLSL code relative to the item (declaration, signed distance function and gradient)"
    },
    "Light.html#glslBuildDataDefault": {
      "id": "Light.html#glslBuildDataDefault",
      "kind": "function",
      "title": "&lt;async&gt; glslBuildDataDefault( globals, blocks ) → {Promise.&lt;void&gt;}",
      "longname": "Light#glslBuildDataDefault",
      "name": "glslBuildDataDefault",
      "tags": "Light#glslBuildDataDefault glslBuildDataDefault",
      "summary": "",
      "description": "Build the GLSL blocks listed in blocks using the default templates"
    },
    "Light.html#loadGLSLTemplate": {
      "id": "Light.html#loadGLSLTemplate",
      "kind": "function",
      "title": "&lt;async&gt; loadGLSLTemplate() → {Promise.&lt;Document&gt;}",
      "longname": "Light#loadGLSLTemplate",
      "name": "loadGLSLTemplate",
      "tags": "Light#loadGLSLTemplate loadGLSLTemplate",
      "summary": "",
      "description": "Load the XML file containing the GLSL blocks of code. Return the XML as a DOM"
    },
    "Light.html#loadGLSLDefaultTemplate": {
      "id": "Light.html#loadGLSLDefaultTemplate",
      "kind": "function",
      "title": "&lt;async&gt; loadGLSLDefaultTemplate() → {Promise.&lt;Document&gt;}",
      "longname": "Light#loadGLSLDefaultTemplate",
      "name": "loadGLSLDefaultTemplate",
      "tags": "Light#loadGLSLDefaultTemplate loadGLSLDefaultTemplate",
      "summary": "",
      "description": "Load the XML file containing the GLSL blocks of code. Return the XML as a DOM"
    },
    "Solid.html": {
      "id": "Solid.html",
      "kind": "class",
      "title": "Solid",
      "longname": "Solid",
      "name": "Solid",
      "tags": "Solid",
      "summary": "",
      "description": "Generic class for objects in the scene The class is named Solid, as Object is a built-in name in Javascript This class should never be instantiated directly. Classes that inherit from Object can be instantiated.",
      "body": ""
    },
    "Solid.html#uuid": {
      "id": "Solid.html#uuid",
      "kind": "member",
      "title": "uuid :String",
      "longname": "Solid#uuid",
      "name": "uuid",
      "tags": "Solid#uuid uuid",
      "summary": "",
      "description": "UUID of this object instance. This gets automatically assigned, so this shouldn't be edited."
    },
    "Solid.html#glsl": {
      "id": "Solid.html#glsl",
      "kind": "member",
      "title": "glsl :Object",
      "longname": "Solid#glsl",
      "name": "glsl",
      "tags": "Solid#glsl glsl",
      "summary": "",
      "description": "The GLSL code for the item (declaration, signed distance function and gradient)"
    },
    "Solid.html#position": {
      "id": "Solid.html#position",
      "kind": "member",
      "title": "position :Position",
      "longname": "Solid#position",
      "name": "position",
      "tags": "Solid#position position",
      "summary": "",
      "description": "The position of the object"
    },
    "Solid.html#global": {
      "id": "Solid.html#global",
      "kind": "member",
      "title": "global :boolean",
      "longname": "Solid#global",
      "name": "global",
      "tags": "Solid#global global",
      "summary": "",
      "description": "Flag: true, if the item is global"
    },
    "Solid.html#local": {
      "id": "Solid.html#local",
      "kind": "member",
      "title": "local :boolean",
      "longname": "Solid#local",
      "name": "local",
      "tags": "Solid#local local",
      "summary": "",
      "description": "Flag: true, if the item is local (i.e. in a quotient manifold/orbifold)"
    },
    "Solid.html#material": {
      "id": "Solid.html#material",
      "kind": "member",
      "title": "material :Material",
      "longname": "Solid#material",
      "name": "material",
      "tags": "Solid#material material",
      "summary": "",
      "description": "Material of the solid"
    },
    "Solid.html#shaderSource": {
      "id": "Solid.html#shaderSource",
      "kind": "member",
      "title": "shaderSource",
      "longname": "Solid#shaderSource",
      "name": "shaderSource",
      "tags": "Solid#shaderSource shaderSource",
      "summary": "",
      "description": "Return the path to the shader code of the item"
    },
    "Solid.html#className": {
      "id": "Solid.html#className",
      "kind": "member",
      "title": "className",
      "longname": "Solid#className",
      "name": "className",
      "tags": "Solid#className className",
      "summary": "",
      "description": "The name of the class (with first letter lower case). Useful to generate the name of items"
    },
    "Solid.html#name": {
      "id": "Solid.html#name",
      "kind": "member",
      "title": "name :string",
      "longname": "Solid#name",
      "name": "name",
      "tags": "Solid#name name",
      "summary": "",
      "description": "The name of the item. This name is computed (from the id) the first time the getter is called. This getter should not be called before the item has received an id."
    },
    "Solid.html#point": {
      "id": "Solid.html#point",
      "kind": "member",
      "title": "point :Point",
      "longname": "Solid#point",
      "name": "point",
      "tags": "Solid#point point",
      "summary": "",
      "description": "The underlying point of the item's position"
    },
    "Solid.html#isLight": {
      "id": "Solid.html#isLight",
      "kind": "function",
      "title": "isLight() → {boolean}",
      "longname": "Solid#isLight",
      "name": "isLight",
      "tags": "Solid#isLight isLight",
      "summary": "",
      "description": "Say if the item is a light"
    },
    "Solid.html#isSolid": {
      "id": "Solid.html#isSolid",
      "kind": "function",
      "title": "isSolid() → {boolean}",
      "longname": "Solid#isSolid",
      "name": "isSolid",
      "tags": "Solid#isSolid isSolid",
      "summary": "",
      "description": "Say if the item is an objects"
    },
    "Solid.html#toGLSL": {
      "id": "Solid.html#toGLSL",
      "kind": "function",
      "title": "toGLSL() → {string}",
      "longname": "Solid#toGLSL",
      "name": "toGLSL",
      "tags": "Solid#toGLSL toGLSL",
      "summary": "",
      "description": "Return a block of GLSL code recreating the same solid as a Solid"
    },
    "Solid.html#glslBuildData": {
      "id": "Solid.html#glslBuildData",
      "kind": "function",
      "title": "&lt;async&gt; glslBuildData( globals ) → {Promise.&lt;void&gt;}",
      "longname": "Solid#glslBuildData",
      "name": "glslBuildData",
      "tags": "Solid#glslBuildData glslBuildData",
      "summary": "",
      "description": "build the GLSL code relative to the item (declaration, signed distance function and gradient)"
    },
    "Solid.html#glslBuildDataDefault": {
      "id": "Solid.html#glslBuildDataDefault",
      "kind": "function",
      "title": "&lt;async&gt; glslBuildDataDefault( globals, blocks ) → {Promise.&lt;void&gt;}",
      "longname": "Solid#glslBuildDataDefault",
      "name": "glslBuildDataDefault",
      "tags": "Solid#glslBuildDataDefault glslBuildDataDefault",
      "summary": "",
      "description": "Build the GLSL blocks listed in blocks using the default templates"
    },
    "Solid.html#loadGLSLTemplate": {
      "id": "Solid.html#loadGLSLTemplate",
      "kind": "function",
      "title": "&lt;async&gt; loadGLSLTemplate() → {Promise.&lt;Document&gt;}",
      "longname": "Solid#loadGLSLTemplate",
      "name": "loadGLSLTemplate",
      "tags": "Solid#loadGLSLTemplate loadGLSLTemplate",
      "summary": "",
      "description": "Load the XML file containing the GLSL blocks of code. Return the XML as a DOM"
    },
    "Solid.html#loadGLSLDefaultTemplate": {
      "id": "Solid.html#loadGLSLDefaultTemplate",
      "kind": "function",
      "title": "&lt;async&gt; loadGLSLDefaultTemplate() → {Promise.&lt;Document&gt;}",
      "longname": "Solid#loadGLSLDefaultTemplate",
      "name": "loadGLSLDefaultTemplate",
      "tags": "Solid#loadGLSLDefaultTemplate loadGLSLDefaultTemplate",
      "summary": "",
      "description": "Load the XML file containing the GLSL blocks of code. Return the XML as a DOM"
    },
    "Vector.html": {
      "id": "Vector.html",
      "kind": "class",
      "title": "Vector",
      "longname": "Vector",
      "name": "Vector",
      "tags": "Vector",
      "summary": "",
      "description": "Tangent vector at the origin written in the reference frame. Are available form three.js: all the linear algebra the length of a vector",
      "body": ""
    },
    "Vector.html#toLog": {
      "id": "Vector.html#toLog",
      "kind": "function",
      "title": "toLog() → {string}",
      "longname": "Vector#toLog",
      "name": "toLog",
      "tags": "Vector#toLog toLog",
      "summary": "",
      "description": "Add a method to Three.js Vector3. Return a human-readable version of the vector (for debugging purpose)"
    },
    "Vector.html#applyMatrix4": {
      "id": "Vector.html#applyMatrix4",
      "kind": "function",
      "title": "applyMatrix4( m ) → {Vector3}",
      "longname": "Vector#applyMatrix4",
      "name": "applyMatrix4",
      "tags": "Vector#applyMatrix4 applyMatrix4",
      "summary": "",
      "description": "Overload Three.js applyMatrix4. Indeed Three.js considers the Vector3 as a 3D point It multiplies the vector (with an implicit 1 in the 4th dimension) and m, and divides by perspective. Here the data represents a vector, thus the implicit 4th coordinate is 0"
    },
    "Vector.html#applyFacing": {
      "id": "Vector.html#applyFacing",
      "kind": "function",
      "title": "applyFacing( position ) → {Vector}",
      "longname": "Vector#applyFacing",
      "name": "applyFacing",
      "tags": "Vector#applyFacing applyFacing",
      "summary": "",
      "description": "Rotate the current vector by the facing component of the position. This method is geometry independent as the coordinates of the vector are given in a chosen reference frame. Only the reference frame depends on the geometry."
    },
    "Vector.html#toGLSL": {
      "id": "Vector.html#toGLSL",
      "kind": "function",
      "title": "toGLSL() → {string}",
      "longname": "Vector#toGLSL",
      "name": "toGLSL",
      "tags": "Vector#toGLSL toGLSL",
      "summary": "",
      "description": "Add a method to Three.js Vector3. Return a block of GLSL code recreating the same vector as a vec3"
    },
    "RelPosition.html": {
      "id": "RelPosition.html",
      "kind": "class",
      "title": "RelPosition",
      "longname": "RelPosition",
      "name": "RelPosition",
      "tags": "RelPosition",
      "summary": "",
      "description": "Relative position. A general position is represented as a pair (h,p) where h (cellBoost) is an Isometry representing an element of a discrete subgroups p (local) is a Position The frame represented by the relative position is the image by h of the frame represented by the position p We split the isometry part (hg) in two pieces. The idea is to g should gives a position in the fundamental domain of the (implicit) underlying lattice. This will keep the coordinates of g in a bounded range. For simplicity we also keep track of the inverse of the cellBoost.",
      "body": ""
    },
    "RelPosition.html#local": {
      "id": "RelPosition.html#local",
      "kind": "member",
      "title": "local :Position",
      "longname": "RelPosition#local",
      "name": "local",
      "tags": "RelPosition#local local",
      "summary": "",
      "description": "the local position"
    },
    "RelPosition.html#cellBoost": {
      "id": "RelPosition.html#cellBoost",
      "kind": "member",
      "title": "cellBoost :Isometry",
      "longname": "RelPosition#cellBoost",
      "name": "cellBoost",
      "tags": "RelPosition#cellBoost cellBoost",
      "summary": "",
      "description": "the \"discrete\" component of the isometry par of the boost"
    },
    "RelPosition.html#invCellBoost": {
      "id": "RelPosition.html#invCellBoost",
      "kind": "member",
      "title": "invCellBoost :Isometry",
      "longname": "RelPosition#invCellBoost",
      "name": "invCellBoost",
      "tags": "RelPosition#invCellBoost invCellBoost",
      "summary": "",
      "description": "the inverse of cellBoost"
    },
    "RelPosition.html#sbgp": {
      "id": "RelPosition.html#sbgp",
      "kind": "member",
      "title": "sbgp :Subgroup",
      "longname": "RelPosition#sbgp",
      "name": "sbgp",
      "tags": "RelPosition#sbgp sbgp",
      "summary": "",
      "description": "the isometry component of the position inside the fundamental domain"
    },
    "RelPosition.html#localPoint": {
      "id": "RelPosition.html#localPoint",
      "kind": "member",
      "title": "localPoint :Point",
      "longname": "RelPosition#localPoint",
      "name": "localPoint",
      "tags": "RelPosition#localPoint localPoint",
      "summary": "",
      "description": "The underlying local point (i.e. ignoring the cell boost)"
    },
    "RelPosition.html#point": {
      "id": "RelPosition.html#point",
      "kind": "member",
      "title": "point :Point",
      "longname": "RelPosition#point",
      "name": "point",
      "tags": "RelPosition#point point",
      "summary": "",
      "description": "The underlying point (taking into account the cell boost)"
    },
    "RelPosition.html#reduceErrorBoost": {
      "id": "RelPosition.html#reduceErrorBoost",
      "kind": "function",
      "title": "reduceErrorBoost() → {RelPosition}",
      "longname": "RelPosition#reduceErrorBoost",
      "name": "reduceErrorBoost",
      "tags": "RelPosition#reduceErrorBoost reduceErrorBoost",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current boost."
    },
    "RelPosition.html#reduceErrorFacing": {
      "id": "RelPosition.html#reduceErrorFacing",
      "kind": "function",
      "title": "reduceErrorFacing() → {RelPosition}",
      "longname": "RelPosition#reduceErrorFacing",
      "name": "reduceErrorFacing",
      "tags": "RelPosition#reduceErrorFacing reduceErrorFacing",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current facing."
    },
    "RelPosition.html#reduceErrorLocal": {
      "id": "RelPosition.html#reduceErrorLocal",
      "kind": "function",
      "title": "reduceErrorLocal() → {RelPosition}",
      "longname": "RelPosition#reduceErrorLocal",
      "name": "reduceErrorLocal",
      "tags": "RelPosition#reduceErrorLocal reduceErrorLocal",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current facing."
    },
    "RelPosition.html#reduceErrorCellBoost": {
      "id": "RelPosition.html#reduceErrorCellBoost",
      "kind": "function",
      "title": "reduceErrorCellBoost() → {RelPosition}",
      "longname": "RelPosition#reduceErrorCellBoost",
      "name": "reduceErrorCellBoost",
      "tags": "RelPosition#reduceErrorCellBoost reduceErrorCellBoost",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current boost."
    },
    "RelPosition.html#reduceError": {
      "id": "RelPosition.html#reduceError",
      "kind": "function",
      "title": "reduceError() → {RelPosition}",
      "longname": "RelPosition#reduceError",
      "name": "reduceError",
      "tags": "RelPosition#reduceError reduceError",
      "summary": "",
      "description": "Reduce the eventual numerical error of the current position."
    },
    "RelPosition.html#applyFacing": {
      "id": "RelPosition.html#applyFacing",
      "kind": "function",
      "title": "applyFacing( matrix ) → {RelPosition}",
      "longname": "RelPosition#applyFacing",
      "name": "applyFacing",
      "tags": "RelPosition#applyFacing applyFacing",
      "summary": "",
      "description": "Rotate the facing by m (right action of O(3) in the set of positions)."
    },
    "RelPosition.html#teleport": {
      "id": "RelPosition.html#teleport",
      "kind": "function",
      "title": "teleport() → {RelPosition}",
      "longname": "RelPosition#teleport",
      "name": "teleport",
      "tags": "RelPosition#teleport teleport",
      "summary": "",
      "description": "Apply if needed a teleportation to bring back the local boos in the fundamental domain"
    },
    "RelPosition.html#flow": {
      "id": "RelPosition.html#flow",
      "kind": "function",
      "title": "flow( v ) → {RelPosition}",
      "longname": "RelPosition#flow",
      "name": "flow",
      "tags": "RelPosition#flow flow",
      "summary": "",
      "description": "Flow the current position. v is the pull back at the origin by the position of the direction in which we flow The time by which we flow is the norm of v This method makes sure that the boost stays in the fundamental domain"
    },
    "RelPosition.html#equals": {
      "id": "RelPosition.html#equals",
      "kind": "function",
      "title": "equals( position ) → {boolean}",
      "longname": "RelPosition#equals",
      "name": "equals",
      "tags": "RelPosition#equals equals",
      "summary": "",
      "description": "Check if the current position and position are the same. Mainly for debugging purposes"
    },
    "RelPosition.html#clone": {
      "id": "RelPosition.html#clone",
      "kind": "function",
      "title": "clone() → {RelPosition}",
      "longname": "RelPosition#clone",
      "name": "clone",
      "tags": "RelPosition#clone clone",
      "summary": "",
      "description": "Return a new copy of the current position."
    },
    "RelPosition.html#copy": {
      "id": "RelPosition.html#copy",
      "kind": "function",
      "title": "copy( position ) → {RelPosition}",
      "longname": "RelPosition#copy",
      "name": "copy",
      "tags": "RelPosition#copy copy",
      "summary": "",
      "description": "Set the current position with the given position."
    },
    "RelPosition.html#toGLSL": {
      "id": "RelPosition.html#toGLSL",
      "kind": "function",
      "title": "toGLSL() → {string}",
      "longname": "RelPosition#toGLSL",
      "name": "toGLSL",
      "tags": "RelPosition#toGLSL toGLSL",
      "summary": "",
      "description": "Return a line of GLSL code creating the same position. Used when dynamically building shaders."
    },
    "Material.html": {
      "id": "Material.html",
      "kind": "class",
      "title": "Material",
      "longname": "Material",
      "name": "Material",
      "tags": "Material",
      "summary": "",
      "description": "Material for objects in the scene",
      "body": ""
    },
    "Material.html#color": {
      "id": "Material.html#color",
      "kind": "member",
      "title": "color :Color",
      "longname": "Material#color",
      "name": "color",
      "tags": "Material#color color",
      "summary": "",
      "description": "Color of the material"
    },
    "Material.html#ambient": {
      "id": "Material.html#ambient",
      "kind": "member",
      "title": "ambient :number",
      "longname": "Material#ambient",
      "name": "ambient",
      "tags": "Material#ambient ambient",
      "summary": "",
      "description": "ambient reflection constant"
    },
    "Material.html#diffuse": {
      "id": "Material.html#diffuse",
      "kind": "member",
      "title": "diffuse :number",
      "longname": "Material#diffuse",
      "name": "diffuse",
      "tags": "Material#diffuse diffuse",
      "summary": "",
      "description": "diffuse reflection constant"
    },
    "Material.html#specular": {
      "id": "Material.html#specular",
      "kind": "member",
      "title": "specular :number",
      "longname": "Material#specular",
      "name": "specular",
      "tags": "Material#specular specular",
      "summary": "",
      "description": "specular reflection constant"
    },
    "Material.html#shininess": {
      "id": "Material.html#shininess",
      "kind": "member",
      "title": "shininess :number",
      "longname": "Material#shininess",
      "name": "shininess",
      "tags": "Material#shininess shininess",
      "summary": "",
      "description": "shininess reflection constant"
    },
    "Material.html#toGLSL": {
      "id": "Material.html#toGLSL",
      "kind": "function",
      "title": "toGLSL() → {string}",
      "longname": "Material#toGLSL",
      "name": "toGLSL",
      "tags": "Material#toGLSL toGLSL",
      "summary": "",
      "description": "Return a line of GLSL code creating the same material Used when dynamically building shaders."
    },
    "Subgroup.html": {
      "id": "Subgroup.html",
      "kind": "class",
      "title": "Subgroup",
      "longname": "Subgroup",
      "name": "Subgroup",
      "tags": "Subgroup",
      "summary": "",
      "description": "We describe a discrete subgroups by a set of generator. Each generator is seen as a teleportation (to move a point back in the fundamental domain). Thus a discrete subgroups is described by a list of teleportations. The order of those teleportations is the order in which the teleportation are performed. This plays an important role if the discrete subgroups is not abelian. A possible extension would be to implement a symbolic representation of the elements in the subgroup. For the lattices we implemented in E^3, S^3, S^2 x E, Nil and Sol this is probably easy. Indeed E^3, the lattice will be a semi-direct product of Z^2 by a finite group. S^3 the lattice is a finite group S^2 x E the lattice is the product of a finite group and Z Nil and Sol, the lattices we used are semi-direct product of Z^2 and Z In those case we still need to define our own structures : OpenGL does not handle integer matrices for instance. For H^3, H^2 x E and SL(2,R) this is not that obvious : OpenGL does not seem to handle strings. One possibility would be to find a representations of those groups in GL(n, A) where A is a number field. We could define our structures to handle formally this number field (probably not too bad in terms of performances) And then matrices in this number field. The advantage (compare to a word representation) are the following: Going from the symbolic representation to the actual Isometry would be straightforward. Checking the equality of tow elements in the lattice should be straight forward.",
      "body": ""
    },
    "Subgroup.html#teleports": {
      "id": "Subgroup.html#teleports",
      "kind": "member",
      "title": "teleports :Array.&lt;Teleport&gt;",
      "longname": "Subgroup#teleports",
      "name": "teleports",
      "tags": "Subgroup#teleports teleports",
      "summary": "",
      "description": "The list of teleports \"generating\" the subgroups. The order matters (see the class description)."
    },
    "Subgroup.html#shaderSource": {
      "id": "Subgroup.html#shaderSource",
      "kind": "member",
      "title": "shaderSource :string",
      "longname": "Subgroup#shaderSource",
      "name": "shaderSource",
      "tags": "Subgroup#shaderSource shaderSource",
      "summary": "",
      "description": "The path to a GLSL file, implementing the teleportations tests. The teleportations should be lister in the same order on the GLSL side."
    },
    "Subgroup.html#glslBuildData": {
      "id": "Subgroup.html#glslBuildData",
      "kind": "function",
      "title": "&lt;async&gt; glslBuildData() → {Promise.&lt;void&gt;}",
      "longname": "Subgroup#glslBuildData",
      "name": "glslBuildData",
      "tags": "Subgroup#glslBuildData glslBuildData",
      "summary": "",
      "description": "Goes through all the teleportations in the discrete subgroup and build the GLSL code performing the associated test."
    },
    "VRControls.html": {
      "id": "VRControls.html",
      "kind": "class",
      "title": "VRControls",
      "longname": "VRControls",
      "name": "VRControls",
      "tags": "VRControls",
      "summary": "",
      "description": "Implements controls to fly in the geometry using the VR controllers. The squeeze button is used to drag (and rotate) the scene. The select button is used to move in the direction of the controller This is inspired from Three.js FlyControls",
      "body": ""
    },
    "VRControls.html#update": {
      "id": "VRControls.html#update",
      "kind": "member",
      "title": "update :function",
      "longname": "VRControls#update",
      "name": "update",
      "tags": "VRControls#update update",
      "summary": "",
      "description": "Function to update the position"
    },
    "VRControls.html#onSelectStart": {
      "id": "VRControls.html#onSelectStart",
      "kind": "function",
      "title": "onSelectStart()",
      "longname": "VRControls#onSelectStart",
      "name": "onSelectStart",
      "tags": "VRControls#onSelectStart onSelectStart",
      "summary": "",
      "description": "Event handler when the user starts selecting"
    },
    "VRControls.html#onSelectEnd": {
      "id": "VRControls.html#onSelectEnd",
      "kind": "function",
      "title": "onSelectEnd()",
      "longname": "VRControls#onSelectEnd",
      "name": "onSelectEnd",
      "tags": "VRControls#onSelectEnd onSelectEnd",
      "summary": "",
      "description": "Event handler when the user stops selecting"
    },
    "VRControls.html#onSqueezeStart": {
      "id": "VRControls.html#onSqueezeStart",
      "kind": "function",
      "title": "onSqueezeStart()",
      "longname": "VRControls#onSqueezeStart",
      "name": "onSqueezeStart",
      "tags": "VRControls#onSqueezeStart onSqueezeStart",
      "summary": "",
      "description": "Event handler when the user starts squeezing"
    },
    "VRControls.html#onSqueezeEnd": {
      "id": "VRControls.html#onSqueezeEnd",
      "kind": "function",
      "title": "onSqueezeEnd()",
      "longname": "VRControls#onSqueezeEnd",
      "name": "onSqueezeEnd",
      "tags": "VRControls#onSqueezeEnd onSqueezeEnd",
      "summary": "",
      "description": "Event handler when the user stops squeezing"
    },
    "KeyboardControls.html": {
      "id": "KeyboardControls.html",
      "kind": "class",
      "title": "KeyboardControls",
      "longname": "KeyboardControls",
      "name": "KeyboardControls",
      "tags": "KeyboardControls",
      "summary": "",
      "description": "Implements controls to fly in the geometry using the keyboard. This is inspired from Three.js FlyControls",
      "body": ""
    },
    "KeyboardControls.html#keyboard": {
      "id": "KeyboardControls.html#keyboard",
      "kind": "member",
      "title": "keyboard :string",
      "longname": "KeyboardControls#keyboard",
      "name": "keyboard",
      "tags": "KeyboardControls#keyboard keyboard",
      "summary": "",
      "description": "The keyboard used for the controls"
    },
    "KeyboardControls.html#infos": {
      "id": "KeyboardControls.html#infos",
      "kind": "member",
      "title": "infos :function",
      "longname": "KeyboardControls#infos",
      "name": "infos",
      "tags": "KeyboardControls#infos infos",
      "summary": "",
      "description": "Function called when pressing the info key"
    },
    "KeyboardControls.html#onKeyDown": {
      "id": "KeyboardControls.html#onKeyDown",
      "kind": "function",
      "title": "onKeyDown( event )",
      "longname": "KeyboardControls#onKeyDown",
      "name": "onKeyDown",
      "tags": "KeyboardControls#onKeyDown onKeyDown",
      "summary": "",
      "description": "Event handler when a key is pressed"
    },
    "KeyboardControls.html#onKeyUp": {
      "id": "KeyboardControls.html#onKeyUp",
      "kind": "function",
      "title": "onKeyUp( event )",
      "longname": "KeyboardControls#onKeyUp",
      "name": "onKeyUp",
      "tags": "KeyboardControls#onKeyUp onKeyUp",
      "summary": "",
      "description": "Event handler when a key is pressed"
    },
    "KeyboardControls.html#updateMovementVector": {
      "id": "KeyboardControls.html#updateMovementVector",
      "kind": "function",
      "title": "updateMovementVector()",
      "longname": "KeyboardControls#updateMovementVector",
      "name": "updateMovementVector",
      "tags": "KeyboardControls#updateMovementVector updateMovementVector",
      "summary": "",
      "description": "Update the movement vector"
    },
    "KeyboardControls.html#updateRotationVector": {
      "id": "KeyboardControls.html#updateRotationVector",
      "kind": "function",
      "title": "updateRotationVector()",
      "longname": "KeyboardControls#updateRotationVector",
      "name": "updateRotationVector",
      "tags": "KeyboardControls#updateRotationVector updateRotationVector",
      "summary": "",
      "description": "Update the rotation vector"
    },
    "KeyboardControls.html#update": {
      "id": "KeyboardControls.html#update",
      "kind": "function",
      "title": "update( delta )",
      "longname": "KeyboardControls#update",
      "name": "update",
      "tags": "KeyboardControls#update update",
      "summary": "",
      "description": "Function to update the position Assume that the current position is (g,m) where g is the boost, i.e. subgroup element * local boost m is the facing, i.e. an element of O(3) Denote by a the Matrix4 representing the Three.js camera orientation, understood as an element of O(3) as well. Denote by e = (e1, e2, e3) the reference frame in the tangent space at the origin. Then the frame at p = go attach to the camera is f = d_og . m . a . e That is the camera is looking at the direction -f3 = - d_og . m . a . e3 Assume now that we want to move in the direction of v = (v1,v2,v3) where the vector is given in the frame f, i.e. v = v1. f1 + v2 . f2 + v3. f3. We need to flow the current position in the direction w, where w corresponds to v written in the \"position frame\", i.e. d_og . m . e. In other words w = a . u, where u = v1 . e1 + v2 . e2 + v3 . e3. Note that we do not change the camera orientation. A similar strategy works for the rotations."
    },
    "module-Thurston-Thurston.html": {
      "id": "module-Thurston-Thurston.html",
      "kind": "class",
      "title": "Thurston~Thurston",
      "longname": "module:Thurston~Thurston",
      "name": "Thurston",
      "tags": "module:Thurston~Thurston",
      "summary": "",
      "description": "Class used to create a scene in the specified geometry",
      "body": ""
    },
    "module-Thurston-Thurston.html#geom": {
      "id": "module-Thurston-Thurston.html#geom",
      "kind": "member",
      "title": "geom :Object",
      "longname": "module:Thurston~Thurston#geom",
      "name": "geom",
      "tags": "module:Thurston~Thurston#geom geom",
      "summary": "",
      "description": "The underlying geometry"
    },
    "module-Thurston-Thurston.html#subgroup": {
      "id": "module-Thurston-Thurston.html#subgroup",
      "kind": "member",
      "title": "subgroup :Subgroup",
      "longname": "module:Thurston~Thurston#subgroup",
      "name": "subgroup",
      "tags": "module:Thurston~Thurston#subgroup subgroup",
      "summary": "",
      "description": "The discrete subgroup defining a quotient manifold/orbifold"
    },
    "module-Thurston-Thurston.html#params": {
      "id": "module-Thurston-Thurston.html#params",
      "kind": "member",
      "title": "params :Object",
      "longname": "module:Thurston~Thurston#params",
      "name": "params",
      "tags": "module:Thurston~Thurston#params params",
      "summary": "",
      "description": "The list of parameters of the object. Interactions with params go through a proxy to automatically keep the list of uniforms up to date."
    },
    "module-Thurston-Thurston.html#_renderer": {
      "id": "module-Thurston-Thurston.html#_renderer",
      "kind": "member",
      "title": "&lt;private&gt; _renderer :WebGLRenderer",
      "longname": "module:Thurston~Thurston#_renderer",
      "name": "_renderer",
      "tags": "module:Thurston~Thurston#_renderer _renderer",
      "summary": "",
      "description": "The renderer used by Three.js"
    },
    "module-Thurston-Thurston.html#_camera": {
      "id": "module-Thurston-Thurston.html#_camera",
      "kind": "member",
      "title": "&lt;private&gt; _camera :PerspectiveCamera",
      "longname": "module:Thurston~Thurston#_camera",
      "name": "_camera",
      "tags": "module:Thurston~Thurston#_camera _camera",
      "summary": "",
      "description": "The Three.js camera"
    },
    "module-Thurston-Thurston.html#_scene": {
      "id": "module-Thurston-Thurston.html#_scene",
      "kind": "member",
      "title": "&lt;private&gt; _scene :Scene",
      "longname": "module:Thurston~Thurston#_scene",
      "name": "_scene",
      "tags": "module:Thurston~Thurston#_scene _scene",
      "summary": "",
      "description": "The underlying Three.js scene"
    },
    "module-Thurston-Thurston.html#_solids": {
      "id": "module-Thurston-Thurston.html#_solids",
      "kind": "member",
      "title": "&lt;private&gt; _solids :Array.&lt;Solid&gt;",
      "longname": "module:Thurston~Thurston#_solids",
      "name": "_solids",
      "tags": "module:Thurston~Thurston#_solids _solids",
      "summary": "",
      "description": "The list of solids in the non-euclidean scene"
    },
    "module-Thurston-Thurston.html#_lights": {
      "id": "module-Thurston-Thurston.html#_lights",
      "kind": "member",
      "title": "&lt;private&gt; _lights :Array.&lt;Light&gt;",
      "longname": "module:Thurston~Thurston#_lights",
      "name": "_lights",
      "tags": "module:Thurston~Thurston#_lights _lights",
      "summary": "",
      "description": "The list of lights in the non-euclidean scene"
    },
    "module-Thurston-Thurston.html#_maxLightDirs": {
      "id": "module-Thurston-Thurston.html#_maxLightDirs",
      "kind": "member",
      "title": "&lt;private&gt; _maxLightDirs :number",
      "longname": "module:Thurston~Thurston#_maxLightDirs",
      "name": "_maxLightDirs",
      "tags": "module:Thurston~Thurston#_maxLightDirs _maxLightDirs",
      "summary": "",
      "description": "The maximal number of lights directions Computed automatically from the list of lights."
    },
    "module-Thurston-Thurston.html#_keyboardControls": {
      "id": "module-Thurston-Thurston.html#_keyboardControls",
      "kind": "member",
      "title": "&lt;private&gt; _keyboardControls :KeyboardControls",
      "longname": "module:Thurston~Thurston#_keyboardControls",
      "name": "_keyboardControls",
      "tags": "module:Thurston~Thurston#_keyboardControls _keyboardControls",
      "summary": "",
      "description": "The keyboard controls"
    },
    "module-Thurston-Thurston.html#_clock": {
      "id": "module-Thurston-Thurston.html#_clock",
      "kind": "member",
      "title": "&lt;private&gt; _clock :Clock",
      "longname": "module:Thurston~Thurston#_clock",
      "name": "_clock",
      "tags": "module:Thurston~Thurston#_clock _clock",
      "summary": "",
      "description": "A clock to measure the time between two call of animate"
    },
    "module-Thurston-Thurston.html#gui": {
      "id": "module-Thurston-Thurston.html#gui",
      "kind": "member",
      "title": "gui :GUI",
      "longname": "module:Thurston~Thurston#gui",
      "name": "gui",
      "tags": "module:Thurston~Thurston#gui gui",
      "summary": "",
      "description": "The graphical user interface"
    },
    "module-Thurston-Thurston.html#stats": {
      "id": "module-Thurston-Thurston.html#stats",
      "kind": "member",
      "title": "stats :Stats",
      "longname": "module:Thurston~Thurston#stats",
      "name": "stats",
      "tags": "module:Thurston~Thurston#stats stats",
      "summary": "",
      "description": "The performance stats"
    },
    "module-Thurston-Thurston.html#maxLightDirs": {
      "id": "module-Thurston-Thurston.html#maxLightDirs",
      "kind": "member",
      "title": "maxLightDirs :number",
      "longname": "module:Thurston~Thurston#maxLightDirs",
      "name": "maxLightDirs",
      "tags": "module:Thurston~Thurston#maxLightDirs maxLightDirs",
      "summary": "",
      "description": "The maximal number of light directions"
    },
    "module-Thurston-Thurston.html#chaseCamera": {
      "id": "module-Thurston-Thurston.html#chaseCamera",
      "kind": "member",
      "title": "chaseCamera",
      "longname": "module:Thurston~Thurston#chaseCamera",
      "name": "chaseCamera",
      "tags": "module:Thurston~Thurston#chaseCamera chaseCamera",
      "summary": "",
      "description": "If the camera moved (most likely because VR headset updated its position), then we update both the Three.js scene (by moving the horizon sphere) and the non-euclidean one (by changing the position). The eye positions are not updated here. This should be done manually somewhere else."
    },
    "module-Thurston-Thurston.html#infos": {
      "id": "module-Thurston-Thurston.html#infos",
      "kind": "function",
      "title": "infos()",
      "longname": "module:Thurston~Thurston#infos",
      "name": "infos",
      "tags": "module:Thurston~Thurston#infos infos",
      "summary": "",
      "description": "Data displayed in the log, when the info key is pressed."
    },
    "module-Thurston-Thurston.html#registerParam": {
      "id": "module-Thurston-Thurston.html#registerParam",
      "kind": "function",
      "title": "registerParam( name, pass, type ) → {Thurston}",
      "longname": "module:Thurston~Thurston#registerParam",
      "name": "registerParam",
      "tags": "module:Thurston~Thurston#registerParam registerParam",
      "summary": "",
      "description": "Register a new parameter to PARAMS"
    },
    "module-Thurston-Thurston.html#setParams": {
      "id": "module-Thurston-Thurston.html#setParams",
      "kind": "function",
      "title": "setParams( params ) → {Thurston}",
      "longname": "module:Thurston~Thurston#setParams",
      "name": "setParams",
      "tags": "module:Thurston~Thurston#setParams setParams",
      "summary": "",
      "description": "Set the given options."
    },
    "module-Thurston-Thurston.html#setParam": {
      "id": "module-Thurston-Thurston.html#setParam",
      "kind": "function",
      "title": "setParam( key, value ) → {Thurston}",
      "longname": "module:Thurston~Thurston#setParam",
      "name": "setParam",
      "tags": "module:Thurston~Thurston#setParam setParam",
      "summary": "",
      "description": "Set the given option."
    },
    "module-Thurston-Thurston.html#addItem": {
      "id": "module-Thurston-Thurston.html#addItem",
      "kind": "function",
      "title": "addItem() → {Thurston}",
      "longname": "module:Thurston~Thurston#addItem",
      "name": "addItem",
      "tags": "module:Thurston~Thurston#addItem addItem",
      "summary": "",
      "description": "Adding an item to the scene."
    },
    "module-Thurston-Thurston.html#addItems": {
      "id": "module-Thurston-Thurston.html#addItems",
      "kind": "function",
      "title": "addItems() → {Thurston}",
      "longname": "module:Thurston~Thurston#addItems",
      "name": "addItems",
      "tags": "module:Thurston~Thurston#addItems addItems",
      "summary": "",
      "description": "Adding a list of item to the scene."
    },
    "module-Thurston-Thurston.html#getEyePositions": {
      "id": "module-Thurston-Thurston.html#getEyePositions",
      "kind": "function",
      "title": "getEyePositions()",
      "longname": "module:Thurston~Thurston#getEyePositions",
      "name": "getEyePositions",
      "tags": "module:Thurston~Thurston#getEyePositions getEyePositions",
      "summary": "",
      "description": "Return the position of the left and right eye, computed from the current position. If the VR mode is not on, then both eye coincide with the observer position."
    },
    "module-Thurston-Thurston.html#appendTitle": {
      "id": "module-Thurston-Thurston.html#appendTitle",
      "kind": "function",
      "title": "appendTitle()",
      "longname": "module:Thurston~Thurston#appendTitle",
      "name": "appendTitle",
      "tags": "module:Thurston~Thurston#appendTitle appendTitle",
      "summary": "",
      "description": "add the name of the geometry to the title of the page"
    },
    "module-Thurston-Thurston.html#setKeyboard": {
      "id": "module-Thurston-Thurston.html#setKeyboard",
      "kind": "function",
      "title": "setKeyboard( value )",
      "longname": "module:Thurston~Thurston#setKeyboard",
      "name": "setKeyboard",
      "tags": "module:Thurston~Thurston#setKeyboard setKeyboard",
      "summary": "",
      "description": "Set the keyboard used in the controls"
    },
    "module-Thurston-Thurston.html#initUI": {
      "id": "module-Thurston-Thurston.html#initUI",
      "kind": "function",
      "title": "initUI() → {Thurston}",
      "longname": "module:Thurston~Thurston#initUI",
      "name": "initUI",
      "tags": "module:Thurston~Thurston#initUI initUI",
      "summary": "",
      "description": "Initialize the graphic user interface"
    },
    "module-Thurston-Thurston.html#initThreeJS": {
      "id": "module-Thurston-Thurston.html#initThreeJS",
      "kind": "function",
      "title": "initThreeJS()",
      "longname": "module:Thurston~Thurston#initThreeJS",
      "name": "initThreeJS",
      "tags": "module:Thurston~Thurston#initThreeJS initThreeJS",
      "summary": "",
      "description": "Setup the Three.js scene"
    },
    "module-Thurston-Thurston.html#initStats": {
      "id": "module-Thurston-Thurston.html#initStats",
      "kind": "function",
      "title": "initStats() → {Thurston}",
      "longname": "module:Thurston~Thurston#initStats",
      "name": "initStats",
      "tags": "module:Thurston~Thurston#initStats initStats",
      "summary": "",
      "description": "Initialize the performance stats"
    },
    "module-Thurston-Thurston.html#buildShaderVertex": {
      "id": "module-Thurston-Thurston.html#buildShaderVertex",
      "kind": "function",
      "title": "&lt;async&gt; buildShaderVertex() → {string}",
      "longname": "module:Thurston~Thurston#buildShaderVertex",
      "name": "buildShaderVertex",
      "tags": "module:Thurston~Thurston#buildShaderVertex buildShaderVertex",
      "summary": "",
      "description": "Build the vertex shader from templates files."
    },
    "module-Thurston-Thurston.html#buildShaderDataConstants": {
      "id": "module-Thurston-Thurston.html#buildShaderDataConstants",
      "kind": "function",
      "title": "buildShaderDataConstants() → {Array.&lt;Object&gt;}",
      "longname": "module:Thurston~Thurston#buildShaderDataConstants",
      "name": "buildShaderDataConstants",
      "tags": "module:Thurston~Thurston#buildShaderDataConstants buildShaderDataConstants",
      "summary": "",
      "description": "Collect all the parameters that will be passed to the shader as constants"
    },
    "module-Thurston-Thurston.html#buildShaderDataUniforms": {
      "id": "module-Thurston-Thurston.html#buildShaderDataUniforms",
      "kind": "function",
      "title": "buildShaderDataUniforms() → {Array.&lt;Object&gt;}",
      "longname": "module:Thurston~Thurston#buildShaderDataUniforms",
      "name": "buildShaderDataUniforms",
      "tags": "module:Thurston~Thurston#buildShaderDataUniforms buildShaderDataUniforms",
      "summary": "",
      "description": "Collect all the parameters that will be passed to the shader as uniforms"
    },
    "module-Thurston-Thurston.html#buildShaderDataBackground": {
      "id": "module-Thurston-Thurston.html#buildShaderDataBackground",
      "kind": "function",
      "title": "&lt;async&gt; buildShaderDataBackground() → {Promise.&lt;Array.&lt;string&gt;&gt;}",
      "longname": "module:Thurston~Thurston#buildShaderDataBackground",
      "name": "buildShaderDataBackground",
      "tags": "module:Thurston~Thurston#buildShaderDataBackground buildShaderDataBackground",
      "summary": "",
      "description": "Return the list of all \"background\" blocks of GLSL code which are required for items and subgroup."
    },
    "module-Thurston-Thurston.html#buildShaderDataItems": {
      "id": "module-Thurston-Thurston.html#buildShaderDataItems",
      "kind": "function",
      "title": "&lt;async&gt; buildShaderDataItems() → {Promise.&lt;{solids: Array.&lt;Solid&gt;, lights: Array.&lt;Light&gt;}&gt;}",
      "longname": "module:Thurston~Thurston#buildShaderDataItems",
      "name": "buildShaderDataItems",
      "tags": "module:Thurston~Thurston#buildShaderDataItems buildShaderDataItems",
      "summary": "",
      "description": "Review all the items in the scene and setup their glsl property Return the solids and lights as lists"
    },
    "module-Thurston-Thurston.html#buildShaderFragment": {
      "id": "module-Thurston-Thurston.html#buildShaderFragment",
      "kind": "function",
      "title": "&lt;async&gt; buildShaderFragment() → {string}",
      "longname": "module:Thurston~Thurston#buildShaderFragment",
      "name": "buildShaderFragment",
      "tags": "module:Thurston~Thurston#buildShaderFragment buildShaderFragment",
      "summary": "",
      "description": "Build the fragment shader from templates files. The data used to populate the templates are build by the functions buildShaderDataConstants (constants) buildShaderDataUniforms (uniforms) buildShaderDataBackground (background routines for the items and the subgroup) buildShaderDataItems (items) this.subgroup.glslBuildData (subgroup)"
    },
    "module-Thurston-Thurston.html#initHorizon": {
      "id": "module-Thurston-Thurston.html#initHorizon",
      "kind": "function",
      "title": "&lt;async&gt; initHorizon() → {Promise.&lt;Thurston&gt;}",
      "longname": "module:Thurston~Thurston#initHorizon",
      "name": "initHorizon",
      "tags": "module:Thurston~Thurston#initHorizon initHorizon",
      "summary": "",
      "description": "Init the horizon of the Three.js seen (with its shaders) This cannot be done in the constructor as it is an async function."
    },
    "module-Thurston-Thurston.html#animate": {
      "id": "module-Thurston-Thurston.html#animate",
      "kind": "function",
      "title": "animate()",
      "longname": "module:Thurston~Thurston#animate",
      "name": "animate",
      "tags": "module:Thurston~Thurston#animate animate",
      "summary": "",
      "description": "Animates the simulation"
    },
    "module-Thurston-Thurston.html#run": {
      "id": "module-Thurston-Thurston.html#run",
      "kind": "function",
      "title": "run()",
      "longname": "module:Thurston~Thurston#run",
      "name": "run",
      "tags": "module:Thurston~Thurston#run run",
      "summary": "",
      "description": "Wrap together initialization and animation We handle the promise here so that the function is no more async"
    },
    "module-Thurston-Thurston.html#onWindowResize": {
      "id": "module-Thurston-Thurston.html#onWindowResize",
      "kind": "function",
      "title": "onWindowResize( event )",
      "longname": "module:Thurston~Thurston#onWindowResize",
      "name": "onWindowResize",
      "tags": "module:Thurston~Thurston#onWindowResize onWindowResize",
      "summary": "",
      "description": "Action when the window is resized"
    },
    "module-Thurston-Thurston.html#addEventListeners": {
      "id": "module-Thurston-Thurston.html#addEventListeners",
      "kind": "function",
      "title": "addEventListeners()",
      "longname": "module:Thurston~Thurston#addEventListeners",
      "name": "addEventListeners",
      "tags": "module:Thurston~Thurston#addEventListeners addEventListeners",
      "summary": "",
      "description": "Register all the event listeners"
    },
    "module-Thurston.html": {
      "id": "module-Thurston.html",
      "kind": "module",
      "title": "Thurston",
      "longname": "module:Thurston",
      "name": "Thurston",
      "tags": "module:Thurston",
      "summary": "",
      "description": "Module used to define and render a scene in one of the eight Thurston geometries.",
      "body": ""
    }
  }
};