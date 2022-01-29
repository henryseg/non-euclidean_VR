import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
/******/ var __webpack_modules__ = ({

/***/ 9397:
/***/ ((__unused_webpack_module, exports) => {

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (Hogan) {
  // Setup regex  assignments
  // remove whitespace according to Mustache spec
  var rIsWhitespace = /\S/,
      rQuot = /\"/g,
      rNewline =  /\n/g,
      rCr = /\r/g,
      rSlash = /\\/g,
      rLineSep = /\u2028/,
      rParagraphSep = /\u2029/;

  Hogan.tags = {
    '#': 1, '^': 2, '<': 3, '$': 4,
    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
    '{': 10, '&': 11, '_t': 12
  };

  Hogan.scan = function scan(text, delimiters) {
    var len = text.length,
        IN_TEXT = 0,
        IN_TAG_TYPE = 1,
        IN_TAG = 2,
        state = IN_TEXT,
        tagType = null,
        tag = null,
        buf = '',
        tokens = [],
        seenTag = false,
        i = 0,
        lineStart = 0,
        otag = '{{',
        ctag = '}}';

    function addBuf() {
      if (buf.length > 0) {
        tokens.push({tag: '_t', text: new String(buf)});
        buf = '';
      }
    }

    function lineIsWhitespace() {
      var isAllWhitespace = true;
      for (var j = lineStart; j < tokens.length; j++) {
        isAllWhitespace =
          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
        if (!isAllWhitespace) {
          return false;
        }
      }

      return isAllWhitespace;
    }

    function filterLine(haveSeenTag, noNewLine) {
      addBuf();

      if (haveSeenTag && lineIsWhitespace()) {
        for (var j = lineStart, next; j < tokens.length; j++) {
          if (tokens[j].text) {
            if ((next = tokens[j+1]) && next.tag == '>') {
              // set indent to token value
              next.indent = tokens[j].text.toString()
            }
            tokens.splice(j, 1);
          }
        }
      } else if (!noNewLine) {
        tokens.push({tag:'\n'});
      }

      seenTag = false;
      lineStart = tokens.length;
    }

    function changeDelimiters(text, index) {
      var close = '=' + ctag,
          closeIndex = text.indexOf(close, index),
          delimiters = trim(
            text.substring(text.indexOf('=', index) + 1, closeIndex)
          ).split(' ');

      otag = delimiters[0];
      ctag = delimiters[delimiters.length - 1];

      return closeIndex + close.length - 1;
    }

    if (delimiters) {
      delimiters = delimiters.split(' ');
      otag = delimiters[0];
      ctag = delimiters[1];
    }

    for (i = 0; i < len; i++) {
      if (state == IN_TEXT) {
        if (tagChange(otag, text, i)) {
          --i;
          addBuf();
          state = IN_TAG_TYPE;
        } else {
          if (text.charAt(i) == '\n') {
            filterLine(seenTag);
          } else {
            buf += text.charAt(i);
          }
        }
      } else if (state == IN_TAG_TYPE) {
        i += otag.length - 1;
        tag = Hogan.tags[text.charAt(i + 1)];
        tagType = tag ? text.charAt(i + 1) : '_v';
        if (tagType == '=') {
          i = changeDelimiters(text, i);
          state = IN_TEXT;
        } else {
          if (tag) {
            i++;
          }
          state = IN_TAG;
        }
        seenTag = i;
      } else {
        if (tagChange(ctag, text, i)) {
          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
          buf = '';
          i += ctag.length - 1;
          state = IN_TEXT;
          if (tagType == '{') {
            if (ctag == '}}') {
              i++;
            } else {
              cleanTripleStache(tokens[tokens.length - 1]);
            }
          }
        } else {
          buf += text.charAt(i);
        }
      }
    }

    filterLine(seenTag, true);

    return tokens;
  }

  function cleanTripleStache(token) {
    if (token.n.substr(token.n.length - 1) === '}') {
      token.n = token.n.substring(0, token.n.length - 1);
    }
  }

  function trim(s) {
    if (s.trim) {
      return s.trim();
    }

    return s.replace(/^\s*|\s*$/g, '');
  }

  function tagChange(tag, text, index) {
    if (text.charAt(index) != tag.charAt(0)) {
      return false;
    }

    for (var i = 1, l = tag.length; i < l; i++) {
      if (text.charAt(index + i) != tag.charAt(i)) {
        return false;
      }
    }

    return true;
  }

  // the tags allowed inside super templates
  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

  function buildTree(tokens, kind, stack, customTags) {
    var instructions = [],
        opener = null,
        tail = null,
        token = null;

    tail = stack[stack.length - 1];

    while (tokens.length > 0) {
      token = tokens.shift();

      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
        throw new Error('Illegal content in < super tag.');
      }

      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
        stack.push(token);
        token.nodes = buildTree(tokens, token.tag, stack, customTags);
      } else if (token.tag == '/') {
        if (stack.length === 0) {
          throw new Error('Closing tag without opener: /' + token.n);
        }
        opener = stack.pop();
        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
        }
        opener.end = token.i;
        return instructions;
      } else if (token.tag == '\n') {
        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
      }

      instructions.push(token);
    }

    if (stack.length > 0) {
      throw new Error('missing closing tag: ' + stack.pop().n);
    }

    return instructions;
  }

  function isOpener(token, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].o == token.n) {
        token.tag = '#';
        return true;
      }
    }
  }

  function isCloser(close, open, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].c == close && tags[i].o == open) {
        return true;
      }
    }
  }

  function stringifySubstitutions(obj) {
    var items = [];
    for (var key in obj) {
      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
    }
    return "{ " + items.join(",") + " }";
  }

  function stringifyPartials(codeObj) {
    var partials = [];
    for (var key in codeObj.partials) {
      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
    }
    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
  }

  Hogan.stringify = function(codeObj, text, options) {
    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
  }

  var serialNo = 0;
  Hogan.generate = function(tree, text, options) {
    serialNo = 0;
    var context = { code: '', subs: {}, partials: {} };
    Hogan.walk(tree, context);

    if (options.asString) {
      return this.stringify(context, text, options);
    }

    return this.makeTemplate(context, text, options);
  }

  Hogan.wrapMain = function(code) {
    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
  }

  Hogan.template = Hogan.Template;

  Hogan.makeTemplate = function(codeObj, text, options) {
    var template = this.makePartials(codeObj);
    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
    return new this.template(template, text, this, options);
  }

  Hogan.makePartials = function(codeObj) {
    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
    for (key in template.partials) {
      template.partials[key] = this.makePartials(template.partials[key]);
    }
    for (key in codeObj.subs) {
      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
    }
    return template;
  }

  function esc(s) {
    return s.replace(rSlash, '\\\\')
            .replace(rQuot, '\\\"')
            .replace(rNewline, '\\n')
            .replace(rCr, '\\r')
            .replace(rLineSep, '\\u2028')
            .replace(rParagraphSep, '\\u2029');
  }

  function chooseMethod(s) {
    return (~s.indexOf('.')) ? 'd' : 'f';
  }

  function createPartial(node, context) {
    var prefix = "<" + (context.prefix || "");
    var sym = prefix + node.n + serialNo++;
    context.partials[sym] = {name: node.n, partials: {}};
    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
    return sym;
  }

  Hogan.codegen = {
    '#': function(node, context) {
      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
                      't.rs(c,p,' + 'function(c,p,t){';
      Hogan.walk(node.nodes, context);
      context.code += '});c.pop();}';
    },

    '^': function(node, context) {
      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
      Hogan.walk(node.nodes, context);
      context.code += '};';
    },

    '>': createPartial,
    '<': function(node, context) {
      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
      Hogan.walk(node.nodes, ctx);
      var template = context.partials[createPartial(node, context)];
      template.subs = ctx.subs;
      template.partials = ctx.partials;
    },

    '$': function(node, context) {
      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
      Hogan.walk(node.nodes, ctx);
      context.subs[node.n] = ctx.code;
      if (!context.inPartial) {
        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
      }
    },

    '\n': function(node, context) {
      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
    },

    '_v': function(node, context) {
      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
    },

    '_t': function(node, context) {
      context.code += write('"' + esc(node.text) + '"');
    },

    '{': tripleStache,

    '&': tripleStache
  }

  function tripleStache(node, context) {
    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
  }

  function write(s) {
    return 't.b(' + s + ');';
  }

  Hogan.walk = function(nodelist, context) {
    var func;
    for (var i = 0, l = nodelist.length; i < l; i++) {
      func = Hogan.codegen[nodelist[i].tag];
      func && func(nodelist[i], context);
    }
    return context;
  }

  Hogan.parse = function(tokens, text, options) {
    options = options || {};
    return buildTree(tokens, '', [], options.sectionTags || []);
  }

  Hogan.cache = {};

  Hogan.cacheKey = function(text, options) {
    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
  }

  Hogan.compile = function(text, options) {
    options = options || {};
    var key = Hogan.cacheKey(text, options);
    var template = this.cache[key];

    if (template) {
      var partials = template.partials;
      for (var name in partials) {
        delete partials[name].instance;
      }
      return template;
    }

    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
    return this.cache[key] = template;
  }
})( true ? exports : 0);


/***/ }),

/***/ 5485:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// This file is for use with Node.js. See dist/ for browser files.

var Hogan = __webpack_require__(9397);
Hogan.Template = (__webpack_require__(2882).Template);
Hogan.template = Hogan.Template;
module.exports = Hogan;


/***/ }),

/***/ 2882:
/***/ ((__unused_webpack_module, exports) => {

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var Hogan = {};

(function (Hogan) {
  Hogan.Template = function (codeObj, text, compiler, options) {
    codeObj = codeObj || {};
    this.r = codeObj.code || this.r;
    this.c = compiler;
    this.options = options || {};
    this.text = text || '';
    this.partials = codeObj.partials || {};
    this.subs = codeObj.subs || {};
    this.buf = '';
  }

  Hogan.Template.prototype = {
    // render: replaced by generated code.
    r: function (context, partials, indent) { return ''; },

    // variable escaping
    v: hoganEscape,

    // triple stache
    t: coerceToString,

    render: function render(context, partials, indent) {
      return this.ri([context], partials || {}, indent);
    },

    // render internal -- a hook for overrides that catches partials too
    ri: function (context, partials, indent) {
      return this.r(context, partials, indent);
    },

    // ensurePartial
    ep: function(symbol, partials) {
      var partial = this.partials[symbol];

      // check to see that if we've instantiated this partial before
      var template = partials[partial.name];
      if (partial.instance && partial.base == template) {
        return partial.instance;
      }

      if (typeof template == 'string') {
        if (!this.c) {
          throw new Error("No compiler available.");
        }
        template = this.c.compile(template, this.options);
      }

      if (!template) {
        return null;
      }

      // We use this to check whether the partials dictionary has changed
      this.partials[symbol].base = template;

      if (partial.subs) {
        // Make sure we consider parent template now
        if (!partials.stackText) partials.stackText = {};
        for (key in partial.subs) {
          if (!partials.stackText[key]) {
            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
          }
        }
        template = createSpecializedPartial(template, partial.subs, partial.partials,
          this.stackSubs, this.stackPartials, partials.stackText);
      }
      this.partials[symbol].instance = template;

      return template;
    },

    // tries to find a partial in the current scope and render it
    rp: function(symbol, context, partials, indent) {
      var partial = this.ep(symbol, partials);
      if (!partial) {
        return '';
      }

      return partial.ri(context, partials, indent);
    },

    // render a section
    rs: function(context, partials, section) {
      var tail = context[context.length - 1];

      if (!isArray(tail)) {
        section(context, partials, this);
        return;
      }

      for (var i = 0; i < tail.length; i++) {
        context.push(tail[i]);
        section(context, partials, this);
        context.pop();
      }
    },

    // maybe start a section
    s: function(val, ctx, partials, inverted, start, end, tags) {
      var pass;

      if (isArray(val) && val.length === 0) {
        return false;
      }

      if (typeof val == 'function') {
        val = this.ms(val, ctx, partials, inverted, start, end, tags);
      }

      pass = !!val;

      if (!inverted && pass && ctx) {
        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
      }

      return pass;
    },

    // find values with dotted names
    d: function(key, ctx, partials, returnFound) {
      var found,
          names = key.split('.'),
          val = this.f(names[0], ctx, partials, returnFound),
          doModelGet = this.options.modelGet,
          cx = null;

      if (key === '.' && isArray(ctx[ctx.length - 2])) {
        val = ctx[ctx.length - 1];
      } else {
        for (var i = 1; i < names.length; i++) {
          found = findInScope(names[i], val, doModelGet);
          if (found !== undefined) {
            cx = val;
            val = found;
          } else {
            val = '';
          }
        }
      }

      if (returnFound && !val) {
        return false;
      }

      if (!returnFound && typeof val == 'function') {
        ctx.push(cx);
        val = this.mv(val, ctx, partials);
        ctx.pop();
      }

      return val;
    },

    // find values with normal names
    f: function(key, ctx, partials, returnFound) {
      var val = false,
          v = null,
          found = false,
          doModelGet = this.options.modelGet;

      for (var i = ctx.length - 1; i >= 0; i--) {
        v = ctx[i];
        val = findInScope(key, v, doModelGet);
        if (val !== undefined) {
          found = true;
          break;
        }
      }

      if (!found) {
        return (returnFound) ? false : "";
      }

      if (!returnFound && typeof val == 'function') {
        val = this.mv(val, ctx, partials);
      }

      return val;
    },

    // higher order templates
    ls: function(func, cx, partials, text, tags) {
      var oldTags = this.options.delimiters;

      this.options.delimiters = tags;
      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
      this.options.delimiters = oldTags;

      return false;
    },

    // compile text
    ct: function(text, cx, partials) {
      if (this.options.disableLambda) {
        throw new Error('Lambda features disabled.');
      }
      return this.c.compile(text, this.options).render(cx, partials);
    },

    // template result buffering
    b: function(s) { this.buf += s; },

    fl: function() { var r = this.buf; this.buf = ''; return r; },

    // method replace section
    ms: function(func, ctx, partials, inverted, start, end, tags) {
      var textSource,
          cx = ctx[ctx.length - 1],
          result = func.call(cx);

      if (typeof result == 'function') {
        if (inverted) {
          return true;
        } else {
          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
        }
      }

      return result;
    },

    // method replace variable
    mv: function(func, ctx, partials) {
      var cx = ctx[ctx.length - 1];
      var result = func.call(cx);

      if (typeof result == 'function') {
        return this.ct(coerceToString(result.call(cx)), cx, partials);
      }

      return result;
    },

    sub: function(name, context, partials, indent) {
      var f = this.subs[name];
      if (f) {
        this.activeSub = name;
        f(context, partials, this, indent);
        this.activeSub = false;
      }
    }

  };

  //Find a key in an object
  function findInScope(key, scope, doModelGet) {
    var val;

    if (scope && typeof scope == 'object') {

      if (scope[key] !== undefined) {
        val = scope[key];

      // try lookup with get for backbone or similar model data
      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
        val = scope.get(key);
      }
    }

    return val;
  }

  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
    function PartialTemplate() {};
    PartialTemplate.prototype = instance;
    function Substitutions() {};
    Substitutions.prototype = instance.subs;
    var key;
    var partial = new PartialTemplate();
    partial.subs = new Substitutions();
    partial.subsText = {};  //hehe. substext.
    partial.buf = '';

    stackSubs = stackSubs || {};
    partial.stackSubs = stackSubs;
    partial.subsText = stackText;
    for (key in subs) {
      if (!stackSubs[key]) stackSubs[key] = subs[key];
    }
    for (key in stackSubs) {
      partial.subs[key] = stackSubs[key];
    }

    stackPartials = stackPartials || {};
    partial.stackPartials = stackPartials;
    for (key in partials) {
      if (!stackPartials[key]) stackPartials[key] = partials[key];
    }
    for (key in stackPartials) {
      partial.partials[key] = stackPartials[key];
    }

    return partial;
  }

  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function hoganEscape(str) {
    str = coerceToString(str);
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }

  var isArray = Array.isArray || function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

})( true ? exports : 0);


/***/ }),

/***/ 9606:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("RayType ");t.b(t.v(t.f("name",c,p,0)));t.b("_setRayType(ExtVector v, RelVector n,float r) {");t.b("\n" + i);t.b("    return setRayType(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, n, r);");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, RayType rayType) {");t.b("\n" + i);t.b("    return render(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, rayType);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "RayType {{name}}_setRayType(ExtVector v, RelVector n,float r) {\n    return setRayType({{name}}, v, n, r);\n}\n\nvec3 {{name}}_render(ExtVector v, RelVector normal, RayType rayType) {\n    return render({{name}}, v, rayType);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 9909:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    return vec3(0, float(v.data.iMarch/camera.maxSteps), v.data.totalDist / camera.maxDist);");t.b("\n" + i);t.b("    //return debugColor;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v) {\n    return vec3(0, float(v.data.iMarch/camera.maxSteps), v.data.totalDist / camera.maxDist);\n    //return debugColor;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6077:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    return normalMaterialRender(v, normal);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal) {\n    return normalMaterialRender(v, normal);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 1202:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("RayType ");t.b(t.v(t.f("name",c,p,0)));t.b("_setRayType(ExtVector v, RelVector n,float r) {");t.b("\n" + i);t.b("    return setRayType(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, n,r);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "RayType {{name}}_setRayType(ExtVector v, RelVector n,float r) {\n    return setRayType({{name}}, v, n,r);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 2330:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, RayType rayType) {\n    if (rayType.reflect){\n        return {{name}}.specular;\n    }\n    return {{material.name}}_render(v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 9040:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, RayType rayType) {\n    if (rayType.reflect){\n        return {{name}}.specular;\n    }\n    return {{material.name}}_render(v, normal);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 588:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;   ");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {\n    if (rayType.reflect){\n        return {{name}}.specular;   \n    }\n    return {{material.name}}_render(v, normal, uv);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 1365:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("      return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {\n    if (rayType.reflect){\n      return {{name}}.specular;\n    }\n    return {{material.name}}_render(v, uv);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8149:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n" + i);t.b(" ");t.b("\n" + i);t.b("    PhongMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,204,519,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return color;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n \n    PhongMaterial material = {{name}};\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n    \n    return color;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3838:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,257,583,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return color;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n\n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v);\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n    \n    return color;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 472:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,265,591,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return color;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n\n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v, normal);\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n    \n    return color;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7660:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,278,604,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n\n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v, normal, uv);\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8204:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n" + i);t.b(" ");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,271,597,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return color;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n \n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v, uv);\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n    \n    return color;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6142:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Gradient for the complement of a shape");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    return negate(");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v));");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Gradient for the complement of a shape\n */\nRelVector {{name}}_gradient(RelVector v){\n    return negate({{shape.name}}_gradient(v));\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7939:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * SDF for the complement of a shape");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(RelVector v){");t.b("\n" + i);t.b("    return - ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * SDF for the complement of a shape\n */\nfloat {{name}}_sdf(RelVector v){\n    return - {{shape.name}}_sdf(v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7260:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec2 ");t.b(t.v(t.f("name",c,p,0)));t.b("_uvMap(RelVector v){");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec2 {{name}}_uvMap(RelVector v){\n    return {{shape.name}}_uvMap(v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6861:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Gradient for the union of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    RelVector grad1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    RelVector grad2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    return gradientMaxPoly(dist1, dist2, grad1, grad2, ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxCoeff);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Gradient for the union of two shapes\n */\nRelVector {{name}}_gradient(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    RelVector grad1 = {{shape1.name}}_gradient(v);\n    RelVector grad2 = {{shape2.name}}_gradient(v);\n    return gradientMaxPoly(dist1, dist2, grad1, grad2, {{name}}.maxCoeff);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3335:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Gradient for the intersection of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    if(dist1 > dist2){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    } else{");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Gradient for the intersection of two shapes\n */\nRelVector {{name}}_gradient(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    if(dist1 > dist2){\n        return {{shape1.name}}_gradient(v);\n    } else{\n        return {{shape2.name}}_gradient(v);\n    }\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6428:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * SDF for the union of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    return smoothMaxPoly(dist1, dist2, ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxCoeff);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * SDF for the union of two shapes\n */\nfloat {{name}}_sdf(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    return smoothMaxPoly(dist1, dist2, {{name}}.maxCoeff);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 2076:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * SDF for the intersection of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    return max(dist1, dist2);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * SDF for the intersection of two shapes\n */\nfloat {{name}}_sdf(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    return max(dist1, dist2);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 2905:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * UV Map for the intersection of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("vec2 ");t.b(t.v(t.f("name",c,p,0)));t.b("_uvMap(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    if(dist1 < dist2){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_uvMap(v);");t.b("\n" + i);t.b("    } else{");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_uvMap(v);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * UV Map for the intersection of two shapes\n */\nvec2 {{name}}_uvMap(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    if(dist1 < dist2){\n        return {{shape1.name}}_uvMap(v);\n    } else{\n        return {{shape2.name}}_uvMap(v);\n    }\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8655:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Gradient for the union of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    RelVector grad1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    RelVector grad2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    return gradientMinPoly(dist1, dist2, grad1, grad2, ");t.b(t.v(t.f("name",c,p,0)));t.b(".minCoeff);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Gradient for the union of two shapes\n */\nRelVector {{name}}_gradient(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    RelVector grad1 = {{shape1.name}}_gradient(v);\n    RelVector grad2 = {{shape2.name}}_gradient(v);\n    return gradientMinPoly(dist1, dist2, grad1, grad2, {{name}}.minCoeff);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7762:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Gradient for the union of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    if(dist1 < dist2){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    } else{");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Gradient for the union of two shapes\n */\nRelVector {{name}}_gradient(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    if(dist1 < dist2){\n        return {{shape1.name}}_gradient(v);\n    } else{\n        return {{shape2.name}}_gradient(v);\n    }\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3238:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * SDF for the union of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    return smoothMinPoly(dist1, dist2, ");t.b(t.v(t.f("name",c,p,0)));t.b(".minCoeff);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * SDF for the union of two shapes\n */\nfloat {{name}}_sdf(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    return smoothMinPoly(dist1, dist2, {{name}}.minCoeff);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3908:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * SDF for the union of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    return min(dist1, dist2);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * SDF for the union of two shapes\n */\nfloat {{name}}_sdf(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    return min(dist1, dist2);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7500:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * UV Map for the intersection of two shapes");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("vec2 ");t.b(t.v(t.f("name",c,p,0)));t.b("_uvMap(RelVector v){");t.b("\n" + i);t.b("    float dist1 = ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    float dist2 = ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    if(dist1 > dist2){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape1.name",c,p,0)));t.b("_uvMap(v);");t.b("\n" + i);t.b("    } else{");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape2.name",c,p,0)));t.b("_uvMap(v);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * UV Map for the intersection of two shapes\n */\nvec2 {{name}}_uvMap(RelVector v){\n    float dist1 = {{shape1.name}}_sdf(v);\n    float dist2 = {{shape2.name}}_sdf(v);\n    if(dist1 > dist2){\n        return {{shape1.name}}_uvMap(v);\n    } else{\n        return {{shape2.name}}_uvMap(v);\n    }\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6242:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Gradient for a wrapping");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Gradient for a wrapping\n */\nRelVector {{name}}_gradient(RelVector v){\n    return {{shape.name}}_gradient(v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3105:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * SDF for a wrapping");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(RelVector v){");t.b("\n" + i);t.b("    float wrap = ");t.b(t.v(t.d("wrap.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    if(wrap > camera.threshold){");t.b("\n" + i);t.b("        return wrap;");t.b("\n" + i);t.b("    } else {");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * SDF for a wrapping\n */\nfloat {{name}}_sdf(RelVector v){\n    float wrap = {{wrap.name}}_sdf(v);\n    if(wrap > camera.threshold){\n        return wrap;\n    } else {\n        return {{shape.name}}_sdf(v);\n    }\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 9338:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec2 ");t.b(t.v(t.f("name",c,p,0)));t.b("_uvMap(RelVector v){");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec2 {{name}}_uvMap(RelVector v){\n    return {{shape.name}}_uvMap(v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8008:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Default creeping function (binary search)");t.b("\n" + i);t.b(" * @param start starting point of the creeping");t.b("\n" + i);t.b(" * @param outside vector out of the boundary (obtained from the previous flow, or the previous creeping)");t.b("\n" + i);t.b(" * @param offset how long we flow after passing the boundary");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("ExtVector ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(ExtVector v, ExtVector outside,  float offset){");t.b("\n" + i);t.b("    ExtVector try = outside;");t.b("\n" + i);t.b("    float sIn = 0.;");t.b("\n" + i);t.b("    float sOut = try.data.lastFlowDist;");t.b("\n" + i);t.b("    float s;");t.b("\n" + i);t.b("    for(int i=0; i < 100; i++){");t.b("\n" + i);t.b("        if(sOut - sIn < offset){");t.b("\n" + i);t.b("            break;");t.b("\n" + i);t.b("        }");t.b("\n" + i);t.b("        s = 0.5 * sIn + 0.5 * sOut;");t.b("\n" + i);t.b("        try = flow(v,s);");t.b("\n" + i);t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("            sOut = s;");t.b("\n" + i);t.b("            outside = try;");t.b("\n" + i);t.b("        } else {");t.b("\n" + i);t.b("            sIn = s;");t.b("\n" + i);t.b("        }");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return outside;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Default creeping function (binary search)\n * @param start starting point of the creeping\n * @param outside vector out of the boundary (obtained from the previous flow, or the previous creeping)\n * @param offset how long we flow after passing the boundary\n */\nExtVector {{glslCreepName}}(ExtVector v, ExtVector outside,  float offset){\n    ExtVector try = outside;\n    float sIn = 0.;\n    float sOut = try.data.lastFlowDist;\n    float s;\n    for(int i=0; i < 100; i++){\n        if(sOut - sIn < offset){\n            break;\n        }\n        s = 0.5 * sIn + 0.5 * sOut;\n        try = flow(v,s);\n        if({{glslTestName}}(try.vector.local.pos)){\n            sOut = s;\n            outside = try;\n        } else {\n            sIn = s;\n        }\n    }\n    return outside;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 968:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b("* Teleportation.");t.b("\n" + i);t.b("* Check if the local vector is still in the fundamental domain define by the teleportation tests.");t.b("\n" + i);t.b("* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true");t.b("\n" + i);t.b("* Otherwise, do nothing and set teleported to false");t.b("\n" + i);t.b("* @param[in] v the relative vector to teleport.");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("ExtVector teleport(ExtVector v){");t.b("\n" + i);t.b("    v.data.isTeleported = false;");t.b("\n" + i);if(t.s(t.f("teleportations",c,p,1),c,p,0,424,621,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(v.vector.local.pos)){");t.b("\n" + i);t.b("            v.vector = rewrite(v.vector, ");t.b(t.v(t.d("elt.name",c,p,0)));t.b(", ");t.b(t.v(t.d("inv.name",c,p,0)));t.b(");");t.b("\n" + i);t.b("            v.data.isTeleported = true;");t.b("\n" + i);t.b("            return v;");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    return v;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b(" * Does one of the two following transformation: ");t.b("\n" + i);t.b(" * flow the vector by the given time, if the vector escape the fundamental domain, ");t.b("\n" + i);t.b(" * then flow during a smaller time to reach the boundary (creeping).");t.b("\n" + i);t.b(" * @param[inout] v the relative vector to flow / teleport / creep.");t.b("\n" + i);t.b(" * @param[in] t the (maximal) time to flow");t.b("\n" + i);t.b(" * @param[in] offset the amount we march passed the boundary");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("ExtVector creepingFlow(ExtVector v, float t, float offset){");t.b("\n" + i);t.b("    ExtVector try = flow(v, t);");t.b("\n" + i);if(t.s(t.f("teleportations",c,p,1),c,p,0,1156,1525,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);if(t.s(t.f("usesCreepingCustom",c,p,1),c,p,0,1189,1308,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("            try = ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(v, offset);");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(t.s(t.f("usesCreepingBinary",c,p,1),c,p,0,1364,1488,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("            try = ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(v, try, offset);");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("        ");t.b("\n" + i);});c.pop();}t.b("    return try;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "/**\n* Teleportation.\n* Check if the local vector is still in the fundamental domain define by the teleportation tests.\n* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true\n* Otherwise, do nothing and set teleported to false\n* @param[in] v the relative vector to teleport.\n*/\nExtVector teleport(ExtVector v){\n    v.data.isTeleported = false;\n    {{#teleportations}}\n        if({{glslTestName}}(v.vector.local.pos)){\n            v.vector = rewrite(v.vector, {{elt.name}}, {{inv.name}});\n            v.data.isTeleported = true;\n            return v;\n        }\n    {{/teleportations}}\n    return v;\n}\n\n\n/**\n * Does one of the two following transformation: \n * flow the vector by the given time, if the vector escape the fundamental domain, \n * then flow during a smaller time to reach the boundary (creeping).\n * @param[inout] v the relative vector to flow / teleport / creep.\n * @param[in] t the (maximal) time to flow\n * @param[in] offset the amount we march passed the boundary\n */\nExtVector creepingFlow(ExtVector v, float t, float offset){\n    ExtVector try = flow(v, t);\n    {{#teleportations}}\n\n        {{#usesCreepingCustom}}\n        if({{glslTestName}}(try.vector.local.pos)){\n            try = {{glslCreepName}}(v, offset);\n        }\n        {{/usesCreepingCustom}}\n\n        {{#usesCreepingBinary}}\n        if({{glslTestName}}(try.vector.local.pos)){\n            try = {{glslCreepName}}(v, try, offset);\n        }\n        {{/usesCreepingBinary}}\n        \n    {{/teleportations}}\n    return try;\n}\n\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7577:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("bool ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(RelVector v, int i, out RelVector dir, out float intensity) {");t.b("\n" + i);t.b("    return directions(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, i, dir, intensity);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "bool {{name}}_directions(RelVector v, int i, out RelVector dir, out float intensity) {\n    return directions({{name}}, v, i, dir, intensity);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8778:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    return render(");t.b(t.v(t.f("name",c,p,0)));t.b(", v);");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v) {\n    return render({{name}}, v);\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 1215:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, vec2 uv) {");t.b("\n" + i);t.b("    return render(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, uv);");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, vec2 uv) {\n    return render({{name}}, v, uv);\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 2044:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/***********************************************************************************************************************");t.b("\n" + i);t.b(" ***********************************************************************************************************************");t.b("\n" + i);t.b(" * ");t.b("\n" + i);t.b(" * Defines the scene SDF and scene Material computations used during the ray-marching and lightening.");t.b("\n" + i);t.b(" *");t.b("\n" + i);t.b(" ***********************************************************************************************************************");t.b("\n" + i);t.b(" **********************************************************************************************************************/");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b(" * Distance along the geodesic directed by \\`v\\` to the closest object in the local scene");t.b("\n" + i);t.b(" * @param[in] v the direction to follows");t.b("\n" + i);t.b(" * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b(" * @param[out] objId the ID of the solid we hit.");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float _localSceneSDF(RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    hit = HIT_NOTHING;");t.b("\n" + i);t.b("    float res = camera.maxDist;");t.b("\n" + i);t.b("    float dist;");t.b("\n");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,1024,1376,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isLocal",c,p,1),c,p,0,1045,1359,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("name",c,p,0)));t.b(".isRendered){");t.b("\n" + i);t.b("                dist = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("                if(dist < camera.threshold) {");t.b("\n" + i);t.b("                    hit = HIT_SOLID;");t.b("\n" + i);t.b("                    objId = ");t.b(t.v(t.f("id",c,p,0)));t.b(";");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return res;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b("* Distance along the geodesic directed by \\`v\\` to the closest object in the local scene");t.b("\n" + i);t.b("* When nearest neighbor is on, the representatiion of v can be updated ");t.b("\n" + i);t.b("* so that the local vector is in a neighbor of the fundamental domain.");t.b("\n" + i);t.b("* This is used to compute correctly the normal / uv map of a local object.");t.b("\n" + i);t.b("* @param[in] v the direction to follows");t.b("\n" + i);t.b("* @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b("* @param[out] objId the ID of the solid we hit.");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("float localSceneSDF(inout RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    float res, dist;");t.b("\n" + i);t.b("    dist = _localSceneSDF(v, hit, objId);");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        return dist;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    res = dist;");t.b("\n" + i);t.b("    ");t.b("\n" + i);if(t.s(t.d("set.usesNearestNeighbors",c,p,1),c,p,0,2144,2560,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        RelVector aux = v;");t.b("\n" + i);t.b("        ");t.b("\n" + i);if(t.s(t.d("set.neighbors",c,p,1),c,p,0,2207,2508,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                aux = rewrite(v, ");t.b(t.v(t.d("elt.name",c,p,0)));t.b(", ");t.b(t.v(t.d("inv.name",c,p,0)));t.b(");");t.b("\n" + i);t.b("                dist = _localSceneSDF(aux, hit, objId);");t.b("\n" + i);t.b("                if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("                    v = aux;");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("                ");t.b("\n" + i);});c.pop();}t.b("        ");t.b("\n" + i);t.b("        return res;");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.d("set.usesNearestNeighbors",c,p,1),c,p,1,0,0,"")){t.b("        return res;");t.b("\n" + i);};t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b(" * Distance along the geodesic directed by \\`v\\` to the closest object in the global scene");t.b("\n" + i);t.b(" * @param[in] v the direction to follows");t.b("\n" + i);t.b(" * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b(" * @param[out] objID the ID of the solid we hit.");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float globalSceneSDF(RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    hit = HIT_NOTHING;");t.b("\n" + i);t.b("    float res = camera.maxDist;");t.b("\n" + i);t.b("    float dist;");t.b("\n" + i);t.b("    ");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,3118,3472,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isGlobal",c,p,1),c,p,0,3140,3454,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("name",c,p,0)));t.b(".isRendered){");t.b("\n" + i);t.b("                dist = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("                if(dist < camera.threshold) {");t.b("\n" + i);t.b("                    hit = HIT_SOLID;");t.b("\n" + i);t.b("                    objId = ");t.b(t.v(t.f("id",c,p,0)));t.b(";");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return res;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/***********************************************************************************************************************\n ***********************************************************************************************************************\n * \n * Defines the scene SDF and scene Material computations used during the ray-marching and lightening.\n *\n ***********************************************************************************************************************\n **********************************************************************************************************************/\n\n/**\n * Distance along the geodesic directed by \\`v\\` to the closest object in the local scene\n * @param[in] v the direction to follows\n * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n * @param[out] objId the ID of the solid we hit.\n */\nfloat _localSceneSDF(RelVector v, out int hit, out int objId){\n    hit = HIT_NOTHING;\n    float res = camera.maxDist;\n    float dist;\n\n    {{#scene.solids}}\n        {{#isLocal}}\n            if({{name}}.isRendered){\n                dist = {{shape.name}}_sdf(v);\n                if(dist < camera.threshold) {\n                    hit = HIT_SOLID;\n                    objId = {{id}};\n                    return dist;\n                }\n                res = min(res, dist);\n            }\n        {{/isLocal}}\n    {{/scene.solids}}\n    \n    return res;\n}\n\n/**\n* Distance along the geodesic directed by \\`v\\` to the closest object in the local scene\n* When nearest neighbor is on, the representatiion of v can be updated \n* so that the local vector is in a neighbor of the fundamental domain.\n* This is used to compute correctly the normal / uv map of a local object.\n* @param[in] v the direction to follows\n* @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n* @param[out] objId the ID of the solid we hit.\n*/\nfloat localSceneSDF(inout RelVector v, out int hit, out int objId){\n    float res, dist;\n    dist = _localSceneSDF(v, hit, objId);\n    if(hit == HIT_SOLID) {\n        return dist;\n    }\n    res = dist;\n    \n    {{#set.usesNearestNeighbors}}\n        RelVector aux = v;\n        \n        {{#set.neighbors}}\n                aux = rewrite(v, {{elt.name}}, {{inv.name}});\n                dist = _localSceneSDF(aux, hit, objId);\n                if(hit == HIT_SOLID) {\n                    v = aux;\n                    return dist;\n                }\n                res = min(res, dist);\n                \n        {{/set.neighbors}}\n        \n        return res;\n    {{/set.usesNearestNeighbors}}\n\n    {{^set.usesNearestNeighbors}}\n        return res;\n    {{/set.usesNearestNeighbors}}\n}\n\n\n/**\n * Distance along the geodesic directed by \\`v\\` to the closest object in the global scene\n * @param[in] v the direction to follows\n * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n * @param[out] objID the ID of the solid we hit.\n */\nfloat globalSceneSDF(RelVector v, out int hit, out int objId){\n    hit = HIT_NOTHING;\n    float res = camera.maxDist;\n    float dist;\n    \n    {{#scene.solids}}\n        {{#isGlobal}}\n            if({{name}}.isRendered){\n                dist = {{shape.name}}_sdf(v);\n                if(dist < camera.threshold) {\n                    hit = HIT_SOLID;\n                    objId = {{id}};\n                    return dist;\n                }\n                res = min(res, dist);\n            }\n        {{/isGlobal}}\n    {{/scene.solids}}\n    \n    return res;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7781:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("VectorData initVectorData(){");t.b("\n" + i);t.b("    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1));");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("void updateVectorDataFromSolid(inout ExtVector v, int objId){");t.b("\n" + i);t.b("    RelVector normal;");t.b("\n" + i);t.b("    vec2 uv;");t.b("\n" + i);t.b("    vec3 color;");t.b("\n" + i);t.b("    vec3 reflectivity;");t.b("\n" + i);t.b("    float t;");t.b("\n" + i);t.b("    ");t.b("\n" + i);t.b("    switch(objId){");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,300,3705,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("    ");t.b("\n" + i);t.b("        case ");t.b(t.v(t.f("id",c,p,0)));t.b(":");t.b("\n" + i);if(t.s(t.d("material.isReflecting",c,p,1),c,p,0,361,2329,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            ");t.b("\n" + i);t.b("            if(v.data.iBounce == maxBounces){");t.b("\n" + i);t.b("                reflectivity = vec3(0);");t.b("\n" + i);t.b("            } ");t.b("\n" + i);t.b("            else {");t.b("\n" + i);t.b("                reflectivity = ");t.b(t.v(t.d("material.name",c,p,0)));t.b(".reflectivity;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            ");t.b("\n" + i);t.b("            normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("            // in general the gradient is not necessarily a unit vector");t.b("\n" + i);t.b("            normal = geomNormalize(normal);");t.b("\n" + i);t.b("    ");t.b("\n" + i);if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,976,1111,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("    ");t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,1213,1577,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,1398,1541,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,1629,1706,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("            if(length(reflectivity) == 0.) {");t.b("\n" + i);t.b("                v.data.stop = true;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            else{");t.b("\n" + i);t.b("                v.data.stop = false;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * (vec3(1) - reflectivity) * color;");t.b("\n" + i);t.b("            v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;");t.b("\n" + i);t.b("            v.vector = geomReflect(v.vector,normal);");t.b("\n" + i);t.b("            v.data.lastBounceDist = 0.;");t.b("\n" + i);t.b("            v.data.iBounce = v.data.iBounce + 1;");t.b("\n" + i);t.b("            t = 20. * camera.threshold / abs(geomDot(v.vector, normal));");t.b("\n" + i);t.b("            v = flow(v, t);");t.b("\n" + i);t.b("    ");t.b("\n" + i);});c.pop();}t.b("    ");t.b("\n" + i);if(!t.s(t.d("material.isReflecting",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,2610,2745,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("    ");t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,2847,3339,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,3096,3303,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,3391,3468,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;");t.b("\n" + i);t.b("            v.data.leftToComputeColor = vec3(0);");t.b("\n" + i);t.b("            v.data.stop = true;");t.b("\n" + i);};t.b("    ");t.b("\n" + i);t.b("        break;");t.b("\n" + i);t.b("    ");t.b("\n" + i);});c.pop();}t.b("    }");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("void updateVectorData(inout ExtVector v, int hit, int objId){");t.b("\n" + i);t.b("    if (hit == HIT_DEBUG) {");t.b("\n" + i);t.b("        v.data.pixel = debugColor;");t.b("\n" + i);t.b("        v.data.leftToComputeColor = vec3(0);");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if (hit == HIT_NOTHING) {");t.b("\n" + i);t.b("        vec3 color = ");t.b(t.v(t.d("scene.background.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("        v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;");t.b("\n" + i);t.b("        v.data.leftToComputeColor = vec3(0);");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        updateVectorDataFromSolid(v, objId);");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "VectorData initVectorData(){\n    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1));\n}\n\n\nvoid updateVectorDataFromSolid(inout ExtVector v, int objId){\n    RelVector normal;\n    vec2 uv;\n    vec3 color;\n    vec3 reflectivity;\n    float t;\n    \n    switch(objId){\n    {{#scene.solids}}\n    \n        case {{id}}:\n        {{#material.isReflecting}}\n            \n            if(v.data.iBounce == maxBounces){\n                reflectivity = vec3(0);\n            } \n            else {\n                reflectivity = {{material.name}}.reflectivity;\n            }\n            \n            normal = {{shape.name}}_gradient(v.vector);\n            // in general the gradient is not necessarily a unit vector\n            normal = geomNormalize(normal);\n    \n            {{^material.usesNormal}}\n                {{^material.usesUVMap}}\n                    color =  {{material.name}}_render(v);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n    \n            {{#material.usesNormal}}\n                {{^material.usesUVMap}}\n                    color = {{material.name}}_render(v, normal);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, normal, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n\n            {{#scene.fog}}\n                color = applyFog(color, v.data.lastBounceDist);\n            {{/scene.fog}}\n\n            if(length(reflectivity) == 0.) {\n                v.data.stop = true;\n            }\n            else{\n                v.data.stop = false;\n            }\n            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * (vec3(1) - reflectivity) * color;\n            v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;\n            v.vector = geomReflect(v.vector,normal);\n            v.data.lastBounceDist = 0.;\n            v.data.iBounce = v.data.iBounce + 1;\n            t = 20. * camera.threshold / abs(geomDot(v.vector, normal));\n            v = flow(v, t);\n    \n        {{/material.isReflecting}}\n    \n        {{^material.isReflecting}}\n            {{^material.usesNormal}}\n                {{^material.usesUVMap}}\n                    color =  {{material.name}}_render(v);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n    \n            {{#material.usesNormal}}\n                {{^material.usesUVMap}}\n                    normal = {{shape.name}}_gradient(v.vector);\n                    color = {{material.name}}_render(v, normal);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    normal = {{shape.name}}_gradient(v.vector);\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, normal, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n\n            {{#scene.fog}}\n                color = applyFog(color, v.data.lastBounceDist);\n            {{/scene.fog}}\n            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;\n            v.data.leftToComputeColor = vec3(0);\n            v.data.stop = true;\n        {{/material.isReflecting}}\n    \n        break;\n    \n    {{/scene.solids}}\n    }\n}\n\nvoid updateVectorData(inout ExtVector v, int hit, int objId){\n    if (hit == HIT_DEBUG) {\n        v.data.pixel = debugColor;\n        v.data.leftToComputeColor = vec3(0);\n        v.data.stop = true;\n        return;\n    }\n    if (hit == HIT_NOTHING) {\n        vec3 color = {{scene.background.name}}_render(v);\n        v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;\n        v.data.leftToComputeColor = vec3(0);\n        v.data.stop = true;\n        return;\n    }\n    if(hit == HIT_SOLID) {\n        updateVectorDataFromSolid(v, objId);\n        return;\n    }\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 4122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * We assume that we are inside a solid");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("void nextObjectProperties(RelVector normal, out float ior, out vec3 absorb,out vec3 emission,out float opticalDepth, out bool isInside){");t.b("\n" + i);t.b("    float dist;");t.b("\n" + i);t.b("    ior = ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".ior; // index of the \"air\"");t.b("\n" + i);t.b("    absorb = ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".absorb; // absorb of the \"air\"");t.b("\n" + i);t.b("    emission=vec3(0,0,0);//no emission from 'air'");t.b("\n" + i);t.b("    opticalDepth=");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".opticalDepth; // opticalDepth of the \"air\"");t.b("\n" + i);t.b("    isInside = false;");t.b("\n" + i);t.b("    ");t.b("\n" + i);t.b("    RelVector v = flow(normal, 2. * camera.threshold);");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,579,1010,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        if(");t.b(t.v(t.f("name",c,p,0)));t.b(".isRendered){");t.b("\n" + i);t.b("            dist = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("            if(dist < camera.threshold) {");t.b("\n" + i);t.b("                ior = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".ior;");t.b("\n" + i);t.b("                absorb = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".absorb;");t.b("\n" + i);t.b("                emission = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".volumeEmission;");t.b("\n" + i);t.b("                opticalDepth = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".opticalDepth;");t.b("\n" + i);t.b("                isInside = true;");t.b("\n" + i);t.b("                return;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * We assume that we are inside a solid\n */\nvoid nextObjectProperties(RelVector normal, out float ior, out vec3 absorb,out vec3 emission,out float opticalDepth, out bool isInside){\n    float dist;\n    ior = {{scene.ptBackground.name}}.ior; // index of the \"air\"\n    absorb = {{scene.ptBackground.name}}.absorb; // absorb of the \"air\"\n    emission=vec3(0,0,0);//no emission from 'air'\n    opticalDepth={{scene.ptBackground.name}}.opticalDepth; // opticalDepth of the \"air\"\n    isInside = false;\n    \n    RelVector v = flow(normal, 2. * camera.threshold);\n    {{#scene.solids}}\n        if({{name}}.isRendered){\n            dist = {{shape.name}}_sdf(v);\n            if(dist < camera.threshold) {\n                ior = {{ptMaterial.name}}.ior;\n                absorb = {{ptMaterial.name}}.absorb;\n                emission = {{ptMaterial.name}}.volumeEmission;\n                opticalDepth = {{ptMaterial.name}}.opticalDepth;\n                isInside = true;\n                return;\n            }\n        }\n    {{/scene.solids}}\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6172:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/***********************************************************************************************************************");t.b("\n" + i);t.b(" ***********************************************************************************************************************");t.b("\n" + i);t.b(" * ");t.b("\n" + i);t.b(" * Defines the scene SDF and scene Material computations used during the ray-marching and lightening.");t.b("\n" + i);t.b(" *");t.b("\n" + i);t.b(" ***********************************************************************************************************************");t.b("\n" + i);t.b(" **********************************************************************************************************************/");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b(" * Distance along the geodesic directed by \\`v\\` to the closest object in the local scene");t.b("\n" + i);t.b(" * @param[in] v the direction to follows");t.b("\n" + i);t.b(" * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b(" * @param[out] objId the ID of the solid we hit.");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float _localSceneSDF(RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    hit = HIT_NOTHING;");t.b("\n" + i);t.b("    float res = camera.maxDist;");t.b("\n" + i);t.b("    float dist;");t.b("\n");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,1024,1381,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isLocal",c,p,1),c,p,0,1045,1364,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("name",c,p,0)));t.b(".isRendered){");t.b("\n" + i);t.b("                dist = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("                if(abs(dist) < camera.threshold) {");t.b("\n" + i);t.b("                    hit = HIT_SOLID;");t.b("\n" + i);t.b("                    objId = ");t.b(t.v(t.f("id",c,p,0)));t.b(";");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return res;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b("* Distance along the geodesic directed by \\`v\\` to the closest object in the local scene");t.b("\n" + i);t.b("* When nearest neighbor is on, the representatiion of v can be updated ");t.b("\n" + i);t.b("* so that the local vector is in a neighbor of the fundamental domain.");t.b("\n" + i);t.b("* This is used to compute correctly the normal / uv map of a local object.");t.b("\n" + i);t.b("* @param[in] v the direction to follows");t.b("\n" + i);t.b("* @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b("* @param[out] objId the ID of the solid we hit.");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("float localSceneSDF(inout RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    float res, dist;");t.b("\n" + i);t.b("    dist = _localSceneSDF(v, hit, objId);");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        return dist;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    res = dist;");t.b("\n" + i);t.b("    ");t.b("\n" + i);if(t.s(t.d("set.usesNearestNeighbors",c,p,1),c,p,0,2149,2565,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        RelVector aux = v;");t.b("\n" + i);t.b("        ");t.b("\n" + i);if(t.s(t.d("set.neighbors",c,p,1),c,p,0,2212,2513,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                aux = rewrite(v, ");t.b(t.v(t.d("elt.name",c,p,0)));t.b(", ");t.b(t.v(t.d("inv.name",c,p,0)));t.b(");");t.b("\n" + i);t.b("                dist = _localSceneSDF(aux, hit, objId);");t.b("\n" + i);t.b("                if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("                    v = aux;");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("                ");t.b("\n" + i);});c.pop();}t.b("        ");t.b("\n" + i);t.b("        return res;");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.d("set.usesNearestNeighbors",c,p,1),c,p,1,0,0,"")){t.b("        return res;");t.b("\n" + i);};t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b(" * Distance along the geodesic directed by \\`v\\` to the closest object in the global scene");t.b("\n" + i);t.b(" * @param[in] v the direction to follows");t.b("\n" + i);t.b(" * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b(" * @param[out] objID the ID of the solid we hit.");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float globalSceneSDF(RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    hit = HIT_NOTHING;");t.b("\n" + i);t.b("    float res = camera.maxDist;");t.b("\n" + i);t.b("    float dist;");t.b("\n" + i);t.b("    ");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,3123,3482,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isGlobal",c,p,1),c,p,0,3145,3464,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("name",c,p,0)));t.b(".isRendered){");t.b("\n" + i);t.b("                dist = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("                if(abs(dist) < camera.threshold) {");t.b("\n" + i);t.b("                    hit = HIT_SOLID;");t.b("\n" + i);t.b("                    objId = ");t.b(t.v(t.f("id",c,p,0)));t.b(";");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return res;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/***********************************************************************************************************************\n ***********************************************************************************************************************\n * \n * Defines the scene SDF and scene Material computations used during the ray-marching and lightening.\n *\n ***********************************************************************************************************************\n **********************************************************************************************************************/\n\n/**\n * Distance along the geodesic directed by \\`v\\` to the closest object in the local scene\n * @param[in] v the direction to follows\n * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n * @param[out] objId the ID of the solid we hit.\n */\nfloat _localSceneSDF(RelVector v, out int hit, out int objId){\n    hit = HIT_NOTHING;\n    float res = camera.maxDist;\n    float dist;\n\n    {{#scene.solids}}\n        {{#isLocal}}\n            if({{name}}.isRendered){\n                dist = {{shape.name}}_sdf(v);\n                if(abs(dist) < camera.threshold) {\n                    hit = HIT_SOLID;\n                    objId = {{id}};\n                    return dist;\n                }\n                res = min(res, dist);\n            }\n        {{/isLocal}}\n    {{/scene.solids}}\n    \n    return res;\n}\n\n/**\n* Distance along the geodesic directed by \\`v\\` to the closest object in the local scene\n* When nearest neighbor is on, the representatiion of v can be updated \n* so that the local vector is in a neighbor of the fundamental domain.\n* This is used to compute correctly the normal / uv map of a local object.\n* @param[in] v the direction to follows\n* @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n* @param[out] objId the ID of the solid we hit.\n*/\nfloat localSceneSDF(inout RelVector v, out int hit, out int objId){\n    float res, dist;\n    dist = _localSceneSDF(v, hit, objId);\n    if(hit == HIT_SOLID) {\n        return dist;\n    }\n    res = dist;\n    \n    {{#set.usesNearestNeighbors}}\n        RelVector aux = v;\n        \n        {{#set.neighbors}}\n                aux = rewrite(v, {{elt.name}}, {{inv.name}});\n                dist = _localSceneSDF(aux, hit, objId);\n                if(hit == HIT_SOLID) {\n                    v = aux;\n                    return dist;\n                }\n                res = min(res, dist);\n                \n        {{/set.neighbors}}\n        \n        return res;\n    {{/set.usesNearestNeighbors}}\n\n    {{^set.usesNearestNeighbors}}\n        return res;\n    {{/set.usesNearestNeighbors}}\n}\n\n\n/**\n * Distance along the geodesic directed by \\`v\\` to the closest object in the global scene\n * @param[in] v the direction to follows\n * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n * @param[out] objID the ID of the solid we hit.\n */\nfloat globalSceneSDF(RelVector v, out int hit, out int objId){\n    hit = HIT_NOTHING;\n    float res = camera.maxDist;\n    float dist;\n    \n    {{#scene.solids}}\n        {{#isGlobal}}\n            if({{name}}.isRendered){\n                dist = {{shape.name}}_sdf(v);\n                if(abs(dist) < camera.threshold) {\n                    hit = HIT_SOLID;\n                    objId = {{id}};\n                    return dist;\n                }\n                res = min(res, dist);\n            }\n        {{/isGlobal}}\n    {{/scene.solids}}\n    \n    return res;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6272:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("VectorData initVectorData(){");t.b("\n" + i);t.b("    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1), ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".absorb, ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".volumeEmission, ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".opticalDepth, false);");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("void roulette(inout ExtVector v){");t.b("\n" + i);t.b("    // as the light left gets smaller, the ray is more likely to get terminated early.");t.b("\n" + i);t.b("    // survivors have their value boosted to make up for fewer samples being in the average.");t.b("\n" + i);t.b("    float p = max(v.data.light.r, max(v.data.light.g, v.data.light.b));");t.b("\n" + i);t.b("    if (randomFloat() > p){");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    // add the energy we 'lose' by randomly terminating paths");t.b("\n" + i);t.b("    v.data.light = v.data.light / p;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("void updateVectorDataFromSolid(inout ExtVector v, int objId){");t.b("\n" + i);t.b("    RelVector normal;");t.b("\n" + i);t.b("    RayType rayType;");t.b("\n" + i);t.b("    vec2 uv;");t.b("\n" + i);t.b("    vec3 color;");t.b("\n" + i);t.b("    vec3 reflectivity;");t.b("\n" + i);t.b("    float hackCoeff = 1.;");t.b("\n" + i);t.b("    float r; /** ratio of IOR */");t.b("\n" + i);t.b("    float nextIOR; /** IOR of the neighbor solid */");t.b("\n" + i);t.b("    vec3 nextAbsorb; /** absorb of the neighbor solid */");t.b("\n" + i);t.b("    vec3 nextEmission;/** volumetric emission of the neighbor solid */");t.b("\n" + i);t.b("    float nextOpticalDepth;/** optical depth of the neighbor solid */");t.b("\n" + i);t.b("    bool nextIsInside = true;");t.b("\n");t.b("\n" + i);t.b("    RelVector diffuseDir;");t.b("\n" + i);t.b("    RelVector reflectDir;");t.b("\n" + i);t.b("    RelVector refractDir;");t.b("\n");t.b("\n" + i);t.b("    // get a uniformly distributed vector on the sphere");t.b("\n" + i);t.b("    RelVector random = randomVector(v.vector);");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("    //get volumetric coloring:");t.b("\n" + i);t.b("    //portion of light is absorbed.");t.b("\n" + i);t.b("    vec3 volAbsorb = exp((-v.data.currentAbsorb) * v.data.lastBounceDist);");t.b("\n" + i);t.b("    ");t.b("\n" + i);t.b("    //light is emitted along the journey (linear or expoenential pickup)");t.b("\n" + i);t.b("    vec3 volEmit = v.data.currentEmission * v.data.lastBounceDist;");t.b("\n" + i);t.b("    //vec3 volEmit = exp(v.data.currentEmission * v.data.lastBounceDist)-vec3(1);");t.b("\n");t.b("\n" + i);t.b("    //use these quantities to update pixel and light:");t.b("\n" + i);t.b("    v.data.light = v.data.light * volAbsorb;");t.b("\n" + i);t.b("    v.data.pixel = v.data.pixel + v.data.light*volEmit;");t.b("\n" + i);t.b("    v.data.light = v.data.light + volEmit;//the absorbtion doesn't distort the light output");t.b("\n" + i);t.b("    ");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("switch(objId){");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,2036,5260,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("    ");t.b("\n" + i);t.b("        case ");t.b(t.v(t.f("id",c,p,0)));t.b(":");t.b("\n" + i);t.b("            normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("            normal = geomNormalize(normal);");t.b("\n");t.b("\n" + i);t.b("            ");t.b("\n" + i);t.b("            // get info and reset normal based on which side we are on.");t.b("\n" + i);t.b("            // starting assumption: in the \"air\"");t.b("\n" + i);t.b("            r = ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".ior / ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".ior;");t.b("\n" + i);t.b("            nextAbsorb = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".absorb;");t.b("\n" + i);t.b("            nextEmission = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".volumeEmission;");t.b("\n" + i);t.b("            nextOpticalDepth = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".opticalDepth;");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(v.data.isInside){");t.b("\n" + i);t.b("                //things to change if we are inside a material instead:");t.b("\n" + i);t.b("                nextObjectProperties(normal, nextIOR, nextAbsorb,nextEmission, nextOpticalDepth,nextIsInside);");t.b("\n" + i);t.b("                r = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".ior / nextIOR;");t.b("\n" + i);t.b("                normal = negate(normal);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            rayType = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b("_setRayType(v, normal,r);");t.b("\n" + i);t.b("        ");t.b("\n" + i);if(!t.s(t.d("ptMaterial.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                color =  ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b("_render(v, normal, rayType);");t.b("\n" + i);};if(t.s(t.d("ptMaterial.usesUVMap",c,p,1),c,p,0,3160,3302,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                color = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b("_render(v, normal, uv, rayType);");t.b("\n" + i);});c.pop();}t.b("        ");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("        // hack to make sure that lights are not too bright");t.b("\n" + i);t.b("            if(v.data.iBounce == 0){");t.b("\n" + i);t.b("                hackCoeff = 0.2;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            //apply surface effects");t.b("\n" + i);t.b("            v.data.pixel = v.data.pixel + hackCoeff * v.data.light * ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".emission;");t.b("\n" + i);t.b("            if(!rayType.refract){");t.b("\n" + i);t.b("                v.data.light = v.data.light * color / max(rayType.chance, 0.0001);");t.b("\n" + i);t.b("             }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            // update the ray direction");t.b("\n" + i);t.b("            // diffuse uses a normal oriented cosine weighted hemisphere sample.");t.b("\n" + i);t.b("            diffuseDir = geomNormalize(add(normal, random));");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(rayType.diffuse){");t.b("\n" + i);t.b("                v.vector = diffuseDir;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(rayType.reflect){");t.b("\n" + i);t.b("                // perfectly smooth specular uses the reflection ray.");t.b("\n" + i);t.b("                reflectDir = geomReflect(v.vector, normal);");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("                // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared");t.b("\n" + i);t.b("               // reflectDir = geomNormalize(geomMix(reflectDir, diffuseDir, ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness * ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness));");t.b("\n" + i);t.b("                v.vector = reflectDir;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(rayType.refract){");t.b("\n" + i);t.b("                    refractDir = geomRefract(v.vector,normal, r);");t.b("\n" + i);t.b("                    // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared");t.b("\n" + i);t.b("                    refractDir = geomNormalize(geomMix(refractDir, diffuseDir, ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness * ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness));");t.b("\n" + i);t.b("                    v.data.isInside = nextIsInside;");t.b("\n" + i);t.b("                    v.data.currentAbsorb = nextAbsorb;");t.b("\n" + i);t.b("                    v.data.currentEmission = nextEmission;");t.b("\n" + i);t.b("                    v.data.currentOpticalDepth = nextOpticalDepth;");t.b("\n" + i);t.b("                    v.vector = refractDir;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            break;");t.b("\n" + i);t.b("    ");t.b("\n" + i);});c.pop();}t.b("    }");t.b("\n");t.b("\n" + i);t.b("    v.data.lastBounceDist = 0.;");t.b("\n" + i);t.b("    v.data.iBounce = v.data.iBounce + 1;");t.b("\n" + i);t.b("    // be carefull, v is not normal to the surface");t.b("\n" + i);t.b("    // if the time we flow is too small, we are still below the camera threshold");t.b("\n" + i);t.b("    float t = 20. * camera.threshold / abs(geomDot(v.vector, normal));");t.b("\n" + i);t.b("    v = flow(v, t);");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("void updateVectorData(inout ExtVector v, int hit, int objId){");t.b("\n" + i);t.b("    if (hit == HIT_DEBUG) {");t.b("\n" + i);t.b("        v.data.pixel = debugColor;");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if (hit == HIT_NOTHING) {");t.b("\n" + i);t.b("        vec3 bgColor = ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".diffuse;");t.b("\n" + i);t.b("        v.data.pixel = v.data.pixel + v.data.light * bgColor;");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        updateVectorDataFromSolid(v, objId);");t.b("\n" + i);t.b("        roulette(v);");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "VectorData initVectorData(){\n    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1), {{scene.ptBackground.name}}.absorb, {{scene.ptBackground.name}}.volumeEmission, {{scene.ptBackground.name}}.opticalDepth, false);\n}\n\n\n\nvoid roulette(inout ExtVector v){\n    // as the light left gets smaller, the ray is more likely to get terminated early.\n    // survivors have their value boosted to make up for fewer samples being in the average.\n    float p = max(v.data.light.r, max(v.data.light.g, v.data.light.b));\n    if (randomFloat() > p){\n        v.data.stop = true;\n    }\n    // add the energy we 'lose' by randomly terminating paths\n    v.data.light = v.data.light / p;\n}\n\n\n\nvoid updateVectorDataFromSolid(inout ExtVector v, int objId){\n    RelVector normal;\n    RayType rayType;\n    vec2 uv;\n    vec3 color;\n    vec3 reflectivity;\n    float hackCoeff = 1.;\n    float r; /** ratio of IOR */\n    float nextIOR; /** IOR of the neighbor solid */\n    vec3 nextAbsorb; /** absorb of the neighbor solid */\n    vec3 nextEmission;/** volumetric emission of the neighbor solid */\n    float nextOpticalDepth;/** optical depth of the neighbor solid */\n    bool nextIsInside = true;\n\n    RelVector diffuseDir;\n    RelVector reflectDir;\n    RelVector refractDir;\n\n    // get a uniformly distributed vector on the sphere\n    RelVector random = randomVector(v.vector);\n\n\n\n\n\n    //get volumetric coloring:\n    //portion of light is absorbed.\n    vec3 volAbsorb = exp((-v.data.currentAbsorb) * v.data.lastBounceDist);\n    \n    //light is emitted along the journey (linear or expoenential pickup)\n    vec3 volEmit = v.data.currentEmission * v.data.lastBounceDist;\n    //vec3 volEmit = exp(v.data.currentEmission * v.data.lastBounceDist)-vec3(1);\n\n    //use these quantities to update pixel and light:\n    v.data.light = v.data.light * volAbsorb;\n    v.data.pixel = v.data.pixel + v.data.light*volEmit;\n    v.data.light = v.data.light + volEmit;//the absorbtion doesn't distort the light output\n    \n\n\n\n\n\n\nswitch(objId){\n    {{#scene.solids}}\n    \n        case {{id}}:\n            normal = {{shape.name}}_gradient(v.vector);\n            normal = geomNormalize(normal);\n\n            \n            // get info and reset normal based on which side we are on.\n            // starting assumption: in the \"air\"\n            r = {{scene.ptBackground.name}}.ior / {{ptMaterial.name}}.ior;\n            nextAbsorb = {{ptMaterial.name}}.absorb;\n            nextEmission = {{ptMaterial.name}}.volumeEmission;\n            nextOpticalDepth = {{ptMaterial.name}}.opticalDepth;\n        \n            if(v.data.isInside){\n                //things to change if we are inside a material instead:\n                nextObjectProperties(normal, nextIOR, nextAbsorb,nextEmission, nextOpticalDepth,nextIsInside);\n                r = {{ptMaterial.name}}.ior / nextIOR;\n                normal = negate(normal);\n            }\n        \n            rayType = {{ptMaterial.name}}_setRayType(v, normal,r);\n        \n            {{^ptMaterial.usesUVMap}}\n                color =  {{ptMaterial.name}}_render(v, normal, rayType);\n            {{/ptMaterial.usesUVMap}}\n            {{#ptMaterial.usesUVMap}}\n                uv = {{shape.name}}_uvMap(v.vector);\n                color = {{ptMaterial.name}}_render(v, normal, uv, rayType);\n            {{/ptMaterial.usesUVMap}}\n        \n        \n        // hack to make sure that lights are not too bright\n            if(v.data.iBounce == 0){\n                hackCoeff = 0.2;\n            }\n        \n            //apply surface effects\n            v.data.pixel = v.data.pixel + hackCoeff * v.data.light * {{ptMaterial.name}}.emission;\n            if(!rayType.refract){\n                v.data.light = v.data.light * color / max(rayType.chance, 0.0001);\n             }\n        \n            // update the ray direction\n            // diffuse uses a normal oriented cosine weighted hemisphere sample.\n            diffuseDir = geomNormalize(add(normal, random));\n        \n            if(rayType.diffuse){\n                v.vector = diffuseDir;\n            }\n        \n            if(rayType.reflect){\n                // perfectly smooth specular uses the reflection ray.\n                reflectDir = geomReflect(v.vector, normal);\n        \n                // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared\n               // reflectDir = geomNormalize(geomMix(reflectDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));\n                v.vector = reflectDir;\n            }\n        \n            if(rayType.refract){\n                    refractDir = geomRefract(v.vector,normal, r);\n                    // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared\n                    refractDir = geomNormalize(geomMix(refractDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));\n                    v.data.isInside = nextIsInside;\n                    v.data.currentAbsorb = nextAbsorb;\n                    v.data.currentEmission = nextEmission;\n                    v.data.currentOpticalDepth = nextOpticalDepth;\n                    v.vector = refractDir;\n            }\n            break;\n    \n    {{/scene.solids}}\n    }\n\n    v.data.lastBounceDist = 0.;\n    v.data.iBounce = v.data.iBounce + 1;\n    // be carefull, v is not normal to the surface\n    // if the time we flow is too small, we are still below the camera threshold\n    float t = 20. * camera.threshold / abs(geomDot(v.vector, normal));\n    v = flow(v, t);\n}\n\nvoid updateVectorData(inout ExtVector v, int hit, int objId){\n    if (hit == HIT_DEBUG) {\n        v.data.pixel = debugColor;\n        v.data.stop = true;\n        return;\n    }\n    if (hit == HIT_NOTHING) {\n        vec3 bgColor = {{scene.ptBackground.name}}.diffuse;\n        v.data.pixel = v.data.pixel + v.data.light * bgColor;\n        v.data.stop = true;\n        return;\n    }\n    if(hit == HIT_SOLID) {\n        updateVectorDataFromSolid(v, objId);\n        roulette(v);\n        return;\n    }\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 5030:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    return gradient(");t.b(t.v(t.f("name",c,p,0)));t.b(",v);");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "RelVector {{name}}_gradient(RelVector v){\n    return gradient({{name}},v);\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8266:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("RelVector ");t.b(t.v(t.f("name",c,p,0)));t.b("_gradient(RelVector v){");t.b("\n" + i);t.b("    float newEp = 0.001;");t.b("\n");t.b("\n" + i);t.b("    RelVector shiftPX = smallShift(v, vec3(newEp, 0, 0));");t.b("\n" + i);t.b("    RelVector shiftPY = smallShift(v, vec3(0, newEp, 0));");t.b("\n" + i);t.b("    RelVector shiftPZ = smallShift(v, vec3(0, 0, newEp));");t.b("\n" + i);t.b("    RelVector shiftMX = smallShift(v, vec3(-newEp, 0, 0));");t.b("\n" + i);t.b("    RelVector shiftMY = smallShift(v, vec3(0, -newEp, 0));");t.b("\n" + i);t.b("    RelVector shiftMZ = smallShift(v, vec3(0, 0, -newEp));");t.b("\n");t.b("\n" + i);t.b("    float vgx = ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(shiftPX) - ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(shiftMX);");t.b("\n" + i);t.b("    float vgy = ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(shiftPY) - ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(shiftMY);");t.b("\n" + i);t.b("    float vgz = ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(shiftPZ) - ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(shiftMZ);");t.b("\n" + i);t.b("    RelVector n = createRelVector(v, vec3(vgx, vgy, vgz));");t.b("\n");t.b("\n" + i);t.b("    n = geomNormalize(n);");t.b("\n" + i);t.b("    return n;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "RelVector {{name}}_gradient(RelVector v){\n    float newEp = 0.001;\n\n    RelVector shiftPX = smallShift(v, vec3(newEp, 0, 0));\n    RelVector shiftPY = smallShift(v, vec3(0, newEp, 0));\n    RelVector shiftPZ = smallShift(v, vec3(0, 0, newEp));\n    RelVector shiftMX = smallShift(v, vec3(-newEp, 0, 0));\n    RelVector shiftMY = smallShift(v, vec3(0, -newEp, 0));\n    RelVector shiftMZ = smallShift(v, vec3(0, 0, -newEp));\n\n    float vgx = {{name}}_sdf(shiftPX) - {{name}}_sdf(shiftMX);\n    float vgy = {{name}}_sdf(shiftPY) - {{name}}_sdf(shiftMY);\n    float vgz = {{name}}_sdf(shiftPZ) - {{name}}_sdf(shiftMZ);\n    RelVector n = createRelVector(v, vec3(vgx, vgy, vgz));\n\n    n = geomNormalize(n);\n    return n;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3707:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("float ");t.b(t.v(t.f("name",c,p,0)));t.b("_sdf(RelVector v) {");t.b("\n" + i);t.b("    return sdf(");t.b(t.v(t.f("name",c,p,0)));t.b(",v);");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "float {{name}}_sdf(RelVector v) {\n    return sdf({{name}},v);\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6097:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                     \n  \n                                                                                                                        \n                                                                                                                        \n\n                                                                                                                        \n          \n                                    \n                                                                                                                        \n\nstruct GroupElement {\n    Isometry isom;                                 \n};\n\nconst GroupElement GROUP_IDENTITY = GroupElement(IDENTITY);\n\nGroupElement multiply(GroupElement elt1, GroupElement elt2){\n    return GroupElement(multiply(elt1.isom, elt2.isom));\n}\n\n                                              \n                                                 \n   \n\nIsometry toIsometry(GroupElement elt) {\n    return elt.isom;\n}"

/***/ }),

/***/ 9188:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                     \n  \n                                                                                                                        \n                                                                                                                        \n\n                                                                                                                        \n          \n                               \n                                                                                                                        \n\nstruct GroupElement {\n    bool fake;                                                           \n};\n\nconst GroupElement GROUP_IDENTITY = GroupElement(true);\n\nGroupElement multiply(GroupElement elt1, GroupElement elt2){\n    return GroupElement(true);\n}\n\n                                              \n                                \n   \n\nIsometry toIsometry(GroupElement elt) {\n    return IDENTITY;\n}"

/***/ }),

/***/ 5363:
/***/ ((module) => {

module.exports = "   \n                                                                \n   \nfloat fresnelReflectAmount(RelVector incident, RelVector normal, float r, float reflecAt0, float relfectAt90) {\n                           \n    float r0 = (r - 1.) / (r + 1.);\n    r0 = r0 * r0;\n    float cosX = -geomDot(normal, incident);\n    if (r > 1.)\n    {\n        float sinT2 = r * r * (1. - cosX * cosX);\n                                    \n        if (sinT2 > 1.){\n            return relfectAt90;\n        }\n        cosX = sqrt(1. - sinT2);\n    }\n    float x = 1.- cosX;\n    float ret = clamp(r0 + (1. - r0) * x * x * x * x * x, 0., 1.);\n\n                                                        \n                               \n    return reflecAt0 + (relfectAt90 - reflecAt0) * ret;\n}"

/***/ }),

/***/ 2093:
/***/ ((module) => {

module.exports = "   \n                                  \n   \nfloat smoothMaxPoly(float a, float b, float k){\n    float h = max(1. - abs(a - b) / k, 0.);\n    return max(a, b) + 0.25 * k * h * h;\n}\n\n   \n                                                                                 \n                                                 \n                                                   \n                                                   \n                                                    \n   \nRelVector gradientMaxPoly(float dist1, float dist2, RelVector grad1, RelVector grad2, float k){\n    RelVector gradMin, gradMax;\n    if (dist1 < dist2) {\n        gradMin = grad1;\n        gradMax = grad2;\n    }\n    else {\n        gradMin = grad2;\n        gradMax = grad1;\n    }\n    float h = max(1. - abs(dist1 - dist2) / k, 0.);\n    return add(multiplyScalar(1. - 0.5 * h, gradMax), multiplyScalar(0.5 * h, gradMin));\n}\n"

/***/ }),

/***/ 5442:
/***/ ((module) => {

module.exports = "float smoothMinPoly(float a, float b, float k){\n    float h = max(1. - abs(a - b) / k, 0.);\n    return min(a, b) - 0.25 * k * h * h;\n}\n\n\n   \n                                                                                 \n                                                 \n                                                   \n                                                   \n                                                    \n   \nRelVector gradientMinPoly(float dist1, float dist2, RelVector grad1, RelVector grad2, float k){\n    RelVector gradMin, gradMax;\n    if (dist1 < dist2) {\n        gradMin = grad1;\n        gradMax = grad2;\n    }\n    else {\n        gradMin = grad2;\n        gradMax = grad1;\n    }\n    float h = max(1. - abs(dist1 - dist2) / k, 0.);\n\n    return add(multiplyScalar(1. - 0.5 * h, gradMin), multiplyScalar(0.5 * h, gradMax));\n}\n"

/***/ }),

/***/ 2143:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct BasicPTMaterial {\n    vec3 emission;\n    vec3 volumeEmission;\n    float opticalDepth;\n    vec3 diffuse;\n    vec3 specular;\n    vec3 absorb;\n    float ior;\n    float roughness;\n    float diffuseChance;\n    float reflectionChance;\n    float refractionChance;\n};\n\n\nRayType setRayType(BasicPTMaterial material, ExtVector v, RelVector n, float r) {\n    RayType res = RayType(false, false, false, 0.);\n    float random = randomFloat();\n\n    float reflectionChance = fresnelReflectAmount(v.vector, n, r, material.reflectionChance, 1.0);\n    float chanceMultiplier = (1. - reflectionChance) / (1. - material.reflectionChance);\n                                                         \n                                  \n    float refractionChance = chanceMultiplier * material.refractionChance;\n    float diffuseChance = 1. - refractionChance - reflectionChance;\n\n    if (random < diffuseChance){\n        res.diffuse = true;\n        res.chance = diffuseChance;\n    } else if (random < diffuseChance + reflectionChance){\n        res.reflect = true;\n        res.chance = reflectionChance;\n    }\n    else {\n        res.refract = true;\n        res.chance = refractionChance;\n    }\n    return res;\n}\n\nvec3 render(BasicPTMaterial material, ExtVector v, RayType rayType) {\n    if (rayType.reflect){\n        return material.specular;\n    }\n                               \n                                              \n                                         \n       \n    return material.diffuse;\n}\n\n"

/***/ }),

/***/ 2197:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct CheckerboardMaterial {\n    vec2 dir1;\n    vec2 dir2;\n    vec3 color1;\n    vec3 color2;\n};\n\nvec3 render(CheckerboardMaterial material, ExtVector v, vec2 uv) {\n    float x1 = mod(dot(uv, material.dir1), 2.);\n    float x2 = mod(dot(uv, material.dir2), 2.);\n    if (x1 < 1. && x2 < 1.){\n        return material.color1;\n    } else if (x1 >= 1. && x2 >= 1.) {\n        return material.color1;\n    } else {\n        return material.color2;\n    }\n}\n\n"

/***/ }),

/***/ 7793:
/***/ ((module) => {

module.exports = "\n                                                                                                                        \n                       \n                                                                                                                        \n"

/***/ }),

/***/ 3496:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                  \n                                            \n                                                     \n                                                                                                                        \n\nvec3 normalMaterialRender(ExtVector v, RelVector normal) {\n    Vector[3] f;\n    Point pos = applyGroupElement(v.vector.cellBoost, v.vector.local.pos);\n    frame(pos, f);\n\n    f[0] = applyGroupElement(v.vector.invCellBoost, f[0]);\n    f[1] = applyGroupElement(v.vector.invCellBoost, f[1]);\n    f[2] = applyGroupElement(v.vector.invCellBoost, f[2]);\n    \n                  \n                            \n    float r =  geomDot(normal.local, f[0]);\n    float g =  geomDot(normal.local, f[1]);\n    float b =  geomDot(normal.local, f[2]);\n    return abs(vec3(r, g, b));\n}"

/***/ }),

/***/ 7198:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct PathTracerWrapMaterial {\n    vec3 emission;\n    vec3 volumeEmission;\n    float opticalDepth;\n    vec3 specular;\n    vec3 absorb;\n    float ior;\n    float roughness;\n    float diffuseChance;\n    float reflectionChance;\n    float refractionChance;\n};\n\n\nRayType setRayType(PathTracerWrapMaterial material, ExtVector v, RelVector n, float r) {\n    RayType res = RayType(false, false, false, 0.);\n    float random = randomFloat();\n\n    float reflectionChance = fresnelReflectAmount(v.vector, n, r, material.reflectionChance, 1.0);\n    float chanceMultiplier = (1. - reflectionChance) / (1. - material.reflectionChance);\n    float refractionChance = chanceMultiplier * material.refractionChance;\n    float diffuseChance = 1. - refractionChance - reflectionChance;\n\n    if (random < diffuseChance){\n        res.diffuse = true;\n        res.chance = diffuseChance;\n    } else if (random < diffuseChance + reflectionChance){\n        res.reflect = true;\n        res.chance = reflectionChance;\n    }\n    else {\n        res.refract = true;\n        res.chance = refractionChance;\n    }\n    return res;\n}\n\n"

/***/ }),

/***/ 6045:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                 \n                                                                                                                        \n\nstruct PhongMaterial {\n    vec3 color;\n    float ambient;\n    float diffuse;\n    float specular;\n    float shininess;\n    vec3 reflectivity;\n};\n\n\n   \n                                                                \n                                \n                                                                        \n                                                             \n                                             \n                                               \n                                                                         \n                                                                   \n                                                            \n                                                      \n   \n                                                                                                                   \n                               \n                         \n                       \n                                                    \n                                                  \n                                                  \n  \n                                                          \n                                                                                                   \n                                 \n                                                       \n                  \n    \n\nvec3 lightComputation(Vector v, Vector n, Vector dir, PhongMaterial material, vec3 lightColor, float intensity){\n    Vector auxV = negate(v);\n    Vector auxL = dir;\n    Vector auxN = n;\n    Vector auxR = geomReflect(negate(auxL), auxN);\n    float NdotL = max(geomDot(auxN, auxL), 0.);\n    float RdotV = max(geomDot(auxR, auxV), 0.);\n\n                                                 \n    float specularCoeff = material.specular * pow(RdotV, material.shininess);\n    float diffuseCoeff = material.diffuse * NdotL;\n    float ambientCoeff = material.ambient;\n\n                                                \n                                                                                                                                                                                                                                      \n    vec3 specularLight = lightColor.rgb;\n    vec3 diffuseLight = 0.8 * lightColor.rgb + 0.2 * vec3(1.);\n    vec3 ambientLight = 0.5 * lightColor.rgb + 0.5 * vec3(1.);\n\n                                                 \n    vec3 specular = specularCoeff * specularLight;\n    vec3 diffuse = diffuseCoeff * diffuseLight * material.color;\n    vec3 ambient = ambientCoeff * ambientLight * material.color;\n\n                 \n    vec3 res = intensity * (ambient + diffuse + specular);\n\n    return res;\n}"

/***/ }),

/***/ 5836:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                      \n                                                                                                                        \n\nstruct PhongWrapMaterial {\n    float ambient;\n    float diffuse;\n    float specular;\n    float shininess;\n    vec3 reflectivity;\n};\n\nvec3 lightComputation(Vector v, Vector n, Vector dir, vec3 baseColor, PhongWrapMaterial material, vec3 lightColor, float intensity){\n    Vector auxV = negate(v);\n    Vector auxL = dir;\n    Vector auxN = n;\n    Vector auxR = geomReflect(negate(auxL), auxN);\n    float NdotL = max(geomDot(auxN, auxL), 0.);\n    float RdotV = max(geomDot(auxR, auxV), 0.);\n\n                                                 \n    float specularCoeff = material.specular * pow(RdotV, material.shininess);\n    float diffuseCoeff = material.diffuse * NdotL;\n    float ambientCoeff = material.ambient;\n\n                                                \n                                                                                                                                                                                                                                      \n    vec3 specularLight = lightColor.rgb;\n    vec3 diffuseLight = 0.8 * lightColor.rgb + 0.2 * vec3(1.);\n    vec3 ambientLight = 0.5 * lightColor.rgb + 0.5 * vec3(1.);\n\n                                                 \n    vec3 specular = specularCoeff * specularLight;\n    vec3 diffuse = diffuseCoeff * diffuseLight * baseColor;\n    vec3 ambient = ambientCoeff * ambientLight * baseColor;\n\n                 \n    vec3 res = intensity * (ambient + diffuse + specular);\n\n    return res;\n}"

/***/ }),

/***/ 9095:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct SimpleTextureMaterial {\n    sampler2D sampler;\n    vec2 start;\n    vec2 scale;\n    bool repeatU;\n    bool repeatV;\n};\n\nvec3 render(SimpleTextureMaterial material, ExtVector v, vec2 uv) {\n    vec2 texCoords = (uv - material.start) * material.scale;\n    vec4 color = texture(material.sampler, texCoords);\n                                                 \n    return color.xyz;\n}\n\n\n"

/***/ }),

/***/ 2664:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                        \n                                                                                                                        \n\nstruct SingleColorMaterial {\n    vec3 color;\n};\n\nvec3 render(SingleColorMaterial material, ExtVector v) {\n    return material.color;\n}"

/***/ }),

/***/ 5348:
/***/ ((module) => {

module.exports = "vec3 applyFog(vec3 color, float dist){\n    float coeff = exp(- fog.scattering * dist);\n    return coeff * color + (1. - coeff) * fog.color;\n}"

/***/ }),

/***/ 7885:
/***/ ((module) => {

module.exports = "                                                                                                                        \n  \n          \n                                 \n  \n                                                                                                                        \n\nstruct ExpFog {\n    vec3 color;                             \n    float scattering;                                                    \n};\n"

/***/ }),

/***/ 7333:
/***/ ((module) => {

module.exports = "struct IntersectionShape {\n    float maxCoeff;\n};"

/***/ }),

/***/ 519:
/***/ ((module) => {

module.exports = "struct UnionShape {\n    float minCoeff;\n};\n"

/***/ }),

/***/ 1685:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = vec4(coords, 0);\n    dir = camera.matrix * dir;\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}"

/***/ }),

/***/ 7591:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct Camera {\n    float fov;                              \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n};"

/***/ }),

/***/ 4651:
/***/ ((module) => {

module.exports = "   \n                                                                                                 \n                                                                                        \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = vec4(coords, 0);\n    dir = camera.matrix * dir;\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}\n\n   \n                                                                                             \n                                                               \n   \nRelVector mappingFromFlatScreen(vec2 coords) {\n                                                         \n    vec2 jitter = vec2(randomFloat(), randomFloat()) - 0.5;\n\n                                                                            \n    vec2 planeCoords = (coords - 0.5 * resolution + jitter) / (0.5 * resolution.y);\n\n                              \n    float z = - 1. / tan(radians(0.5 * camera.fov));\n\n                                                      \n    vec4 dir = vec4(planeCoords, z, 0);\n\n    dir = camera.matrix * dir;\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}"

/***/ }),

/***/ 766:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                      \n                                                                                               \n                                                                                                                        \nstruct PathTracerCamera {\n    float fov;                     \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n    float focalLength;                    \n    float aperture;                \n};"

/***/ }),

/***/ 5074:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = normalize(vec4(coords, 0));\n    dir = camera.matrix * dir;\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    return applyPosition(camera.position, v);\n}"

/***/ }),

/***/ 6539:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct VRCamera {\n    float fov;                     \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n};"

/***/ }),

/***/ 190:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                                               \n  \n                                                                                                                        \n                                                                                                                        \n\n\nVector geomMix(Vector v1, Vector v2, float a){\n    return add(multiplyScalar(1.-a, v1), multiplyScalar(a, v2));\n}\n\n   \n                                           \n                         \n             \n   \nVector negate(Vector v) {\n    return multiplyScalar(-1., v);\n}\n\n\n   \n                                         \n                       \n   \nfloat geomLength(Vector v){\n    return sqrt(geomDot(v, v));\n}\n\n   \n                                                          \n                            \n   \nVector geomNormalize(Vector v){\n    float a = geomLength(v);\n    return multiplyScalar(1./a, v);\n}\n\n   \n                                                     \n   \nfloat cosAngle(Vector v1, Vector v2){\n    float a1 = geomLength(v1);\n    float a2 = geomLength(v2);\n    return geomDot(v1, v2)/ (a1 * a2);\n}\n\n   \n                                                           \n                                   \n                                                                                                        \n                                     \n                                                                   \n                                                                       \n   \nVector geomReflect(Vector v, Vector n){\n    return sub(v, multiplyScalar(2. * geomDot(v, n), n));\n}\n\n\n   \n                                         \n                                                                        \n                                                                                   \n                                              \n   \nVector geomRefract(Vector v, Vector n, float r){\n    float cosTheta1 = -geomDot(n, v);\n    float sinTheta2Sq = r * r * (1. - cosTheta1 * cosTheta1);\n\n    if (sinTheta2Sq > 1.){\n               \n        return zeroVector(v.pos);\n    }\n                                                                 \n    float cosTheta2 = sqrt(1. - sinTheta2Sq);\n    float aux = r * cosTheta1 - cosTheta2;\n    return add(multiplyScalar(r, v), multiplyScalar(aux, n));\n}\n\n   \n                                                                          \n                                           \n   \nIsometry makeTranslation(Vector v) {\n    return makeTranslation(v.pos);\n}\n\n   \n                                                                          \n                                              \n   \nIsometry makeInvTranslation(Vector v) {\n    return makeInvTranslation(v.pos);\n}\n"

/***/ }),

/***/ 4168:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                                               \n  \n                                                                                                                        \n                                                                                                                        \n\n   \n                                                                         \n               \n   \nVector createVector(Point p, vec3 coords, Vector[3] frame){\n    Vector c0 = multiplyScalar(coords[0], frame[0]);\n    Vector c1 = multiplyScalar(coords[1], frame[1]);\n    Vector c2 = multiplyScalar(coords[2], frame[2]);\n    return add(c0, add(c1, c2));\n}\n\n\n\n   \n                                                                                          \n               \n   \nVector createVector(Point p, vec3 coords){\n    Vector[3] f;\n    frame(p, f);\n    return createVector(p, coords, f);\n}\n\n   \n                                                                                          \n               \n   \nVector createVectorOrtho(Point p, vec3 coords){\n    Vector[3] f;\n    orthoFrame(p, f);\n    return createVector(p, coords, f);\n}\n\n\n                                                                                                                        \n  \n                   \n                                                             \n                                                                       \n  \n                                                                                                                        \n\nstruct Position {\n    Isometry boost;\n    mat4 facing;\n};\n\n\n   \n                                        \n                          \n                                           \n   \nVector applyPosition(Position p, Vector v){\n    Vector res = applyFacing(p.facing, v);\n    return applyIsometry(p.boost, res);\n}"

/***/ }),

/***/ 2792:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                       \n                                                                                               \n  \n                                                                                                                        \n                                                                                                                        \n\n   \n              \n                                \n   \nPoint applyIsometry(GroupElement elt, Point p){\n    return applyIsometry(toIsometry(elt), p);\n}\n\nPoint applyGroupElement(GroupElement elt, Point p){\n    return applyIsometry(toIsometry(elt), p);\n}\n\n   \n              \n                                \n   \nVector applyIsometry(GroupElement elt, Vector v){\n    return applyIsometry(toIsometry(elt), v);\n}\n\nVector applyGroupElement(GroupElement elt, Vector v){\n    return applyIsometry(toIsometry(elt), v);\n}\n\n\n\n                                                                                                                        \n  \n                      \n                                                        \n                                                                     \n                        \n                                                                                 \n                                                                                 \n                                                                                   \n                                                                                    \n                                                                       \n                                                                                                                        \n\nstruct RelPosition {\n    Position local;\n    GroupElement cellBoost;\n    GroupElement invCellBoost;\n};\n\n\n                                                                                                                        \n  \n                    \n                                  \n                                                                       \n                      \n                                                                                 \n                                                                                 \n                                                                            \n                                                                                    \n                                                                                                                        \n\nstruct RelVector {\n    Vector local;\n    GroupElement cellBoost;\n    GroupElement invCellBoost;\n};\n\n\n   \n                                                            \n   \nRelVector reduceError(RelVector v){\n    v.local = reduceError(v.local);\n    return v;\n}\n\n   \n                         \n                            \n                                                      \n   \nRelVector add(RelVector v1, RelVector v2){\n    v1.local = add(v1.local, v2.local);\n    return v1;\n}\n\n   \n                              \n                            \n                                                      \n   \nRelVector sub(RelVector v1, RelVector v2){\n    v1.local = sub(v1.local, v2.local);\n    return v1;\n}\n\n   \n                                   \n                         \n                      \n   \nRelVector multiplyScalar(float s, RelVector v){\n    v.local = multiplyScalar(s, v.local);\n    return v;\n}\n\n   \n                                                                                 \n                     \n                                                        \n   \nfloat geomDot(RelVector v1, RelVector v2) {\n    return geomDot(v1.local, v2.local);\n}\n\n   \n                              \n   \nRelVector geomNormalize(RelVector v){\n    v.local = geomNormalize(v.local);\n    return v;\n}\n\n   \n                                   \n                                                        \n   \nRelVector geomMix(RelVector v1, RelVector v2, float a) {\n    v1.local = geomMix(v1.local, v2.local, a);\n    return v1;\n}\n\n   \n                                            \n   \nRelVector negate(RelVector v){\n    v.local = negate(v.local);\n    return v;\n}\n\n   \n                                                                     \n                                                       \n   \nRelVector geomReflect(RelVector v, RelVector normal){\n    v.local = geomReflect(v.local, normal.local);\n    return v;\n}\n\n\n   \n                                                                     \n                                                       \n   \nRelVector geomRefract(RelVector v, RelVector normal, float n){\n    v.local = geomRefract(v.local, normal.local, n);\n    return v;\n}\n\n   \n                         \n                                            \n                                                                         \n   \nRelVector flow(RelVector v, float t) {\n    v.local = flow(v.local, t);\n    return v;\n}\n\n   \n                                                                                          \n                                                                           \n                                                                          \n                               \n                                                                                              \n   \nRelVector smallShift(RelVector v, vec3 dp){\n    v.local = smallShift(v.local, dp);\n    return v;\n                                                 \n                                                               \n}\n\n\n   \n                                                                                                            \n                           \n                                                   \n                                                                                             \n                                            \n   \n                                                   \n                                                   \n               \n                                                             \n                                                                 \n   \n\n   \n                                                                                                            \n                                                   \n                                                                                             \n   \nRelVector createRelVector(RelVector v, vec3 coords){\n    v.local =  createVector(v.local.pos, coords);\n    return v;\n                                                           \n                                                               \n}\n\n   \n                                                                  \n                          \n                                           \n   \nRelVector applyPosition(RelPosition position, Vector v) {\n    Vector local = applyPosition(position.local, v);\n    return RelVector(local, position.cellBoost, position.invCellBoost);\n}\n\n   \n                                                                                                                    \n   \nRelVector rewrite(RelVector v, GroupElement elt, GroupElement inv){\n    v.local = applyGroupElement(elt, v.local);\n                                     \n                                       \n    v.cellBoost = multiply(v.cellBoost, inv);\n    v.invCellBoost = multiply(elt, v.invCellBoost);\n    return v;\n}\n\n\n                                                                                                                        \n  \n                    \n                                    \n                                                                              \n                  \n                                                      \n                                                                                         \n  \n                                                                                                                        \n\nstruct ExtVector {\n    RelVector vector;\n    VectorData data;\n};\n\n\nExtVector flow(ExtVector v, float t) {\n    v.vector = flow(v.vector, t);\n    v.data.lastFlowDist = t;\n    v.data.lastBounceDist = v.data.lastBounceDist + t;\n    v.data.totalDist  = v.data.totalDist + t;\n    return v;\n}\n\n\n\n"

/***/ }),

/***/ 5315:
/***/ ((module) => {

module.exports = "   \n                          \n   \nvarying vec3 spherePosition;\n\n   \n                                           \n                       \n                                                           \n                                 \n                                                         \n   \nvoid main() {\n    RelVector vector = mapping(spherePosition);\n    ExtVector v = ExtVector(vector, initVectorData());\n    vec3 color = getColor(v);\n    gl_FragColor = vec4(color, 1);\n}"

/***/ }),

/***/ 9461:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                              \n  \n                                                                                                                        \n                                                                                                                        \n\nstruct VectorData {\n    float lastFlowDist;                                                                    \n    float lastBounceDist;                                                           \n    float totalDist;                                                  \n    bool isTeleported;                                             \n    int iMarch;                                                        \n    int iBounce;                                             \n    bool stop;                              \n    vec3 pixel;                                                                   \n    vec3 leftToComputeColor;                                                                     \n};"

/***/ }),

/***/ 1767:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                             \n  \n                                                                                                                        \n                                                                                                                        \n\n   \n              \n   \nconst float PI = 3.1415926538;\n\n   \n                      \n   \nvec3 debugColor = vec3(0.5, 0, 0.8);\n\n   \n                                    \n         \n   \nconst int HIT_NOTHING = 0;\n   \n                                    \n         \n   \nconst int HIT_SOLID = 1;\n   \n                                  \n         \n   \nconst int HIT_DEBUG = -1;\n"

/***/ }),

/***/ 145:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n              \n  \n                                                                                                                        \n                                                                                                                        \n\n\n   \n                \n                                                      \n                                         \n                                                                                       \n                                                      \n                                                                    \n          \n                                \n                               \n                          \n                                                                                               \n                                                               \n                                                                                                                 \n                                                                                         \n   \nint raymarch(inout ExtVector v, out int objId){\n    initFlow(v.vector.local);                                                                 \n    ExtVector globalV0 = v;\n    ExtVector globalV = globalV0;\n    ExtVector localV0 = v;\n    ExtVector localV = localV0;\n    ExtVector res = v;\n    int auxId;\n    int auxHit;\n    float marchingStep = camera.minDist;\n    float dist;\n    int hit = HIT_NOTHING;\n\n    \n                  \n    for (int i = 0; i < camera.maxSteps; i++){\n                          \n        localV.data.iMarch = v.data.iMarch + i;\n        \n                                                     \n        localV = teleport(localV);\n        if (localV.data.isTeleported){\n                                                                                           \n            localV0 = localV;\n                                                                                      \n            marchingStep = camera.minDist;\n        }\n        else {\n                                                    \n            if (localV.data.totalDist > camera.maxDist) {\n                break;\n            }\n            dist = localSceneSDF(localV.vector, auxHit, auxId);\n            if (auxHit == HIT_DEBUG){\n                hit = HIT_DEBUG;\n                break;\n            }\n            if (auxHit == HIT_SOLID) {\n                                   \n                hit = HIT_SOLID;\n                objId = auxId;\n                v = localV;\n                break;\n            }\n            marchingStep = marchingStep + dist;\n            localV = creepingFlow(localV0, marchingStep, camera.threshold);\n        }\n    }\n    if(hit == HIT_NOTHING) {\n        v = localV;\n    }\n\n                  \n    marchingStep = camera.minDist;\n    for (int i=0; i < camera.maxSteps; i++){\n                          \n        globalV.data.iMarch = v.data.iMarch + i;\n        \n        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){\n                                              \n            break;\n        }\n        dist = globalSceneSDF(globalV.vector, auxHit, auxId);\n\n        if (auxHit == HIT_DEBUG){\n            hit = HIT_DEBUG;\n            break;\n        }\n        if (auxHit == HIT_SOLID) {\n                               \n            hit = auxHit;\n            objId = auxId;\n            v = globalV;\n            break;\n        }\n        marchingStep = marchingStep + dist;\n        globalV = flow(globalV0, marchingStep);\n    }\n\n    if(hit == HIT_NOTHING) {\n        v = globalV;\n    }\n    return hit;\n}\n\nvec3 getColor(ExtVector v){\n    int objId;\n    int hit;\n    for (int i = 0; i <= maxBounces; i++){\n        if (v.data.stop){\n            break;\n        }\n        hit = raymarch(v, objId);\n        updateVectorData(v, hit, objId);\n    }\n    return v.data.pixel;\n}"

/***/ }),

/***/ 2639:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                \n  \n                                                                                                                        \n                                                                                                                        \n \nvarying vec3 spherePosition;\n\n   \n                                      \n                                                   \n                                                               \n                                                 \n   \nvoid main()\n{\n    spherePosition = position;\n    gl_Position = projectionMatrix * vec4(position, 1.0);\n}"

/***/ }),

/***/ 8187:
/***/ ((module) => {

module.exports = "   \n                          \n   \nvarying vec3 spherePosition;\n\n\n   \n                                           \n                       \n                                                           \n                                 \n                                                         \n   \nvoid main() {\n    initSeed(gl_FragCoord.xy, frameSeed);\n    RelVector vector = mappingFromFlatScreen(gl_FragCoord.xy);\n    ExtVector v = ExtVector(vector, initVectorData());\n    vec3 color = getColor(v);\n    gl_FragColor = vec4(color, 1);\n}\n"

/***/ }),

/***/ 9638:
/***/ ((module) => {

module.exports = "   \n                                                \n  \n   \nuint seed;\n\n   \n                                                \n                                                                  \n                                                \n                                                                                                         \n   \nvoid initSeed(vec2 coords, uint frameSeed){\n    uvec2 aux = uvec2(coords);\n    seed =  aux.x * uint(1973) + aux.y * uint(925277) + frameSeed * uint(26699) | uint(1);\n}\n\n   \n                           \n               \n                                                                                                     \n   \nuint wangHash() {\n    seed = (seed ^ uint(61)) ^ (seed >> uint(16));\n    seed = seed * uint(9);\n    seed = seed ^ (seed >> 4);\n    seed = seed * uint(0x27d4eb2d);\n    seed = seed ^ (seed >> 15);\n    return seed;\n}\n\n   \n                                                  \n   \nfloat randomFloat() {\n    return float(wangHash()) / 4294967296.;\n}\n\n   \n                                                                           \n                                                                                                    \n                                                                                                       \n                                          \n   \nvec3 randomUnitVec3() {\n    float z = randomFloat() * 2. - 1.;\n    float theta = randomFloat() * 2. * PI;\n    float r = sqrt(1. - z * z);\n    float x = r * cos(theta);\n    float y = r * sin(theta);\n    return vec3(x, y, z);\n}\n\n   \n                                                   \n                                                      \n   \nVector randomVector(Point p) {\n    vec3 dir = randomUnitVec3();\n    return createVectorOrtho(p, dir);\n}\n\n   \n                                                                     \n                                                                                               \n   \nvec2 randomNormal2D(){\n    float u = randomFloat();\n    float v = randomFloat();\n\n    float r = sqrt(abs(2. * log(u)));\n    float x = r * cos(2. * PI * v);\n    float y = r * sin(2. * PI * v);\n\n    return vec2(x, y);\n\n}\n\n   \n                                                      \n   \nfloat randomNormal(float mean, float stdev){\n\n                           \n    float x = randomNormal2D().x;\n\n                                   \n    return stdev * x + mean;\n}\n"

/***/ }),

/***/ 7920:
/***/ ((module) => {

module.exports = "   \n                                                                                      \n  \n   \n\n\n   \n                                                                                   \n                                                                          \n                                                       \n   \nRelVector randomVector(RelVector v) {\n    v.local = randomVector(v.local.pos);\n    return v;\n}"

/***/ }),

/***/ 3499:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n              \n  \n                                                                                                                        \n                                                                                                                        \n\n\n   \n                \n                                                      \n                                         \n                                                                                       \n                                                      \n                                                                    \n          \n                                \n                               \n                          \n                                                                                               \n                                                               \n                                                                                                                 \n                                                                                         \n   \nint raymarch(inout ExtVector v, out int objId){\n    initFlow(v.vector.local);                                                                 \n    ExtVector globalV0 = v;\n    ExtVector globalV = globalV0;\n    ExtVector localV0 = v;\n    ExtVector localV = localV0;\n    ExtVector res = v;\n    int auxId;\n    int auxHit;\n    float marchingStep = camera.minDist;\n    float dist;\n    int hit = HIT_NOTHING;\n\n    \n                  \n    for (int i = 0; i < camera.maxSteps; i++){\n                          \n        localV.data.iMarch = v.data.iMarch + i;\n        \n                                                     \n        localV = teleport(localV);\n        if (localV.data.isTeleported){\n                                                                                           \n            localV0 = localV;\n                                                                                      \n            marchingStep = camera.minDist;\n        }\n        else {\n                                                    \n            if (localV.data.totalDist > camera.maxDist) {\n                break;\n            }\n            dist = localSceneSDF(localV.vector, auxHit, auxId);\n            if (auxHit == HIT_DEBUG){\n                hit = HIT_DEBUG;\n                break;\n            }\n            if (auxHit == HIT_SOLID) {\n                                   \n                hit = HIT_SOLID;\n                objId = auxId;\n                v = localV;\n                break;\n            }\n            marchingStep = marchingStep + abs(dist);\n            localV = creepingFlow(localV0, marchingStep, camera.threshold);\n        }\n    }\n    if(hit == HIT_NOTHING) {\n        v = localV;\n    }\n                  \n    marchingStep = camera.minDist;\n    for (int i=0; i < camera.maxSteps; i++){\n                          \n        globalV.data.iMarch = v.data.iMarch + i;\n        \n        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){\n                                              \n            break;\n        }\n        dist = globalSceneSDF(globalV.vector, auxHit, auxId);\n\n        if (auxHit == HIT_DEBUG){\n            hit = HIT_DEBUG;\n            break;\n        }\n        if (auxHit == HIT_SOLID) {\n                               \n            hit = auxHit;\n            objId = auxId;\n            v = globalV;\n            break;\n        }\n        marchingStep = marchingStep + abs(dist);\n        globalV = flow(globalV0, marchingStep);\n    }\n\n    if(hit == HIT_NOTHING) {\n        v = globalV;\n    }\n    return hit;\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nbool doesItScatter(inout float dist, float opticalDepth){\n                          \n    if (opticalDepth>100.){\n        return false;\n    }\n    else {\n        float probScatter=1.-exp(-dist/opticalDepth);\n        float flip=randomFloat();\n        if (flip<probScatter){\n                                           \n                                                \n            dist=dist*randomFloat();\n            return true;\n        }\n                                              \n        return false;\n    }\n}\n\n\nvoid scatterRay(inout ExtVector v){\n                                         \n    RelVector w=randomVector(v.vector);\n    \n                                                 \n                                                  \n    v.vector=w;\n                                             \n                                                      \n}\n\n\n\nint scatterRaymarch(inout ExtVector v, out int objId){\n    initFlow(v.vector.local);                                                                 \n    ExtVector globalV0 = v;\n    ExtVector globalV = globalV0;\n    ExtVector localV0 = v;\n    ExtVector localV = localV0;\n    ExtVector res = v;\n    int auxId;\n    int auxHit;\n    float marchingStep = camera.minDist;\n    float dist;\n    int hit = HIT_NOTHING;\n    float d;\n    bool doScatter;\n\n\n                  \n    for (int i = 0; i < camera.maxSteps; i++){\n                          \n        localV.data.iMarch = v.data.iMarch + i;\n\n                                                     \n        localV = teleport(localV);\n        if (localV.data.isTeleported){\n                                                                                           \n            localV0 = localV;\n                                                                                      \n            marchingStep = camera.minDist;\n        }\n        else {\n                                                    \n            if (localV.data.totalDist > camera.maxDist) {\n                break;\n            }\n            dist = localSceneSDF(localV.vector, auxHit, auxId);\n            if (auxHit == HIT_DEBUG){\n                hit = HIT_DEBUG;\n                break;\n            }\n            if (auxHit == HIT_SOLID) {\n                                   \n                hit = HIT_SOLID;\n                objId = auxId;\n                v = localV;\n                break;\n            }\n            \n                                          \n            d=abs(dist);\n            doScatter=doesItScatter(d,v.data.currentOpticalDepth);\n            \n                                                \n            marchingStep = marchingStep + d;\n            localV = creepingFlow(localV0, marchingStep, camera.threshold);\n            \n                                                       \n            if(doScatter){\n                scatterRay(localV);\n            }\n        }\n    }\n    if(hit == HIT_NOTHING) {\n        v = localV;\n    }\n                  \n    marchingStep = camera.minDist;\n    for (int i=0; i < camera.maxSteps; i++){\n                          \n        globalV.data.iMarch = v.data.iMarch + i;\n\n        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){\n                                              \n            break;\n        }\n        dist = globalSceneSDF(globalV.vector, auxHit, auxId);\n\n        if (auxHit == HIT_DEBUG){\n            hit = HIT_DEBUG;\n            break;\n        }\n        if (auxHit == HIT_SOLID) {\n                               \n            hit = auxHit;\n            objId = auxId;\n            v = globalV;\n            break;\n        }\n        \n                                      \n        d=abs(dist);\n        doScatter=doesItScatter(d,v.data.currentOpticalDepth);\n\n                                            \n        marchingStep = marchingStep + d;\n        globalV = flow(globalV0, marchingStep);\n\n                                                   \n        if(doScatter){\n            scatterRay(globalV);\n        }\n    }\n\n    if(hit == HIT_NOTHING) {\n        v = globalV;\n    }\n    return hit;\n}\n\n\n\n\n\n\n\n\n\n\n\n\nvec3 getColor(ExtVector v){\n    int objId;\n    int hit;\n    for (int i = 0; i <= maxBounces; i++){\n        if (v.data.stop){\n            break;\n        }\n        hit = scatterRaymarch(v, objId);\n        updateVectorData(v, hit, objId);\n    }\n    return v.data.pixel;\n}"

/***/ }),

/***/ 3888:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n           \n  \n                                                                                                                        \n                                                                                                                        \n\nstruct RayType{\n    bool diffuse;\n    bool reflect;\n    bool refract;\n    float chance;\n};\n\n                                                                                                                        \n                                                                                                                        \n  \n                              \n  \n                                                                                                                        \n                                                                                                                        \n\nstruct VectorData {\n    float lastFlowDist;                                                                    \n    float lastBounceDist;                                                           \n    float totalDist;                                                  \n    bool isTeleported;                                             \n    int iMarch;                                                        \n    int iBounce;                                             \n    bool stop;                              \n    vec3 pixel;         \n    vec3 light;         \n    vec3 currentAbsorb;                                                    \n    vec3 currentEmission;                                                             \n    float currentOpticalDepth;                                                              \n    bool isInside;                                        \n};\n\n"

/***/ }),

/***/ 7499:
/***/ ((module) => {

module.exports = "                                                                                                                        \n  \n           \n                               \n  \n                                                                                                                        \n \n struct Solid {\n    bool isRendered;\n };\n"

/***/ }),

/***/ 8959:
/***/ ((module) => {

module.exports = "                                                                                                                        \n        \n                                                        \n                                                   \n                                                                               \n                                                                                                                        \n\n\n\n                                                                                                                        \n  \n                   \n                                            \n  \n                                                                                                                        \nstruct Isometry{\n    mat4 matrix;\n    float shift;\n};\n\n   \n                    \n   \nconst Isometry IDENTITY = Isometry(mat4(1.), 0.);                          \n\n   \n                                                              \n   \nIsometry reduceError(Isometry isom){\n    return isom;\n}\n\n   \n                                     \n   \nIsometry multiply(Isometry isom1, Isometry isom2) {\n    mat4 matrix = isom1.matrix * isom2.matrix;\n    float shift = isom1.shift + isom1.matrix[3][3] * isom2.shift;\n    Isometry res= Isometry(matrix, shift);\n    return reduceError(res);\n}\n\n   \n                                            \n   \nIsometry geomInverse(Isometry isom) {\n    mat4 inv = inverse(isom.matrix);\n    float shift = -isom.matrix[3][3] * isom.shift;\n    Isometry res=Isometry(inv, shift);\n    return reduceError(res);\n}\n\n                                                                                                                        \n  \n                \n                                        \n  \n                                                                                                                        \nstruct Point{\n    vec4 coords;\n};\n\n\nconst Point ORIGIN = Point(vec4(0, 0, 1, 0));                               \n\n   \n                                                           \n   \nPoint reduceError(Point p){\n    vec3 aux = normalize(p.coords.xyz);\n    return Point(vec4(aux, p.coords.w));\n}\n\n   \n                                       \n   \nPoint applyIsometry(Isometry isom, Point p) {\n    vec4 coords = isom.matrix * p.coords;\n    coords.w += isom.shift;\n    Point res = Point(coords);\n    return reduceError(res);\n}\n\n   \n                                                                     \n                                  \n   \n\nIsometry makeTranslation(Point p) {\n    mat4 matrix = mat4(1.);\n    float shift=p.coords.w;\n    vec2 u = p.coords.xy;\n    float c1 = length(u);\n    if (c1 == 0.) {\n        return Isometry(matrix, shift);\n    }\n\n    float c2 = 1. - p.coords.z;\n    u = normalize(u);\n    mat4 m = mat4(\n    0, 0, -u.x, 0,\n    0, 0, -u.y, 0,\n    u.x, u.y, 0, 0,\n    0, 0, 0, 0\n    );\n    matrix = matrix + c1 * m + c2 * m * m;\n    return Isometry(matrix, shift);\n}\n\n   \n                                                                     \n                                     \n   \nIsometry makeInvTranslation(Point p) {\n    Isometry isom = makeTranslation(p);\n    return geomInverse(isom);\n}\n\n                                                                                                                        \n  \n                 \n                                                              \n                                                                                                  \n  \n                                                                                                                        \nstruct Vector{\n    Point pos;                         \n    vec4 dir;                                \n};\n\n   \n                                \n   \nVector zeroVector(Point pos){\n    return Vector(pos, vec4(0));\n}\n\n   \n                                                            \n   \nVector reduceError(Vector v){\n    v.pos = reduceError(v.pos);\n    v.dir.xyz = v.dir.xyz - dot(v.pos.coords.xyz, v.dir.xyz) * v.pos.coords.xyz;\n    return v;\n}\n\n   \n                         \n                            \n   \nVector add(Vector v1, Vector v2){\n    return Vector(v1.pos, v1.dir + v2.dir);\n}\n\n   \n                              \n                            \n   \nVector sub(Vector v1, Vector v2){\n    return Vector(v1.pos, v1.dir - v2.dir);\n}\n\n   \n                                   \n                         \n                      \n   \nVector multiplyScalar(float s, Vector v){\n    return Vector(v.pos, s * v.dir);\n}\n\n   \n                                                                                 \n                     \n   \nfloat geomDot(Vector v1, Vector v2) {\n    return dot(v1.dir, v2.dir);\n}\n\n   \n                                        \n   \nVector applyIsometry(Isometry isom, Vector v) {\n    Point p = applyIsometry(isom, v.pos);\n    return Vector(p, isom.matrix * v.dir);\n}\n\n\n   \n                                                                       \n                                                                                                           \n                                           \n   \nVector applyFacing(mat4 m, Vector v) {\n    vec4 aux = m * vec4(v.dir.xy, v.dir.w, 0.);\n    return Vector(v.pos, vec4(aux.xy, 0, aux.z));\n}\n\nvoid initFlow(Vector v){\n}"

/***/ }),

/***/ 7614:
/***/ ((module) => {

module.exports = "   \n                               \n                                                                       \n                                     \n                                                      \n   \nvoid frame(Point p, out Vector[3] f){\n    vec4 dir0 = vec4(p.coords.z, 0, -p.coords.x,0);\n    vec4 dir1 = vec4(0, p.coords.z, -p.coords.y,0);\n    vec4 dir2 = vec4(0, 0, 0, 1);\n    dir0 = normalize(dir0);\n    dir1 = normalize(dir1);\n    f[0] = Vector(p, dir0);\n    f[1] = Vector(p, dir1);\n    f[2] = Vector(p, dir2);\n}\n\n\nvoid orthoFrame(Point p, out Vector[3] f){\n    float x = p.coords.x;\n    float y = p.coords.y;\n    float z = p.coords.z;\n\n    float den = 1. + z;\n    vec4 dir0 = (1. / den) * vec4(-x * x + z + 1., -x * y, -x * den, 0.);\n    vec4 dir1 = (1. / den) * vec4(-x * y, -y * y + z + 1., -y * den, 0.);\n    vec4 dir2 = vec4(0, 0, 0, 1);\n\n    f[0] = Vector(p, dir0);\n    f[1] = Vector(p, dir1);\n    f[2] = Vector(p, dir2);\n}\n\n\n   \n                                                                                         \n                              \n                                                                                              \n   \nPoint smallShift(Point p, vec3 dp){\n    Vector[3] f;\n    frame(p, f);\n    vec4 coords = p.coords + dp[0] * f[0].dir + dp[1] * f[1].dir + dp[2] * f[2].dir;\n    Point res = Point(coords);\n    return reduceError(res);\n}\n\n\nVector smallShift(Vector v, vec3 dp){\n    Point pos = smallShift(v.pos, dp);\n    return Vector(pos,v.dir);\n}\n\n\n   \n                                  \n                                                 \n   \nVector flow(Vector v, float t){\n    vec3 u=v.dir.xyz;\n    float lambda=length(u);\n    u=normalize(u);\n\n    vec3 coords = cos(lambda*t) * v.pos.coords.xyz+ sin(lambda*t) * u;\n    Point pos = Point(vec4(coords,v.pos.coords.w+t*v.dir.w));\n                      \n    vec3 dir = -sin(lambda*t) * v.pos.coords.xyz + cos(lambda*t) * u;\n    Vector res=Vector(pos,vec4(lambda*dir,v.dir.w));\n    res=reduceError(res);\n    return geomNormalize(res);\n}\n"

/***/ }),

/***/ 1936:
/***/ ((module) => {

module.exports = "Vector direction(Point p, Point q){\n    vec3 pAux = p.coords.xyz;\n    vec3 qAux = q.coords.xyz;\n    float c = dot(pAux, qAux);\n    float lenAux = acos(c);\n    vec3 dirAux = qAux - c * pAux;\n    dirAux = (lenAux / sqrt(1. - c * c )) * dirAux;\n    Vector res = Vector(p, vec4(dirAux, q.coords.w - p.coords.w));\n    return geomNormalize(res);\n}"

/***/ }),

/***/ 4182:
/***/ ((module) => {

module.exports = "   \n                              \n   \nfloat dist(Point p1, Point p2){\n    float aux1=acos(dot(p1.coords.xyz, p2.coords.xyz));\n    float aux2=p1.coords.w-p2.coords.w;\n    return sqrt(aux1*aux1+aux2*aux2);\n}\n"

/***/ }),

/***/ 3626:
/***/ ((module) => {

module.exports = "   \n                                                                                   \n                                                  \n                                        \n                                \n  \nfloat lightIntensity(float len){\n                            \n    return 1./ len;\n}"

/***/ }),

/***/ 1283:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \n\nstruct ESun {\n    int id;\n    vec3 color;\n    float intensity;\n    float direction;\n    int maxDirs;\n};\n\nbool directions(ESun light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i!=0){\n        return false;\n    }\n    intensity = light.intensity;\n    Vector local=Vector(v.local.pos, vec4(0, 0, 0, light.direction));\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}"

/***/ }),

/***/ 2778:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                   \n                                                                                                                        \nstruct PointLight {\n    int id;\n    vec3 color;\n    float intensity;\n    Point position;\n    int maxDirs;\n};\n\nbool directions(PointLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i!=0){\n        return false;\n    }\n    Point position = applyGroupElement(v.invCellBoost, light.position);\n    float dist = dist(v.local.pos, position);\n    intensity = lightIntensity(dist) * light.intensity;\n    Vector local = direction(v.local.pos, position);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}\n"

/***/ }),

/***/ 2855:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                         \n                                                                                                                        \n\nstruct VaryingColorMaterial {\n    vec3 mainColor;\n    vec3 weight;\n};\n\nvec3 render(VaryingColorMaterial material, ExtVector v) {\n    return material.mainColor + material.weight * v.vector.local.pos.coords.xyw;\n}"

/***/ }),

/***/ 1329:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                          \n                                                                                                                        \n\nstruct BallShape {\n    int id;\n    Point center;\n    float radius;\n};\n\n   \n                                                 \n   \nfloat sdf(BallShape ball, RelVector v) {\n    Point center = applyGroupElement(v.invCellBoost, ball.center);\n    return dist(v.local.pos, center) - ball.radius;\n}\n"

/***/ }),

/***/ 8967:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                          \n                                                                                                                        \n\nstruct LocalBallShape {\n    int id;\n    Point center;\n    float radius;\n};\n\n   \n                                                 \n   \nfloat sdf(LocalBallShape ball, RelVector v) {\n    return dist(v.local.pos, ball.center) - ball.radius;\n}\n\n   \n                                  \n   \nRelVector gradient(LocalBallShape ball, RelVector v){\n    Vector local = direction(v.local.pos, ball.center);\n    return RelVector(negate(local), v.cellBoost, v.invCellBoost);\n}\n"

/***/ }),

/***/ 5688:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                                            \n  \n                                                                                                                        \n                                                                                                                        \n\n\n"

/***/ }),

/***/ 466:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "img/426f7657671a2811d4aa.png";

/***/ }),

/***/ 8367:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "img/33960f5af615e67309e5.jpg";

/***/ }),

/***/ 2971:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "img/eba62d0cff4836a949b8.png";

/***/ }),

/***/ 5753:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "img/4b569137334e61081651.jpg";

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		var getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/global */
/******/ (() => {
/******/ 	__webpack_require__.g = (function() {
/******/ 		if (typeof globalThis === 'object') return globalThis;
/******/ 		try {
/******/ 			return this || new Function('return this')();
/******/ 		} catch (e) {
/******/ 			if (typeof window === 'object') return window;
/******/ 		}
/******/ 	})();
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/publicPath */
/******/ (() => {
/******/ 	var scriptUrl;
/******/ 	if (typeof import.meta.url === "string") scriptUrl = import.meta.url
/******/ 	// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 	// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 	if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 	scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 	__webpack_require__.p = scriptUrl;
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "ec": () => (/* reexport */ Ball),
  "Yb": () => (/* reexport */ BallShape),
  "QU": () => (/* reexport */ BasicCamera),
  "ZH": () => (/* reexport */ BasicPTMaterial),
  "K9": () => (/* binding */ thurstonS2E_BasicRenderer),
  "cK": () => (/* reexport */ CREEPING_FULL),
  "_x": () => (/* reexport */ CREEPING_OFF),
  "kj": () => (/* reexport */ CREEPING_STRICT),
  "Vz": () => (/* reexport */ CheckerboardMaterial),
  "Iy": () => (/* reexport */ ComplementShape),
  "ik": () => (/* reexport */ DIR_DOWN),
  "fY": () => (/* reexport */ DIR_UP),
  "TB": () => (/* reexport */ DebugMaterial),
  "Al": () => (/* reexport */ DragVRControls),
  "Gj": () => (/* reexport */ ESun),
  "KO": () => (/* reexport */ EarthTexture),
  "c$": () => (/* reexport */ ExpFog),
  "mD": () => (/* reexport */ FlyControls),
  "yb": () => (/* reexport */ Fog),
  "ZA": () => (/* reexport */ Group_Group),
  "Jz": () => (/* reexport */ GroupElement_GroupElement),
  "HZ": () => (/* reexport */ InfoControls),
  "TN": () => (/* reexport */ IntersectionShape),
  "JV": () => (/* reexport */ Isometry),
  "Sc": () => (/* reexport */ IsotropicChaseVRControls),
  "Nh": () => (/* reexport */ KeyGenericControls),
  "RL": () => (/* reexport */ LEFT),
  "_k": () => (/* reexport */ Light),
  "uR": () => (/* reexport */ LightVRControls),
  "jo": () => (/* reexport */ LocalBall),
  "Q": () => (/* reexport */ LocalBallShape),
  "Qv": () => (/* reexport */ MarsTexture),
  "F5": () => (/* reexport */ Material),
  "Uc": () => (/* reexport */ Matrix2),
  "Yu": () => (/* reexport */ MoonTexture),
  "Fh": () => (/* reexport */ MoveVRControls),
  "oB": () => (/* reexport */ NormalMaterial),
  "pJ": () => (/* reexport */ PTMaterial),
  "GW": () => (/* reexport */ PathTracerCamera),
  "DZ": () => (/* binding */ thurstonS2E_PathTracerRenderer),
  "_K": () => (/* reexport */ PathTracerWrapMaterial),
  "JF": () => (/* reexport */ PhongMaterial),
  "Lv": () => (/* reexport */ PhongWrapMaterial),
  "E9": () => (/* reexport */ Point),
  "ce": () => (/* reexport */ PointLight),
  "Ly": () => (/* reexport */ Position),
  "iv": () => (/* reexport */ QuadRing),
  "mH": () => (/* reexport */ QuadRingElement),
  "xd": () => (/* reexport */ QuadRingMatrix4),
  "pX": () => (/* reexport */ RIGHT),
  "Dz": () => (/* reexport */ RelPosition),
  "Uj": () => (/* reexport */ ResetVRControls),
  "cV": () => (/* reexport */ SMOOTH_MAX_POLY),
  "lR": () => (/* reexport */ SMOOTH_MIN_POLY),
  "xs": () => (/* reexport */ Scene),
  "oC": () => (/* reexport */ ShootVRControls),
  "h8": () => (/* reexport */ SingleColorMaterial),
  "Qf": () => (/* reexport */ Solid),
  "_D": () => (/* reexport */ SunTexture),
  "$p": () => (/* reexport */ SwitchControls),
  "xG": () => (/* reexport */ TeleportationSet),
  "qC": () => (/* binding */ thurstonS2E_Thurston),
  "N$": () => (/* binding */ thurstonS2E_ThurstonLite),
  "TO": () => (/* binding */ thurstonS2E_ThurstonVR),
  "yI": () => (/* reexport */ UnionShape),
  "E6": () => (/* reexport */ VRCamera),
  "zO": () => (/* binding */ thurstonS2E_VRRenderer),
  "cB": () => (/* reexport */ VaryingColorMaterial),
  "OW": () => (/* reexport */ Vector),
  "$9": () => (/* reexport */ WrapShape),
  "iR": () => (/* reexport */ XRControllerModelFactory),
  "ak": () => (/* reexport */ bind),
  "Cy": () => (/* reexport */ complement),
  "Rc": () => (/* reexport */ cube_set),
  "jV": () => (/* reexport */ intersection),
  "wS": () => (/* reexport */ pathTracerWrap),
  "IJ": () => (/* reexport */ phongWrap),
  "p2": () => (/* reexport */ safeString),
  "dV": () => (/* reexport */ set),
  "G0": () => (/* reexport */ union),
  "re": () => (/* reexport */ wrap),
  "xS": () => (/* reexport */ zLoop_set)
});

;// CONCATENATED MODULE: external "three"
var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
const external_three_namespaceObject = x({ ["AnimationClip"]: () => __WEBPACK_EXTERNAL_MODULE_three__.AnimationClip, ["Bone"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Bone, ["Box3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Box3, ["BufferAttribute"]: () => __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute, ["BufferGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry, ["CanvasTexture"]: () => __WEBPACK_EXTERNAL_MODULE_three__.CanvasTexture, ["ClampToEdgeWrapping"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping, ["Clock"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Clock, ["Color"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Color, ["DirectionalLight"]: () => __WEBPACK_EXTERNAL_MODULE_three__.DirectionalLight, ["DoubleSide"]: () => __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide, ["EventDispatcher"]: () => __WEBPACK_EXTERNAL_MODULE_three__.EventDispatcher, ["FileLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.FileLoader, ["Float32BufferAttribute"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute, ["FloatType"]: () => __WEBPACK_EXTERNAL_MODULE_three__.FloatType, ["FrontSide"]: () => __WEBPACK_EXTERNAL_MODULE_three__.FrontSide, ["Group"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Group, ["ImageBitmapLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ImageBitmapLoader, ["InterleavedBuffer"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterleavedBuffer, ["InterleavedBufferAttribute"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterleavedBufferAttribute, ["Interpolant"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Interpolant, ["InterpolateDiscrete"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterpolateDiscrete, ["InterpolateLinear"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterpolateLinear, ["Line"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Line, ["LineBasicMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial, ["LineLoop"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LineLoop, ["LineSegments"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LineSegments, ["LinearFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter, ["LinearMipmapLinearFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LinearMipmapLinearFilter, ["LinearMipmapNearestFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LinearMipmapNearestFilter, ["Loader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Loader, ["LoaderUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LoaderUtils, ["Material"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Material, ["MathUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MathUtils, ["Matrix3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Matrix3, ["Matrix4"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Matrix4, ["Mesh"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Mesh, ["MeshBasicMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial, ["MeshPhysicalMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MeshPhysicalMaterial, ["MeshStandardMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MeshStandardMaterial, ["MirroredRepeatWrapping"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MirroredRepeatWrapping, ["NearestFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter, ["NearestMipmapLinearFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NearestMipmapLinearFilter, ["NearestMipmapNearestFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NearestMipmapNearestFilter, ["NumberKeyframeTrack"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NumberKeyframeTrack, ["Object3D"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Object3D, ["OrthographicCamera"]: () => __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera, ["PerspectiveCamera"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera, ["PointLight"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PointLight, ["Points"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Points, ["PointsMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PointsMaterial, ["PropertyBinding"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PropertyBinding, ["Quaternion"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Quaternion, ["QuaternionKeyframeTrack"]: () => __WEBPACK_EXTERNAL_MODULE_three__.QuaternionKeyframeTrack, ["RGBAFormat"]: () => __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, ["RGBFormat"]: () => __WEBPACK_EXTERNAL_MODULE_three__.RGBFormat, ["RepeatWrapping"]: () => __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping, ["Scene"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Scene, ["ShaderMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial, ["Skeleton"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Skeleton, ["SkinnedMesh"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SkinnedMesh, ["Sphere"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Sphere, ["SphereBufferGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SphereBufferGeometry, ["SphereGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry, ["SpotLight"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SpotLight, ["TangentSpaceNormalMap"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TangentSpaceNormalMap, ["TextureLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TextureLoader, ["TriangleFanDrawMode"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TriangleFanDrawMode, ["TriangleStripDrawMode"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TriangleStripDrawMode, ["Uniform"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Uniform, ["UniformsUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.UniformsUtils, ["Vector2"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector2, ["Vector3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector3, ["Vector4"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector4, ["VectorKeyframeTrack"]: () => __WEBPACK_EXTERNAL_MODULE_three__.VectorKeyframeTrack, ["WebGLRenderTarget"]: () => __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget, ["WebGLRenderer"]: () => __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderer, ["sRGBEncoding"]: () => __WEBPACK_EXTERNAL_MODULE_three__.sRGBEncoding });
;// CONCATENATED MODULE: ./src/core/geometry/Isometry.js
/**
 * @class
 *
 * @classdesc
 * Isometry of the geometry.
 */
class Isometry {

    /**
     * Constructor.
     * Since the constructor is different for each geometry, it delegates the task to the method `build`
     * (that can be overwritten easily unlike the constructor).
     * Another way to do would be to implement for each geometry a new class that inherit from Isometry.
     * How ever the drawback is that the class Position would need also to be extended,
     * so that it manipulate the right classes.
     *
     */
    constructor() {
        this.build(...arguments);
    }

    get isIsometry() {
        return true;
    }

    /**
     * Fake constructor
     * If no argument is passed, return the identity.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to the identity.
     * @abstract
     * @return {Isometry} The current isometry
     */
    identity() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Reduce the eventual numerical errors of the current isometry (typically Gram-Schmidt).
     * @abstract
     * @return {Isometry} The current isometry
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the left, i.e. replace `this` by `this * isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    multiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by isom on the right, i.e. replace `this` by `isom * this`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    premultiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Invert the current isometry
     * @return {Isometry} The current isometry
     */
    invert() {
        this.matrix.invert();
        return this;
    }

    /**
     * Return a preferred isometry sending the origin to the given point
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point - the target point
     * @return {Isometry} The current isometry
     */
    makeTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the given point to the origin
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point - the point that is moved back to the orign
     * @return {Isometry} The current isometry
     */
    makeInvTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a preferred isometry sending the origin to the image of v by the exponential map.
     * @abstract
     * @param {Vector} vec - the vector in the tangent space
     * @return {Isometry} The current isometry
     */
    makeTranslationFromDir(vec) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Take as input a Matrix4 m, seen as an isometry of the tangent space at the origin (in the reference frame)
     * and set the current isometry so that its differential is dexp * dm, where
     * - dexp is the differential of the exponential map
     * - dm is the differential of m
     * @todo turn it into an abstract method, when implemented in all geometries
     * @param {Matrix4} m - an isometry of the tangent space
     * @return {Isometry} The current isometry
     */
    diffExpMap(m) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current isometry and `isom` are the same.
     * Mainly for debugging purposes.
     * @abstract
     * @param isom
     * @return {boolean} true if the isometries are equal, false otherwise
     */
    equals(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current isometry.
     * @abstract
     * @return {Isometry} The clone of the current isometry
     */
    clone() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry with the given isometry
     * @abstract
     * @param {Isometry} isom - the isometry to copy
     * @return {Isometry} The current isometry
     */
    copy(isom) {
        throw new Error("This method need be overloaded.");
    }

}


;// CONCATENATED MODULE: ./src/geometries/s2e/geometry/Isometry.js




Isometry.prototype.build = function () {
    this.matrix = new external_three_namespaceObject.Matrix4();
    this.shift = 0;
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
    this.shift = 0;
    return this;
}

Isometry.prototype.reduceError = function () {}

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    const coeff = this.matrix.elements[this.matrix.elements.length - 1];
    this.shift = this.shift + isom.shift;
    return this;
}

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    const coeff = isom.matrix.elements[isom.matrix.elements.length - 1];
    this.shift = isom.shift + coeff * this.shift;
    return this;
}

Isometry.prototype.invert = function () {
    this.matrix.invert();
    const coeff = this.matrix.elements[this.matrix.elements.length - 1];
    this.shift = -coeff * this.shift;

    return this;
}



Isometry.prototype.makeTranslationFromDir = function (vec) {

    const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

    this.shift = vec.z;

    this.matrix.identity();

    if (len !== 0) {
        const c1 = Math.sin(len);
        const c2 = 1 - Math.cos(len);

        const dx = vec.x / len;
        const dy = vec.y / len;
        const m = new external_three_namespaceObject.Matrix4().set(
            0, 0, dx, 0,
            0, 0, dy, 0,
            -dx, -dy, 0, 0,
            0, 0, 0, 0.0);
        const m2 = m.clone().multiply(m);
        m.multiplyScalar(c1);
        m2.multiplyScalar(c2);
        this.matrix.add(m);
        this.matrix.add(m2);

    }

    return this;
}




Isometry.prototype.makeTranslation = function (point) {
    const [x, y, z, w] = point.coords.toArray();

    const u = new external_three_namespaceObject.Vector2(x, y);
    const c1 = u.length();

    this.shift = w;
    this.matrix.identity();

    if (c1 === 0) {
        return this;
    }

    const c2 = 1 - z;
    u.normalize();

    const m = new external_three_namespaceObject.Matrix4().set(
        0, 0, u.x, 0,
        0, 0, u.y, 0,
        -u.x, -u.y, 0, 0,
        0, 0, 0, 0.0);

    const m2 = new external_three_namespaceObject.Matrix4().copy(m).multiply(m);
    m.multiplyScalar(c1);
    m2.multiplyScalar(c2);
    this.matrix.add(m);
    this.matrix.add(m2);

    return this;
}




Isometry.prototype.makeInvTranslation = function (point) {
    this.makeTranslation(point);
    this.invert();
    return this;
}




Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix) && this.shift === isom.shift;
};

Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.matrix.copy(this.matrix);
    res.shift = this.shift;
    return res;
};

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    this.shift = isom.shift;
    return this;
};





;// CONCATENATED MODULE: ./src/core/geometry/Point.js
/**
 * @class
 *
 * @classdesc
 * Point in the geometry.
 */
class Point {

    /**
     * Constructor.
     * Same remark as for isometries.
     */
    constructor(...args) {
        this.build(...args);
    }

    /**
     * Fake constructor.
     * If no argument is passed, return the origin of the space.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the coordinates of the point
     */
    set() {
        throw new Error("This method need be overloaded.");
    }

    get isPoint(){
        return true;
    }

    /**
     * Translate the current point by the given isometry.
     * @abstract
     * @param {Isometry} isom - the isometry to apply
     * @return {Point} The current point
     */
    applyIsometry(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Reduce possible errors
     * @abstract
     * @return {Point} The current point
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Check if the current point and `point ` are the same.
     * Mainly for debugging purposes.
     * @abstract
     * @param {Point} point
     * @return {boolean} true if the points are equal, false otherwise
     */
    equals(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current point.
     * @abstract
     * @return {Point} the clone of the current point
     */
    clone() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * set the current point with the given point
     * @abstract
     * @param {Point} point - the point to copy
     * @return {Point} The current point
     */
    copy(point) {
        throw new Error("This method need be overloaded.");
    }
}



;// CONCATENATED MODULE: ./src/geometries/s2e/geometry/Point.js




Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new external_three_namespaceObject.Vector4(0, 0, 1, 0);
    } else {
        this.coords = new external_three_namespaceObject.Vector4(...arguments);
    }
};

Point.prototype.set = function () {
    this.coords.set(...arguments);
}

Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix);
    this.coords.setW(this.coords.w + isom.shift);
    return this;
};

Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};


Point.prototype.reduceError = function () {
    return this;
}

Point.prototype.clone = function () {
    let res = new Point();
    res.coords.copy(this.coords);
    return res;
};

Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};





;// CONCATENATED MODULE: ./src/core/geometry/Vector.js


/**
 * @class
 * @extends Vector3
 *
 * @classdesc
 * Tangent vector at the origin written in the reference frame.
 * Are available form three.js:
 * - all the linear algebra
 * - the length of a vector
 *
 * @todo It seems that this class is actually geometry independent
 * (because of the choice of a reference frame).
 * If so, remove for the other files the class extensions,
 * and replace them by an `export {Vector} from './abstract.js'`
 */
class Vector extends external_three_namespaceObject.Vector3 {

    get isVector(){
        return true;
    }

    /**
     * Overload Three.js `applyMatrix4`.
     * Indeed Three.js considers the `Vector3` as a 3D **point**
     * It multiplies the vector (with an implicit 1 in the 4th dimension) and `m`, and divides by perspective.
     * Here the data represents a **vector**, thus the implicit 4th coordinate is 0
     * @param {Matrix4} m - The matrix to apply
     * @return {Vector} The current vector
     */
    applyMatrix4(m) {
        const aux = new external_three_namespaceObject.Vector4(this.x, this.y, this.z, 0);
        aux.applyMatrix4(m);
        this.set(aux.x, aux.y, aux.z);
        return this;
    }

    /**
     * Rotate the current vector by the facing component of the position.
     * This method is geometry independent as the coordinates of the vector
     * are given in a chosen reference frame.
     * Only the reference frame depends on the geometry.
     * @param {Position} position
     * @return {Vector} The current vector
     */
    applyFacing(position) {
        this.applyQuaternion(position.quaternion);
        return this;
    }
}


;// CONCATENATED MODULE: ./src/core/geometry/Position.js





/**
 * @class
 *
 * @classdesc
 * Location and facing (of the observer, an object, etc).
 *
 * @todo Choose a better name ??
 */
class Position {

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame.
     */
    constructor() {
        /**
         * The isometry component  of the position.
         * @type {Isometry}
         */
        this.boost = new Isometry();
        /**
         * The facing.
         * We represent it as quaternion, whose action by conjugation on R^3 defines an element of O(3)
         */
        this.quaternion = new external_three_namespaceObject.Quaternion();
    }

    get isPosition(){
        return true;
    }

    /**
     * The facing as a Matrix4, representing an element of O(3).
     * This is the data that is actually passed to the shader
     * @type {Matrix4}
     */
    get facing() {
        return new external_three_namespaceObject.Matrix4().makeRotationFromQuaternion(this.quaternion);
    }

    /**
     * Set the boost part of the position.
     * @param {Isometry} isom
     * @return {Position} The current position
     */
    setBoost(isom) {
        this.boost = isom;
        return this;
    }

    /**
     * Set the facing part of the position.
     * @param {Quaternion} quaternion
     * @return {Position} The current position
     */
    setQuaternion(quaternion) {
        this.quaternion = quaternion;
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {Position} The current position
     */
    reduceErrorBoost() {
        this.boost.reduceError();
        return this;
    }

    /**
     * Make the the quaternion has length one.
     * @return {Position} The current position
     */
    reduceErrorQuaternion() {
        this.quaternion.normalize();
        return this;
    }

    /**
     * Reduce the error of the boost part and the quaternion part.
     * @return {Position} The current position
     */
    reduceError() {
        this.reduceErrorBoost();
        this.reduceErrorQuaternion();
        return this;
    }

    /**
     * Return the underlying point
     * @return {Point} the translate of the origin by the isometry part of the position
     */
    get point() {
        return new Point().applyIsometry(this.boost);
    }

    /**
     * Reset the position in its default position (boost = identity, quaternion = 1)
     * @return {Position} The current position
     */
    reset(){
        this.boost.identity();
        this.quaternion.identity();
        return this;
    }

    /**
     * Translate the current position by `isom` (left action of the isometry group G on the set of positions).
     * @param {Isometry} isom - the isometry to apply
     * @return {Position} The current position
     */
    applyIsometry(isom) {
        this.boost.premultiply(isom);
        return this;
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Quaternion} quaternion - the facing to apply (in the observer frame)
     * @return {Position} The current position
     */
    applyQuaternion(quaternion) {
        this.quaternion.multiply(quaternion);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the right by the given position (g,m), i.e. return (g0 * g, m * m0)
     * @param {Position} position
     * @return {Position} The current position
     */
    multiply(position) {
        this.boost.multiply(position.boost);
        this.quaternion.premultiply(position.quaternion);
        return this;
    }

    /**
     * Multiply the current position (g0,m0) on the left by the given position (g,m), i.e. return (g * g0, m0 * m)
     * @param {Position} position
     * @return {Position} The current position
     */
    premultiply(position) {
        this.boost.premultiply(position.boost);
        this.quaternion.multiply(position.quaternion);
        return this;
    }

    /**
     * Set the current position to its inverse
     * @deprecated Not sure this is really needed
     * @return {Position} The current position
     */
    invert() {
        this.boost.invert();
        this.quaternion.conjugate();
        return this;
    }

    /**
     * Replace the current position, by the one obtained by flow the initial position `(id, id)`
     * in the direction `v` (given in the reference frame).
     * @abstract
     * @param {Vector} v - the direction in the reference frame
     * @return {Position} The current position
     */
    flowFromOrigin(v) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`.
     *
     * The procedure goes as follows.
     * Let `e = (e1, e2, e3)` be the reference frame in the tangent space at the origin.
     * Assume that the current position is `(g,m)`
     * The vector `v = (v1, v2, v3)` is given in the observer frame, that is `v = d_og m u`,
     * where `u = u1 . e1 + u2 . e2 + u3 . e3`.
     * - We first pull back the data at the origin by the inverse of `g`.
     * - We compute the position `(g',m')` obtained from the initial position `(id, id)` by flowing in the direction `w = m u`.
     * This position send the frame `m e` to `d_o g' . m ' . m . e `
     * - We move everything back using `g`, so that the new observer frame is `d_o (gg') . m' . m e`.
     *
     * Hence the new position `(gg', m'm)` is obtained by multiplying `(g,m)` and `(g',m')`
     *
     * @param {Vector} v - the direction in the observer frame
     * @return {Position} The current position
     */
    flow(v) {
        const w = v.clone().applyFacing(this);
        const shift = new Position().flowFromOrigin(w);
        this.multiply(shift);
        return this;
    }

    /**
     * Fake version of the differential of the exponential map.
     *
     * Assume that the current position is the (Id,Id).
     * Take as input a Matrix4 `matrix` seen as an affine isometry of R^3 = T_oX with respect to the reference frame e = (e_1, e_2, e_3)
     * (or more precisely, an isometry of the tangent bundle of T_oX)
     * Update the position with the following properties.
     * Let u = matrix . (0,0,0,1) that is the image of the origin of T_oX by matrix
     * Let v = matrix . (0,0,1,0) that is the image of the vector e_3 by matrix
     * The updated position (g,m) is such that g . origin = exp(u) and d_og m v = d_u exp v
     * Or at least, this is the ideal goal.
     *
     * We fake the behavior using parallel transport.
     * Apparently the error made if of the order of O(|u|^2).
     * https://mathoverflow.net/questions/126104/difference-between-parallel-transport-and-derivative-of-the-exponential-map
     * Thus for controllers supposed to stay close to the user, it could be enough.
     * (The overlay of the controllers and the seen is only correct at the first order.)
     *
     * If the current position is not (Id, Id), then everything is made "relative" to the current position.
     *
     * @param {Matrix4} matrix - an affine isometry of the tangent space at the origin
     * @return {Position}
     */
    fakeDiffExpMap(matrix) {
        const u = new Vector().setFromMatrixPosition(matrix);
        const quaternion = new external_three_namespaceObject.Quaternion().setFromRotationMatrix(matrix);
        this.flow(u);
        this.quaternion.multiply(quaternion);
        return this;
    }

    /**
     * Check if the current position and `position ` are the same.
     * @param {Position} position
     * @return {boolean} true if the positions are equal, false otherwise
     */
    equals(position) {
        return this.boost.equals(position.boost) && this.quaternion.equals(position.quaternion);
    }

    /**
     * Return a new copy of the current position.
     * @return {Position} The clone of the current position
     */
    clone() {
        let res = new Position();
        res.boost.copy(this.boost);
        res.quaternion.copy(this.quaternion);
        return res;
    }

    /**
     * Set the current position with the given one.
     * @param {Position} position - the position to copy
     * @return {Position} the current position
     */
    copy(position) {
        this.boost.copy(position.boost);
        this.quaternion.copy(position.quaternion);
    }
}



;// CONCATENATED MODULE: ./src/geometries/s2e/geometry/Position.js


Position.prototype.flowFromOrigin = function (v) {
    this.boost.makeTranslationFromDir(v);
    this.quaternion.identity();
    return this;
}



// EXTERNAL MODULE: ./src/geometries/s2e/geometry/shaders/part1.glsl
var part1 = __webpack_require__(8959);
var part1_default = /*#__PURE__*/__webpack_require__.n(part1);
// EXTERNAL MODULE: ./src/geometries/s2e/geometry/shaders/part2.glsl
var part2 = __webpack_require__(7614);
var part2_default = /*#__PURE__*/__webpack_require__.n(part2);
;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/shaders/CopyShader.js
/**
 * Full-screen textured quad shader
 */

var CopyShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;

		}`

};



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/Pass.js


class Pass {

	constructor() {

		// if set to true, the pass is processed by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;

	}

	setSize( /* width, height */ ) {}

	render( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new external_three_namespaceObject.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new external_three_namespaceObject.BufferGeometry();
_geometry.setAttribute( 'position', new external_three_namespaceObject.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
_geometry.setAttribute( 'uv', new external_three_namespaceObject.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

class FullScreenQuad {

	constructor( material ) {

		this._mesh = new external_three_namespaceObject.Mesh( _geometry, material );

	}

	dispose() {

		this._mesh.geometry.dispose();

	}

	render( renderer ) {

		renderer.render( this._mesh, _camera );

	}

	get material() {

		return this._mesh.material;

	}

	set material( value ) {

		this._mesh.material = value;

	}

}



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/ShaderPass.js



class ShaderPass extends Pass {

	constructor( shader, textureID ) {

		super();

		this.textureID = ( textureID !== undefined ) ? textureID : 'tDiffuse';

		if ( shader instanceof external_three_namespaceObject.ShaderMaterial ) {

			this.uniforms = shader.uniforms;

			this.material = shader;

		} else if ( shader ) {

			this.uniforms = external_three_namespaceObject.UniformsUtils.clone( shader.uniforms );

			this.material = new external_three_namespaceObject.ShaderMaterial( {

				defines: Object.assign( {}, shader.defines ),
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader

			} );

		}

		this.fsQuad = new FullScreenQuad( this.material );

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.fsQuad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			this.fsQuad.render( renderer );

		}

	}

}



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/MaskPass.js


class MaskPass extends Pass {

	constructor( scene, camera ) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.clear = true;
		this.needsSwap = false;

		this.inverse = false;

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const context = renderer.getContext();
		const state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		state.buffers.depth.setLocked( true );

		// set up stencil

		let writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );
		state.buffers.stencil.setLocked( true );

		// draw into the stencil buffer

		renderer.setRenderTarget( readBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		// only render where stencil is set to 1

		state.buffers.stencil.setLocked( false );
		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
		state.buffers.stencil.setLocked( true );

	}

}

class ClearMaskPass extends Pass {

	constructor() {

		super();

		this.needsSwap = false;

	}

	render( renderer /*, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		renderer.state.buffers.stencil.setLocked( false );
		renderer.state.buffers.stencil.setTest( false );

	}

}



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/EffectComposer.js






class EffectComposer {

	constructor( renderer, renderTarget ) {

		this.renderer = renderer;

		if ( renderTarget === undefined ) {

			const parameters = {
				minFilter: external_three_namespaceObject.LinearFilter,
				magFilter: external_three_namespaceObject.LinearFilter,
				format: external_three_namespaceObject.RGBAFormat
			};

			const size = renderer.getSize( new external_three_namespaceObject.Vector2() );
			this._pixelRatio = renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = new external_three_namespaceObject.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, parameters );
			renderTarget.texture.name = 'EffectComposer.rt1';

		} else {

			this._pixelRatio = 1;
			this._width = renderTarget.width;
			this._height = renderTarget.height;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.renderToScreen = true;

		this.passes = [];

		// dependencies

		if ( CopyShader === undefined ) {

			console.error( 'THREE.EffectComposer relies on CopyShader' );

		}

		if ( ShaderPass === undefined ) {

			console.error( 'THREE.EffectComposer relies on ShaderPass' );

		}

		this.copyPass = new ShaderPass( CopyShader );

		this.clock = new external_three_namespaceObject.Clock();

	}

	swapBuffers() {

		const tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	}

	addPass( pass ) {

		this.passes.push( pass );
		pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

	}

	insertPass( pass, index ) {

		this.passes.splice( index, 0, pass );
		pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

	}

	removePass( pass ) {

		const index = this.passes.indexOf( pass );

		if ( index !== - 1 ) {

			this.passes.splice( index, 1 );

		}

	}

	isLastEnabledPass( passIndex ) {

		for ( let i = passIndex + 1; i < this.passes.length; i ++ ) {

			if ( this.passes[ i ].enabled ) {

				return false;

			}

		}

		return true;

	}

	render( deltaTime ) {

		// deltaTime value is in seconds

		if ( deltaTime === undefined ) {

			deltaTime = this.clock.getDelta();

		}

		const currentRenderTarget = this.renderer.getRenderTarget();

		let maskActive = false;

		for ( let i = 0, il = this.passes.length; i < il; i ++ ) {

			const pass = this.passes[ i ];

			if ( pass.enabled === false ) continue;

			pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					const context = this.renderer.getContext();
					const stencil = this.renderer.state.buffers.stencil;

					//context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

					//context.stencilFunc( context.EQUAL, 1, 0xffffffff );
					stencil.setFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( MaskPass !== undefined ) {

				if ( pass instanceof MaskPass ) {

					maskActive = true;

				} else if ( pass instanceof ClearMaskPass ) {

					maskActive = false;

				}

			}

		}

		this.renderer.setRenderTarget( currentRenderTarget );

	}

	reset( renderTarget ) {

		if ( renderTarget === undefined ) {

			const size = this.renderer.getSize( new external_three_namespaceObject.Vector2() );
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	}

	setSize( width, height ) {

		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
		this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

		for ( let i = 0; i < this.passes.length; i ++ ) {

			this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

		}

	}

	setPixelRatio( pixelRatio ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

}


class EffectComposer_Pass {

	constructor() {

		// if set to true, the pass is processed by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
		this.renderToScreen = false;

	}

	setSize( /* width, height */ ) {}

	render( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

	}

}

// Helper for passes that need to fill the viewport with a single quad.

const EffectComposer_camera = new external_three_namespaceObject.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

const EffectComposer_geometry = new external_three_namespaceObject.BufferGeometry();
EffectComposer_geometry.setAttribute( 'position', new external_three_namespaceObject.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
EffectComposer_geometry.setAttribute( 'uv', new external_three_namespaceObject.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

class EffectComposer_FullScreenQuad {

	constructor( material ) {

		this._mesh = new external_three_namespaceObject.Mesh( EffectComposer_geometry, material );

	}

	dispose() {

		this._mesh.geometry.dispose();

	}

	render( renderer ) {

		renderer.render( this._mesh, EffectComposer_camera );

	}

	get material() {

		return this._mesh.material;

	}

	set material( value ) {

		this._mesh.material = value;

	}

}



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/RenderPass.js



class RenderPass extends Pass {

	constructor( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.overrideMaterial = overrideMaterial;

		this.clearColor = clearColor;
		this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

		this.clear = true;
		this.clearDepth = false;
		this.needsSwap = false;
		this._oldClearColor = new external_three_namespaceObject.Color();

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		let oldClearAlpha, oldOverrideMaterial;

		if ( this.overrideMaterial !== undefined ) {

			oldOverrideMaterial = this.scene.overrideMaterial;

			this.scene.overrideMaterial = this.overrideMaterial;

		}

		if ( this.clearColor ) {

			renderer.getClearColor( this._oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.clearDepth();

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

		// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
		if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
		renderer.render( this.scene, this.camera );

		if ( this.clearColor ) {

			renderer.setClearColor( this._oldClearColor, oldClearAlpha );

		}

		if ( this.overrideMaterial !== undefined ) {

			this.scene.overrideMaterial = oldOverrideMaterial;

		}

		renderer.autoClear = oldAutoClear;

	}

}



;// CONCATENATED MODULE: ./src/core/renderers/AbstractRenderer.js


/**
 * Hack : add a property to check if an element inherits from the class 'WebGLRenderer'
 * We cannot use the constructor name, as this one will change if the code is minified.
 */
Object.defineProperty(external_three_namespaceObject.WebGLRenderer.prototype, 'isWebGLRenderer', {
    get: function () {
        return true;
    }
})


/**
 * @class
 * @abstract
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 * Abstract class with the code common to all renderers.
 */
class AbstractRenderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the render. For the moment includes
     * @param {WebGLRenderer|Object} threeRenderer - either a Three.js renderer or the parameters to build it
     * - {boolean} postprocess - Gamma and Tone correction
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        /**
         * The first part of the geometry dependent shader.
         * @type{string}
         */
        this.shader1 = shader1;
        /**
         * The second part of the geometry dependent shader.
         * @type{string}
         */
        this.shader2 = shader2;
        /**
         * The underlying subgroup
         * @type {TeleportationSet}
         */
        this.set = set;
        /**
         * Non-euclidean camera
         * @type {BasicCamera}
         */
        this.camera = camera;
        /**
         * Non-euclidean scene
         * @type {Scene}
         */
        this.scene = scene;

        /**
         * The underlying Three.js renderer
         * If the passed argument is already a WebGLRenderer, we directly use it,
         * otherwise, we build a WebGLRenderer from the passed parameters.
         * @type {WebGLRenderer}
         */
        this.threeRenderer = threeRenderer.isWebGLRenderer ? threeRenderer : new external_three_namespaceObject.WebGLRenderer(threeRenderer);
        /**
         * Number of time the light rays bounce
         * @type {number}
         */
        this.maxBounces = params.maxBounces !== undefined ? params.maxBounces : 0;
        /**
         * Add post processing to the final output
         * @type {Boolean}
         */
        this.postProcess = params.postProcess !== undefined ? params.postProcess : false;

        /**
         * The underlying Three.js scene
         * Not to be confused with the non-euclidean scene.
         * @type {ThreeScene}
         */
        this.threeScene = new external_three_namespaceObject.Scene();
    }

    /**
     * Shortcut to set the pixel ratio of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {number} value
     */
    setPixelRatio(value) {
        this.threeRenderer.setPixelRatio(value);
    }

    /**
     * Shortcut to set the size of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {number} width
     * @param {number} height
     * @param {boolean} updateStyle
     */
    setSize(width, height, updateStyle = true) {
        this.threeRenderer.setSize(width, height, updateStyle);
    }

    /**
     * Shortcut to set the clear color of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {Color} color
     * @param {number} alpha
     */
    setClearColor(color, alpha) {
        this.threeRenderer.setClearColor(color, alpha);
    }

    /**
     * Shortcut to set the animation loop of the underlying Three.js renderer.
     * See Three.js doc.
     * @param {Function} callback
     */
    setAnimationLoop(callback) {
        this.threeRenderer.setAnimationLoop(callback);
    }

    /**
     * Shortcut to the DOM element of the underlying Three.js renderer.
     * See Three.js doc.
     * @return {HTMLCanvasElement}
     */
    get domElement() {
        return this.threeRenderer.domElement;
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @abstract
     */
    build() {
        throw new Error('AbstractRenderer: this method is not implemented');
    }

    /**
     * Render the non-euclidean scene.
     * The method `build` should be called before.
     * @abstract
     */
    render() {
        throw new Error('AbstractRenderer: this method is not implemented');
        // this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }
}
;// CONCATENATED MODULE: ./src/utils/ShaderBuilder.js
/**
 * @class
 *
 * @classdesc
 * Tool to build shaders without redundancies in the imported chunks of code
 *
 */

const BASIC_RENDERER = 1;
const VR_RENDERER = 2;
const PATHTRACER_RENDERER = 3;

class ShaderBuilder {
    /**
     * Constructor.
     * The constructor does not take arguments.
     * @param useCase - what kind of use is made of this shader builder
     */
    constructor(useCase = BASIC_RENDERER) {
        /**
         * What kind of use is made of this shader builder
         * @type {number}
         */
        this.useCase = useCase;
        /**
         * The shader built shader code.
         * @type {string}
         */
        this.code = "";
        /**
         * The list of shader imports already included.
         * @type {string[]}
         */
        this.includedImports = [];
        /**
         * The list of classes already included.
         * @type {string[]}
         */
        this.includedClasses = [];
        /**
         * List of names of constants already included
         * @type {string[]}
         */
        this.includedConstants = [];
        /**
         * List of names of uniforms already included
         * @type {string[]}
         */
        this.includedUniforms = [];
        /**
         * List of names of instances already included
         * @type {string[]}
         */
        this.includedInstances = [];
        /**
         * An object with all the uniforms to pass to the shader.
         * @type {{}}
         */
        this.uniforms = {};
    }

    /**
     * Add the given chunk (without any prior test)
     * @param {string} code
     * @return {ShaderBuilder} - the current shader builder
     */
    addChunk(code) {
        this.code = this.code + "\r\n\r\n" + code;
        return this;
    }

    /**
     * Incorporate the given import (if it does not already exists)
     * @param {string} imp - the import to add
     * @return {ShaderBuilder} - the current shader builder
     */
    addImport(imp) {
        if (!this.includedImports.includes(imp)) {
            this.includedImports.push(imp);
            this.code = this.code + "\r\n\r\n" + imp;
        }
        return this;
    }

    /**
     * Incorporate the given dependency (if it does not already exists)
     * @param {string} name - the name of the class
     * @param {string} code - the code of the class
     * @return {ShaderBuilder} - the current shader builder
     */
    addClass(name, code) {
        if (!this.includedClasses.includes(name)) {
            this.includedClasses.push(name);
            this.code = this.code + "\r\n\r\n" + code;
        }
        return this;
    }

    /**
     * Add a constant to the shader code.
     * @param {string} name - the name of the constant
     * @param {string} type - the GLSL type of the constant
     * @param {*} value - the JS value of the constant
     * @return {ShaderBuilder} - the current shader builder
     */
    addConstant(name, type, value) {
        if (!this.includedConstants.includes(name)) {
            this.includedConstants.push(name);
            this.code = this.code + "\r\n\r\n" + `const ${type} ${name} = ${value};`;
        }
        return this;
    }

    /**
     * Add a uniform variable to the shader code.
     * Update the object listing all the uniforms
     * @param {string} name - the name of the uniform
     * @param {string} type - the GLSL type of the uniform
     * @param {*} value - the JS value of the uniform
     * @return {ShaderBuilder} - the current shader builder
     */
    addUniform(name, type, value) {
        if (!this.includedUniforms.includes(name)) {
            this.includedUniforms.push(name);
            this.code = this.code + "\r\n\r\n" + `uniform ${type} ${name};`;
            this.uniforms[name] = {type: type, value: value};
        }
        return this;
    }

    /**
     * Update the value of a previously defined uniform
     * @param {string} name - the name of the uniform
     * @param {*} value - the value of the uniform
     * @return {ShaderBuilder} - the current shader builder
     */
    updateUniform(name, value) {
        this.uniforms[name].value = value;
        return this;
    }

    /**
     * Add the given code (related to a specific instance of a class).
     * Check before (using name) that the code has not been included before.
     * @param {string} name - the name of the instance
     * @param {string} code - the code of the instance
     * @return {ShaderBuilder}
     */
    addInstance(name, code) {
        if (!this.includedInstances.includes(name)) {
            this.includedInstances.push(name);
            this.code = this.code + "\r\n\r\n" + code;
        }
        return this;
    }
}
// EXTERNAL MODULE: ./src/core/renderers/shaders/common/vertex.glsl
var vertex = __webpack_require__(2639);
var vertex_default = /*#__PURE__*/__webpack_require__.n(vertex);
// EXTERNAL MODULE: ./src/core/renderers/shaders/common/constants.glsl
var constants = __webpack_require__(1767);
var constants_default = /*#__PURE__*/__webpack_require__.n(constants);
// EXTERNAL MODULE: ./src/core/geometry/shaders/commons1.glsl
var commons1 = __webpack_require__(190);
var commons1_default = /*#__PURE__*/__webpack_require__.n(commons1);
// EXTERNAL MODULE: ./src/core/geometry/shaders/commons2.glsl
var commons2 = __webpack_require__(4168);
var commons2_default = /*#__PURE__*/__webpack_require__.n(commons2);
// EXTERNAL MODULE: ./src/core/renderers/shaders/common/raymarch.glsl
var raymarch = __webpack_require__(145);
var raymarch_default = /*#__PURE__*/__webpack_require__.n(raymarch);
// EXTERNAL MODULE: ./src/core/renderers/shaders/basic/scenes.glsl.mustache
var scenes_glsl_mustache = __webpack_require__(2044);
var scenes_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(scenes_glsl_mustache);
// EXTERNAL MODULE: ./src/core/renderers/shaders/basic/vectorDataStruct.glsl
var vectorDataStruct = __webpack_require__(9461);
var vectorDataStruct_default = /*#__PURE__*/__webpack_require__.n(vectorDataStruct);
// EXTERNAL MODULE: ./src/core/renderers/shaders/basic/vectorDataUpdate.glsl.mustache
var vectorDataUpdate_glsl_mustache = __webpack_require__(7781);
var vectorDataUpdate_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(vectorDataUpdate_glsl_mustache);
;// CONCATENATED MODULE: ./src/postProcess/steve/shader.js
/* harmony default export */ const shader = ({

    uniforms: {
        'tDiffuse': {value: null}

    },
    // language=GLSL
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,

    // language=GLSL
    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;


        vec3 LessThan(vec3 f, float value)
        {
            return vec3(
            (f.x < value) ? 1.0f : 0.0f,
            (f.y < value) ? 1.0f : 0.0f,
            (f.z < value) ? 1.0f : 0.0f);
        }

        //GAMMA CORRECTION
        vec3 LinearToSRGB(vec3 rgb)
        {
            rgb = clamp(rgb, 0.0f, 1.0f);

            return mix(
            pow(rgb, vec3(1.0f / 2.4f)) * 1.055f - 0.055f,
            rgb * 12.92f,
            LessThan(rgb, 0.0031308f)
            );
        }
        //TONE MAPPING
        vec3 ACESFilm(vec3 x)
        {
            float a = 2.51f;
            float b = 0.03f;
            float c = 2.43f;
            float d = 0.59f;
            float e = 0.14f;
            return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);
        }

        vec3 postProcess(vec3 pixelColor){

            //set the exposure 
            float exposure = 0.8;
            pixelColor *= exposure;

            //correct tones
            pixelColor = ACESFilm(pixelColor);
            pixelColor = LinearToSRGB(pixelColor);

            return pixelColor;
        }
        
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec3 aux = postProcess(color.rgb);
            gl_FragColor = vec4(min(vec3(1.0), aux), color.a);
        }`

});
// EXTERNAL MODULE: ./src/core/renderers/shaders/basic/main.glsl
var main = __webpack_require__(5315);
var main_default = /*#__PURE__*/__webpack_require__.n(main);
;// CONCATENATED MODULE: ./src/core/renderers/BasicRenderer.js




















/**
 * @class
 *
 * @classdesc
 * Non-euclidean renderer.
 * Takes as input the non-euclidean camera and scene and makes some magic.
 * It should not be confused with the Three.js WebGLRenderer it relies on.
 */
class BasicRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        super(shader1, shader2, set, camera, scene, params, threeRenderer);
        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder();
        /**
         * Effect composer for postprocessing
         * @type {EffectComposer}
         */
        this.composer = new EffectComposer(this.threeRenderer);
    }

    get isBasicRenderer() {
        return true;
    }

    setPixelRatio(value) {
        super.setPixelRatio(value);
        this.composer.setPixelRatio(window.devicePixelRatio);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Build the fragment shader
     */
    buildFragmentShader() {

        // constants
        this._fragmentBuilder.addChunk((constants_default()));
        this._fragmentBuilder.addUniform('maxBounces', 'int', this.maxBounces);
        // geometry
        this._fragmentBuilder.addChunk(this.shader1);
        this._fragmentBuilder.addChunk((commons1_default()));
        this._fragmentBuilder.addChunk(this.shader2);
        this._fragmentBuilder.addChunk((commons2_default()));

        // data carried by ExtVector
        this._fragmentBuilder.addChunk((vectorDataStruct_default()));
        // subgroup/quotient orbifold
        this.set.shader(this._fragmentBuilder);

        // camera
        this.camera.shader(this._fragmentBuilder);

        // scene
        this.scene.shader(this._fragmentBuilder);
        this._fragmentBuilder.addChunk(scenes_glsl_mustache_default()( this));
        this._fragmentBuilder.addChunk(vectorDataUpdate_glsl_mustache_default()(this));

        // ray-march and main
        this._fragmentBuilder.addChunk((raymarch_default()));
        this._fragmentBuilder.addChunk((main_default()));
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {BasicRenderer}
     */
    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new external_three_namespaceObject.SphereBufferGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const material = new external_three_namespaceObject.ShaderMaterial({
            uniforms: this._fragmentBuilder.uniforms,
            vertexShader: (vertex_default()),
            fragmentShader: this._fragmentBuilder.code,
        });
        const horizonSphere = new external_three_namespaceObject.Mesh(geometry, material);
        this.threeScene.add(horizonSphere);

        // add the render to the passes of the effect composer
        const renderPass = new RenderPass(this.threeScene, this.camera.threeCamera);
        renderPass.clear = false;
        this.composer.addPass(renderPass);

        if (this.postProcess) {
            const effectPass = new ShaderPass(shader);
            effectPass.clear = false;
            this.composer.addPass(effectPass);
        }

        return this;
    }

    checkShader() {
        console.log(this._fragmentBuilder.code);
    }

    render() {
        this.composer.render();
    }


}
;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/TexturePass.js




class TexturePass extends Pass {

	constructor( map, opacity ) {

		super();

		if ( CopyShader === undefined ) console.error( 'THREE.TexturePass relies on CopyShader' );

		const shader = CopyShader;

		this.map = map;
		this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

		this.uniforms = external_three_namespaceObject.UniformsUtils.clone( shader.uniforms );

		this.material = new external_three_namespaceObject.ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			depthTest: false,
			depthWrite: false

		} );

		this.needsSwap = false;

		this.fsQuad = new FullScreenQuad( null );

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.fsQuad.material = this.material;

		this.uniforms[ 'opacity' ].value = this.opacity;
		this.uniforms[ 'tDiffuse' ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

		renderer.autoClear = oldAutoClear;

	}

}



// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/scenes.glsl.mustache
var pathTracer_scenes_glsl_mustache = __webpack_require__(6172);
var pathTracer_scenes_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(pathTracer_scenes_glsl_mustache);
// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/raymarch.glsl
var pathTracer_raymarch = __webpack_require__(3499);
var pathTracer_raymarch_default = /*#__PURE__*/__webpack_require__.n(pathTracer_raymarch);
// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/random1.glsl
var random1 = __webpack_require__(9638);
var random1_default = /*#__PURE__*/__webpack_require__.n(random1);
// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/random2.glsl
var random2 = __webpack_require__(7920);
var random2_default = /*#__PURE__*/__webpack_require__.n(random2);
// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/vectorDataStruct.glsl
var pathTracer_vectorDataStruct = __webpack_require__(3888);
var pathTracer_vectorDataStruct_default = /*#__PURE__*/__webpack_require__.n(pathTracer_vectorDataStruct);
// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/vectorDataUpdate.glsl.mustache
var pathTracer_vectorDataUpdate_glsl_mustache = __webpack_require__(6272);
var pathTracer_vectorDataUpdate_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(pathTracer_vectorDataUpdate_glsl_mustache);
// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/main.glsl
var pathTracer_main = __webpack_require__(8187);
var pathTracer_main_default = /*#__PURE__*/__webpack_require__.n(pathTracer_main);
// EXTERNAL MODULE: ./src/core/renderers/shaders/pathTracer/nextObject.glsl.mustache
var nextObject_glsl_mustache = __webpack_require__(4122);
var nextObject_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(nextObject_glsl_mustache);
;// CONCATENATED MODULE: ./src/core/renderers/PathTracerRenderer.js

























const accumulateMat = new external_three_namespaceObject.ShaderMaterial({
    uniforms: {
        accTex: new external_three_namespaceObject.Uniform(null),
        newTex: new external_three_namespaceObject.Uniform(null),
        iFrame: new external_three_namespaceObject.Uniform(0)
    },
    // language=GLSL
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    // language=GLSL
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D accTex;
        uniform sampler2D newTex;
        uniform float iFrame;
        void main() {
            float den = 1./ (1. + iFrame);
            gl_FragColor = den * (iFrame *  texture2D(accTex, vUv) + texture2D(newTex, vUv));
        }`
});
const accumulateQuad = new EffectComposer_FullScreenQuad(accumulateMat);

const rtParameters = {
    minFilter: external_three_namespaceObject.NearestFilter,
    magFilter: external_three_namespaceObject.NearestFilter,
    format: external_three_namespaceObject.RGBAFormat,
    type: external_three_namespaceObject.FloatType,
};

class PathTracerRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {BasicCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        super(shader1, shader2, set, camera, scene, params, threeRenderer);
        // different default value for the number of time we bounce
        this.maxBounces = params.maxBounces !== undefined ? params.maxBounces : 50;

        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder(PATHTRACER_RENDERER);

        this.sceneTarget = new external_three_namespaceObject.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
        this.accReadTarget = new external_three_namespaceObject.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
        this.accWriteTarget = new external_three_namespaceObject.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters);
        /**
         * Index of the frame (used to average the picture in the accumulation)
         * @type {number}
         */
        this.iFrame = 0;
        this.displayComposer = new EffectComposer(this.threeRenderer);
    }

    get isPathTracerRenderer() {
        return true;
    }

    setPixelRatio(value) {
        super.setPixelRatio(value);
        this.displayComposer.setPixelRatio(value);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.sceneTarget.setSize(width, height);
        this.accReadTarget.setSize(width, height);
        this.accWriteTarget.setSize(width, height);
        this.displayComposer.setSize(width, height);
    }

    updateFrameSeed() {
        const seed = Math.floor(10000 * Math.random())
        this._fragmentBuilder.updateUniform('frameSeed', seed);
    }

    /**
     * Build the fragment shader
     */
    buildFragmentShader() {
        // constants
        this._fragmentBuilder.addChunk((constants_default()));
        const res = new external_three_namespaceObject.Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.addUniform('resolution', 'vec2', res)
        this._fragmentBuilder.addUniform('maxBounces', 'int', this.maxBounces);
        // geometry
        this._fragmentBuilder.addChunk(this.shader1);
        this._fragmentBuilder.addChunk((commons1_default()));
        this._fragmentBuilder.addChunk(this.shader2);
        this._fragmentBuilder.addChunk((commons2_default()));

        // methods for random data
        this._fragmentBuilder.addUniform('frameSeed', 'uint', Math.floor(10000 * Math.random()));
        this._fragmentBuilder.addChunk((random1_default()));

        // vector data structure (for later use in ExtVector)
        this._fragmentBuilder.addChunk((pathTracer_vectorDataStruct_default()));

        // subgroup/quotient orbifold
        this.set.shader(this._fragmentBuilder);

        // complement of methods for random data
        this._fragmentBuilder.addChunk((random2_default()));

        // camera
        this.camera.shader(this._fragmentBuilder);

        // scene
        this.scene.shader(this._fragmentBuilder);
        this._fragmentBuilder.addChunk(pathTracer_scenes_glsl_mustache_default()(this));
        this._fragmentBuilder.addChunk(nextObject_glsl_mustache_default()(this));
        this._fragmentBuilder.addChunk(pathTracer_vectorDataUpdate_glsl_mustache_default()(this));

        // ray-march and main
        this._fragmentBuilder.addChunk((pathTracer_raymarch_default()));
        this._fragmentBuilder.addChunk((pathTracer_main_default()));
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {PathTracerRenderer}
     */
    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new external_three_namespaceObject.SphereBufferGeometry(1000, 60, 40);
        // flip the sphere inside out
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const material = new external_three_namespaceObject.ShaderMaterial({
            uniforms: this._fragmentBuilder.uniforms,
            vertexShader: (vertex_default()),
            fragmentShader: this._fragmentBuilder.code,
        });
        const horizonSphere = new external_three_namespaceObject.Mesh(geometry, material);
        this.threeScene.add(horizonSphere);

        this.displayComposer.addPass(new TexturePass(this.accReadTarget.texture));
        this.displayComposer.addPass(new ShaderPass(shader));

        return this;
    }

    checkShader() {
        console.log(this._fragmentBuilder.code);
    }

    /**
     * Render the accumulated target
     * (for display or download purposes)
     */
    renderAccTarget() {
        this.threeRenderer.setRenderTarget(null);
        this.displayComposer.render();
    }

    render() {
        let accTmpTarget;
        this.updateFrameSeed();
        const res = new external_three_namespaceObject.Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.updateUniform('resolution', res);

        this.threeRenderer.setRenderTarget(this.sceneTarget);
        this.threeRenderer.render(this.threeScene, this.camera.threeCamera);

        this.threeRenderer.setRenderTarget(this.accWriteTarget);
        accumulateMat.uniforms['accTex'].value = this.accReadTarget.texture;
        accumulateMat.uniforms['newTex'].value = this.sceneTarget.texture;
        accumulateMat.uniforms['iFrame'].value = this.iFrame;
        accumulateQuad.render(this.threeRenderer);

        accTmpTarget = this.accReadTarget;
        this.accReadTarget = this.accWriteTarget;
        this.accWriteTarget = accTmpTarget;

        this.renderAccTarget();
        this.iFrame = this.iFrame + 1;
    }
}
;// CONCATENATED MODULE: ./node_modules/webxr-polyfill/build/webxr-polyfill.module.js
/**
 * @license
 * webxr-polyfill
 * Copyright (c) 2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * cardboard-vr-display
 * Copyright (c) 2015-2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * webvr-polyfill-dpdb 
 * Copyright (c) 2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * wglu-preserve-state
 * Copyright (c) 2016, Brandon Jones.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @license
 * nosleep.js
 * Copyright (c) 2017, Rich Tibbett
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const _global = typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g :
                typeof self !== 'undefined' ? self :
                typeof window !== 'undefined' ? window : {};

const PRIVATE = Symbol('@@webxr-polyfill/EventTarget');
class EventTarget {
  constructor() {
    this[PRIVATE] = {
      listeners: new Map(),
    };
  }
  addEventListener(type, listener) {
    if (typeof type !== 'string') { throw new Error('`type` must be a string'); }
    if (typeof listener !== 'function') { throw new Error('`listener` must be a function'); }
    const typedListeners = this[PRIVATE].listeners.get(type) || [];
    typedListeners.push(listener);
    this[PRIVATE].listeners.set(type, typedListeners);
  }
  removeEventListener(type, listener) {
    if (typeof type !== 'string') { throw new Error('`type` must be a string'); }
    if (typeof listener !== 'function') { throw new Error('`listener` must be a function'); }
    const typedListeners = this[PRIVATE].listeners.get(type) || [];
    for (let i = typedListeners.length; i >= 0; i--) {
      if (typedListeners[i] === listener) {
        typedListeners.pop();
      }
    }
  }
  dispatchEvent(type, event) {
    const typedListeners = this[PRIVATE].listeners.get(type) || [];
    const queue = [];
    for (let i = 0; i < typedListeners.length; i++) {
      queue[i] = typedListeners[i];
    }
    for (let listener of queue) {
      listener(event);
    }
    if (typeof this[`on${type}`] === 'function') {
      this[`on${type}`](event);
    }
  }
}

const EPSILON = 0.000001;
let ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;


const degree = Math.PI / 180;

function create() {
  let out = new ARRAY_TYPE(16);
  if(ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}


function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

function invert(out, a) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}


function multiply(out, a, b) {
  let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  return out;
}












function fromRotationTranslation(out, q, v) {
  let x = q[0], y = q[1], z = q[2], w = q[3];
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  let xx = x * x2;
  let xy = x * y2;
  let xz = x * z2;
  let yy = y * y2;
  let yz = y * z2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}

function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}

function getRotation(out, mat) {
  let trace = mat[0] + mat[5] + mat[10];
  let S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (mat[6] - mat[9]) / S;
    out[1] = (mat[8] - mat[2]) / S;
    out[2] = (mat[1] - mat[4]) / S;
  } else if ((mat[0] > mat[5]) && (mat[0] > mat[10])) {
    S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
    out[3] = (mat[6] - mat[9]) / S;
    out[0] = 0.25 * S;
    out[1] = (mat[1] + mat[4]) / S;
    out[2] = (mat[8] + mat[2]) / S;
  } else if (mat[5] > mat[10]) {
    S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
    out[3] = (mat[8] - mat[2]) / S;
    out[0] = (mat[1] + mat[4]) / S;
    out[1] = 0.25 * S;
    out[2] = (mat[6] + mat[9]) / S;
  } else {
    S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
    out[3] = (mat[1] - mat[4]) / S;
    out[0] = (mat[8] + mat[2]) / S;
    out[1] = (mat[6] + mat[9]) / S;
    out[2] = 0.25 * S;
  }
  return out;
}




function perspective(out, fovy, aspect, near, far) {
  let f = 1.0 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = (2 * far * near) * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}

function create$1() {
  let out = new ARRAY_TYPE(3);
  if(ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
function clone$1(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function webxr_polyfill_module_length(a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  return Math.sqrt(x*x + y*y + z*z);
}
function fromValues$1(x, y, z) {
  let out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function copy$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

function add$1(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}








function scale$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}






function normalize(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let len = x*x + y*y + z*z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
  }
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  let ax = a[0], ay = a[1], az = a[2];
  let bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}






function transformQuat(out, a, q) {
    let qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    let x = a[0], y = a[1], z = a[2];
    let uvx = qy * z - qz * y,
        uvy = qz * x - qx * z,
        uvz = qx * y - qy * x;
    let uuvx = qy * uvz - qz * uvy,
        uuvy = qz * uvx - qx * uvz,
        uuvz = qx * uvy - qy * uvx;
    let w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;
    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;
    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
}



function angle(a, b) {
  let tempA = fromValues$1(a[0], a[1], a[2]);
  let tempB = fromValues$1(b[0], b[1], b[2]);
  normalize(tempA, tempA);
  normalize(tempB, tempB);
  let cosine = dot(tempA, tempB);
  if(cosine > 1.0) {
    return 0;
  }
  else if(cosine < -1.0) {
    return Math.PI;
  } else {
    return Math.acos(cosine);
  }
}








const len = webxr_polyfill_module_length;

const forEach = (function() {
  let vec = create$1();
  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 3;
    }
    if(!offset) {
      offset = 0;
    }
    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }
    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
    }
    return a;
  };
})();

function create$2() {
  let out = new ARRAY_TYPE(9);
  if(ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

function create$3() {
  let out = new ARRAY_TYPE(4);
  if(ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
function clone$3(a) {
  let out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function fromValues$3(x, y, z, w) {
  let out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function copy$3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}


















function normalize$1(out, a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let w = a[3];
  let len = x*x + y*y + z*z + w*w;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
  }
  return out;
}















const forEach$1 = (function() {
  let vec = create$3();
  return function(a, stride, offset, count, fn, arg) {
    let i, l;
    if(!stride) {
      stride = 4;
    }
    if(!offset) {
      offset = 0;
    }
    if(count) {
      l = Math.min((count * stride) + offset, a.length);
    } else {
      l = a.length;
    }
    for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
    }
    return a;
  };
})();

function create$4() {
  let out = new ARRAY_TYPE(4);
  if(ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  let s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}

function multiply$4(out, a, b) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}




function slerp(out, a, b, t) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  let omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if ( cosom < 0.0 ) {
    cosom = -cosom;
    bx = - bx;
    by = - by;
    bz = - bz;
    bw = - bw;
  }
  if ( (1.0 - cosom) > EPSILON ) {
    omega  = Math.acos(cosom);
    sinom  = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1.0 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}

function invert$2(out, a) {
  let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  let dot$$1 = a0*a0 + a1*a1 + a2*a2 + a3*a3;
  let invDot = dot$$1 ? 1.0/dot$$1 : 0;
  out[0] = -a0*invDot;
  out[1] = -a1*invDot;
  out[2] = -a2*invDot;
  out[3] = a3*invDot;
  return out;
}

function fromMat3(out, m) {
  let fTrace = m[0] + m[4] + m[8];
  let fRoot;
  if ( fTrace > 0.0 ) {
    fRoot = Math.sqrt(fTrace + 1.0);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5/fRoot;
    out[0] = (m[5]-m[7])*fRoot;
    out[1] = (m[6]-m[2])*fRoot;
    out[2] = (m[1]-m[3])*fRoot;
  } else {
    let i = 0;
    if ( m[4] > m[0] )
      i = 1;
    if ( m[8] > m[i*3+i] )
      i = 2;
    let j = (i+1)%3;
    let k = (i+2)%3;
    fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
    out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
    out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
  }
  return out;
}
function fromEuler(out, x, y, z) {
    let halfToRad = 0.5 * Math.PI / 180.0;
    x *= halfToRad;
    y *= halfToRad;
    z *= halfToRad;
    let sx = Math.sin(x);
    let cx = Math.cos(x);
    let sy = Math.sin(y);
    let cy = Math.cos(y);
    let sz = Math.sin(z);
    let cz = Math.cos(z);
    out[0] = sx * cy * cz - cx * sy * sz;
    out[1] = cx * sy * cz + sx * cy * sz;
    out[2] = cx * cy * sz - sx * sy * cz;
    out[3] = cx * cy * cz + sx * sy * sz;
    return out;
}

const clone$4 = clone$3;
const fromValues$4 = fromValues$3;
const copy$4 = copy$3;










const normalize$2 = normalize$1;


const rotationTo = (function() {
  let tmpvec3 = create$1();
  let xUnitVec3 = fromValues$1(1,0,0);
  let yUnitVec3 = fromValues$1(0,1,0);
  return function(out, a, b) {
    let dot$$1 = dot(a, b);
    if (dot$$1 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001)
        cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot$$1 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot$$1;
      return normalize$2(out, out);
    }
  };
})();
const sqlerp = (function () {
  let temp1 = create$4();
  let temp2 = create$4();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}());
const setAxes = (function() {
  let matr = create$2();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize$2(out, fromMat3(out, matr));
  };
})();

const PRIVATE$1 = Symbol('@@webxr-polyfill/XRRigidTransform');
class XRRigidTransform$1 {
  constructor() {
    this[PRIVATE$1] = {
      matrix: null,
      position: null,
      orientation: null,
      inverse: null,
    };
    if (arguments.length === 0) {
      this[PRIVATE$1].matrix = identity(new Float32Array(16));
    } else if (arguments.length === 1) {
      if (arguments[0] instanceof Float32Array) {
        this[PRIVATE$1].matrix = arguments[0];
      } else {
        this[PRIVATE$1].position = this._getPoint(arguments[0]);
        this[PRIVATE$1].orientation = DOMPointReadOnly.fromPoint({
            x: 0, y: 0, z: 0, w: 1
        });
      }
    } else if (arguments.length === 2) {
      this[PRIVATE$1].position = this._getPoint(arguments[0]);
      this[PRIVATE$1].orientation = this._getPoint(arguments[1]);
    } else {
      throw new Error("Too many arguments!");
    }
    if (this[PRIVATE$1].matrix) {
        let position = create$1();
        getTranslation(position, this[PRIVATE$1].matrix);
        this[PRIVATE$1].position = DOMPointReadOnly.fromPoint({
            x: position[0],
            y: position[1],
            z: position[2]
        });
        let orientation = create$4();
        getRotation(orientation, this[PRIVATE$1].matrix);
        this[PRIVATE$1].orientation = DOMPointReadOnly.fromPoint({
          x: orientation[0],
          y: orientation[1],
          z: orientation[2],
          w: orientation[3]
        });
    } else {
        this[PRIVATE$1].matrix = identity(new Float32Array(16));
        fromRotationTranslation(
          this[PRIVATE$1].matrix,
          fromValues$4(
            this[PRIVATE$1].orientation.x,
            this[PRIVATE$1].orientation.y,
            this[PRIVATE$1].orientation.z,
            this[PRIVATE$1].orientation.w),
          fromValues$1(
            this[PRIVATE$1].position.x,
            this[PRIVATE$1].position.y,
            this[PRIVATE$1].position.z)
        );
    }
  }
  _getPoint(arg) {
    if (arg instanceof DOMPointReadOnly) {
      return arg;
    }
    return DOMPointReadOnly.fromPoint(arg);
  }
  get matrix() { return this[PRIVATE$1].matrix; }
  get position() { return this[PRIVATE$1].position; }
  get orientation() { return this[PRIVATE$1].orientation; }
  get inverse() {
    if (this[PRIVATE$1].inverse === null) {
      let invMatrix = identity(new Float32Array(16));
      invert(invMatrix, this[PRIVATE$1].matrix);
      this[PRIVATE$1].inverse = new XRRigidTransform$1(invMatrix);
      this[PRIVATE$1].inverse[PRIVATE$1].inverse = this;
    }
    return this[PRIVATE$1].inverse;
  }
}

const PRIVATE$2 = Symbol('@@webxr-polyfill/XRSpace');

class XRSpace {
  constructor(specialType = null, inputSource = null) {
    this[PRIVATE$2] = {
      specialType,
      inputSource,
      baseMatrix: null,
      inverseBaseMatrix: null,
      lastFrameId: -1
    };
  }
  get _specialType() {
    return this[PRIVATE$2].specialType;
  }
  get _inputSource() {
    return this[PRIVATE$2].inputSource;
  }
  _ensurePoseUpdated(device, frameId) {
    if (frameId == this[PRIVATE$2].lastFrameId) return;
    this[PRIVATE$2].lastFrameId = frameId;
    this._onPoseUpdate(device);
  }
  _onPoseUpdate(device) {
    if (this[PRIVATE$2].specialType == 'viewer') {
      this._baseMatrix = device.getBasePoseMatrix();
    }
  }
  set _baseMatrix(matrix) {
    this[PRIVATE$2].baseMatrix = matrix;
    this[PRIVATE$2].inverseBaseMatrix = null;
  }
  get _baseMatrix() {
    if (!this[PRIVATE$2].baseMatrix) {
      if (this[PRIVATE$2].inverseBaseMatrix) {
        this[PRIVATE$2].baseMatrix = new Float32Array(16);
        invert(this[PRIVATE$2].baseMatrix, this[PRIVATE$2].inverseBaseMatrix);
      }
    }
    return this[PRIVATE$2].baseMatrix;
  }
  set _inverseBaseMatrix(matrix) {
    this[PRIVATE$2].inverseBaseMatrix = matrix;
    this[PRIVATE$2].baseMatrix = null;
  }
  get _inverseBaseMatrix() {
    if (!this[PRIVATE$2].inverseBaseMatrix) {
      if (this[PRIVATE$2].baseMatrix) {
        this[PRIVATE$2].inverseBaseMatrix = new Float32Array(16);
        invert(this[PRIVATE$2].inverseBaseMatrix, this[PRIVATE$2].baseMatrix);
      }
    }
    return this[PRIVATE$2].inverseBaseMatrix;
  }
  _getSpaceRelativeTransform(space) {
    if (!this._inverseBaseMatrix || !space._baseMatrix) {
      return null;
    }
    let out = new Float32Array(16);
    multiply(out, this._inverseBaseMatrix, space._baseMatrix);
    return new XRRigidTransform$1(out);
  }
}

const DEFAULT_EMULATION_HEIGHT = 1.6;
const PRIVATE$3 = Symbol('@@webxr-polyfill/XRReferenceSpace');
const XRReferenceSpaceTypes = [
  'viewer',
  'local',
  'local-floor',
  'bounded-floor',
  'unbounded'
];
function isFloor(type) {
  return type === 'bounded-floor' || type === 'local-floor';
}
class XRReferenceSpace extends XRSpace {
  constructor(type, transform = null) {
    if (!XRReferenceSpaceTypes.includes(type)) {
      throw new Error(`XRReferenceSpaceType must be one of ${XRReferenceSpaceTypes}`);
    }
    super(type);
    if (type === 'bounded-floor' && !transform) {
      throw new Error(`XRReferenceSpace cannot use 'bounded-floor' type if the platform does not provide the floor level`);
    }
    if (isFloor(type) && !transform) {
      transform = identity(new Float32Array(16));
      transform[13] = DEFAULT_EMULATION_HEIGHT;
    }
    this._inverseBaseMatrix = transform || identity(new Float32Array(16));
    this[PRIVATE$3] = {
      type,
      transform,
      originOffset : identity(new Float32Array(16)),
    };
  }
  _transformBasePoseMatrix(out, pose) {
    multiply(out, this._inverseBaseMatrix, pose);
  }
  _originOffsetMatrix() {
    return this[PRIVATE$3].originOffset;
  }
  _adjustForOriginOffset(transformMatrix) {
    let inverseOriginOffsetMatrix = new Float32Array(16);
    invert(inverseOriginOffsetMatrix, this[PRIVATE$3].originOffset);
    multiply(transformMatrix, inverseOriginOffsetMatrix, transformMatrix);
  }
  _getSpaceRelativeTransform(space) {
    let transform = super._getSpaceRelativeTransform(space);
    this._adjustForOriginOffset(transform.matrix);
    return new XRRigidTransform(transform.matrix);
  }
  getOffsetReferenceSpace(additionalOffset) {
    let newSpace = new XRReferenceSpace(
      this[PRIVATE$3].type,
      this[PRIVATE$3].transform,
      this[PRIVATE$3].bounds);
    multiply(newSpace[PRIVATE$3].originOffset, this[PRIVATE$3].originOffset, additionalOffset.matrix);
    return newSpace;
  }
}

const PRIVATE$4 = Symbol('@@webxr-polyfill/XR');
const XRSessionModes = ['inline', 'immersive-vr', 'immersive-ar'];
const DEFAULT_SESSION_OPTIONS = {
  'inline': {
    requiredFeatures: ['viewer'],
    optionalFeatures: [],
  },
  'immersive-vr': {
    requiredFeatures: ['viewer', 'local'],
    optionalFeatures: [],
  },
  'immersive-ar': {
    requiredFeatures: ['viewer', 'local'],
    optionalFeatures: [],
  }
};
const POLYFILL_REQUEST_SESSION_ERROR =
`Polyfill Error: Must call navigator.xr.isSessionSupported() with any XRSessionMode
or navigator.xr.requestSession('inline') prior to requesting an immersive
session. This is a limitation specific to the WebXR Polyfill and does not apply
to native implementations of the API.`;
class XRSystem extends EventTarget {
  constructor(devicePromise) {
    super();
    this[PRIVATE$4] = {
      device: null,
      devicePromise,
      immersiveSession: null,
      inlineSessions: new Set(),
    };
    devicePromise.then((device) => { this[PRIVATE$4].device = device; });
  }
  async isSessionSupported(mode) {
    if (!this[PRIVATE$4].device) {
      await this[PRIVATE$4].devicePromise;
    }
    if (mode != 'inline') {
      return Promise.resolve(this[PRIVATE$4].device.isSessionSupported(mode));
    }
    return Promise.resolve(true);
  }
  async requestSession(mode, options) {
    if (!this[PRIVATE$4].device) {
      if (mode != 'inline') {
        throw new Error(POLYFILL_REQUEST_SESSION_ERROR);
      } else {
        await this[PRIVATE$4].devicePromise;
      }
    }
    if (!XRSessionModes.includes(mode)) {
      throw new TypeError(
          `The provided value '${mode}' is not a valid enum value of type XRSessionMode`);
    }
    const defaultOptions = DEFAULT_SESSION_OPTIONS[mode];
    const requiredFeatures = defaultOptions.requiredFeatures.concat(
        options && options.requiredFeatures ? options.requiredFeatures : []);
    const optionalFeatures = defaultOptions.optionalFeatures.concat(
        options && options.optionalFeatures ? options.optionalFeatures : []);
    const enabledFeatures = new Set();
    let requirementsFailed = false;
    for (let feature of requiredFeatures) {
      if (!this[PRIVATE$4].device.isFeatureSupported(feature)) {
        console.error(`The required feature '${feature}' is not supported`);
        requirementsFailed = true;
      } else {
        enabledFeatures.add(feature);
      }
    }
    if (requirementsFailed) {
      throw new DOMException('Session does not support some required features', 'NotSupportedError');
    }
    for (let feature of optionalFeatures) {
      if (!this[PRIVATE$4].device.isFeatureSupported(feature)) {
        console.log(`The optional feature '${feature}' is not supported`);
      } else {
        enabledFeatures.add(feature);
      }
    }
    const sessionId = await this[PRIVATE$4].device.requestSession(mode, enabledFeatures);
    const session = new XRSession(this[PRIVATE$4].device, mode, sessionId);
    if (mode == 'inline') {
      this[PRIVATE$4].inlineSessions.add(session);
    } else {
      this[PRIVATE$4].immersiveSession = session;
    }
    const onSessionEnd = () => {
      if (mode == 'inline') {
        this[PRIVATE$4].inlineSessions.delete(session);
      } else {
        this[PRIVATE$4].immersiveSession = null;
      }
      session.removeEventListener('end', onSessionEnd);
    };
    session.addEventListener('end', onSessionEnd);
    return session;
  }
}

let now;
if ('performance' in _global === false) {
  let startTime = Date.now();
  now = () => Date.now() - startTime;
} else {
  now = () => performance.now();
}
var now$1 = now;

const PRIVATE$5 = Symbol('@@webxr-polyfill/XRPose');
class XRPose$1 {
  constructor(transform, emulatedPosition) {
    this[PRIVATE$5] = {
      transform,
      emulatedPosition,
    };
  }
  get transform() { return this[PRIVATE$5].transform; }
  get emulatedPosition() { return this[PRIVATE$5].emulatedPosition; }
}

const PRIVATE$6 = Symbol('@@webxr-polyfill/XRViewerPose');
class XRViewerPose extends XRPose$1 {
  constructor(transform, views, emulatedPosition = false) {
    super(transform, emulatedPosition);
    this[PRIVATE$6] = {
      views
    };
  }
  get views() {
    return this[PRIVATE$6].views;
  }
}

const PRIVATE$7 = Symbol('@@webxr-polyfill/XRViewport');
class XRViewport {
  constructor(target) {
    this[PRIVATE$7] = { target };
  }
  get x() { return this[PRIVATE$7].target.x; }
  get y() { return this[PRIVATE$7].target.y; }
  get width() { return this[PRIVATE$7].target.width; }
  get height() { return this[PRIVATE$7].target.height; }
}

const XREyes = ['left', 'right', 'none'];
const PRIVATE$8 = Symbol('@@webxr-polyfill/XRView');
class XRView {
  constructor(device, transform, eye, sessionId) {
    if (!XREyes.includes(eye)) {
      throw new Error(`XREye must be one of: ${XREyes}`);
    }
    const temp = Object.create(null);
    const viewport = new XRViewport(temp);
    this[PRIVATE$8] = {
      device,
      eye,
      viewport,
      temp,
      sessionId,
      transform,
    };
  }
  get eye() { return this[PRIVATE$8].eye; }
  get projectionMatrix() { return this[PRIVATE$8].device.getProjectionMatrix(this.eye); }
  get transform() { return this[PRIVATE$8].transform; }
  _getViewport(layer) {
    if (this[PRIVATE$8].device.getViewport(this[PRIVATE$8].sessionId,
                                           this.eye,
                                           layer,
                                           this[PRIVATE$8].temp)) {
      return this[PRIVATE$8].viewport;
    }
    return undefined;
  }
}

const PRIVATE$9 = Symbol('@@webxr-polyfill/XRFrame');
const NON_ACTIVE_MSG = "XRFrame access outside the callback that produced it is invalid.";
const NON_ANIMFRAME_MSG = "getViewerPose can only be called on XRFrame objects passed to XRSession.requestAnimationFrame callbacks.";
let NEXT_FRAME_ID = 0;
class XRFrame {
  constructor(device, session, sessionId) {
    this[PRIVATE$9] = {
      id: ++NEXT_FRAME_ID,
      active: false,
      animationFrame: false,
      device,
      session,
      sessionId
    };
  }
  get session() { return this[PRIVATE$9].session; }
  getViewerPose(referenceSpace) {
    if (!this[PRIVATE$9].animationFrame) {
      throw new DOMException(NON_ANIMFRAME_MSG, 'InvalidStateError');
    }
    if (!this[PRIVATE$9].active) {
      throw new DOMException(NON_ACTIVE_MSG, 'InvalidStateError');
    }
    const device = this[PRIVATE$9].device;
    const session = this[PRIVATE$9].session;
    session[PRIVATE$15].viewerSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
    referenceSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
    let viewerTransform = referenceSpace._getSpaceRelativeTransform(session[PRIVATE$15].viewerSpace);
    const views = [];
    for (let viewSpace of session[PRIVATE$15].viewSpaces) {
      viewSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
      let viewTransform = referenceSpace._getSpaceRelativeTransform(viewSpace);
      let view = new XRView(device, viewTransform, viewSpace.eye, this[PRIVATE$9].sessionId);
      views.push(view);
    }
    let viewerPose = new XRViewerPose(viewerTransform, views, false                             );
    return viewerPose;
  }
  getPose(space, baseSpace) {
    if (!this[PRIVATE$9].active) {
      throw new DOMException(NON_ACTIVE_MSG, 'InvalidStateError');
    }
    const device = this[PRIVATE$9].device;
    if (space._specialType === "target-ray" || space._specialType === "grip") {
      return device.getInputPose(
        space._inputSource, baseSpace, space._specialType);
    } else {
      space._ensurePoseUpdated(device, this[PRIVATE$9].id);
      baseSpace._ensurePoseUpdated(device, this[PRIVATE$9].id);
      let transform = baseSpace._getSpaceRelativeTransform(space);
      if (!transform) { return null; }
      return new XRPose(transform, false                             );
    }
    return null;
  }
}

const PRIVATE$10 = Symbol('@@webxr-polyfill/XRRenderState');
const XRRenderStateInit = Object.freeze({
  depthNear: 0.1,
  depthFar: 1000.0,
  inlineVerticalFieldOfView: null,
  baseLayer: null
});
class XRRenderState {
  constructor(stateInit = {}) {
    const config = Object.assign({}, XRRenderStateInit, stateInit);
    this[PRIVATE$10] = { config };
  }
  get depthNear() { return this[PRIVATE$10].config.depthNear; }
  get depthFar() { return this[PRIVATE$10].config.depthFar; }
  get inlineVerticalFieldOfView() { return this[PRIVATE$10].config.inlineVerticalFieldOfView; }
  get baseLayer() { return this[PRIVATE$10].config.baseLayer; }
}

const POLYFILLED_XR_COMPATIBLE = Symbol('@@webxr-polyfill/polyfilled-xr-compatible');
const XR_COMPATIBLE = Symbol('@@webxr-polyfill/xr-compatible');

const PRIVATE$11 = Symbol('@@webxr-polyfill/XRWebGLLayer');
const XRWebGLLayerInit = Object.freeze({
  antialias: true,
  depth: false,
  stencil: false,
  alpha: true,
  multiview: false,
  ignoreDepthValues: false,
  framebufferScaleFactor: 1.0,
});
class XRWebGLLayer {
  constructor(session, context, layerInit={}) {
    const config = Object.assign({}, XRWebGLLayerInit, layerInit);
    if (!(session instanceof XRSession$1)) {
      throw new Error('session must be a XRSession');
    }
    if (session.ended) {
      throw new Error(`InvalidStateError`);
    }
    if (context[POLYFILLED_XR_COMPATIBLE]) {
      if (context[XR_COMPATIBLE] !== true) {
        throw new Error(`InvalidStateError`);
      }
    }
    const framebuffer = context.getParameter(context.FRAMEBUFFER_BINDING);
    this[PRIVATE$11] = {
      context,
      config,
      framebuffer,
      session,
    };
  }
  get context() { return this[PRIVATE$11].context; }
  get antialias() { return this[PRIVATE$11].config.antialias; }
  get ignoreDepthValues() { return true; }
  get framebuffer() { return this[PRIVATE$11].framebuffer; }
  get framebufferWidth() { return this[PRIVATE$11].context.drawingBufferWidth; }
  get framebufferHeight() { return this[PRIVATE$11].context.drawingBufferHeight; }
  get _session() { return this[PRIVATE$11].session; }
  getViewport(view) {
    return view._getViewport(this);
  }
  static getNativeFramebufferScaleFactor(session) {
    if (!session) {
      throw new TypeError('getNativeFramebufferScaleFactor must be passed a session.')
    }
    if (session[PRIVATE$15].ended) { return 0.0; }
    return 1.0;
  }
}

const PRIVATE$12 = Symbol('@@webxr-polyfill/XRInputSourceEvent');
class XRInputSourceEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$12] = {
      frame: eventInitDict.frame,
      inputSource: eventInitDict.inputSource
    };
    Object.setPrototypeOf(this, XRInputSourceEvent.prototype);
  }
  get frame() { return this[PRIVATE$12].frame; }
  get inputSource() { return this[PRIVATE$12].inputSource; }
}

const PRIVATE$13 = Symbol('@@webxr-polyfill/XRSessionEvent');
class XRSessionEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$13] = {
      session: eventInitDict.session
    };
    Object.setPrototypeOf(this, XRSessionEvent.prototype);
  }
  get session() { return this[PRIVATE$13].session; }
}

const PRIVATE$14 = Symbol('@@webxr-polyfill/XRInputSourcesChangeEvent');
class XRInputSourcesChangeEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$14] = {
      session: eventInitDict.session,
      added: eventInitDict.added,
      removed: eventInitDict.removed
    };
    Object.setPrototypeOf(this, XRInputSourcesChangeEvent.prototype);
  }
  get session() { return this[PRIVATE$14].session; }
  get added() { return this[PRIVATE$14].added; }
  get removed() { return this[PRIVATE$14].removed; }
}

const PRIVATE$15 = Symbol('@@webxr-polyfill/XRSession');
class XRViewSpace extends XRSpace {
  constructor(eye) {
    super(eye);
  }
  get eye() {
    return this._specialType;
  }
  _onPoseUpdate(device) {
    this._inverseBaseMatrix = device.getBaseViewMatrix(this._specialType);
  }
}
class XRSession$1 extends EventTarget {
  constructor(device, mode, id) {
    super();
    let immersive = mode != 'inline';
    let initialRenderState = new XRRenderState({
      inlineVerticalFieldOfView: immersive ? null : Math.PI * 0.5
    });
    this[PRIVATE$15] = {
      device,
      mode,
      immersive,
      ended: false,
      suspended: false,
      frameCallbacks: [],
      currentFrameCallbacks: null,
      frameHandle: 0,
      deviceFrameHandle: null,
      id,
      activeRenderState: initialRenderState,
      pendingRenderState: null,
      viewerSpace: new XRReferenceSpace("viewer"),
      viewSpaces: [],
      currentInputSources: []
    };
    if (immersive) {
      this[PRIVATE$15].viewSpaces.push(new XRViewSpace('left'),
                                    new XRViewSpace('right'));
    } else {
      this[PRIVATE$15].viewSpaces.push(new XRViewSpace('none'));
    }
    this[PRIVATE$15].onDeviceFrame = () => {
      if (this[PRIVATE$15].ended || this[PRIVATE$15].suspended) {
        return;
      }
      this[PRIVATE$15].deviceFrameHandle = null;
      this[PRIVATE$15].startDeviceFrameLoop();
      if (this[PRIVATE$15].pendingRenderState !== null) {
        this[PRIVATE$15].activeRenderState = new XRRenderState(this[PRIVATE$15].pendingRenderState);
        this[PRIVATE$15].pendingRenderState = null;
        if (this[PRIVATE$15].activeRenderState.baseLayer) {
          this[PRIVATE$15].device.onBaseLayerSet(
            this[PRIVATE$15].id,
            this[PRIVATE$15].activeRenderState.baseLayer);
        }
      }
      if (this[PRIVATE$15].activeRenderState.baseLayer === null) {
        return;
      }
      const frame = new XRFrame(device, this, this[PRIVATE$15].id);
      const callbacks = this[PRIVATE$15].currentFrameCallbacks = this[PRIVATE$15].frameCallbacks;
      this[PRIVATE$15].frameCallbacks = [];
      frame[PRIVATE$9].active = true;
      frame[PRIVATE$9].animationFrame = true;
      this[PRIVATE$15].device.onFrameStart(this[PRIVATE$15].id, this[PRIVATE$15].activeRenderState);
      this._checkInputSourcesChange();
      const rightNow = now$1();
      for (let i = 0; i < callbacks.length; i++) {
        try {
          if (!callbacks[i].cancelled && typeof callbacks[i].callback === 'function') {
            callbacks[i].callback(rightNow, frame);
          }
        } catch(err) {
          console.error(err);
        }
      }
      this[PRIVATE$15].currentFrameCallbacks = null;
      frame[PRIVATE$9].active = false;
      this[PRIVATE$15].device.onFrameEnd(this[PRIVATE$15].id);
    };
    this[PRIVATE$15].startDeviceFrameLoop = () => {
      if (this[PRIVATE$15].deviceFrameHandle === null) {
        this[PRIVATE$15].deviceFrameHandle = this[PRIVATE$15].device.requestAnimationFrame(
          this[PRIVATE$15].onDeviceFrame
        );
      }
    };
    this[PRIVATE$15].stopDeviceFrameLoop = () => {
      const handle = this[PRIVATE$15].deviceFrameHandle;
      if (handle !== null) {
        this[PRIVATE$15].device.cancelAnimationFrame(handle);
        this[PRIVATE$15].deviceFrameHandle = null;
      }
    };
    this[PRIVATE$15].onPresentationEnd = sessionId => {
      if (sessionId !== this[PRIVATE$15].id) {
        this[PRIVATE$15].suspended = false;
        this[PRIVATE$15].startDeviceFrameLoop();
        this.dispatchEvent('focus', { session: this });
        return;
      }
      this[PRIVATE$15].ended = true;
      this[PRIVATE$15].stopDeviceFrameLoop();
      device.removeEventListener('@@webxr-polyfill/vr-present-end', this[PRIVATE$15].onPresentationEnd);
      device.removeEventListener('@@webxr-polyfill/vr-present-start', this[PRIVATE$15].onPresentationStart);
      device.removeEventListener('@@webxr-polyfill/input-select-start', this[PRIVATE$15].onSelectStart);
      device.removeEventListener('@@webxr-polyfill/input-select-end', this[PRIVATE$15].onSelectEnd);
      this.dispatchEvent('end', new XRSessionEvent('end', { session: this }));
    };
    device.addEventListener('@@webxr-polyfill/vr-present-end', this[PRIVATE$15].onPresentationEnd);
    this[PRIVATE$15].onPresentationStart = sessionId => {
      if (sessionId === this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].suspended = true;
      this[PRIVATE$15].stopDeviceFrameLoop();
      this.dispatchEvent('blur', { session: this });
    };
    device.addEventListener('@@webxr-polyfill/vr-present-start', this[PRIVATE$15].onPresentationStart);
    this[PRIVATE$15].onSelectStart = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('selectstart',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-select-start', this[PRIVATE$15].onSelectStart);
    this[PRIVATE$15].onSelectEnd = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('selectend',  evt.inputSource);
      this[PRIVATE$15].dispatchInputSourceEvent('select',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-select-end', this[PRIVATE$15].onSelectEnd);
    this[PRIVATE$15].onSqueezeStart = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('squeezestart',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-squeeze-start', this[PRIVATE$15].onSqueezeStart);
    this[PRIVATE$15].onSqueezeEnd = evt => {
      if (evt.sessionId !== this[PRIVATE$15].id) {
        return;
      }
      this[PRIVATE$15].dispatchInputSourceEvent('squeezeend',  evt.inputSource);
      this[PRIVATE$15].dispatchInputSourceEvent('squeeze',  evt.inputSource);
    };
    device.addEventListener('@@webxr-polyfill/input-squeeze-end', this[PRIVATE$15].onSqueezeEnd);
    this[PRIVATE$15].dispatchInputSourceEvent = (type, inputSource) => {
      const frame = new XRFrame(device, this, this[PRIVATE$15].id);
      const event = new XRInputSourceEvent(type, { frame, inputSource });
      frame[PRIVATE$9].active = true;
      this.dispatchEvent(type, event);
      frame[PRIVATE$9].active = false;
    };
    this[PRIVATE$15].startDeviceFrameLoop();
    this.onblur = undefined;
    this.onfocus = undefined;
    this.onresetpose = undefined;
    this.onend = undefined;
    this.onselect = undefined;
    this.onselectstart = undefined;
    this.onselectend = undefined;
  }
  get renderState() { return this[PRIVATE$15].activeRenderState; }
  get environmentBlendMode() {
    return this[PRIVATE$15].device.environmentBlendMode || 'opaque';
  }
  async requestReferenceSpace(type) {
    if (this[PRIVATE$15].ended) {
      return;
    }
    if (!XRReferenceSpaceTypes.includes(type)) {
      throw new TypeError(`XRReferenceSpaceType must be one of ${XRReferenceSpaceTypes}`);
    }
    if (!this[PRIVATE$15].device.doesSessionSupportReferenceSpace(this[PRIVATE$15].id, type)) {
      throw new DOMException(`The ${type} reference space is not supported by this session.`, 'NotSupportedError');
    }
    if (type === 'viewer') {
      return this[PRIVATE$15].viewerSpace;
    }
    let transform = await this[PRIVATE$15].device.requestFrameOfReferenceTransform(type);
    if (type === 'bounded-floor') {
      if (!transform) {
        throw new DOMException(`${type} XRReferenceSpace not supported by this device.`, 'NotSupportedError');
      }
      let bounds = this[PRIVATE$15].device.requestStageBounds();
      if (!bounds) {
        throw new DOMException(`${type} XRReferenceSpace not supported by this device.`, 'NotSupportedError');
      }
      throw new DOMException(`The WebXR polyfill does not support the ${type} reference space yet.`, 'NotSupportedError');
    }
    return new XRReferenceSpace(type, transform);
  }
  requestAnimationFrame(callback) {
    if (this[PRIVATE$15].ended) {
      return;
    }
    const handle = ++this[PRIVATE$15].frameHandle;
    this[PRIVATE$15].frameCallbacks.push({
      handle,
      callback,
      cancelled: false
    });
    return handle;
  }
  cancelAnimationFrame(handle) {
    let callbacks = this[PRIVATE$15].frameCallbacks;
    let index = callbacks.findIndex(d => d && d.handle === handle);
    if (index > -1) {
      callbacks[index].cancelled = true;
      callbacks.splice(index, 1);
    }
    callbacks = this[PRIVATE$15].currentFrameCallbacks;
    if (callbacks) {
      index = callbacks.findIndex(d => d && d.handle === handle);
      if (index > -1) {
        callbacks[index].cancelled = true;
      }
    }
  }
  get inputSources() {
    return this[PRIVATE$15].device.getInputSources();
  }
  async end() {
    if (this[PRIVATE$15].ended) {
      return;
    }
    if (this[PRIVATE$15].immersive) {
      this[PRIVATE$15].ended = true;
      this[PRIVATE$15].device.removeEventListener('@@webxr-polyfill/vr-present-start',
                                                 this[PRIVATE$15].onPresentationStart);
      this[PRIVATE$15].device.removeEventListener('@@webxr-polyfill/vr-present-end',
                                                 this[PRIVATE$15].onPresentationEnd);
      this[PRIVATE$15].device.removeEventListener('@@webxr-polyfill/input-select-start',
                                                 this[PRIVATE$15].onSelectStart);
      this[PRIVATE$15].device.removeEventListener('@@webxr-polyfill/input-select-end',
                                                 this[PRIVATE$15].onSelectEnd);
      this.dispatchEvent('end', new XRSessionEvent('end', { session: this }));
    }
    this[PRIVATE$15].stopDeviceFrameLoop();
    return this[PRIVATE$15].device.endSession(this[PRIVATE$15].id);
  }
  updateRenderState(newState) {
    if (this[PRIVATE$15].ended) {
      const message = "Can't call updateRenderState on an XRSession " +
                      "that has already ended.";
      throw new Error(message);
    }
    if (newState.baseLayer && (newState.baseLayer._session !== this)) {
      const message = "Called updateRenderState with a base layer that was " +
                      "created by a different session.";
      throw new Error(message);
    }
    const fovSet = (newState.inlineVerticalFieldOfView !== null) &&
                   (newState.inlineVerticalFieldOfView !== undefined);
    if (fovSet) {
      if (this[PRIVATE$15].immersive) {
        const message = "inlineVerticalFieldOfView must not be set for an " +
                        "XRRenderState passed to updateRenderState for an " +
                        "immersive session.";
        throw new Error(message);
      } else {
        newState.inlineVerticalFieldOfView = Math.min(
          3.13, Math.max(0.01, newState.inlineVerticalFieldOfView));
      }
    }
    if (this[PRIVATE$15].pendingRenderState === null) {
      const activeRenderState = this[PRIVATE$15].activeRenderState;
      this[PRIVATE$15].pendingRenderState = {
        depthNear: activeRenderState.depthNear,
        depthFar: activeRenderState.depthFar,
        inlineVerticalFieldOfView: activeRenderState.inlineVerticalFieldOfView,
        baseLayer: activeRenderState.baseLayer
      };
    }
    Object.assign(this[PRIVATE$15].pendingRenderState, newState);
  }
  _checkInputSourcesChange() {
    const added = [];
    const removed = [];
    const newInputSources = this.inputSources;
    const oldInputSources = this[PRIVATE$15].currentInputSources;
    for (const newInputSource of newInputSources) {
      if (!oldInputSources.includes(newInputSource)) {
        added.push(newInputSource);
      }
    }
    for (const oldInputSource of oldInputSources) {
      if (!newInputSources.includes(oldInputSource)) {
        removed.push(oldInputSource);
      }
    }
    if (added.length > 0 || removed.length > 0) {
      this.dispatchEvent('inputsourceschange', new XRInputSourcesChangeEvent('inputsourceschange', {
        session: this,
        added: added,
        removed: removed
      }));
    }
    this[PRIVATE$15].currentInputSources.length = 0;
    for (const newInputSource of newInputSources) {
      this[PRIVATE$15].currentInputSources.push(newInputSource);
    }
  }
}

const PRIVATE$16 = Symbol('@@webxr-polyfill/XRInputSource');
class XRInputSource {
  constructor(impl) {
    this[PRIVATE$16] = {
      impl,
      gripSpace: new XRSpace("grip", this),
      targetRaySpace: new XRSpace("target-ray", this)
    };
  }
  get handedness() { return this[PRIVATE$16].impl.handedness; }
  get targetRayMode() { return this[PRIVATE$16].impl.targetRayMode; }
  get gripSpace() {
    let mode = this[PRIVATE$16].impl.targetRayMode;
    if (mode === "gaze" || mode === "screen") {
      return null;
    }
    return this[PRIVATE$16].gripSpace;
  }
  get targetRaySpace() { return this[PRIVATE$16].targetRaySpace; }
  get profiles() { return this[PRIVATE$16].impl.profiles; }
  get gamepad() { return this[PRIVATE$16].impl.gamepad; }
}

const PRIVATE$17 = Symbol('@@webxr-polyfill/XRReferenceSpaceEvent');
class XRReferenceSpaceEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this[PRIVATE$17] = {
      referenceSpace: eventInitDict.referenceSpace,
      transform: eventInitDict.transform || null
    };
    Object.setPrototypeOf(this, XRReferenceSpaceEvent.prototype);
  }
  get referenceSpace() { return this[PRIVATE$17].referenceSpace; }
  get transform() { return this[PRIVATE$17].transform; }
}

var API = {
  XRSystem,
  XRSession: XRSession$1,
  XRSessionEvent,
  XRFrame,
  XRView,
  XRViewport,
  XRViewerPose,
  XRWebGLLayer,
  XRSpace,
  XRReferenceSpace,
  XRReferenceSpaceEvent,
  XRInputSource,
  XRInputSourceEvent,
  XRInputSourcesChangeEvent,
  XRRenderState,
  XRRigidTransform: XRRigidTransform$1,
  XRPose: XRPose$1,
};

const polyfillMakeXRCompatible = Context => {
  if (typeof Context.prototype.makeXRCompatible === 'function') {
    return false;
  }
  Context.prototype.makeXRCompatible = function () {
    this[XR_COMPATIBLE] = true;
    return Promise.resolve();
  };
  return true;
};
const polyfillGetContext = (Canvas) => {
  const getContext = Canvas.prototype.getContext;
  Canvas.prototype.getContext = function (contextType, glAttribs) {
    const ctx = getContext.call(this, contextType, glAttribs);
    if (ctx) {
      ctx[POLYFILLED_XR_COMPATIBLE] = true;
      if (glAttribs && ('xrCompatible' in glAttribs)) {
        ctx[XR_COMPATIBLE] = glAttribs.xrCompatible;
      }
    }
    return ctx;
  };
};

const isImageBitmapSupported = global =>
  !!(global.ImageBitmapRenderingContext &&
     global.createImageBitmap);
const isMobile = global => {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(global.navigator.userAgent||global.navigator.vendor||global.opera);
  return check;
};
const applyCanvasStylesForMinimalRendering = canvas => {
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.width = canvas.style.height = '1px';
  canvas.style.top = canvas.style.left = '0px';
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var cardboardVrDisplay = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
var MIN_TIMESTEP = 0.001;
var MAX_TIMESTEP = 1;
var dataUri = function dataUri(mimeType, svg) {
  return 'data:' + mimeType + ',' + encodeURIComponent(svg);
};
var lerp = function lerp(a, b, t) {
  return a + (b - a) * t;
};
var isIOS = function () {
  var isIOS = /iPad|iPhone|iPod/.test(navigator.platform);
  return function () {
    return isIOS;
  };
}();
var isWebViewAndroid = function () {
  var isWebViewAndroid = navigator.userAgent.indexOf('Version') !== -1 && navigator.userAgent.indexOf('Android') !== -1 && navigator.userAgent.indexOf('Chrome') !== -1;
  return function () {
    return isWebViewAndroid;
  };
}();
var isSafari = function () {
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  return function () {
    return isSafari;
  };
}();
var isFirefoxAndroid = function () {
  var isFirefoxAndroid = navigator.userAgent.indexOf('Firefox') !== -1 && navigator.userAgent.indexOf('Android') !== -1;
  return function () {
    return isFirefoxAndroid;
  };
}();
var getChromeVersion = function () {
  var match = navigator.userAgent.match(/.*Chrome\/([0-9]+)/);
  var value = match ? parseInt(match[1], 10) : null;
  return function () {
    return value;
  };
}();
var isSafariWithoutDeviceMotion = function () {
  var value = false;
  value = isIOS() && isSafari() && navigator.userAgent.indexOf('13_4') !== -1;
  return function () {
    return value;
  };
}();
var isChromeWithoutDeviceMotion = function () {
  var value = false;
  if (getChromeVersion() === 65) {
    var match = navigator.userAgent.match(/.*Chrome\/([0-9\.]*)/);
    if (match) {
      var _match$1$split = match[1].split('.'),
          _match$1$split2 = slicedToArray(_match$1$split, 4),
          major = _match$1$split2[0],
          minor = _match$1$split2[1],
          branch = _match$1$split2[2],
          build = _match$1$split2[3];
      value = parseInt(branch, 10) === 3325 && parseInt(build, 10) < 148;
    }
  }
  return function () {
    return value;
  };
}();
var isR7 = function () {
  var isR7 = navigator.userAgent.indexOf('R7 Build') !== -1;
  return function () {
    return isR7;
  };
}();
var isLandscapeMode = function isLandscapeMode() {
  var rtn = window.orientation == 90 || window.orientation == -90;
  return isR7() ? !rtn : rtn;
};
var isTimestampDeltaValid = function isTimestampDeltaValid(timestampDeltaS) {
  if (isNaN(timestampDeltaS)) {
    return false;
  }
  if (timestampDeltaS <= MIN_TIMESTEP) {
    return false;
  }
  if (timestampDeltaS > MAX_TIMESTEP) {
    return false;
  }
  return true;
};
var getScreenWidth = function getScreenWidth() {
  return Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio;
};
var getScreenHeight = function getScreenHeight() {
  return Math.min(window.screen.width, window.screen.height) * window.devicePixelRatio;
};
var requestFullscreen = function requestFullscreen(element) {
  if (isWebViewAndroid()) {
    return false;
  }
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    return false;
  }
  return true;
};
var exitFullscreen = function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else {
    return false;
  }
  return true;
};
var getFullscreenElement = function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
};
var linkProgram = function linkProgram(gl, vertexSource, fragmentSource, attribLocationMap) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  for (var attribName in attribLocationMap) {
    gl.bindAttribLocation(program, attribLocationMap[attribName], attribName);
  }gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
};
var getProgramUniforms = function getProgramUniforms(gl, program) {
  var uniforms = {};
  var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  var uniformName = '';
  for (var i = 0; i < uniformCount; i++) {
    var uniformInfo = gl.getActiveUniform(program, i);
    uniformName = uniformInfo.name.replace('[0]', '');
    uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
  }
  return uniforms;
};
var orthoMatrix = function orthoMatrix(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right),
      bt = 1 / (bottom - top),
      nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
};
var isMobile = function isMobile() {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
var extend = function extend(dest, src) {
  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }
  return dest;
};
var safariCssSizeWorkaround = function safariCssSizeWorkaround(canvas) {
  if (isIOS()) {
    var width = canvas.style.width;
    var height = canvas.style.height;
    canvas.style.width = parseInt(width) + 1 + 'px';
    canvas.style.height = parseInt(height) + 'px';
    setTimeout(function () {
      canvas.style.width = width;
      canvas.style.height = height;
    }, 100);
  }
  window.canvas = canvas;
};
var frameDataFromPose = function () {
  var piOver180 = Math.PI / 180.0;
  var rad45 = Math.PI * 0.25;
  function mat4_perspectiveFromFieldOfView(out, fov, near, far) {
    var upTan = Math.tan(fov ? fov.upDegrees * piOver180 : rad45),
        downTan = Math.tan(fov ? fov.downDegrees * piOver180 : rad45),
        leftTan = Math.tan(fov ? fov.leftDegrees * piOver180 : rad45),
        rightTan = Math.tan(fov ? fov.rightDegrees * piOver180 : rad45),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);
    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = (upTan - downTan) * yScale * 0.5;
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = far * near / (near - far);
    out[15] = 0.0;
    return out;
  }
  function mat4_fromRotationTranslation(out, q, v) {
    var x = q[0],
        y = q[1],
        z = q[2],
        w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,
        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;
    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function mat4_translate(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2],
        a00,
        a01,
        a02,
        a03,
        a10,
        a11,
        a12,
        a13,
        a20,
        a21,
        a22,
        a23;
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
      a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
      a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];
      out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
      out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
      out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return out;
  }
  function mat4_invert(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11],
        a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15],
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,
    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  var defaultOrientation = new Float32Array([0, 0, 0, 1]);
  var defaultPosition = new Float32Array([0, 0, 0]);
  function updateEyeMatrices(projection, view, pose, fov, offset, vrDisplay) {
    mat4_perspectiveFromFieldOfView(projection, fov || null, vrDisplay.depthNear, vrDisplay.depthFar);
    var orientation = pose.orientation || defaultOrientation;
    var position = pose.position || defaultPosition;
    mat4_fromRotationTranslation(view, orientation, position);
    if (offset) mat4_translate(view, view, offset);
    mat4_invert(view, view);
  }
  return function (frameData, pose, vrDisplay) {
    if (!frameData || !pose) return false;
    frameData.pose = pose;
    frameData.timestamp = pose.timestamp;
    updateEyeMatrices(frameData.leftProjectionMatrix, frameData.leftViewMatrix, pose, vrDisplay._getFieldOfView("left"), vrDisplay._getEyeOffset("left"), vrDisplay);
    updateEyeMatrices(frameData.rightProjectionMatrix, frameData.rightViewMatrix, pose, vrDisplay._getFieldOfView("right"), vrDisplay._getEyeOffset("right"), vrDisplay);
    return true;
  };
}();
var isInsideCrossOriginIFrame = function isInsideCrossOriginIFrame() {
  var isFramed = window.self !== window.top;
  var refOrigin = getOriginFromUrl(document.referrer);
  var thisOrigin = getOriginFromUrl(window.location.href);
  return isFramed && refOrigin !== thisOrigin;
};
var getOriginFromUrl = function getOriginFromUrl(url) {
  var domainIdx;
  var protoSepIdx = url.indexOf("://");
  if (protoSepIdx !== -1) {
    domainIdx = protoSepIdx + 3;
  } else {
    domainIdx = 0;
  }
  var domainEndIdx = url.indexOf('/', domainIdx);
  if (domainEndIdx === -1) {
    domainEndIdx = url.length;
  }
  return url.substring(0, domainEndIdx);
};
var getQuaternionAngle = function getQuaternionAngle(quat) {
  if (quat.w > 1) {
    console.warn('getQuaternionAngle: w > 1');
    return 0;
  }
  var angle = 2 * Math.acos(quat.w);
  return angle;
};
var warnOnce = function () {
  var observedWarnings = {};
  return function (key, message) {
    if (observedWarnings[key] === undefined) {
      console.warn('webvr-polyfill: ' + message);
      observedWarnings[key] = true;
    }
  };
}();
var deprecateWarning = function deprecateWarning(deprecated, suggested) {
  var alternative = suggested ? 'Please use ' + suggested + ' instead.' : '';
  warnOnce(deprecated, deprecated + ' has been deprecated. ' + 'This may not work on native WebVR displays. ' + alternative);
};
function WGLUPreserveGLState(gl, bindings, callback) {
  if (!bindings) {
    callback(gl);
    return;
  }
  var boundValues = [];
  var activeTexture = null;
  for (var i = 0; i < bindings.length; ++i) {
    var binding = bindings[i];
    switch (binding) {
      case gl.TEXTURE_BINDING_2D:
      case gl.TEXTURE_BINDING_CUBE_MAP:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31) {
          console.error("TEXTURE_BINDING_2D or TEXTURE_BINDING_CUBE_MAP must be followed by a valid texture unit");
          boundValues.push(null, null);
          break;
        }
        if (!activeTexture) {
          activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
        }
        gl.activeTexture(textureUnit);
        boundValues.push(gl.getParameter(binding), null);
        break;
      case gl.ACTIVE_TEXTURE:
        activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
        boundValues.push(null);
        break;
      default:
        boundValues.push(gl.getParameter(binding));
        break;
    }
  }
  callback(gl);
  for (var i = 0; i < bindings.length; ++i) {
    var binding = bindings[i];
    var boundValue = boundValues[i];
    switch (binding) {
      case gl.ACTIVE_TEXTURE:
        break;
      case gl.ARRAY_BUFFER_BINDING:
        gl.bindBuffer(gl.ARRAY_BUFFER, boundValue);
        break;
      case gl.COLOR_CLEAR_VALUE:
        gl.clearColor(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.COLOR_WRITEMASK:
        gl.colorMask(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.CURRENT_PROGRAM:
        gl.useProgram(boundValue);
        break;
      case gl.ELEMENT_ARRAY_BUFFER_BINDING:
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boundValue);
        break;
      case gl.FRAMEBUFFER_BINDING:
        gl.bindFramebuffer(gl.FRAMEBUFFER, boundValue);
        break;
      case gl.RENDERBUFFER_BINDING:
        gl.bindRenderbuffer(gl.RENDERBUFFER, boundValue);
        break;
      case gl.TEXTURE_BINDING_2D:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
          break;
        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, boundValue);
        break;
      case gl.TEXTURE_BINDING_CUBE_MAP:
        var textureUnit = bindings[++i];
        if (textureUnit < gl.TEXTURE0 || textureUnit > gl.TEXTURE31)
          break;
        gl.activeTexture(textureUnit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, boundValue);
        break;
      case gl.VIEWPORT:
        gl.viewport(boundValue[0], boundValue[1], boundValue[2], boundValue[3]);
        break;
      case gl.BLEND:
      case gl.CULL_FACE:
      case gl.DEPTH_TEST:
      case gl.SCISSOR_TEST:
      case gl.STENCIL_TEST:
        if (boundValue) {
          gl.enable(binding);
        } else {
          gl.disable(binding);
        }
        break;
      default:
        console.log("No GL restore behavior for 0x" + binding.toString(16));
        break;
    }
    if (activeTexture) {
      gl.activeTexture(activeTexture);
    }
  }
}
var glPreserveState = WGLUPreserveGLState;
var distortionVS = ['attribute vec2 position;', 'attribute vec3 texCoord;', 'varying vec2 vTexCoord;', 'uniform vec4 viewportOffsetScale[2];', 'void main() {', '  vec4 viewport = viewportOffsetScale[int(texCoord.z)];', '  vTexCoord = (texCoord.xy * viewport.zw) + viewport.xy;', '  gl_Position = vec4( position, 1.0, 1.0 );', '}'].join('\n');
var distortionFS = ['precision mediump float;', 'uniform sampler2D diffuse;', 'varying vec2 vTexCoord;', 'void main() {', '  gl_FragColor = texture2D(diffuse, vTexCoord);', '}'].join('\n');
function CardboardDistorter(gl, cardboardUI, bufferScale, dirtySubmitFrameBindings) {
  this.gl = gl;
  this.cardboardUI = cardboardUI;
  this.bufferScale = bufferScale;
  this.dirtySubmitFrameBindings = dirtySubmitFrameBindings;
  this.ctxAttribs = gl.getContextAttributes();
  this.instanceExt = gl.getExtension('ANGLE_instanced_arrays');
  this.meshWidth = 20;
  this.meshHeight = 20;
  this.bufferWidth = gl.drawingBufferWidth;
  this.bufferHeight = gl.drawingBufferHeight;
  this.realBindFramebuffer = gl.bindFramebuffer;
  this.realEnable = gl.enable;
  this.realDisable = gl.disable;
  this.realColorMask = gl.colorMask;
  this.realClearColor = gl.clearColor;
  this.realViewport = gl.viewport;
  if (!isIOS()) {
    this.realCanvasWidth = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, 'width');
    this.realCanvasHeight = Object.getOwnPropertyDescriptor(gl.canvas.__proto__, 'height');
  }
  this.isPatched = false;
  this.lastBoundFramebuffer = null;
  this.cullFace = false;
  this.depthTest = false;
  this.blend = false;
  this.scissorTest = false;
  this.stencilTest = false;
  this.viewport = [0, 0, 0, 0];
  this.colorMask = [true, true, true, true];
  this.clearColor = [0, 0, 0, 0];
  this.attribs = {
    position: 0,
    texCoord: 1
  };
  this.program = linkProgram(gl, distortionVS, distortionFS, this.attribs);
  this.uniforms = getProgramUniforms(gl, this.program);
  this.viewportOffsetScale = new Float32Array(8);
  this.setTextureBounds();
  this.vertexBuffer = gl.createBuffer();
  this.indexBuffer = gl.createBuffer();
  this.indexCount = 0;
  this.renderTarget = gl.createTexture();
  this.framebuffer = gl.createFramebuffer();
  this.depthStencilBuffer = null;
  this.depthBuffer = null;
  this.stencilBuffer = null;
  if (this.ctxAttribs.depth && this.ctxAttribs.stencil) {
    this.depthStencilBuffer = gl.createRenderbuffer();
  } else if (this.ctxAttribs.depth) {
    this.depthBuffer = gl.createRenderbuffer();
  } else if (this.ctxAttribs.stencil) {
    this.stencilBuffer = gl.createRenderbuffer();
  }
  this.patch();
  this.onResize();
}
CardboardDistorter.prototype.destroy = function () {
  var gl = this.gl;
  this.unpatch();
  gl.deleteProgram(this.program);
  gl.deleteBuffer(this.vertexBuffer);
  gl.deleteBuffer(this.indexBuffer);
  gl.deleteTexture(this.renderTarget);
  gl.deleteFramebuffer(this.framebuffer);
  if (this.depthStencilBuffer) {
    gl.deleteRenderbuffer(this.depthStencilBuffer);
  }
  if (this.depthBuffer) {
    gl.deleteRenderbuffer(this.depthBuffer);
  }
  if (this.stencilBuffer) {
    gl.deleteRenderbuffer(this.stencilBuffer);
  }
  if (this.cardboardUI) {
    this.cardboardUI.destroy();
  }
};
CardboardDistorter.prototype.onResize = function () {
  var gl = this.gl;
  var self = this;
  var glState = [gl.RENDERBUFFER_BINDING, gl.TEXTURE_BINDING_2D, gl.TEXTURE0];
  glPreserveState(gl, glState, function (gl) {
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, null);
    if (self.scissorTest) {
      self.realDisable.call(gl, gl.SCISSOR_TEST);
    }
    self.realColorMask.call(gl, true, true, true, true);
    self.realViewport.call(gl, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    self.realClearColor.call(gl, 0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, self.renderTarget);
    gl.texImage2D(gl.TEXTURE_2D, 0, self.ctxAttribs.alpha ? gl.RGBA : gl.RGB, self.bufferWidth, self.bufferHeight, 0, self.ctxAttribs.alpha ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, self.renderTarget, 0);
    if (self.ctxAttribs.depth && self.ctxAttribs.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.depthStencilBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, self.depthStencilBuffer);
    } else if (self.ctxAttribs.depth) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, self.depthBuffer);
    } else if (self.ctxAttribs.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, self.stencilBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, self.bufferWidth, self.bufferHeight);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, self.stencilBuffer);
    }
    if (!gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer incomplete!');
    }
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.lastBoundFramebuffer);
    if (self.scissorTest) {
      self.realEnable.call(gl, gl.SCISSOR_TEST);
    }
    self.realColorMask.apply(gl, self.colorMask);
    self.realViewport.apply(gl, self.viewport);
    self.realClearColor.apply(gl, self.clearColor);
  });
  if (this.cardboardUI) {
    this.cardboardUI.onResize();
  }
};
CardboardDistorter.prototype.patch = function () {
  if (this.isPatched) {
    return;
  }
  var self = this;
  var canvas = this.gl.canvas;
  var gl = this.gl;
  if (!isIOS()) {
    canvas.width = getScreenWidth() * this.bufferScale;
    canvas.height = getScreenHeight() * this.bufferScale;
    Object.defineProperty(canvas, 'width', {
      configurable: true,
      enumerable: true,
      get: function get() {
        return self.bufferWidth;
      },
      set: function set(value) {
        self.bufferWidth = value;
        self.realCanvasWidth.set.call(canvas, value);
        self.onResize();
      }
    });
    Object.defineProperty(canvas, 'height', {
      configurable: true,
      enumerable: true,
      get: function get() {
        return self.bufferHeight;
      },
      set: function set(value) {
        self.bufferHeight = value;
        self.realCanvasHeight.set.call(canvas, value);
        self.onResize();
      }
    });
  }
  this.lastBoundFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  if (this.lastBoundFramebuffer == null) {
    this.lastBoundFramebuffer = this.framebuffer;
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  }
  this.gl.bindFramebuffer = function (target, framebuffer) {
    self.lastBoundFramebuffer = framebuffer ? framebuffer : self.framebuffer;
    self.realBindFramebuffer.call(gl, target, self.lastBoundFramebuffer);
  };
  this.cullFace = gl.getParameter(gl.CULL_FACE);
  this.depthTest = gl.getParameter(gl.DEPTH_TEST);
  this.blend = gl.getParameter(gl.BLEND);
  this.scissorTest = gl.getParameter(gl.SCISSOR_TEST);
  this.stencilTest = gl.getParameter(gl.STENCIL_TEST);
  gl.enable = function (pname) {
    switch (pname) {
      case gl.CULL_FACE:
        self.cullFace = true;break;
      case gl.DEPTH_TEST:
        self.depthTest = true;break;
      case gl.BLEND:
        self.blend = true;break;
      case gl.SCISSOR_TEST:
        self.scissorTest = true;break;
      case gl.STENCIL_TEST:
        self.stencilTest = true;break;
    }
    self.realEnable.call(gl, pname);
  };
  gl.disable = function (pname) {
    switch (pname) {
      case gl.CULL_FACE:
        self.cullFace = false;break;
      case gl.DEPTH_TEST:
        self.depthTest = false;break;
      case gl.BLEND:
        self.blend = false;break;
      case gl.SCISSOR_TEST:
        self.scissorTest = false;break;
      case gl.STENCIL_TEST:
        self.stencilTest = false;break;
    }
    self.realDisable.call(gl, pname);
  };
  this.colorMask = gl.getParameter(gl.COLOR_WRITEMASK);
  gl.colorMask = function (r, g, b, a) {
    self.colorMask[0] = r;
    self.colorMask[1] = g;
    self.colorMask[2] = b;
    self.colorMask[3] = a;
    self.realColorMask.call(gl, r, g, b, a);
  };
  this.clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
  gl.clearColor = function (r, g, b, a) {
    self.clearColor[0] = r;
    self.clearColor[1] = g;
    self.clearColor[2] = b;
    self.clearColor[3] = a;
    self.realClearColor.call(gl, r, g, b, a);
  };
  this.viewport = gl.getParameter(gl.VIEWPORT);
  gl.viewport = function (x, y, w, h) {
    self.viewport[0] = x;
    self.viewport[1] = y;
    self.viewport[2] = w;
    self.viewport[3] = h;
    self.realViewport.call(gl, x, y, w, h);
  };
  this.isPatched = true;
  safariCssSizeWorkaround(canvas);
};
CardboardDistorter.prototype.unpatch = function () {
  if (!this.isPatched) {
    return;
  }
  var gl = this.gl;
  var canvas = this.gl.canvas;
  if (!isIOS()) {
    Object.defineProperty(canvas, 'width', this.realCanvasWidth);
    Object.defineProperty(canvas, 'height', this.realCanvasHeight);
  }
  canvas.width = this.bufferWidth;
  canvas.height = this.bufferHeight;
  gl.bindFramebuffer = this.realBindFramebuffer;
  gl.enable = this.realEnable;
  gl.disable = this.realDisable;
  gl.colorMask = this.realColorMask;
  gl.clearColor = this.realClearColor;
  gl.viewport = this.realViewport;
  if (this.lastBoundFramebuffer == this.framebuffer) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  this.isPatched = false;
  setTimeout(function () {
    safariCssSizeWorkaround(canvas);
  }, 1);
};
CardboardDistorter.prototype.setTextureBounds = function (leftBounds, rightBounds) {
  if (!leftBounds) {
    leftBounds = [0, 0, 0.5, 1];
  }
  if (!rightBounds) {
    rightBounds = [0.5, 0, 0.5, 1];
  }
  this.viewportOffsetScale[0] = leftBounds[0];
  this.viewportOffsetScale[1] = leftBounds[1];
  this.viewportOffsetScale[2] = leftBounds[2];
  this.viewportOffsetScale[3] = leftBounds[3];
  this.viewportOffsetScale[4] = rightBounds[0];
  this.viewportOffsetScale[5] = rightBounds[1];
  this.viewportOffsetScale[6] = rightBounds[2];
  this.viewportOffsetScale[7] = rightBounds[3];
};
CardboardDistorter.prototype.submitFrame = function () {
  var gl = this.gl;
  var self = this;
  var glState = [];
  if (!this.dirtySubmitFrameBindings) {
    glState.push(gl.CURRENT_PROGRAM, gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING, gl.TEXTURE_BINDING_2D, gl.TEXTURE0);
  }
  glPreserveState(gl, glState, function (gl) {
    self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, null);
    var positionDivisor = 0;
    var texCoordDivisor = 0;
    if (self.instanceExt) {
      positionDivisor = gl.getVertexAttrib(self.attribs.position, self.instanceExt.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE);
      texCoordDivisor = gl.getVertexAttrib(self.attribs.texCoord, self.instanceExt.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE);
    }
    if (self.cullFace) {
      self.realDisable.call(gl, gl.CULL_FACE);
    }
    if (self.depthTest) {
      self.realDisable.call(gl, gl.DEPTH_TEST);
    }
    if (self.blend) {
      self.realDisable.call(gl, gl.BLEND);
    }
    if (self.scissorTest) {
      self.realDisable.call(gl, gl.SCISSOR_TEST);
    }
    if (self.stencilTest) {
      self.realDisable.call(gl, gl.STENCIL_TEST);
    }
    self.realColorMask.call(gl, true, true, true, true);
    self.realViewport.call(gl, 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (self.ctxAttribs.alpha || isIOS()) {
      self.realClearColor.call(gl, 0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.useProgram(self.program);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.enableVertexAttribArray(self.attribs.position);
    gl.enableVertexAttribArray(self.attribs.texCoord);
    gl.vertexAttribPointer(self.attribs.position, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(self.attribs.texCoord, 3, gl.FLOAT, false, 20, 8);
    if (self.instanceExt) {
      if (positionDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.position, 0);
      }
      if (texCoordDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.texCoord, 0);
      }
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(self.uniforms.diffuse, 0);
    gl.bindTexture(gl.TEXTURE_2D, self.renderTarget);
    gl.uniform4fv(self.uniforms.viewportOffsetScale, self.viewportOffsetScale);
    gl.drawElements(gl.TRIANGLES, self.indexCount, gl.UNSIGNED_SHORT, 0);
    if (self.cardboardUI) {
      self.cardboardUI.renderNoState();
    }
    self.realBindFramebuffer.call(self.gl, gl.FRAMEBUFFER, self.framebuffer);
    if (!self.ctxAttribs.preserveDrawingBuffer) {
      self.realClearColor.call(gl, 0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    if (!self.dirtySubmitFrameBindings) {
      self.realBindFramebuffer.call(gl, gl.FRAMEBUFFER, self.lastBoundFramebuffer);
    }
    if (self.cullFace) {
      self.realEnable.call(gl, gl.CULL_FACE);
    }
    if (self.depthTest) {
      self.realEnable.call(gl, gl.DEPTH_TEST);
    }
    if (self.blend) {
      self.realEnable.call(gl, gl.BLEND);
    }
    if (self.scissorTest) {
      self.realEnable.call(gl, gl.SCISSOR_TEST);
    }
    if (self.stencilTest) {
      self.realEnable.call(gl, gl.STENCIL_TEST);
    }
    self.realColorMask.apply(gl, self.colorMask);
    self.realViewport.apply(gl, self.viewport);
    if (self.ctxAttribs.alpha || !self.ctxAttribs.preserveDrawingBuffer) {
      self.realClearColor.apply(gl, self.clearColor);
    }
    if (self.instanceExt) {
      if (positionDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.position, positionDivisor);
      }
      if (texCoordDivisor != 0) {
        self.instanceExt.vertexAttribDivisorANGLE(self.attribs.texCoord, texCoordDivisor);
      }
    }
  });
  if (isIOS()) {
    var canvas = gl.canvas;
    if (canvas.width != self.bufferWidth || canvas.height != self.bufferHeight) {
      self.bufferWidth = canvas.width;
      self.bufferHeight = canvas.height;
      self.onResize();
    }
  }
};
CardboardDistorter.prototype.updateDeviceInfo = function (deviceInfo) {
  var gl = this.gl;
  var self = this;
  var glState = [gl.ARRAY_BUFFER_BINDING, gl.ELEMENT_ARRAY_BUFFER_BINDING];
  glPreserveState(gl, glState, function (gl) {
    var vertices = self.computeMeshVertices_(self.meshWidth, self.meshHeight, deviceInfo);
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    if (!self.indexCount) {
      var indices = self.computeMeshIndices_(self.meshWidth, self.meshHeight);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      self.indexCount = indices.length;
    }
  });
};
CardboardDistorter.prototype.computeMeshVertices_ = function (width, height, deviceInfo) {
  var vertices = new Float32Array(2 * width * height * 5);
  var lensFrustum = deviceInfo.getLeftEyeVisibleTanAngles();
  var noLensFrustum = deviceInfo.getLeftEyeNoLensTanAngles();
  var viewport = deviceInfo.getLeftEyeVisibleScreenRect(noLensFrustum);
  var vidx = 0;
  for (var e = 0; e < 2; e++) {
    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++, vidx++) {
        var u = i / (width - 1);
        var v = j / (height - 1);
        var s = u;
        var t = v;
        var x = lerp(lensFrustum[0], lensFrustum[2], u);
        var y = lerp(lensFrustum[3], lensFrustum[1], v);
        var d = Math.sqrt(x * x + y * y);
        var r = deviceInfo.distortion.distortInverse(d);
        var p = x * r / d;
        var q = y * r / d;
        u = (p - noLensFrustum[0]) / (noLensFrustum[2] - noLensFrustum[0]);
        v = (q - noLensFrustum[3]) / (noLensFrustum[1] - noLensFrustum[3]);
        u = (viewport.x + u * viewport.width - 0.5) * 2.0;
        v = (viewport.y + v * viewport.height - 0.5) * 2.0;
        vertices[vidx * 5 + 0] = u;
        vertices[vidx * 5 + 1] = v;
        vertices[vidx * 5 + 2] = s;
        vertices[vidx * 5 + 3] = t;
        vertices[vidx * 5 + 4] = e;
      }
    }
    var w = lensFrustum[2] - lensFrustum[0];
    lensFrustum[0] = -(w + lensFrustum[0]);
    lensFrustum[2] = w - lensFrustum[2];
    w = noLensFrustum[2] - noLensFrustum[0];
    noLensFrustum[0] = -(w + noLensFrustum[0]);
    noLensFrustum[2] = w - noLensFrustum[2];
    viewport.x = 1 - (viewport.x + viewport.width);
  }
  return vertices;
};
CardboardDistorter.prototype.computeMeshIndices_ = function (width, height) {
  var indices = new Uint16Array(2 * (width - 1) * (height - 1) * 6);
  var halfwidth = width / 2;
  var halfheight = height / 2;
  var vidx = 0;
  var iidx = 0;
  for (var e = 0; e < 2; e++) {
    for (var j = 0; j < height; j++) {
      for (var i = 0; i < width; i++, vidx++) {
        if (i == 0 || j == 0) continue;
        if (i <= halfwidth == j <= halfheight) {
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - width - 1;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx - width - 1;
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - 1;
        } else {
          indices[iidx++] = vidx - 1;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx;
          indices[iidx++] = vidx - width;
          indices[iidx++] = vidx - 1;
          indices[iidx++] = vidx - width - 1;
        }
      }
    }
  }
  return indices;
};
CardboardDistorter.prototype.getOwnPropertyDescriptor_ = function (proto, attrName) {
  var descriptor = Object.getOwnPropertyDescriptor(proto, attrName);
  if (descriptor.get === undefined || descriptor.set === undefined) {
    descriptor.configurable = true;
    descriptor.enumerable = true;
    descriptor.get = function () {
      return this.getAttribute(attrName);
    };
    descriptor.set = function (val) {
      this.setAttribute(attrName, val);
    };
  }
  return descriptor;
};
var uiVS = ['attribute vec2 position;', 'uniform mat4 projectionMat;', 'void main() {', '  gl_Position = projectionMat * vec4( position, -1.0, 1.0 );', '}'].join('\n');
var uiFS = ['precision mediump float;', 'uniform vec4 color;', 'void main() {', '  gl_FragColor = color;', '}'].join('\n');
var DEG2RAD = Math.PI / 180.0;
var kAnglePerGearSection = 60;
var kOuterRimEndAngle = 12;
var kInnerRimBeginAngle = 20;
var kOuterRadius = 1;
var kMiddleRadius = 0.75;
var kInnerRadius = 0.3125;
var kCenterLineThicknessDp = 4;
var kButtonWidthDp = 28;
var kTouchSlopFactor = 1.5;
function CardboardUI(gl) {
  this.gl = gl;
  this.attribs = {
    position: 0
  };
  this.program = linkProgram(gl, uiVS, uiFS, this.attribs);
  this.uniforms = getProgramUniforms(gl, this.program);
  this.vertexBuffer = gl.createBuffer();
  this.gearOffset = 0;
  this.gearVertexCount = 0;
  this.arrowOffset = 0;
  this.arrowVertexCount = 0;
  this.projMat = new Float32Array(16);
  this.listener = null;
  this.onResize();
}
CardboardUI.prototype.destroy = function () {
  var gl = this.gl;
  if (this.listener) {
    gl.canvas.removeEventListener('click', this.listener, false);
  }
  gl.deleteProgram(this.program);
  gl.deleteBuffer(this.vertexBuffer);
};
CardboardUI.prototype.listen = function (optionsCallback, backCallback) {
  var canvas = this.gl.canvas;
  this.listener = function (event) {
    var midline = canvas.clientWidth / 2;
    var buttonSize = kButtonWidthDp * kTouchSlopFactor;
    if (event.clientX > midline - buttonSize && event.clientX < midline + buttonSize && event.clientY > canvas.clientHeight - buttonSize) {
      optionsCallback(event);
    }
    else if (event.clientX < buttonSize && event.clientY < buttonSize) {
        backCallback(event);
      }
  };
  canvas.addEventListener('click', this.listener, false);
};
CardboardUI.prototype.onResize = function () {
  var gl = this.gl;
  var self = this;
  var glState = [gl.ARRAY_BUFFER_BINDING];
  glPreserveState(gl, glState, function (gl) {
    var vertices = [];
    var midline = gl.drawingBufferWidth / 2;
    var physicalPixels = Math.max(screen.width, screen.height) * window.devicePixelRatio;
    var scalingRatio = gl.drawingBufferWidth / physicalPixels;
    var dps = scalingRatio * window.devicePixelRatio;
    var lineWidth = kCenterLineThicknessDp * dps / 2;
    var buttonSize = kButtonWidthDp * kTouchSlopFactor * dps;
    var buttonScale = kButtonWidthDp * dps / 2;
    var buttonBorder = (kButtonWidthDp * kTouchSlopFactor - kButtonWidthDp) * dps;
    vertices.push(midline - lineWidth, buttonSize);
    vertices.push(midline - lineWidth, gl.drawingBufferHeight);
    vertices.push(midline + lineWidth, buttonSize);
    vertices.push(midline + lineWidth, gl.drawingBufferHeight);
    self.gearOffset = vertices.length / 2;
    function addGearSegment(theta, r) {
      var angle = (90 - theta) * DEG2RAD;
      var x = Math.cos(angle);
      var y = Math.sin(angle);
      vertices.push(kInnerRadius * x * buttonScale + midline, kInnerRadius * y * buttonScale + buttonScale);
      vertices.push(r * x * buttonScale + midline, r * y * buttonScale + buttonScale);
    }
    for (var i = 0; i <= 6; i++) {
      var segmentTheta = i * kAnglePerGearSection;
      addGearSegment(segmentTheta, kOuterRadius);
      addGearSegment(segmentTheta + kOuterRimEndAngle, kOuterRadius);
      addGearSegment(segmentTheta + kInnerRimBeginAngle, kMiddleRadius);
      addGearSegment(segmentTheta + (kAnglePerGearSection - kInnerRimBeginAngle), kMiddleRadius);
      addGearSegment(segmentTheta + (kAnglePerGearSection - kOuterRimEndAngle), kOuterRadius);
    }
    self.gearVertexCount = vertices.length / 2 - self.gearOffset;
    self.arrowOffset = vertices.length / 2;
    function addArrowVertex(x, y) {
      vertices.push(buttonBorder + x, gl.drawingBufferHeight - buttonBorder - y);
    }
    var angledLineWidth = lineWidth / Math.sin(45 * DEG2RAD);
    addArrowVertex(0, buttonScale);
    addArrowVertex(buttonScale, 0);
    addArrowVertex(buttonScale + angledLineWidth, angledLineWidth);
    addArrowVertex(angledLineWidth, buttonScale + angledLineWidth);
    addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
    addArrowVertex(0, buttonScale);
    addArrowVertex(buttonScale, buttonScale * 2);
    addArrowVertex(buttonScale + angledLineWidth, buttonScale * 2 - angledLineWidth);
    addArrowVertex(angledLineWidth, buttonScale - angledLineWidth);
    addArrowVertex(0, buttonScale);
    addArrowVertex(angledLineWidth, buttonScale - lineWidth);
    addArrowVertex(kButtonWidthDp * dps, buttonScale - lineWidth);
    addArrowVertex(angledLineWidth, buttonScale + lineWidth);
    addArrowVertex(kButtonWidthDp * dps, buttonScale + lineWidth);
    self.arrowVertexCount = vertices.length / 2 - self.arrowOffset;
    gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  });
};
CardboardUI.prototype.render = function () {
  var gl = this.gl;
  var self = this;
  var glState = [gl.CULL_FACE, gl.DEPTH_TEST, gl.BLEND, gl.SCISSOR_TEST, gl.STENCIL_TEST, gl.COLOR_WRITEMASK, gl.VIEWPORT, gl.CURRENT_PROGRAM, gl.ARRAY_BUFFER_BINDING];
  glPreserveState(gl, glState, function (gl) {
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.STENCIL_TEST);
    gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    self.renderNoState();
  });
};
CardboardUI.prototype.renderNoState = function () {
  var gl = this.gl;
  gl.useProgram(this.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.enableVertexAttribArray(this.attribs.position);
  gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 8, 0);
  gl.uniform4f(this.uniforms.color, 1.0, 1.0, 1.0, 1.0);
  orthoMatrix(this.projMat, 0, gl.drawingBufferWidth, 0, gl.drawingBufferHeight, 0.1, 1024.0);
  gl.uniformMatrix4fv(this.uniforms.projectionMat, false, this.projMat);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.drawArrays(gl.TRIANGLE_STRIP, this.gearOffset, this.gearVertexCount);
  gl.drawArrays(gl.TRIANGLE_STRIP, this.arrowOffset, this.arrowVertexCount);
};
function Distortion(coefficients) {
  this.coefficients = coefficients;
}
Distortion.prototype.distortInverse = function (radius) {
  var r0 = 0;
  var r1 = 1;
  var dr0 = radius - this.distort(r0);
  while (Math.abs(r1 - r0) > 0.0001             ) {
    var dr1 = radius - this.distort(r1);
    var r2 = r1 - dr1 * ((r1 - r0) / (dr1 - dr0));
    r0 = r1;
    r1 = r2;
    dr0 = dr1;
  }
  return r1;
};
Distortion.prototype.distort = function (radius) {
  var r2 = radius * radius;
  var ret = 0;
  for (var i = 0; i < this.coefficients.length; i++) {
    ret = r2 * (ret + this.coefficients[i]);
  }
  return (ret + 1) * radius;
};
var degToRad = Math.PI / 180;
var radToDeg = 180 / Math.PI;
var Vector3 = function Vector3(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};
Vector3.prototype = {
  constructor: Vector3,
  set: function set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },
  copy: function copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  },
  length: function length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  normalize: function normalize() {
    var scalar = this.length();
    if (scalar !== 0) {
      var invScalar = 1 / scalar;
      this.multiplyScalar(invScalar);
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return this;
  },
  multiplyScalar: function multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
  },
  applyQuaternion: function applyQuaternion(q) {
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var qx = q.x;
    var qy = q.y;
    var qz = q.z;
    var qw = q.w;
    var ix = qw * x + qy * z - qz * y;
    var iy = qw * y + qz * x - qx * z;
    var iz = qw * z + qx * y - qy * x;
    var iw = -qx * x - qy * y - qz * z;
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return this;
  },
  dot: function dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },
  crossVectors: function crossVectors(a, b) {
    var ax = a.x,
        ay = a.y,
        az = a.z;
    var bx = b.x,
        by = b.y,
        bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }
};
var Quaternion = function Quaternion(x, y, z, w) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.w = w !== undefined ? w : 1;
};
Quaternion.prototype = {
  constructor: Quaternion,
  set: function set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  },
  copy: function copy(quaternion) {
    this.x = quaternion.x;
    this.y = quaternion.y;
    this.z = quaternion.z;
    this.w = quaternion.w;
    return this;
  },
  setFromEulerXYZ: function setFromEulerXYZ(x, y, z) {
    var c1 = Math.cos(x / 2);
    var c2 = Math.cos(y / 2);
    var c3 = Math.cos(z / 2);
    var s1 = Math.sin(x / 2);
    var s2 = Math.sin(y / 2);
    var s3 = Math.sin(z / 2);
    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 + s1 * s2 * c3;
    this.w = c1 * c2 * c3 - s1 * s2 * s3;
    return this;
  },
  setFromEulerYXZ: function setFromEulerYXZ(x, y, z) {
    var c1 = Math.cos(x / 2);
    var c2 = Math.cos(y / 2);
    var c3 = Math.cos(z / 2);
    var s1 = Math.sin(x / 2);
    var s2 = Math.sin(y / 2);
    var s3 = Math.sin(z / 2);
    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 - s1 * s2 * c3;
    this.w = c1 * c2 * c3 + s1 * s2 * s3;
    return this;
  },
  setFromAxisAngle: function setFromAxisAngle(axis, angle) {
    var halfAngle = angle / 2,
        s = Math.sin(halfAngle);
    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(halfAngle);
    return this;
  },
  multiply: function multiply(q) {
    return this.multiplyQuaternions(this, q);
  },
  multiplyQuaternions: function multiplyQuaternions(a, b) {
    var qax = a.x,
        qay = a.y,
        qaz = a.z,
        qaw = a.w;
    var qbx = b.x,
        qby = b.y,
        qbz = b.z,
        qbw = b.w;
    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    return this;
  },
  inverse: function inverse() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    this.normalize();
    return this;
  },
  normalize: function normalize() {
    var l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    if (l === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      l = 1 / l;
      this.x = this.x * l;
      this.y = this.y * l;
      this.z = this.z * l;
      this.w = this.w * l;
    }
    return this;
  },
  slerp: function slerp(qb, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);
    var x = this.x,
        y = this.y,
        z = this.z,
        w = this.w;
    var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
    if (cosHalfTheta < 0) {
      this.w = -qb.w;
      this.x = -qb.x;
      this.y = -qb.y;
      this.z = -qb.z;
      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }
    if (cosHalfTheta >= 1.0) {
      this.w = w;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    var halfTheta = Math.acos(cosHalfTheta);
    var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
    if (Math.abs(sinHalfTheta) < 0.001) {
      this.w = 0.5 * (w + this.w);
      this.x = 0.5 * (x + this.x);
      this.y = 0.5 * (y + this.y);
      this.z = 0.5 * (z + this.z);
      return this;
    }
    var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
        ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    this.w = w * ratioA + this.w * ratioB;
    this.x = x * ratioA + this.x * ratioB;
    this.y = y * ratioA + this.y * ratioB;
    this.z = z * ratioA + this.z * ratioB;
    return this;
  },
  setFromUnitVectors: function () {
    var v1, r;
    var EPS = 0.000001;
    return function (vFrom, vTo) {
      if (v1 === undefined) v1 = new Vector3();
      r = vFrom.dot(vTo) + 1;
      if (r < EPS) {
        r = 0;
        if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
          v1.set(-vFrom.y, vFrom.x, 0);
        } else {
          v1.set(0, -vFrom.z, vFrom.y);
        }
      } else {
        v1.crossVectors(vFrom, vTo);
      }
      this.x = v1.x;
      this.y = v1.y;
      this.z = v1.z;
      this.w = r;
      this.normalize();
      return this;
    };
  }()
};
function Device(params) {
  this.width = params.width || getScreenWidth();
  this.height = params.height || getScreenHeight();
  this.widthMeters = params.widthMeters;
  this.heightMeters = params.heightMeters;
  this.bevelMeters = params.bevelMeters;
}
var DEFAULT_ANDROID = new Device({
  widthMeters: 0.110,
  heightMeters: 0.062,
  bevelMeters: 0.004
});
var DEFAULT_IOS = new Device({
  widthMeters: 0.1038,
  heightMeters: 0.0584,
  bevelMeters: 0.004
});
var Viewers = {
  CardboardV1: new CardboardViewer({
    id: 'CardboardV1',
    label: 'Cardboard I/O 2014',
    fov: 40,
    interLensDistance: 0.060,
    baselineLensDistance: 0.035,
    screenLensDistance: 0.042,
    distortionCoefficients: [0.441, 0.156],
    inverseCoefficients: [-0.4410035, 0.42756155, -0.4804439, 0.5460139, -0.58821183, 0.5733938, -0.48303202, 0.33299083, -0.17573841, 0.0651772, -0.01488963, 0.001559834]
  }),
  CardboardV2: new CardboardViewer({
    id: 'CardboardV2',
    label: 'Cardboard I/O 2015',
    fov: 60,
    interLensDistance: 0.064,
    baselineLensDistance: 0.035,
    screenLensDistance: 0.039,
    distortionCoefficients: [0.34, 0.55],
    inverseCoefficients: [-0.33836704, -0.18162185, 0.862655, -1.2462051, 1.0560602, -0.58208317, 0.21609078, -0.05444823, 0.009177956, -9.904169E-4, 6.183535E-5, -1.6981803E-6]
  })
};
function DeviceInfo(deviceParams, additionalViewers) {
  this.viewer = Viewers.CardboardV2;
  this.updateDeviceParams(deviceParams);
  this.distortion = new Distortion(this.viewer.distortionCoefficients);
  for (var i = 0; i < additionalViewers.length; i++) {
    var viewer = additionalViewers[i];
    Viewers[viewer.id] = new CardboardViewer(viewer);
  }
}
DeviceInfo.prototype.updateDeviceParams = function (deviceParams) {
  this.device = this.determineDevice_(deviceParams) || this.device;
};
DeviceInfo.prototype.getDevice = function () {
  return this.device;
};
DeviceInfo.prototype.setViewer = function (viewer) {
  this.viewer = viewer;
  this.distortion = new Distortion(this.viewer.distortionCoefficients);
};
DeviceInfo.prototype.determineDevice_ = function (deviceParams) {
  if (!deviceParams) {
    if (isIOS()) {
      console.warn('Using fallback iOS device measurements.');
      return DEFAULT_IOS;
    } else {
      console.warn('Using fallback Android device measurements.');
      return DEFAULT_ANDROID;
    }
  }
  var METERS_PER_INCH = 0.0254;
  var metersPerPixelX = METERS_PER_INCH / deviceParams.xdpi;
  var metersPerPixelY = METERS_PER_INCH / deviceParams.ydpi;
  var width = getScreenWidth();
  var height = getScreenHeight();
  return new Device({
    widthMeters: metersPerPixelX * width,
    heightMeters: metersPerPixelY * height,
    bevelMeters: deviceParams.bevelMm * 0.001
  });
};
DeviceInfo.prototype.getDistortedFieldOfViewLeftEye = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var eyeToScreenDistance = viewer.screenLensDistance;
  var outerDist = (device.widthMeters - viewer.interLensDistance) / 2;
  var innerDist = viewer.interLensDistance / 2;
  var bottomDist = viewer.baselineLensDistance - device.bevelMeters;
  var topDist = device.heightMeters - bottomDist;
  var outerAngle = radToDeg * Math.atan(distortion.distort(outerDist / eyeToScreenDistance));
  var innerAngle = radToDeg * Math.atan(distortion.distort(innerDist / eyeToScreenDistance));
  var bottomAngle = radToDeg * Math.atan(distortion.distort(bottomDist / eyeToScreenDistance));
  var topAngle = radToDeg * Math.atan(distortion.distort(topDist / eyeToScreenDistance));
  return {
    leftDegrees: Math.min(outerAngle, viewer.fov),
    rightDegrees: Math.min(innerAngle, viewer.fov),
    downDegrees: Math.min(bottomAngle, viewer.fov),
    upDegrees: Math.min(topAngle, viewer.fov)
  };
};
DeviceInfo.prototype.getLeftEyeVisibleTanAngles = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var fovLeft = Math.tan(-degToRad * viewer.fov);
  var fovTop = Math.tan(degToRad * viewer.fov);
  var fovRight = Math.tan(degToRad * viewer.fov);
  var fovBottom = Math.tan(-degToRad * viewer.fov);
  var halfWidth = device.widthMeters / 4;
  var halfHeight = device.heightMeters / 2;
  var verticalLensOffset = viewer.baselineLensDistance - device.bevelMeters - halfHeight;
  var centerX = viewer.interLensDistance / 2 - halfWidth;
  var centerY = -verticalLensOffset;
  var centerZ = viewer.screenLensDistance;
  var screenLeft = distortion.distort((centerX - halfWidth) / centerZ);
  var screenTop = distortion.distort((centerY + halfHeight) / centerZ);
  var screenRight = distortion.distort((centerX + halfWidth) / centerZ);
  var screenBottom = distortion.distort((centerY - halfHeight) / centerZ);
  var result = new Float32Array(4);
  result[0] = Math.max(fovLeft, screenLeft);
  result[1] = Math.min(fovTop, screenTop);
  result[2] = Math.min(fovRight, screenRight);
  result[3] = Math.max(fovBottom, screenBottom);
  return result;
};
DeviceInfo.prototype.getLeftEyeNoLensTanAngles = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var result = new Float32Array(4);
  var fovLeft = distortion.distortInverse(Math.tan(-degToRad * viewer.fov));
  var fovTop = distortion.distortInverse(Math.tan(degToRad * viewer.fov));
  var fovRight = distortion.distortInverse(Math.tan(degToRad * viewer.fov));
  var fovBottom = distortion.distortInverse(Math.tan(-degToRad * viewer.fov));
  var halfWidth = device.widthMeters / 4;
  var halfHeight = device.heightMeters / 2;
  var verticalLensOffset = viewer.baselineLensDistance - device.bevelMeters - halfHeight;
  var centerX = viewer.interLensDistance / 2 - halfWidth;
  var centerY = -verticalLensOffset;
  var centerZ = viewer.screenLensDistance;
  var screenLeft = (centerX - halfWidth) / centerZ;
  var screenTop = (centerY + halfHeight) / centerZ;
  var screenRight = (centerX + halfWidth) / centerZ;
  var screenBottom = (centerY - halfHeight) / centerZ;
  result[0] = Math.max(fovLeft, screenLeft);
  result[1] = Math.min(fovTop, screenTop);
  result[2] = Math.min(fovRight, screenRight);
  result[3] = Math.max(fovBottom, screenBottom);
  return result;
};
DeviceInfo.prototype.getLeftEyeVisibleScreenRect = function (undistortedFrustum) {
  var viewer = this.viewer;
  var device = this.device;
  var dist = viewer.screenLensDistance;
  var eyeX = (device.widthMeters - viewer.interLensDistance) / 2;
  var eyeY = viewer.baselineLensDistance - device.bevelMeters;
  var left = (undistortedFrustum[0] * dist + eyeX) / device.widthMeters;
  var top = (undistortedFrustum[1] * dist + eyeY) / device.heightMeters;
  var right = (undistortedFrustum[2] * dist + eyeX) / device.widthMeters;
  var bottom = (undistortedFrustum[3] * dist + eyeY) / device.heightMeters;
  return {
    x: left,
    y: bottom,
    width: right - left,
    height: top - bottom
  };
};
DeviceInfo.prototype.getFieldOfViewLeftEye = function (opt_isUndistorted) {
  return opt_isUndistorted ? this.getUndistortedFieldOfViewLeftEye() : this.getDistortedFieldOfViewLeftEye();
};
DeviceInfo.prototype.getFieldOfViewRightEye = function (opt_isUndistorted) {
  var fov = this.getFieldOfViewLeftEye(opt_isUndistorted);
  return {
    leftDegrees: fov.rightDegrees,
    rightDegrees: fov.leftDegrees,
    upDegrees: fov.upDegrees,
    downDegrees: fov.downDegrees
  };
};
DeviceInfo.prototype.getUndistortedFieldOfViewLeftEye = function () {
  var p = this.getUndistortedParams_();
  return {
    leftDegrees: radToDeg * Math.atan(p.outerDist),
    rightDegrees: radToDeg * Math.atan(p.innerDist),
    downDegrees: radToDeg * Math.atan(p.bottomDist),
    upDegrees: radToDeg * Math.atan(p.topDist)
  };
};
DeviceInfo.prototype.getUndistortedViewportLeftEye = function () {
  var p = this.getUndistortedParams_();
  var viewer = this.viewer;
  var device = this.device;
  var eyeToScreenDistance = viewer.screenLensDistance;
  var screenWidth = device.widthMeters / eyeToScreenDistance;
  var screenHeight = device.heightMeters / eyeToScreenDistance;
  var xPxPerTanAngle = device.width / screenWidth;
  var yPxPerTanAngle = device.height / screenHeight;
  var x = Math.round((p.eyePosX - p.outerDist) * xPxPerTanAngle);
  var y = Math.round((p.eyePosY - p.bottomDist) * yPxPerTanAngle);
  return {
    x: x,
    y: y,
    width: Math.round((p.eyePosX + p.innerDist) * xPxPerTanAngle) - x,
    height: Math.round((p.eyePosY + p.topDist) * yPxPerTanAngle) - y
  };
};
DeviceInfo.prototype.getUndistortedParams_ = function () {
  var viewer = this.viewer;
  var device = this.device;
  var distortion = this.distortion;
  var eyeToScreenDistance = viewer.screenLensDistance;
  var halfLensDistance = viewer.interLensDistance / 2 / eyeToScreenDistance;
  var screenWidth = device.widthMeters / eyeToScreenDistance;
  var screenHeight = device.heightMeters / eyeToScreenDistance;
  var eyePosX = screenWidth / 2 - halfLensDistance;
  var eyePosY = (viewer.baselineLensDistance - device.bevelMeters) / eyeToScreenDistance;
  var maxFov = viewer.fov;
  var viewerMax = distortion.distortInverse(Math.tan(degToRad * maxFov));
  var outerDist = Math.min(eyePosX, viewerMax);
  var innerDist = Math.min(halfLensDistance, viewerMax);
  var bottomDist = Math.min(eyePosY, viewerMax);
  var topDist = Math.min(screenHeight - eyePosY, viewerMax);
  return {
    outerDist: outerDist,
    innerDist: innerDist,
    topDist: topDist,
    bottomDist: bottomDist,
    eyePosX: eyePosX,
    eyePosY: eyePosY
  };
};
function CardboardViewer(params) {
  this.id = params.id;
  this.label = params.label;
  this.fov = params.fov;
  this.interLensDistance = params.interLensDistance;
  this.baselineLensDistance = params.baselineLensDistance;
  this.screenLensDistance = params.screenLensDistance;
  this.distortionCoefficients = params.distortionCoefficients;
  this.inverseCoefficients = params.inverseCoefficients;
}
DeviceInfo.Viewers = Viewers;
var format = 1;
var last_updated = "2019-11-09T17:36:14Z";
var devices = [{"type":"android","rules":[{"mdmh":"asus/*/Nexus 7/*"},{"ua":"Nexus 7"}],"dpi":[320.8,323],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"asus/*/ASUS_X00PD/*"},{"ua":"ASUS_X00PD"}],"dpi":245,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"asus/*/ASUS_X008D/*"},{"ua":"ASUS_X008D"}],"dpi":282,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"asus/*/ASUS_Z00AD/*"},{"ua":"ASUS_Z00AD"}],"dpi":[403,404.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 2 XL/*"},{"ua":"Pixel 2 XL"}],"dpi":537.9,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 3 XL/*"},{"ua":"Pixel 3 XL"}],"dpi":[558.5,553.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel XL/*"},{"ua":"Pixel XL"}],"dpi":[537.9,533],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 3/*"},{"ua":"Pixel 3"}],"dpi":442.4,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Google/*/Pixel 2/*"},{"ua":"Pixel 2"}],"dpi":441,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"Google/*/Pixel/*"},{"ua":"Pixel"}],"dpi":[432.6,436.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"HTC/*/HTC6435LVW/*"},{"ua":"HTC6435LVW"}],"dpi":[449.7,443.3],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One XL/*"},{"ua":"HTC One XL"}],"dpi":[315.3,314.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"htc/*/Nexus 9/*"},{"ua":"Nexus 9"}],"dpi":289,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One M9/*"},{"ua":"HTC One M9"}],"dpi":[442.5,443.3],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One_M8/*"},{"ua":"HTC One_M8"}],"dpi":[449.7,447.4],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"HTC/*/HTC One/*"},{"ua":"HTC One"}],"dpi":472.8,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Huawei/*/Nexus 6P/*"},{"ua":"Nexus 6P"}],"dpi":[515.1,518],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Huawei/*/BLN-L24/*"},{"ua":"HONORBLN-L24"}],"dpi":480,"bw":4,"ac":500},{"type":"android","rules":[{"mdmh":"Huawei/*/BKL-L09/*"},{"ua":"BKL-L09"}],"dpi":403,"bw":3.47,"ac":500},{"type":"android","rules":[{"mdmh":"LENOVO/*/Lenovo PB2-690Y/*"},{"ua":"Lenovo PB2-690Y"}],"dpi":[457.2,454.713],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/Nexus 5X/*"},{"ua":"Nexus 5X"}],"dpi":[422,419.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LGMS345/*"},{"ua":"LGMS345"}],"dpi":[221.7,219.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/LG-D800/*"},{"ua":"LG-D800"}],"dpi":[422,424.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/LG-D850/*"},{"ua":"LG-D850"}],"dpi":[537.9,541.9],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"LGE/*/VS985 4G/*"},{"ua":"VS985 4G"}],"dpi":[537.9,535.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/Nexus 5/*"},{"ua":"Nexus 5 B"}],"dpi":[442.4,444.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/Nexus 4/*"},{"ua":"Nexus 4"}],"dpi":[319.8,318.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LG-P769/*"},{"ua":"LG-P769"}],"dpi":[240.6,247.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LGMS323/*"},{"ua":"LGMS323"}],"dpi":[206.6,204.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"LGE/*/LGLS996/*"},{"ua":"LGLS996"}],"dpi":[403.4,401.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Micromax/*/4560MMX/*"},{"ua":"4560MMX"}],"dpi":[240,219.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Micromax/*/A250/*"},{"ua":"Micromax A250"}],"dpi":[480,446.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Micromax/*/Micromax AQ4501/*"},{"ua":"Micromax AQ4501"}],"dpi":240,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/G5/*"},{"ua":"Moto G (5) Plus"}],"dpi":[403.4,403],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/DROID RAZR/*"},{"ua":"DROID RAZR"}],"dpi":[368.1,256.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT830C/*"},{"ua":"XT830C"}],"dpi":[254,255.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1021/*"},{"ua":"XT1021"}],"dpi":[254,256.7],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1023/*"},{"ua":"XT1023"}],"dpi":[254,256.7],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1028/*"},{"ua":"XT1028"}],"dpi":[326.6,327.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1034/*"},{"ua":"XT1034"}],"dpi":[326.6,328.4],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1053/*"},{"ua":"XT1053"}],"dpi":[315.3,316.1],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1562/*"},{"ua":"XT1562"}],"dpi":[403.4,402.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/Nexus 6/*"},{"ua":"Nexus 6 B"}],"dpi":[494.3,489.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1063/*"},{"ua":"XT1063"}],"dpi":[295,296.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/XT1064/*"},{"ua":"XT1064"}],"dpi":[295,295.6],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1092/*"},{"ua":"XT1092"}],"dpi":[422,424.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"motorola/*/XT1095/*"},{"ua":"XT1095"}],"dpi":[422,423.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"motorola/*/G4/*"},{"ua":"Moto G (4)"}],"dpi":401,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/A0001/*"},{"ua":"A0001"}],"dpi":[403.4,401],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE E1001/*"},{"ua":"ONE E1001"}],"dpi":[442.4,441.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE E1003/*"},{"ua":"ONE E1003"}],"dpi":[442.4,441.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE E1005/*"},{"ua":"ONE E1005"}],"dpi":[442.4,441.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A2001/*"},{"ua":"ONE A2001"}],"dpi":[391.9,405.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A2003/*"},{"ua":"ONE A2003"}],"dpi":[391.9,405.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A2005/*"},{"ua":"ONE A2005"}],"dpi":[391.9,405.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A3000/*"},{"ua":"ONEPLUS A3000"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A3003/*"},{"ua":"ONEPLUS A3003"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A3010/*"},{"ua":"ONEPLUS A3010"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A5000/*"},{"ua":"ONEPLUS A5000 "}],"dpi":[403.411,399.737],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONE A5010/*"},{"ua":"ONEPLUS A5010"}],"dpi":[403,400],"bw":2,"ac":1000},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6000/*"},{"ua":"ONEPLUS A6000"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6003/*"},{"ua":"ONEPLUS A6003"}],"dpi":401,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6010/*"},{"ua":"ONEPLUS A6010"}],"dpi":401,"bw":2,"ac":500},{"type":"android","rules":[{"mdmh":"OnePlus/*/ONEPLUS A6013/*"},{"ua":"ONEPLUS A6013"}],"dpi":401,"bw":2,"ac":500},{"type":"android","rules":[{"mdmh":"OPPO/*/X909/*"},{"ua":"X909"}],"dpi":[442.4,444.1],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9082/*"},{"ua":"GT-I9082"}],"dpi":[184.7,185.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G360P/*"},{"ua":"SM-G360P"}],"dpi":[196.7,205.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/Nexus S/*"},{"ua":"Nexus S"}],"dpi":[234.5,229.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9300/*"},{"ua":"GT-I9300"}],"dpi":[304.8,303.9],"bw":5,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-T230NU/*"},{"ua":"SM-T230NU"}],"dpi":216,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SGH-T399/*"},{"ua":"SGH-T399"}],"dpi":[217.7,231.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SGH-M919/*"},{"ua":"SGH-M919"}],"dpi":[440.8,437.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N9005/*"},{"ua":"SM-N9005"}],"dpi":[386.4,387],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SAMSUNG-SM-N900A/*"},{"ua":"SAMSUNG-SM-N900A"}],"dpi":[386.4,387.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9500/*"},{"ua":"GT-I9500"}],"dpi":[442.5,443.3],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9505/*"},{"ua":"GT-I9505"}],"dpi":439.4,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G900F/*"},{"ua":"SM-G900F"}],"dpi":[415.6,431.6],"bw":5,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G900M/*"},{"ua":"SM-G900M"}],"dpi":[415.6,431.6],"bw":5,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G800F/*"},{"ua":"SM-G800F"}],"dpi":326.8,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G906S/*"},{"ua":"SM-G906S"}],"dpi":[562.7,572.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9300/*"},{"ua":"GT-I9300"}],"dpi":[306.7,304.8],"bw":5,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-T535/*"},{"ua":"SM-T535"}],"dpi":[142.6,136.4],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N920C/*"},{"ua":"SM-N920C"}],"dpi":[515.1,518.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N920P/*"},{"ua":"SM-N920P"}],"dpi":[386.3655,390.144],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N920W8/*"},{"ua":"SM-N920W8"}],"dpi":[515.1,518.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9300I/*"},{"ua":"GT-I9300I"}],"dpi":[304.8,305.8],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-I9195/*"},{"ua":"GT-I9195"}],"dpi":[249.4,256.7],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SPH-L520/*"},{"ua":"SPH-L520"}],"dpi":[249.4,255.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SAMSUNG-SGH-I717/*"},{"ua":"SAMSUNG-SGH-I717"}],"dpi":285.8,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SPH-D710/*"},{"ua":"SPH-D710"}],"dpi":[217.7,204.2],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/GT-N7100/*"},{"ua":"GT-N7100"}],"dpi":265.1,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SCH-I605/*"},{"ua":"SCH-I605"}],"dpi":265.1,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/Galaxy Nexus/*"},{"ua":"Galaxy Nexus"}],"dpi":[315.3,314.2],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N910H/*"},{"ua":"SM-N910H"}],"dpi":[515.1,518],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-N910C/*"},{"ua":"SM-N910C"}],"dpi":[515.2,520.2],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G130M/*"},{"ua":"SM-G130M"}],"dpi":[165.9,164.8],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G928I/*"},{"ua":"SM-G928I"}],"dpi":[515.1,518.4],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G920F/*"},{"ua":"SM-G920F"}],"dpi":580.6,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G920P/*"},{"ua":"SM-G920P"}],"dpi":[522.5,577],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G925F/*"},{"ua":"SM-G925F"}],"dpi":580.6,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G925V/*"},{"ua":"SM-G925V"}],"dpi":[522.5,576.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G930F/*"},{"ua":"SM-G930F"}],"dpi":576.6,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G935F/*"},{"ua":"SM-G935F"}],"dpi":533,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G950F/*"},{"ua":"SM-G950F"}],"dpi":[562.707,565.293],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G955U/*"},{"ua":"SM-G955U"}],"dpi":[522.514,525.762],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G955F/*"},{"ua":"SM-G955F"}],"dpi":[522.514,525.762],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960F/*"},{"ua":"SM-G960F"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G9600/*"},{"ua":"SM-G9600"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960T/*"},{"ua":"SM-G960T"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960N/*"},{"ua":"SM-G960N"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960U/*"},{"ua":"SM-G960U"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G9608/*"},{"ua":"SM-G9608"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960FD/*"},{"ua":"SM-G960FD"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G960W/*"},{"ua":"SM-G960W"}],"dpi":[569.575,571.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G965F/*"},{"ua":"SM-G965F"}],"dpi":529,"bw":2,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/C6903/*"},{"ua":"C6903"}],"dpi":[442.5,443.3],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"Sony/*/D6653/*"},{"ua":"D6653"}],"dpi":[428.6,427.6],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/E6653/*"},{"ua":"E6653"}],"dpi":[428.6,425.7],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/E6853/*"},{"ua":"E6853"}],"dpi":[403.4,401.9],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Sony/*/SGP321/*"},{"ua":"SGP321"}],"dpi":[224.7,224.1],"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"TCT/*/ALCATEL ONE TOUCH Fierce/*"},{"ua":"ALCATEL ONE TOUCH Fierce"}],"dpi":[240,247.5],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"THL/*/thl 5000/*"},{"ua":"thl 5000"}],"dpi":[480,443.3],"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"Fly/*/IQ4412/*"},{"ua":"IQ4412"}],"dpi":307.9,"bw":3,"ac":1000},{"type":"android","rules":[{"mdmh":"ZTE/*/ZTE Blade L2/*"},{"ua":"ZTE Blade L2"}],"dpi":240,"bw":3,"ac":500},{"type":"android","rules":[{"mdmh":"BENEVE/*/VR518/*"},{"ua":"VR518"}],"dpi":480,"bw":3,"ac":500},{"type":"ios","rules":[{"res":[640,960]}],"dpi":[325.1,328.4],"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[640,1136]}],"dpi":[317.1,320.2],"bw":3,"ac":1000},{"type":"ios","rules":[{"res":[750,1334]}],"dpi":326.4,"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[1242,2208]}],"dpi":[453.6,458.4],"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[1125,2001]}],"dpi":[410.9,415.4],"bw":4,"ac":1000},{"type":"ios","rules":[{"res":[1125,2436]}],"dpi":458,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"Huawei/*/EML-L29/*"},{"ua":"EML-L29"}],"dpi":428,"bw":3.45,"ac":500},{"type":"android","rules":[{"mdmh":"Nokia/*/Nokia 7.1/*"},{"ua":"Nokia 7.1"}],"dpi":[432,431.9],"bw":3,"ac":500},{"type":"ios","rules":[{"res":[1242,2688]}],"dpi":458,"bw":4,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G570M/*"},{"ua":"SM-G570M"}],"dpi":320,"bw":3.684,"ac":1000},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G970F/*"},{"ua":"SM-G970F"}],"dpi":438,"bw":2.281,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G973F/*"},{"ua":"SM-G973F"}],"dpi":550,"bw":2.002,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G975F/*"},{"ua":"SM-G975F"}],"dpi":522,"bw":2.054,"ac":500},{"type":"android","rules":[{"mdmh":"samsung/*/SM-G977F/*"},{"ua":"SM-G977F"}],"dpi":505,"bw":2.334,"ac":500},{"type":"ios","rules":[{"res":[828,1792]}],"dpi":326,"bw":5,"ac":500}];
var DPDB_CACHE = {
	format: format,
	last_updated: last_updated,
	devices: devices
};
function Dpdb(url, onDeviceParamsUpdated) {
  this.dpdb = DPDB_CACHE;
  this.recalculateDeviceParams_();
  if (url) {
    this.onDeviceParamsUpdated = onDeviceParamsUpdated;
    var xhr = new XMLHttpRequest();
    var obj = this;
    xhr.open('GET', url, true);
    xhr.addEventListener('load', function () {
      obj.loading = false;
      if (xhr.status >= 200 && xhr.status <= 299) {
        obj.dpdb = JSON.parse(xhr.response);
        obj.recalculateDeviceParams_();
      } else {
        console.error('Error loading online DPDB!');
      }
    });
    xhr.send();
  }
}
Dpdb.prototype.getDeviceParams = function () {
  return this.deviceParams;
};
Dpdb.prototype.recalculateDeviceParams_ = function () {
  var newDeviceParams = this.calcDeviceParams_();
  if (newDeviceParams) {
    this.deviceParams = newDeviceParams;
    if (this.onDeviceParamsUpdated) {
      this.onDeviceParamsUpdated(this.deviceParams);
    }
  } else {
    console.error('Failed to recalculate device parameters.');
  }
};
Dpdb.prototype.calcDeviceParams_ = function () {
  var db = this.dpdb;
  if (!db) {
    console.error('DPDB not available.');
    return null;
  }
  if (db.format != 1) {
    console.error('DPDB has unexpected format version.');
    return null;
  }
  if (!db.devices || !db.devices.length) {
    console.error('DPDB does not have a devices section.');
    return null;
  }
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var width = getScreenWidth();
  var height = getScreenHeight();
  if (!db.devices) {
    console.error('DPDB has no devices section.');
    return null;
  }
  for (var i = 0; i < db.devices.length; i++) {
    var device = db.devices[i];
    if (!device.rules) {
      console.warn('Device[' + i + '] has no rules section.');
      continue;
    }
    if (device.type != 'ios' && device.type != 'android') {
      console.warn('Device[' + i + '] has invalid type.');
      continue;
    }
    if (isIOS() != (device.type == 'ios')) continue;
    var matched = false;
    for (var j = 0; j < device.rules.length; j++) {
      var rule = device.rules[j];
      if (this.ruleMatches_(rule, userAgent, width, height)) {
        matched = true;
        break;
      }
    }
    if (!matched) continue;
    var xdpi = device.dpi[0] || device.dpi;
    var ydpi = device.dpi[1] || device.dpi;
    return new DeviceParams({ xdpi: xdpi, ydpi: ydpi, bevelMm: device.bw });
  }
  console.warn('No DPDB device match.');
  return null;
};
Dpdb.prototype.ruleMatches_ = function (rule, ua, screenWidth, screenHeight) {
  if (!rule.ua && !rule.res) return false;
  if (rule.ua && rule.ua.substring(0, 2) === 'SM') rule.ua = rule.ua.substring(0, 7);
  if (rule.ua && ua.indexOf(rule.ua) < 0) return false;
  if (rule.res) {
    if (!rule.res[0] || !rule.res[1]) return false;
    var resX = rule.res[0];
    var resY = rule.res[1];
    if (Math.min(screenWidth, screenHeight) != Math.min(resX, resY) || Math.max(screenWidth, screenHeight) != Math.max(resX, resY)) {
      return false;
    }
  }
  return true;
};
function DeviceParams(params) {
  this.xdpi = params.xdpi;
  this.ydpi = params.ydpi;
  this.bevelMm = params.bevelMm;
}
function SensorSample(sample, timestampS) {
  this.set(sample, timestampS);
}
SensorSample.prototype.set = function (sample, timestampS) {
  this.sample = sample;
  this.timestampS = timestampS;
};
SensorSample.prototype.copy = function (sensorSample) {
  this.set(sensorSample.sample, sensorSample.timestampS);
};
function ComplementaryFilter(kFilter, isDebug) {
  this.kFilter = kFilter;
  this.isDebug = isDebug;
  this.currentAccelMeasurement = new SensorSample();
  this.currentGyroMeasurement = new SensorSample();
  this.previousGyroMeasurement = new SensorSample();
  if (isIOS()) {
    this.filterQ = new Quaternion(-1, 0, 0, 1);
  } else {
    this.filterQ = new Quaternion(1, 0, 0, 1);
  }
  this.previousFilterQ = new Quaternion();
  this.previousFilterQ.copy(this.filterQ);
  this.accelQ = new Quaternion();
  this.isOrientationInitialized = false;
  this.estimatedGravity = new Vector3();
  this.measuredGravity = new Vector3();
  this.gyroIntegralQ = new Quaternion();
}
ComplementaryFilter.prototype.addAccelMeasurement = function (vector, timestampS) {
  this.currentAccelMeasurement.set(vector, timestampS);
};
ComplementaryFilter.prototype.addGyroMeasurement = function (vector, timestampS) {
  this.currentGyroMeasurement.set(vector, timestampS);
  var deltaT = timestampS - this.previousGyroMeasurement.timestampS;
  if (isTimestampDeltaValid(deltaT)) {
    this.run_();
  }
  this.previousGyroMeasurement.copy(this.currentGyroMeasurement);
};
ComplementaryFilter.prototype.run_ = function () {
  if (!this.isOrientationInitialized) {
    this.accelQ = this.accelToQuaternion_(this.currentAccelMeasurement.sample);
    this.previousFilterQ.copy(this.accelQ);
    this.isOrientationInitialized = true;
    return;
  }
  var deltaT = this.currentGyroMeasurement.timestampS - this.previousGyroMeasurement.timestampS;
  var gyroDeltaQ = this.gyroToQuaternionDelta_(this.currentGyroMeasurement.sample, deltaT);
  this.gyroIntegralQ.multiply(gyroDeltaQ);
  this.filterQ.copy(this.previousFilterQ);
  this.filterQ.multiply(gyroDeltaQ);
  var invFilterQ = new Quaternion();
  invFilterQ.copy(this.filterQ);
  invFilterQ.inverse();
  this.estimatedGravity.set(0, 0, -1);
  this.estimatedGravity.applyQuaternion(invFilterQ);
  this.estimatedGravity.normalize();
  this.measuredGravity.copy(this.currentAccelMeasurement.sample);
  this.measuredGravity.normalize();
  var deltaQ = new Quaternion();
  deltaQ.setFromUnitVectors(this.estimatedGravity, this.measuredGravity);
  deltaQ.inverse();
  if (this.isDebug) {
    console.log('Delta: %d deg, G_est: (%s, %s, %s), G_meas: (%s, %s, %s)', radToDeg * getQuaternionAngle(deltaQ), this.estimatedGravity.x.toFixed(1), this.estimatedGravity.y.toFixed(1), this.estimatedGravity.z.toFixed(1), this.measuredGravity.x.toFixed(1), this.measuredGravity.y.toFixed(1), this.measuredGravity.z.toFixed(1));
  }
  var targetQ = new Quaternion();
  targetQ.copy(this.filterQ);
  targetQ.multiply(deltaQ);
  this.filterQ.slerp(targetQ, 1 - this.kFilter);
  this.previousFilterQ.copy(this.filterQ);
};
ComplementaryFilter.prototype.getOrientation = function () {
  return this.filterQ;
};
ComplementaryFilter.prototype.accelToQuaternion_ = function (accel) {
  var normAccel = new Vector3();
  normAccel.copy(accel);
  normAccel.normalize();
  var quat = new Quaternion();
  quat.setFromUnitVectors(new Vector3(0, 0, -1), normAccel);
  quat.inverse();
  return quat;
};
ComplementaryFilter.prototype.gyroToQuaternionDelta_ = function (gyro, dt) {
  var quat = new Quaternion();
  var axis = new Vector3();
  axis.copy(gyro);
  axis.normalize();
  quat.setFromAxisAngle(axis, gyro.length() * dt);
  return quat;
};
function PosePredictor(predictionTimeS, isDebug) {
  this.predictionTimeS = predictionTimeS;
  this.isDebug = isDebug;
  this.previousQ = new Quaternion();
  this.previousTimestampS = null;
  this.deltaQ = new Quaternion();
  this.outQ = new Quaternion();
}
PosePredictor.prototype.getPrediction = function (currentQ, gyro, timestampS) {
  if (!this.previousTimestampS) {
    this.previousQ.copy(currentQ);
    this.previousTimestampS = timestampS;
    return currentQ;
  }
  var axis = new Vector3();
  axis.copy(gyro);
  axis.normalize();
  var angularSpeed = gyro.length();
  if (angularSpeed < degToRad * 20) {
    if (this.isDebug) {
      console.log('Moving slowly, at %s deg/s: no prediction', (radToDeg * angularSpeed).toFixed(1));
    }
    this.outQ.copy(currentQ);
    this.previousQ.copy(currentQ);
    return this.outQ;
  }
  var predictAngle = angularSpeed * this.predictionTimeS;
  this.deltaQ.setFromAxisAngle(axis, predictAngle);
  this.outQ.copy(this.previousQ);
  this.outQ.multiply(this.deltaQ);
  this.previousQ.copy(currentQ);
  this.previousTimestampS = timestampS;
  return this.outQ;
};
function FusionPoseSensor(kFilter, predictionTime, yawOnly, isDebug) {
  this.yawOnly = yawOnly;
  this.accelerometer = new Vector3();
  this.gyroscope = new Vector3();
  this.filter = new ComplementaryFilter(kFilter, isDebug);
  this.posePredictor = new PosePredictor(predictionTime, isDebug);
  this.isFirefoxAndroid = isFirefoxAndroid();
  this.isIOS = isIOS();
  var chromeVersion = getChromeVersion();
  this.isDeviceMotionInRadians = !this.isIOS && chromeVersion && chromeVersion < 66;
  this.isWithoutDeviceMotion = isChromeWithoutDeviceMotion() || isSafariWithoutDeviceMotion();
  this.filterToWorldQ = new Quaternion();
  if (isIOS()) {
    this.filterToWorldQ.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
  } else {
    this.filterToWorldQ.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
  }
  this.inverseWorldToScreenQ = new Quaternion();
  this.worldToScreenQ = new Quaternion();
  this.originalPoseAdjustQ = new Quaternion();
  this.originalPoseAdjustQ.setFromAxisAngle(new Vector3(0, 0, 1), -window.orientation * Math.PI / 180);
  this.setScreenTransform_();
  if (isLandscapeMode()) {
    this.filterToWorldQ.multiply(this.inverseWorldToScreenQ);
  }
  this.resetQ = new Quaternion();
  this.orientationOut_ = new Float32Array(4);
  this.start();
}
FusionPoseSensor.prototype.getPosition = function () {
  return null;
};
FusionPoseSensor.prototype.getOrientation = function () {
  var orientation = void 0;
  if (this.isWithoutDeviceMotion && this._deviceOrientationQ) {
    this.deviceOrientationFixQ = this.deviceOrientationFixQ || function () {
      var z = new Quaternion().setFromAxisAngle(new Vector3(0, 0, -1), 0);
      var y = new Quaternion();
      if (window.orientation === -90) {
        y.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / -2);
      } else {
        y.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
      }
      return z.multiply(y);
    }();
    this.deviceOrientationFilterToWorldQ = this.deviceOrientationFilterToWorldQ || function () {
      var q = new Quaternion();
      q.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
      return q;
    }();
    orientation = this._deviceOrientationQ;
    var out = new Quaternion();
    out.copy(orientation);
    out.multiply(this.deviceOrientationFilterToWorldQ);
    out.multiply(this.resetQ);
    out.multiply(this.worldToScreenQ);
    out.multiplyQuaternions(this.deviceOrientationFixQ, out);
    if (this.yawOnly) {
      out.x = 0;
      out.z = 0;
      out.normalize();
    }
    this.orientationOut_[0] = out.x;
    this.orientationOut_[1] = out.y;
    this.orientationOut_[2] = out.z;
    this.orientationOut_[3] = out.w;
    return this.orientationOut_;
  } else {
    var filterOrientation = this.filter.getOrientation();
    orientation = this.posePredictor.getPrediction(filterOrientation, this.gyroscope, this.previousTimestampS);
  }
  var out = new Quaternion();
  out.copy(this.filterToWorldQ);
  out.multiply(this.resetQ);
  out.multiply(orientation);
  out.multiply(this.worldToScreenQ);
  if (this.yawOnly) {
    out.x = 0;
    out.z = 0;
    out.normalize();
  }
  this.orientationOut_[0] = out.x;
  this.orientationOut_[1] = out.y;
  this.orientationOut_[2] = out.z;
  this.orientationOut_[3] = out.w;
  return this.orientationOut_;
};
FusionPoseSensor.prototype.resetPose = function () {
  this.resetQ.copy(this.filter.getOrientation());
  this.resetQ.x = 0;
  this.resetQ.y = 0;
  this.resetQ.z *= -1;
  this.resetQ.normalize();
  if (isLandscapeMode()) {
    this.resetQ.multiply(this.inverseWorldToScreenQ);
  }
  this.resetQ.multiply(this.originalPoseAdjustQ);
};
FusionPoseSensor.prototype.onDeviceOrientation_ = function (e) {
  this._deviceOrientationQ = this._deviceOrientationQ || new Quaternion();
  var alpha = e.alpha,
      beta = e.beta,
      gamma = e.gamma;
  alpha = (alpha || 0) * Math.PI / 180;
  beta = (beta || 0) * Math.PI / 180;
  gamma = (gamma || 0) * Math.PI / 180;
  this._deviceOrientationQ.setFromEulerYXZ(beta, alpha, -gamma);
};
FusionPoseSensor.prototype.onDeviceMotion_ = function (deviceMotion) {
  this.updateDeviceMotion_(deviceMotion);
};
FusionPoseSensor.prototype.updateDeviceMotion_ = function (deviceMotion) {
  var accGravity = deviceMotion.accelerationIncludingGravity;
  var rotRate = deviceMotion.rotationRate;
  var timestampS = deviceMotion.timeStamp / 1000;
  var deltaS = timestampS - this.previousTimestampS;
  if (deltaS < 0) {
    warnOnce('fusion-pose-sensor:invalid:non-monotonic', 'Invalid timestamps detected: non-monotonic timestamp from devicemotion');
    this.previousTimestampS = timestampS;
    return;
  } else if (deltaS <= MIN_TIMESTEP || deltaS > MAX_TIMESTEP) {
    warnOnce('fusion-pose-sensor:invalid:outside-threshold', 'Invalid timestamps detected: Timestamp from devicemotion outside expected range.');
    this.previousTimestampS = timestampS;
    return;
  }
  this.accelerometer.set(-accGravity.x, -accGravity.y, -accGravity.z);
  if (rotRate) {
    if (isR7()) {
      this.gyroscope.set(-rotRate.beta, rotRate.alpha, rotRate.gamma);
    } else {
      this.gyroscope.set(rotRate.alpha, rotRate.beta, rotRate.gamma);
    }
    if (!this.isDeviceMotionInRadians) {
      this.gyroscope.multiplyScalar(Math.PI / 180);
    }
    this.filter.addGyroMeasurement(this.gyroscope, timestampS);
  }
  this.filter.addAccelMeasurement(this.accelerometer, timestampS);
  this.previousTimestampS = timestampS;
};
FusionPoseSensor.prototype.onOrientationChange_ = function (screenOrientation) {
  this.setScreenTransform_();
};
FusionPoseSensor.prototype.onMessage_ = function (event) {
  var message = event.data;
  if (!message || !message.type) {
    return;
  }
  var type = message.type.toLowerCase();
  if (type !== 'devicemotion') {
    return;
  }
  this.updateDeviceMotion_(message.deviceMotionEvent);
};
FusionPoseSensor.prototype.setScreenTransform_ = function () {
  this.worldToScreenQ.set(0, 0, 0, 1);
  switch (window.orientation) {
    case 0:
      break;
    case 90:
      this.worldToScreenQ.setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);
      break;
    case -90:
      this.worldToScreenQ.setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
      break;
    case 180:
      break;
  }
  this.inverseWorldToScreenQ.copy(this.worldToScreenQ);
  this.inverseWorldToScreenQ.inverse();
};
FusionPoseSensor.prototype.start = function () {
  this.onDeviceMotionCallback_ = this.onDeviceMotion_.bind(this);
  this.onOrientationChangeCallback_ = this.onOrientationChange_.bind(this);
  this.onMessageCallback_ = this.onMessage_.bind(this);
  this.onDeviceOrientationCallback_ = this.onDeviceOrientation_.bind(this);
  if (isIOS() && isInsideCrossOriginIFrame()) {
    window.addEventListener('message', this.onMessageCallback_);
  }
  window.addEventListener('orientationchange', this.onOrientationChangeCallback_);
  if (this.isWithoutDeviceMotion) {
    window.addEventListener('deviceorientation', this.onDeviceOrientationCallback_);
  } else {
    window.addEventListener('devicemotion', this.onDeviceMotionCallback_);
  }
};
FusionPoseSensor.prototype.stop = function () {
  window.removeEventListener('devicemotion', this.onDeviceMotionCallback_);
  window.removeEventListener('deviceorientation', this.onDeviceOrientationCallback_);
  window.removeEventListener('orientationchange', this.onOrientationChangeCallback_);
  window.removeEventListener('message', this.onMessageCallback_);
};
var SENSOR_FREQUENCY = 60;
var X_AXIS = new Vector3(1, 0, 0);
var Z_AXIS = new Vector3(0, 0, 1);
var SENSOR_TO_VR = new Quaternion();
SENSOR_TO_VR.setFromAxisAngle(X_AXIS, -Math.PI / 2);
SENSOR_TO_VR.multiply(new Quaternion().setFromAxisAngle(Z_AXIS, Math.PI / 2));
var PoseSensor = function () {
  function PoseSensor(config) {
    classCallCheck(this, PoseSensor);
    this.config = config;
    this.sensor = null;
    this.fusionSensor = null;
    this._out = new Float32Array(4);
    this.api = null;
    this.errors = [];
    this._sensorQ = new Quaternion();
    this._outQ = new Quaternion();
    this._onSensorRead = this._onSensorRead.bind(this);
    this._onSensorError = this._onSensorError.bind(this);
    this.init();
  }
  createClass(PoseSensor, [{
    key: 'init',
    value: function init() {
      var sensor = null;
      try {
        sensor = new RelativeOrientationSensor({
          frequency: SENSOR_FREQUENCY,
          referenceFrame: 'screen'
        });
        sensor.addEventListener('error', this._onSensorError);
      } catch (error) {
        this.errors.push(error);
        if (error.name === 'SecurityError') {
          console.error('Cannot construct sensors due to the Feature Policy');
          console.warn('Attempting to fall back using "devicemotion"; however this will ' + 'fail in the future without correct permissions.');
          this.useDeviceMotion();
        } else if (error.name === 'ReferenceError') {
          this.useDeviceMotion();
        } else {
          console.error(error);
        }
      }
      if (sensor) {
        this.api = 'sensor';
        this.sensor = sensor;
        this.sensor.addEventListener('reading', this._onSensorRead);
        this.sensor.start();
      }
    }
  }, {
    key: 'useDeviceMotion',
    value: function useDeviceMotion() {
      this.api = 'devicemotion';
      this.fusionSensor = new FusionPoseSensor(this.config.K_FILTER, this.config.PREDICTION_TIME_S, this.config.YAW_ONLY, this.config.DEBUG);
      if (this.sensor) {
        this.sensor.removeEventListener('reading', this._onSensorRead);
        this.sensor.removeEventListener('error', this._onSensorError);
        this.sensor = null;
      }
    }
  }, {
    key: 'getOrientation',
    value: function getOrientation() {
      if (this.fusionSensor) {
        return this.fusionSensor.getOrientation();
      }
      if (!this.sensor || !this.sensor.quaternion) {
        this._out[0] = this._out[1] = this._out[2] = 0;
        this._out[3] = 1;
        return this._out;
      }
      var q = this.sensor.quaternion;
      this._sensorQ.set(q[0], q[1], q[2], q[3]);
      var out = this._outQ;
      out.copy(SENSOR_TO_VR);
      out.multiply(this._sensorQ);
      if (this.config.YAW_ONLY) {
        out.x = out.z = 0;
        out.normalize();
      }
      this._out[0] = out.x;
      this._out[1] = out.y;
      this._out[2] = out.z;
      this._out[3] = out.w;
      return this._out;
    }
  }, {
    key: '_onSensorError',
    value: function _onSensorError(event) {
      this.errors.push(event.error);
      if (event.error.name === 'NotAllowedError') {
        console.error('Permission to access sensor was denied');
      } else if (event.error.name === 'NotReadableError') {
        console.error('Sensor could not be read');
      } else {
        console.error(event.error);
      }
      this.useDeviceMotion();
    }
  }, {
    key: '_onSensorRead',
    value: function _onSensorRead() {}
  }]);
  return PoseSensor;
}();
var rotateInstructionsAsset = "<svg width='198' height='240' viewBox='0 0 198 240' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><path d='M149.625 109.527l6.737 3.891v.886c0 .177.013.36.038.549.01.081.02.162.027.242.14 1.415.974 2.998 2.105 3.999l5.72 5.062.081-.09s4.382-2.53 5.235-3.024l25.97 14.993v54.001c0 .771-.386 1.217-.948 1.217-.233 0-.495-.076-.772-.236l-23.967-13.838-.014.024-27.322 15.775-.85-1.323c-4.731-1.529-9.748-2.74-14.951-3.61a.27.27 0 0 0-.007.024l-5.067 16.961-7.891 4.556-.037-.063v27.59c0 .772-.386 1.217-.948 1.217-.232 0-.495-.076-.772-.236l-42.473-24.522c-.95-.549-1.72-1.877-1.72-2.967v-1.035l-.021.047a5.111 5.111 0 0 0-1.816-.399 5.682 5.682 0 0 0-.546.001 13.724 13.724 0 0 1-1.918-.041c-1.655-.153-3.2-.6-4.404-1.296l-46.576-26.89.005.012-10.278-18.75c-1.001-1.827-.241-4.216 1.698-5.336l56.011-32.345a4.194 4.194 0 0 1 2.099-.572c1.326 0 2.572.659 3.227 1.853l.005-.003.227.413-.006.004a9.63 9.63 0 0 0 1.477 2.018l.277.27c1.914 1.85 4.468 2.801 7.113 2.801 1.949 0 3.948-.517 5.775-1.572.013 0 7.319-4.219 7.319-4.219a4.194 4.194 0 0 1 2.099-.572c1.326 0 2.572.658 3.226 1.853l3.25 5.928.022-.018 6.785 3.917-.105-.182 46.881-26.965m0-1.635c-.282 0-.563.073-.815.218l-46.169 26.556-5.41-3.124-3.005-5.481c-.913-1.667-2.699-2.702-4.66-2.703-1.011 0-2.02.274-2.917.792a3825 3825 0 0 1-7.275 4.195l-.044.024a9.937 9.937 0 0 1-4.957 1.353c-2.292 0-4.414-.832-5.976-2.342l-.252-.245a7.992 7.992 0 0 1-1.139-1.534 1.379 1.379 0 0 0-.06-.122l-.227-.414a1.718 1.718 0 0 0-.095-.154c-.938-1.574-2.673-2.545-4.571-2.545-1.011 0-2.02.274-2.917.792L3.125 155.502c-2.699 1.559-3.738 4.94-2.314 7.538l10.278 18.75c.177.323.448.563.761.704l46.426 26.804c1.403.81 3.157 1.332 5.072 1.508a15.661 15.661 0 0 0 2.146.046 4.766 4.766 0 0 1 .396 0c.096.004.19.011.283.022.109 1.593 1.159 3.323 2.529 4.114l42.472 24.522c.524.302 1.058.455 1.59.455 1.497 0 2.583-1.2 2.583-2.852v-26.562l7.111-4.105a1.64 1.64 0 0 0 .749-.948l4.658-15.593c4.414.797 8.692 1.848 12.742 3.128l.533.829a1.634 1.634 0 0 0 2.193.531l26.532-15.317L193 192.433c.523.302 1.058.455 1.59.455 1.497 0 2.583-1.199 2.583-2.852v-54.001c0-.584-.312-1.124-.818-1.416l-25.97-14.993a1.633 1.633 0 0 0-1.636.001c-.606.351-2.993 1.73-4.325 2.498l-4.809-4.255c-.819-.725-1.461-1.933-1.561-2.936a7.776 7.776 0 0 0-.033-.294 2.487 2.487 0 0 1-.023-.336v-.886c0-.584-.312-1.123-.817-1.416l-6.739-3.891a1.633 1.633 0 0 0-.817-.219' fill='#455A64'/><path d='M96.027 132.636l46.576 26.891c1.204.695 1.979 1.587 2.242 2.541l-.01.007-81.374 46.982h-.001c-1.654-.152-3.199-.6-4.403-1.295l-46.576-26.891 83.546-48.235' fill='#FAFAFA'/><path d='M63.461 209.174c-.008 0-.015 0-.022-.002-1.693-.156-3.228-.609-4.441-1.309l-46.576-26.89a.118.118 0 0 1 0-.203l83.546-48.235a.117.117 0 0 1 .117 0l46.576 26.891c1.227.708 2.021 1.612 2.296 2.611a.116.116 0 0 1-.042.124l-.021.016-81.375 46.981a.11.11 0 0 1-.058.016zm-50.747-28.303l46.401 26.79c1.178.68 2.671 1.121 4.32 1.276l81.272-46.922c-.279-.907-1.025-1.73-2.163-2.387l-46.517-26.857-83.313 48.1z' fill='#607D8B'/><path d='M148.327 165.471a5.85 5.85 0 0 1-.546.001c-1.894-.083-3.302-1.038-3.145-2.132a2.693 2.693 0 0 0-.072-1.105l-81.103 46.822c.628.058 1.272.073 1.918.042.182-.009.364-.009.546-.001 1.894.083 3.302 1.038 3.145 2.132l79.257-45.759' fill='#FFF'/><path d='M69.07 211.347a.118.118 0 0 1-.115-.134c.045-.317-.057-.637-.297-.925-.505-.61-1.555-1.022-2.738-1.074a5.966 5.966 0 0 0-.535.001 14.03 14.03 0 0 1-1.935-.041.117.117 0 0 1-.103-.092.116.116 0 0 1 .055-.126l81.104-46.822a.117.117 0 0 1 .171.07c.104.381.129.768.074 1.153-.045.316.057.637.296.925.506.61 1.555 1.021 2.739 1.073.178.008.357.008.535-.001a.117.117 0 0 1 .064.218l-79.256 45.759a.114.114 0 0 1-.059.016zm-3.405-2.372c.089 0 .177.002.265.006 1.266.056 2.353.488 2.908 1.158.227.274.35.575.36.882l78.685-45.429c-.036 0-.072-.001-.107-.003-1.267-.056-2.354-.489-2.909-1.158-.282-.34-.402-.724-.347-1.107a2.604 2.604 0 0 0-.032-.91L63.846 208.97a13.91 13.91 0 0 0 1.528.012c.097-.005.194-.007.291-.007z' fill='#607D8B'/><path d='M2.208 162.134c-1.001-1.827-.241-4.217 1.698-5.337l56.011-32.344c1.939-1.12 4.324-.546 5.326 1.281l.232.41a9.344 9.344 0 0 0 1.47 2.021l.278.27c3.325 3.214 8.583 3.716 12.888 1.23l7.319-4.22c1.94-1.119 4.324-.546 5.325 1.282l3.25 5.928-83.519 48.229-10.278-18.75z' fill='#FAFAFA'/><path d='M12.486 181.001a.112.112 0 0 1-.031-.005.114.114 0 0 1-.071-.056L2.106 162.19c-1.031-1.88-.249-4.345 1.742-5.494l56.01-32.344a4.328 4.328 0 0 1 2.158-.588c1.415 0 2.65.702 3.311 1.882.01.008.018.017.024.028l.227.414a.122.122 0 0 1 .013.038 9.508 9.508 0 0 0 1.439 1.959l.275.266c1.846 1.786 4.344 2.769 7.031 2.769 1.977 0 3.954-.538 5.717-1.557a.148.148 0 0 1 .035-.013l7.284-4.206a4.321 4.321 0 0 1 2.157-.588c1.427 0 2.672.716 3.329 1.914l3.249 5.929a.116.116 0 0 1-.044.157l-83.518 48.229a.116.116 0 0 1-.059.016zm49.53-57.004c-.704 0-1.41.193-2.041.557l-56.01 32.345c-1.882 1.086-2.624 3.409-1.655 5.179l10.221 18.645 83.317-48.112-3.195-5.829c-.615-1.122-1.783-1.792-3.124-1.792a4.08 4.08 0 0 0-2.04.557l-7.317 4.225a.148.148 0 0 1-.035.013 11.7 11.7 0 0 1-5.801 1.569c-2.748 0-5.303-1.007-7.194-2.835l-.278-.27a9.716 9.716 0 0 1-1.497-2.046.096.096 0 0 1-.013-.037l-.191-.347a.11.11 0 0 1-.023-.029c-.615-1.123-1.783-1.793-3.124-1.793z' fill='#607D8B'/><path d='M42.434 155.808c-2.51-.001-4.697-1.258-5.852-3.365-1.811-3.304-.438-7.634 3.059-9.654l12.291-7.098a7.599 7.599 0 0 1 3.789-1.033c2.51 0 4.697 1.258 5.852 3.365 1.811 3.304.439 7.634-3.059 9.654l-12.291 7.098a7.606 7.606 0 0 1-3.789 1.033zm13.287-20.683a7.128 7.128 0 0 0-3.555.971l-12.291 7.098c-3.279 1.893-4.573 5.942-2.883 9.024 1.071 1.955 3.106 3.122 5.442 3.122a7.13 7.13 0 0 0 3.556-.97l12.291-7.098c3.279-1.893 4.572-5.942 2.883-9.024-1.072-1.955-3.106-3.123-5.443-3.123z' fill='#607D8B'/><path d='M149.588 109.407l6.737 3.89v.887c0 .176.013.36.037.549.011.081.02.161.028.242.14 1.415.973 2.998 2.105 3.999l7.396 6.545c.177.156.358.295.541.415 1.579 1.04 2.95.466 3.062-1.282.049-.784.057-1.595.023-2.429l-.003-.16v-1.151l25.987 15.003v54c0 1.09-.77 1.53-1.72.982l-42.473-24.523c-.95-.548-1.72-1.877-1.72-2.966v-34.033' fill='#FAFAFA'/><path d='M194.553 191.25c-.257 0-.54-.085-.831-.253l-42.472-24.521c-.981-.567-1.779-1.943-1.779-3.068v-34.033h.234v34.033c0 1.051.745 2.336 1.661 2.866l42.473 24.521c.424.245.816.288 1.103.122.285-.164.442-.52.442-1.002v-53.933l-25.753-14.868.003 1.106c.034.832.026 1.654-.024 2.439-.054.844-.396 1.464-.963 1.746-.619.309-1.45.173-2.28-.373a5.023 5.023 0 0 1-.553-.426l-7.397-6.544c-1.158-1.026-1.999-2.625-2.143-4.076a9.624 9.624 0 0 0-.027-.238 4.241 4.241 0 0 1-.038-.564v-.82l-6.68-3.856.117-.202 6.738 3.89.058.034v.954c0 .171.012.351.036.533.011.083.021.165.029.246.138 1.395.948 2.935 2.065 3.923l7.397 6.545c.173.153.35.289.527.406.758.499 1.504.63 2.047.359.49-.243.786-.795.834-1.551.05-.778.057-1.591.024-2.417l-.004-.163v-1.355l.175.1 25.987 15.004.059.033v54.068c0 .569-.198.996-.559 1.204a1.002 1.002 0 0 1-.506.131' fill='#607D8B'/><path d='M145.685 163.161l24.115 13.922-25.978 14.998-1.462-.307c-6.534-2.17-13.628-3.728-21.019-4.616-4.365-.524-8.663 1.096-9.598 3.62a2.746 2.746 0 0 0-.011 1.928c1.538 4.267 4.236 8.363 7.995 12.135l.532.845-25.977 14.997-24.115-13.922 75.518-43.6' fill='#FFF'/><path d='M94.282 220.818l-.059-.033-24.29-14.024.175-.101 75.577-43.634.058.033 24.29 14.024-26.191 15.122-.045-.01-1.461-.307c-6.549-2.174-13.613-3.725-21.009-4.614a13.744 13.744 0 0 0-1.638-.097c-3.758 0-7.054 1.531-7.837 3.642a2.62 2.62 0 0 0-.01 1.848c1.535 4.258 4.216 8.326 7.968 12.091l.016.021.526.835.006.01.064.102-.105.061-25.977 14.998-.058.033zm-23.881-14.057l23.881 13.788 24.802-14.32c.546-.315.846-.489 1.017-.575l-.466-.74c-3.771-3.787-6.467-7.881-8.013-12.168a2.851 2.851 0 0 1 .011-2.008c.815-2.199 4.203-3.795 8.056-3.795.557 0 1.117.033 1.666.099 7.412.891 14.491 2.445 21.041 4.621.836.175 1.215.254 1.39.304l25.78-14.884-23.881-13.788-75.284 43.466z' fill='#607D8B'/><path d='M167.23 125.979v50.871l-27.321 15.773-6.461-14.167c-.91-1.996-3.428-1.738-5.624.574a10.238 10.238 0 0 0-2.33 4.018l-6.46 21.628-27.322 15.774v-50.871l75.518-43.6' fill='#FFF'/><path d='M91.712 220.567a.127.127 0 0 1-.059-.016.118.118 0 0 1-.058-.101v-50.871c0-.042.023-.08.058-.101l75.519-43.6a.117.117 0 0 1 .175.101v50.871c0 .041-.023.08-.059.1l-27.321 15.775a.118.118 0 0 1-.094.01.12.12 0 0 1-.071-.063l-6.46-14.168c-.375-.822-1.062-1.275-1.934-1.275-1.089 0-2.364.686-3.5 1.881a10.206 10.206 0 0 0-2.302 3.972l-6.46 21.627a.118.118 0 0 1-.054.068L91.77 220.551a.12.12 0 0 1-.058.016zm.117-50.92v50.601l27.106-15.65 6.447-21.583a10.286 10.286 0 0 1 2.357-4.065c1.18-1.242 2.517-1.954 3.669-1.954.969 0 1.731.501 2.146 1.411l6.407 14.051 27.152-15.676v-50.601l-75.284 43.466z' fill='#607D8B'/><path d='M168.543 126.213v50.87l-27.322 15.774-6.46-14.168c-.91-1.995-3.428-1.738-5.624.574a10.248 10.248 0 0 0-2.33 4.019l-6.461 21.627-27.321 15.774v-50.87l75.518-43.6' fill='#FFF'/><path d='M93.025 220.8a.123.123 0 0 1-.059-.015.12.12 0 0 1-.058-.101v-50.871c0-.042.023-.08.058-.101l75.518-43.6a.112.112 0 0 1 .117 0c.036.02.059.059.059.1v50.871a.116.116 0 0 1-.059.101l-27.321 15.774a.111.111 0 0 1-.094.01.115.115 0 0 1-.071-.062l-6.46-14.168c-.375-.823-1.062-1.275-1.935-1.275-1.088 0-2.363.685-3.499 1.881a10.19 10.19 0 0 0-2.302 3.971l-6.461 21.628a.108.108 0 0 1-.053.067l-27.322 15.775a.12.12 0 0 1-.058.015zm.117-50.919v50.6l27.106-15.649 6.447-21.584a10.293 10.293 0 0 1 2.357-4.065c1.179-1.241 2.516-1.954 3.668-1.954.969 0 1.732.502 2.147 1.412l6.407 14.051 27.152-15.676v-50.601l-75.284 43.466z' fill='#607D8B'/><path d='M169.8 177.083l-27.322 15.774-6.46-14.168c-.91-1.995-3.428-1.738-5.625.574a10.246 10.246 0 0 0-2.329 4.019l-6.461 21.627-27.321 15.774v-50.87l75.518-43.6v50.87z' fill='#FAFAFA'/><path d='M94.282 220.917a.234.234 0 0 1-.234-.233v-50.871c0-.083.045-.161.117-.202l75.518-43.601a.234.234 0 1 1 .35.202v50.871a.233.233 0 0 1-.116.202l-27.322 15.775a.232.232 0 0 1-.329-.106l-6.461-14.168c-.36-.789-.992-1.206-1.828-1.206-1.056 0-2.301.672-3.415 1.844a10.099 10.099 0 0 0-2.275 3.924l-6.46 21.628a.235.235 0 0 1-.107.136l-27.322 15.774a.23.23 0 0 1-.116.031zm.233-50.969v50.331l26.891-15.525 6.434-21.539a10.41 10.41 0 0 1 2.384-4.112c1.201-1.265 2.569-1.991 3.753-1.991 1.018 0 1.818.526 2.253 1.48l6.354 13.934 26.982-15.578v-50.331l-75.051 43.331z' fill='#607D8B'/><path d='M109.894 199.943c-1.774 0-3.241-.725-4.244-2.12a.224.224 0 0 1 .023-.294.233.233 0 0 1 .301-.023c.78.547 1.705.827 2.75.827 1.323 0 2.754-.439 4.256-1.306 5.311-3.067 9.631-10.518 9.631-16.611 0-1.927-.442-3.56-1.278-4.724a.232.232 0 0 1 .323-.327c1.671 1.172 2.591 3.381 2.591 6.219 0 6.242-4.426 13.863-9.865 17.003-1.574.908-3.084 1.356-4.488 1.356zm-2.969-1.542c.813.651 1.82.877 2.968.877h.001c1.321 0 2.753-.327 4.254-1.194 5.311-3.067 9.632-10.463 9.632-16.556 0-1.979-.463-3.599-1.326-4.761.411 1.035.625 2.275.625 3.635 0 6.243-4.426 13.883-9.865 17.023-1.574.909-3.084 1.317-4.49 1.317-.641 0-1.243-.149-1.799-.341z' fill='#607D8B'/><path d='M113.097 197.23c5.384-3.108 9.748-10.636 9.748-16.814 0-2.051-.483-3.692-1.323-4.86-1.784-1.252-4.374-1.194-7.257.47-5.384 3.108-9.748 10.636-9.748 16.814 0 2.051.483 3.692 1.323 4.86 1.784 1.252 4.374 1.194 7.257-.47' fill='#FAFAFA'/><path d='M108.724 198.614c-1.142 0-2.158-.213-3.019-.817-.021-.014-.04.014-.055-.007-.894-1.244-1.367-2.948-1.367-4.973 0-6.242 4.426-13.864 9.865-17.005 1.574-.908 3.084-1.363 4.49-1.363 1.142 0 2.158.309 3.018.913a.23.23 0 0 1 .056.056c.894 1.244 1.367 2.972 1.367 4.997 0 6.243-4.426 13.783-9.865 16.923-1.574.909-3.084 1.276-4.49 1.276zm-2.718-1.109c.774.532 1.688.776 2.718.776 1.323 0 2.754-.413 4.256-1.28 5.311-3.066 9.631-10.505 9.631-16.598 0-1.909-.434-3.523-1.255-4.685-.774-.533-1.688-.799-2.718-.799-1.323 0-2.755.441-4.256 1.308-5.311 3.066-9.631 10.506-9.631 16.599 0 1.909.434 3.517 1.255 4.679z' fill='#607D8B'/><path d='M149.318 114.262l-9.984 8.878 15.893 11.031 5.589-6.112-11.498-13.797' fill='#FAFAFA'/><path d='M169.676 120.84l-9.748 5.627c-3.642 2.103-9.528 2.113-13.147.024-3.62-2.089-3.601-5.488.041-7.591l9.495-5.608-6.729-3.885-81.836 47.071 45.923 26.514 3.081-1.779c.631-.365.869-.898.618-1.39-2.357-4.632-2.593-9.546-.683-14.262 5.638-13.92 24.509-24.815 48.618-28.07 8.169-1.103 16.68-.967 24.704.394.852.145 1.776.008 2.407-.357l3.081-1.778-25.825-14.91' fill='#FAFAFA'/><path d='M113.675 183.459a.47.47 0 0 1-.233-.062l-45.924-26.515a.468.468 0 0 1 .001-.809l81.836-47.071a.467.467 0 0 1 .466 0l6.729 3.885a.467.467 0 0 1-.467.809l-6.496-3.75-80.9 46.533 44.988 25.973 2.848-1.644c.192-.111.62-.409.435-.773-2.416-4.748-2.658-9.814-.7-14.65 2.806-6.927 8.885-13.242 17.582-18.263 8.657-4.998 19.518-8.489 31.407-10.094 8.198-1.107 16.79-.97 24.844.397.739.125 1.561.007 2.095-.301l2.381-1.374-25.125-14.506a.467.467 0 0 1 .467-.809l25.825 14.91a.467.467 0 0 1 0 .809l-3.081 1.779c-.721.417-1.763.575-2.718.413-7.963-1.351-16.457-1.486-24.563-.392-11.77 1.589-22.512 5.039-31.065 9.977-8.514 4.916-14.456 11.073-17.183 17.805-1.854 4.578-1.623 9.376.666 13.875.37.725.055 1.513-.8 2.006l-3.081 1.78a.476.476 0 0 1-.234.062' fill='#455A64'/><path d='M153.316 128.279c-2.413 0-4.821-.528-6.652-1.586-1.818-1.049-2.82-2.461-2.82-3.975 0-1.527 1.016-2.955 2.861-4.02l9.493-5.607a.233.233 0 1 1 .238.402l-9.496 5.609c-1.696.979-2.628 2.263-2.628 3.616 0 1.34.918 2.608 2.585 3.571 3.549 2.049 9.343 2.038 12.914-.024l9.748-5.628a.234.234 0 0 1 .234.405l-9.748 5.628c-1.858 1.072-4.296 1.609-6.729 1.609' fill='#607D8B'/><path d='M113.675 182.992l-45.913-26.508M113.675 183.342a.346.346 0 0 1-.175-.047l-45.913-26.508a.35.35 0 1 1 .35-.607l45.913 26.508a.35.35 0 0 1-.175.654' fill='#455A64'/><path d='M67.762 156.484v54.001c0 1.09.77 2.418 1.72 2.967l42.473 24.521c.95.549 1.72.11 1.72-.98v-54.001' fill='#FAFAFA'/><path d='M112.727 238.561c-.297 0-.62-.095-.947-.285l-42.473-24.521c-1.063-.613-1.895-2.05-1.895-3.27v-54.001a.35.35 0 1 1 .701 0v54.001c0 .96.707 2.18 1.544 2.663l42.473 24.522c.344.198.661.243.87.122.206-.119.325-.411.325-.799v-54.001a.35.35 0 1 1 .7 0v54.001c0 .655-.239 1.154-.675 1.406a1.235 1.235 0 0 1-.623.162' fill='#455A64'/><path d='M112.86 147.512h-.001c-2.318 0-4.499-.522-6.142-1.471-1.705-.984-2.643-2.315-2.643-3.749 0-1.445.952-2.791 2.68-3.788l12.041-6.953c1.668-.962 3.874-1.493 6.212-1.493 2.318 0 4.499.523 6.143 1.472 1.704.984 2.643 2.315 2.643 3.748 0 1.446-.952 2.791-2.68 3.789l-12.042 6.952c-1.668.963-3.874 1.493-6.211 1.493zm12.147-16.753c-2.217 0-4.298.497-5.861 1.399l-12.042 6.952c-1.502.868-2.33 1.998-2.33 3.182 0 1.173.815 2.289 2.293 3.142 1.538.889 3.596 1.378 5.792 1.378h.001c2.216 0 4.298-.497 5.861-1.399l12.041-6.953c1.502-.867 2.33-1.997 2.33-3.182 0-1.172-.814-2.288-2.292-3.142-1.539-.888-3.596-1.377-5.793-1.377z' fill='#607D8B'/><path d='M165.63 123.219l-5.734 3.311c-3.167 1.828-8.286 1.837-11.433.02-3.147-1.817-3.131-4.772.036-6.601l5.734-3.31 11.397 6.58' fill='#FAFAFA'/><path d='M154.233 117.448l9.995 5.771-4.682 2.704c-1.434.827-3.352 1.283-5.399 1.283-2.029 0-3.923-.449-5.333-1.263-1.29-.744-2-1.694-2-2.674 0-.991.723-1.955 2.036-2.713l5.383-3.108m0-.809l-5.734 3.31c-3.167 1.829-3.183 4.784-.036 6.601 1.568.905 3.623 1.357 5.684 1.357 2.077 0 4.159-.46 5.749-1.377l5.734-3.311-11.397-6.58M145.445 179.667c-1.773 0-3.241-.85-4.243-2.245-.067-.092-.057-.275.023-.356.08-.081.207-.12.3-.055.781.548 1.706.812 2.751.811 1.322 0 2.754-.446 4.256-1.313 5.31-3.066 9.631-10.522 9.631-16.615 0-1.927-.442-3.562-1.279-4.726a.235.235 0 0 1 .024-.301.232.232 0 0 1 .3-.027c1.67 1.172 2.59 3.38 2.59 6.219 0 6.242-4.425 13.987-9.865 17.127-1.573.908-3.083 1.481-4.488 1.481zM142.476 178c.814.651 1.82 1.002 2.969 1.002 1.322 0 2.753-.452 4.255-1.32 5.31-3.065 9.631-10.523 9.631-16.617 0-1.98-.463-3.63-1.325-4.793.411 1.035.624 2.26.624 3.62 0 6.242-4.425 13.875-9.865 17.015-1.573.909-3.084 1.376-4.489 1.376a5.49 5.49 0 0 1-1.8-.283z' fill='#607D8B'/><path d='M148.648 176.704c5.384-3.108 9.748-10.636 9.748-16.813 0-2.052-.483-3.693-1.322-4.861-1.785-1.252-4.375-1.194-7.258.471-5.383 3.108-9.748 10.636-9.748 16.813 0 2.051.484 3.692 1.323 4.86 1.785 1.253 4.374 1.195 7.257-.47' fill='#FAFAFA'/><path d='M144.276 178.276c-1.143 0-2.158-.307-3.019-.911a.217.217 0 0 1-.055-.054c-.895-1.244-1.367-2.972-1.367-4.997 0-6.241 4.425-13.875 9.865-17.016 1.573-.908 3.084-1.369 4.489-1.369 1.143 0 2.158.307 3.019.91a.24.24 0 0 1 .055.055c.894 1.244 1.367 2.971 1.367 4.997 0 6.241-4.425 13.875-9.865 17.016-1.573.908-3.084 1.369-4.489 1.369zm-2.718-1.172c.773.533 1.687.901 2.718.901 1.322 0 2.754-.538 4.256-1.405 5.31-3.066 9.631-10.567 9.631-16.661 0-1.908-.434-3.554-1.256-4.716-.774-.532-1.688-.814-2.718-.814-1.322 0-2.754.433-4.256 1.3-5.31 3.066-9.631 10.564-9.631 16.657 0 1.91.434 3.576 1.256 4.738z' fill='#607D8B'/><path d='M150.72 172.361l-.363-.295a24.105 24.105 0 0 0 2.148-3.128 24.05 24.05 0 0 0 1.977-4.375l.443.149a24.54 24.54 0 0 1-2.015 4.46 24.61 24.61 0 0 1-2.19 3.189M115.917 191.514l-.363-.294a24.174 24.174 0 0 0 2.148-3.128 24.038 24.038 0 0 0 1.976-4.375l.443.148a24.48 24.48 0 0 1-2.015 4.461 24.662 24.662 0 0 1-2.189 3.188M114 237.476V182.584 237.476' fill='#607D8B'/><g><path d='M81.822 37.474c.017-.135-.075-.28-.267-.392-.327-.188-.826-.21-1.109-.045l-6.012 3.471c-.131.076-.194.178-.191.285.002.132.002.461.002.578v.043l-.007.128-6.591 3.779c-.001 0-2.077 1.046-2.787 5.192 0 0-.912 6.961-.898 19.745.015 12.57.606 17.07 1.167 21.351.22 1.684 3.001 2.125 3.001 2.125.331.04.698-.027 1.08-.248l75.273-43.551c1.808-1.069 2.667-3.719 3.056-6.284 1.213-7.99 1.675-32.978-.275-39.878-.196-.693-.51-1.083-.868-1.282l-2.086-.79c-.727.028-1.416.467-1.534.535L82.032 37.072l-.21.402' fill='#FFF'/><path d='M144.311 1.701l2.085.79c.358.199.672.589.868 1.282 1.949 6.9 1.487 31.887.275 39.878-.39 2.565-1.249 5.215-3.056 6.284L69.21 93.486a1.78 1.78 0 0 1-.896.258l-.183-.011c0 .001-2.782-.44-3.003-2.124-.56-4.282-1.151-8.781-1.165-21.351-.015-12.784.897-19.745.897-19.745.71-4.146 2.787-5.192 2.787-5.192l6.591-3.779.007-.128v-.043c0-.117 0-.446-.002-.578-.003-.107.059-.21.191-.285l6.012-3.472a.98.98 0 0 1 .481-.11c.218 0 .449.053.627.156.193.112.285.258.268.392l.211-.402 60.744-34.836c.117-.068.806-.507 1.534-.535m0-.997l-.039.001c-.618.023-1.283.244-1.974.656l-.021.012-60.519 34.706a2.358 2.358 0 0 0-.831-.15c-.365 0-.704.084-.98.244l-6.012 3.471c-.442.255-.699.69-.689 1.166l.001.15-6.08 3.487c-.373.199-2.542 1.531-3.29 5.898l-.006.039c-.009.07-.92 7.173-.906 19.875.014 12.62.603 17.116 1.172 21.465l.002.015c.308 2.355 3.475 2.923 3.836 2.98l.034.004c.101.013.204.019.305.019a2.77 2.77 0 0 0 1.396-.392l75.273-43.552c1.811-1.071 2.999-3.423 3.542-6.997 1.186-7.814 1.734-33.096-.301-40.299-.253-.893-.704-1.527-1.343-1.882l-.132-.062-2.085-.789a.973.973 0 0 0-.353-.065' fill='#455A64'/><path d='M128.267 11.565l1.495.434-56.339 32.326' fill='#FFF'/><path d='M74.202 90.545a.5.5 0 0 1-.25-.931l18.437-10.645a.499.499 0 1 1 .499.864L74.451 90.478l-.249.067M75.764 42.654l-.108-.062.046-.171 5.135-2.964.17.045-.045.171-5.135 2.964-.063.017M70.52 90.375V46.421l.063-.036L137.84 7.554v43.954l-.062.036L70.52 90.375zm.25-43.811v43.38l66.821-38.579V7.985L70.77 46.564z' fill='#607D8B'/><path d='M86.986 83.182c-.23.149-.612.384-.849.523l-11.505 6.701c-.237.139-.206.252.068.252h.565c.275 0 .693-.113.93-.252L87.7 83.705c.237-.139.428-.253.425-.256a11.29 11.29 0 0 1-.006-.503c0-.274-.188-.377-.418-.227l-.715.463' fill='#607D8B'/><path d='M75.266 90.782H74.7c-.2 0-.316-.056-.346-.166-.03-.11.043-.217.215-.317l11.505-6.702c.236-.138.615-.371.844-.519l.715-.464a.488.488 0 0 1 .266-.089c.172 0 .345.13.345.421 0 .214.001.363.003.437l.006.004-.004.069c-.003.075-.003.075-.486.356l-11.505 6.702a2.282 2.282 0 0 1-.992.268zm-.6-.25l.034.001h.566c.252 0 .649-.108.866-.234l11.505-6.702c.168-.098.294-.173.361-.214-.004-.084-.004-.218-.004-.437l-.095-.171-.131.049-.714.463c-.232.15-.616.386-.854.525l-11.505 6.702-.029.018z' fill='#607D8B'/><path d='M75.266 89.871H74.7c-.2 0-.316-.056-.346-.166-.03-.11.043-.217.215-.317l11.505-6.702c.258-.151.694-.268.993-.268h.565c.2 0 .316.056.346.166.03.11-.043.217-.215.317l-11.505 6.702a2.282 2.282 0 0 1-.992.268zm-.6-.25l.034.001h.566c.252 0 .649-.107.866-.234l11.505-6.702.03-.018-.035-.001h-.565c-.252 0-.649.108-.867.234l-11.505 6.702-.029.018zM74.37 90.801v-1.247 1.247' fill='#607D8B'/><path d='M68.13 93.901c-.751-.093-1.314-.737-1.439-1.376-.831-4.238-1.151-8.782-1.165-21.352-.015-12.784.897-19.745.897-19.745.711-4.146 2.787-5.192 2.787-5.192l74.859-43.219c.223-.129 2.487-1.584 3.195.923 1.95 6.9 1.488 31.887.275 39.878-.389 2.565-1.248 5.215-3.056 6.283L69.21 93.653c-.382.221-.749.288-1.08.248 0 0-2.781-.441-3.001-2.125-.561-4.281-1.152-8.781-1.167-21.351-.014-12.784.898-19.745.898-19.745.71-4.146 2.787-5.191 2.787-5.191l6.598-3.81.871-.119 6.599-3.83.046-.461L68.13 93.901' fill='#FAFAFA'/><path d='M68.317 94.161l-.215-.013h-.001l-.244-.047c-.719-.156-2.772-.736-2.976-2.292-.568-4.34-1.154-8.813-1.168-21.384-.014-12.654.891-19.707.9-19.777.725-4.231 2.832-5.338 2.922-5.382l6.628-3.827.87-.119 6.446-3.742.034-.334a.248.248 0 0 1 .273-.223.248.248 0 0 1 .223.272l-.059.589-6.752 3.919-.87.118-6.556 3.785c-.031.016-1.99 1.068-2.666 5.018-.007.06-.908 7.086-.894 19.702.014 12.539.597 16.996 1.161 21.305.091.691.689 1.154 1.309 1.452a1.95 1.95 0 0 1-.236-.609c-.781-3.984-1.155-8.202-1.17-21.399-.014-12.653.891-19.707.9-19.777.725-4.231 2.832-5.337 2.922-5.382-.004.001 74.444-42.98 74.846-43.212l.028-.017c.904-.538 1.72-.688 2.36-.433.555.221.949.733 1.172 1.52 2.014 7.128 1.46 32.219.281 39.983-.507 3.341-1.575 5.515-3.175 6.462L69.335 93.869a2.023 2.023 0 0 1-1.018.292zm-.147-.507c.293.036.604-.037.915-.217l75.273-43.551c1.823-1.078 2.602-3.915 2.934-6.106 1.174-7.731 1.731-32.695-.268-39.772-.178-.631-.473-1.032-.876-1.192-.484-.193-1.166-.052-1.921.397l-.034.021-74.858 43.218c-.031.017-1.989 1.069-2.666 5.019-.007.059-.908 7.085-.894 19.702.015 13.155.386 17.351 1.161 21.303.09.461.476.983 1.037 1.139.114.025.185.037.196.039h.001z' fill='#455A64'/><path d='M69.317 68.982c.489-.281.885-.056.885.505 0 .56-.396 1.243-.885 1.525-.488.282-.884.057-.884-.504 0-.56.396-1.243.884-1.526' fill='#FFF'/><path d='M68.92 71.133c-.289 0-.487-.228-.487-.625 0-.56.396-1.243.884-1.526a.812.812 0 0 1 .397-.121c.289 0 .488.229.488.626 0 .56-.396 1.243-.885 1.525a.812.812 0 0 1-.397.121m.794-2.459a.976.976 0 0 0-.49.147c-.548.317-.978 1.058-.978 1.687 0 .486.271.812.674.812a.985.985 0 0 0 .491-.146c.548-.317.978-1.057.978-1.687 0-.486-.272-.813-.675-.813' fill='#8097A2'/><path d='M68.92 70.947c-.271 0-.299-.307-.299-.439 0-.491.361-1.116.79-1.363a.632.632 0 0 1 .303-.096c.272 0 .301.306.301.438 0 .491-.363 1.116-.791 1.364a.629.629 0 0 1-.304.096m.794-2.086a.812.812 0 0 0-.397.121c-.488.283-.884.966-.884 1.526 0 .397.198.625.487.625a.812.812 0 0 0 .397-.121c.489-.282.885-.965.885-1.525 0-.397-.199-.626-.488-.626' fill='#8097A2'/><path d='M69.444 85.35c.264-.152.477-.031.477.272 0 .303-.213.67-.477.822-.263.153-.477.031-.477-.271 0-.302.214-.671.477-.823' fill='#FFF'/><path d='M69.23 86.51c-.156 0-.263-.123-.263-.337 0-.302.214-.671.477-.823a.431.431 0 0 1 .214-.066c.156 0 .263.124.263.338 0 .303-.213.67-.477.822a.431.431 0 0 1-.214.066m.428-1.412c-.1 0-.203.029-.307.09-.32.185-.57.618-.57.985 0 .309.185.524.449.524a.63.63 0 0 0 .308-.09c.32-.185.57-.618.57-.985 0-.309-.185-.524-.45-.524' fill='#8097A2'/><path d='M69.23 86.322l-.076-.149c0-.235.179-.544.384-.661l.12-.041.076.151c0 .234-.179.542-.383.66l-.121.04m.428-1.038a.431.431 0 0 0-.214.066c-.263.152-.477.521-.477.823 0 .214.107.337.263.337a.431.431 0 0 0 .214-.066c.264-.152.477-.519.477-.822 0-.214-.107-.338-.263-.338' fill='#8097A2'/><path d='M139.278 7.769v43.667L72.208 90.16V46.493l67.07-38.724' fill='#455A64'/><path d='M72.083 90.375V46.421l.063-.036 67.257-38.831v43.954l-.062.036-67.258 38.831zm.25-43.811v43.38l66.821-38.579V7.985L72.333 46.564z' fill='#607D8B'/></g><path d='M125.737 88.647l-7.639 3.334V84l-11.459 4.713v8.269L99 100.315l13.369 3.646 13.368-15.314' fill='#455A64'/></g></svg>";
function RotateInstructions() {
  this.loadIcon_();
  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.top = 0;
  s.right = 0;
  s.bottom = 0;
  s.left = 0;
  s.backgroundColor = 'gray';
  s.fontFamily = 'sans-serif';
  s.zIndex = 1000000;
  var img = document.createElement('img');
  img.src = this.icon;
  var s = img.style;
  s.marginLeft = '25%';
  s.marginTop = '25%';
  s.width = '50%';
  overlay.appendChild(img);
  var text = document.createElement('div');
  var s = text.style;
  s.textAlign = 'center';
  s.fontSize = '16px';
  s.lineHeight = '24px';
  s.margin = '24px 25%';
  s.width = '50%';
  text.innerHTML = 'Place your phone into your Cardboard viewer.';
  overlay.appendChild(text);
  var snackbar = document.createElement('div');
  var s = snackbar.style;
  s.backgroundColor = '#CFD8DC';
  s.position = 'fixed';
  s.bottom = 0;
  s.width = '100%';
  s.height = '48px';
  s.padding = '14px 24px';
  s.boxSizing = 'border-box';
  s.color = '#656A6B';
  overlay.appendChild(snackbar);
  var snackbarText = document.createElement('div');
  snackbarText.style.float = 'left';
  snackbarText.innerHTML = 'No Cardboard viewer?';
  var snackbarButton = document.createElement('a');
  snackbarButton.href = 'https://www.google.com/get/cardboard/get-cardboard/';
  snackbarButton.innerHTML = 'get one';
  snackbarButton.target = '_blank';
  var s = snackbarButton.style;
  s.float = 'right';
  s.fontWeight = 600;
  s.textTransform = 'uppercase';
  s.borderLeft = '1px solid gray';
  s.paddingLeft = '24px';
  s.textDecoration = 'none';
  s.color = '#656A6B';
  snackbar.appendChild(snackbarText);
  snackbar.appendChild(snackbarButton);
  this.overlay = overlay;
  this.text = text;
  this.hide();
}
RotateInstructions.prototype.show = function (parent) {
  if (!parent && !this.overlay.parentElement) {
    document.body.appendChild(this.overlay);
  } else if (parent) {
    if (this.overlay.parentElement && this.overlay.parentElement != parent) this.overlay.parentElement.removeChild(this.overlay);
    parent.appendChild(this.overlay);
  }
  this.overlay.style.display = 'block';
  var img = this.overlay.querySelector('img');
  var s = img.style;
  if (isLandscapeMode()) {
    s.width = '20%';
    s.marginLeft = '40%';
    s.marginTop = '3%';
  } else {
    s.width = '50%';
    s.marginLeft = '25%';
    s.marginTop = '25%';
  }
};
RotateInstructions.prototype.hide = function () {
  this.overlay.style.display = 'none';
};
RotateInstructions.prototype.showTemporarily = function (ms, parent) {
  this.show(parent);
  this.timer = setTimeout(this.hide.bind(this), ms);
};
RotateInstructions.prototype.disableShowTemporarily = function () {
  clearTimeout(this.timer);
};
RotateInstructions.prototype.update = function () {
  this.disableShowTemporarily();
  if (!isLandscapeMode() && isMobile()) {
    this.show();
  } else {
    this.hide();
  }
};
RotateInstructions.prototype.loadIcon_ = function () {
  this.icon = dataUri('image/svg+xml', rotateInstructionsAsset);
};
var DEFAULT_VIEWER = 'CardboardV1';
var VIEWER_KEY = 'WEBVR_CARDBOARD_VIEWER';
var CLASS_NAME = 'webvr-polyfill-viewer-selector';
function ViewerSelector(defaultViewer) {
  try {
    this.selectedKey = localStorage.getItem(VIEWER_KEY);
  } catch (error) {
    console.error('Failed to load viewer profile: %s', error);
  }
  if (!this.selectedKey) {
    this.selectedKey = defaultViewer || DEFAULT_VIEWER;
  }
  this.dialog = this.createDialog_(DeviceInfo.Viewers);
  this.root = null;
  this.onChangeCallbacks_ = [];
}
ViewerSelector.prototype.show = function (root) {
  this.root = root;
  root.appendChild(this.dialog);
  var selected = this.dialog.querySelector('#' + this.selectedKey);
  selected.checked = true;
  this.dialog.style.display = 'block';
};
ViewerSelector.prototype.hide = function () {
  if (this.root && this.root.contains(this.dialog)) {
    this.root.removeChild(this.dialog);
  }
  this.dialog.style.display = 'none';
};
ViewerSelector.prototype.getCurrentViewer = function () {
  return DeviceInfo.Viewers[this.selectedKey];
};
ViewerSelector.prototype.getSelectedKey_ = function () {
  var input = this.dialog.querySelector('input[name=field]:checked');
  if (input) {
    return input.id;
  }
  return null;
};
ViewerSelector.prototype.onChange = function (cb) {
  this.onChangeCallbacks_.push(cb);
};
ViewerSelector.prototype.fireOnChange_ = function (viewer) {
  for (var i = 0; i < this.onChangeCallbacks_.length; i++) {
    this.onChangeCallbacks_[i](viewer);
  }
};
ViewerSelector.prototype.onSave_ = function () {
  this.selectedKey = this.getSelectedKey_();
  if (!this.selectedKey || !DeviceInfo.Viewers[this.selectedKey]) {
    console.error('ViewerSelector.onSave_: this should never happen!');
    return;
  }
  this.fireOnChange_(DeviceInfo.Viewers[this.selectedKey]);
  try {
    localStorage.setItem(VIEWER_KEY, this.selectedKey);
  } catch (error) {
    console.error('Failed to save viewer profile: %s', error);
  }
  this.hide();
};
ViewerSelector.prototype.createDialog_ = function (options) {
  var container = document.createElement('div');
  container.classList.add(CLASS_NAME);
  container.style.display = 'none';
  var overlay = document.createElement('div');
  var s = overlay.style;
  s.position = 'fixed';
  s.left = 0;
  s.top = 0;
  s.width = '100%';
  s.height = '100%';
  s.background = 'rgba(0, 0, 0, 0.3)';
  overlay.addEventListener('click', this.hide.bind(this));
  var width = 280;
  var dialog = document.createElement('div');
  var s = dialog.style;
  s.boxSizing = 'border-box';
  s.position = 'fixed';
  s.top = '24px';
  s.left = '50%';
  s.marginLeft = -width / 2 + 'px';
  s.width = width + 'px';
  s.padding = '24px';
  s.overflow = 'hidden';
  s.background = '#fafafa';
  s.fontFamily = "'Roboto', sans-serif";
  s.boxShadow = '0px 5px 20px #666';
  dialog.appendChild(this.createH1_('Select your viewer'));
  for (var id in options) {
    dialog.appendChild(this.createChoice_(id, options[id].label));
  }
  dialog.appendChild(this.createButton_('Save', this.onSave_.bind(this)));
  container.appendChild(overlay);
  container.appendChild(dialog);
  return container;
};
ViewerSelector.prototype.createH1_ = function (name) {
  var h1 = document.createElement('h1');
  var s = h1.style;
  s.color = 'black';
  s.fontSize = '20px';
  s.fontWeight = 'bold';
  s.marginTop = 0;
  s.marginBottom = '24px';
  h1.innerHTML = name;
  return h1;
};
ViewerSelector.prototype.createChoice_ = function (id, name) {
  var div = document.createElement('div');
  div.style.marginTop = '8px';
  div.style.color = 'black';
  var input = document.createElement('input');
  input.style.fontSize = '30px';
  input.setAttribute('id', id);
  input.setAttribute('type', 'radio');
  input.setAttribute('value', id);
  input.setAttribute('name', 'field');
  var label = document.createElement('label');
  label.style.marginLeft = '4px';
  label.setAttribute('for', id);
  label.innerHTML = name;
  div.appendChild(input);
  div.appendChild(label);
  return div;
};
ViewerSelector.prototype.createButton_ = function (label, onclick) {
  var button = document.createElement('button');
  button.innerHTML = label;
  var s = button.style;
  s.float = 'right';
  s.textTransform = 'uppercase';
  s.color = '#1094f7';
  s.fontSize = '14px';
  s.letterSpacing = 0;
  s.border = 0;
  s.background = 'none';
  s.marginTop = '16px';
  button.addEventListener('click', onclick);
  return button;
};
var commonjsGlobal$$1 = typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : {};
function unwrapExports$$1 (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}
function createCommonjsModule$$1(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}
var NoSleep = createCommonjsModule$$1(function (module, exports) {
(function webpackUniversalModuleDefinition(root, factory) {
	module.exports = factory();
})(commonjsGlobal$$1, function() {
return          (function(modules) {
         	var installedModules = {};
         	function __nested_webpack_require_185508__(moduleId) {
         		if(installedModules[moduleId]) {
         			return installedModules[moduleId].exports;
         		}
         		var module = installedModules[moduleId] = {
         			i: moduleId,
         			l: false,
         			exports: {}
         		};
         		modules[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_185508__);
         		module.l = true;
         		return module.exports;
         	}
         	__nested_webpack_require_185508__.m = modules;
         	__nested_webpack_require_185508__.c = installedModules;
         	__nested_webpack_require_185508__.d = function(exports, name, getter) {
         		if(!__nested_webpack_require_185508__.o(exports, name)) {
         			Object.defineProperty(exports, name, {
         				configurable: false,
         				enumerable: true,
         				get: getter
         			});
         		}
         	};
         	__nested_webpack_require_185508__.n = function(module) {
         		var getter = module && module.__esModule ?
         			function getDefault() { return module['default']; } :
         			function getModuleExports() { return module; };
         		__nested_webpack_require_185508__.d(getter, 'a', getter);
         		return getter;
         	};
         	__nested_webpack_require_185508__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
         	__nested_webpack_require_185508__.p = "";
         	return __nested_webpack_require_185508__(__nested_webpack_require_185508__.s = 0);
         })
         ([
      (function(module, exports, __nested_webpack_require_186988__) {
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var mediaFile = __nested_webpack_require_186988__(1);
var oldIOS = typeof navigator !== 'undefined' && parseFloat(('' + (/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ''])[1]).replace('undefined', '3_2').replace('_', '.').replace('_', '')) < 10 && !window.MSStream;
var NoSleep = function () {
  function NoSleep() {
    _classCallCheck(this, NoSleep);
    if (oldIOS) {
      this.noSleepTimer = null;
    } else {
      this.noSleepVideo = document.createElement('video');
      this.noSleepVideo.setAttribute('playsinline', '');
      this.noSleepVideo.setAttribute('src', mediaFile);
      this.noSleepVideo.addEventListener('timeupdate', function (e) {
        if (this.noSleepVideo.currentTime > 0.5) {
          this.noSleepVideo.currentTime = Math.random();
        }
      }.bind(this));
    }
  }
  _createClass(NoSleep, [{
    key: 'enable',
    value: function enable() {
      if (oldIOS) {
        this.disable();
        this.noSleepTimer = window.setInterval(function () {
          window.location.href = '/';
          window.setTimeout(window.stop, 0);
        }, 15000);
      } else {
        this.noSleepVideo.play();
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (oldIOS) {
        if (this.noSleepTimer) {
          window.clearInterval(this.noSleepTimer);
          this.noSleepTimer = null;
        }
      } else {
        this.noSleepVideo.pause();
      }
    }
  }]);
  return NoSleep;
}();
module.exports = NoSleep;
      }),
      (function(module, exports, __webpack_require__) {
module.exports = 'data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKBtZGF0AAAC8wYF///v3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9NiBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MSBrZXlpbnQ9MzAwIGtleWludF9taW49MzAgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0xMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IHZidl9tYXhyYXRlPTIwMDAwIHZidl9idWZzaXplPTI1MDAwIGNyZl9tYXg9MC4wIG5hbF9ocmQ9bm9uZSBmaWxsZXI9MCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAOWWIhAA3//p+C7v8tDDSTjf97w55i3SbRPO4ZY+hkjD5hbkAkL3zpJ6h/LR1CAABzgB1kqqzUorlhQAAAAxBmiQYhn/+qZYADLgAAAAJQZ5CQhX/AAj5IQADQGgcIQADQGgcAAAACQGeYUQn/wALKCEAA0BoHAAAAAkBnmNEJ/8ACykhAANAaBwhAANAaBwAAAANQZpoNExDP/6plgAMuSEAA0BoHAAAAAtBnoZFESwr/wAI+SEAA0BoHCEAA0BoHAAAAAkBnqVEJ/8ACykhAANAaBwAAAAJAZ6nRCf/AAsoIQADQGgcIQADQGgcAAAADUGarDRMQz/+qZYADLghAANAaBwAAAALQZ7KRRUsK/8ACPkhAANAaBwAAAAJAZ7pRCf/AAsoIQADQGgcIQADQGgcAAAACQGe60Qn/wALKCEAA0BoHAAAAA1BmvA0TEM//qmWAAy5IQADQGgcIQADQGgcAAAAC0GfDkUVLCv/AAj5IQADQGgcAAAACQGfLUQn/wALKSEAA0BoHCEAA0BoHAAAAAkBny9EJ/8ACyghAANAaBwAAAANQZs0NExDP/6plgAMuCEAA0BoHAAAAAtBn1JFFSwr/wAI+SEAA0BoHCEAA0BoHAAAAAkBn3FEJ/8ACyghAANAaBwAAAAJAZ9zRCf/AAsoIQADQGgcIQADQGgcAAAADUGbeDRMQz/+qZYADLkhAANAaBwAAAALQZ+WRRUsK/8ACPghAANAaBwhAANAaBwAAAAJAZ+1RCf/AAspIQADQGgcAAAACQGft0Qn/wALKSEAA0BoHCEAA0BoHAAAAA1Bm7w0TEM//qmWAAy4IQADQGgcAAAAC0Gf2kUVLCv/AAj5IQADQGgcAAAACQGf+UQn/wALKCEAA0BoHCEAA0BoHAAAAAkBn/tEJ/8ACykhAANAaBwAAAANQZvgNExDP/6plgAMuSEAA0BoHCEAA0BoHAAAAAtBnh5FFSwr/wAI+CEAA0BoHAAAAAkBnj1EJ/8ACyghAANAaBwhAANAaBwAAAAJAZ4/RCf/AAspIQADQGgcAAAADUGaJDRMQz/+qZYADLghAANAaBwAAAALQZ5CRRUsK/8ACPkhAANAaBwhAANAaBwAAAAJAZ5hRCf/AAsoIQADQGgcAAAACQGeY0Qn/wALKSEAA0BoHCEAA0BoHAAAAA1Bmmg0TEM//qmWAAy5IQADQGgcAAAAC0GehkUVLCv/AAj5IQADQGgcIQADQGgcAAAACQGepUQn/wALKSEAA0BoHAAAAAkBnqdEJ/8ACyghAANAaBwAAAANQZqsNExDP/6plgAMuCEAA0BoHCEAA0BoHAAAAAtBnspFFSwr/wAI+SEAA0BoHAAAAAkBnulEJ/8ACyghAANAaBwhAANAaBwAAAAJAZ7rRCf/AAsoIQADQGgcAAAADUGa8DRMQz/+qZYADLkhAANAaBwhAANAaBwAAAALQZ8ORRUsK/8ACPkhAANAaBwAAAAJAZ8tRCf/AAspIQADQGgcIQADQGgcAAAACQGfL0Qn/wALKCEAA0BoHAAAAA1BmzQ0TEM//qmWAAy4IQADQGgcAAAAC0GfUkUVLCv/AAj5IQADQGgcIQADQGgcAAAACQGfcUQn/wALKCEAA0BoHAAAAAkBn3NEJ/8ACyghAANAaBwhAANAaBwAAAANQZt4NExC//6plgAMuSEAA0BoHAAAAAtBn5ZFFSwr/wAI+CEAA0BoHCEAA0BoHAAAAAkBn7VEJ/8ACykhAANAaBwAAAAJAZ+3RCf/AAspIQADQGgcAAAADUGbuzRMQn/+nhAAYsAhAANAaBwhAANAaBwAAAAJQZ/aQhP/AAspIQADQGgcAAAACQGf+UQn/wALKCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHCEAA0BoHAAACiFtb292AAAAbG12aGQAAAAA1YCCX9WAgl8AAAPoAAAH/AABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAGGlvZHMAAAAAEICAgAcAT////v7/AAAF+XRyYWsAAABcdGtoZAAAAAPVgIJf1YCCXwAAAAEAAAAAAAAH0AAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAygAAAMoAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAB9AAABdwAAEAAAAABXFtZGlhAAAAIG1kaGQAAAAA1YCCX9WAgl8AAV+QAAK/IFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAUcbWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAE3HN0YmwAAACYc3RzZAAAAAAAAAABAAAAiGF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAygDKAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAyYXZjQwFNQCj/4QAbZ01AKOyho3ySTUBAQFAAAAMAEAAr8gDxgxlgAQAEaO+G8gAAABhzdHRzAAAAAAAAAAEAAAA8AAALuAAAABRzdHNzAAAAAAAAAAEAAAABAAAB8GN0dHMAAAAAAAAAPAAAAAEAABdwAAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAADqYAAAAAQAAF3AAAAABAAAAAAAAAAEAAAu4AAAAAQAAOpgAAAABAAAXcAAAAAEAAAAAAAAAAQAAC7gAAAABAAA6mAAAAAEAABdwAAAAAQAAAAAAAAABAAALuAAAAAEAAC7gAAAAAQAAF3AAAAABAAAAAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAEEc3RzegAAAAAAAAAAAAAAPAAAAzQAAAAQAAAADQAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAAPAAAADQAAAA0AAAARAAAADwAAAA0AAAANAAAAEQAAAA8AAAANAAAADQAAABEAAAANAAAADQAAAQBzdGNvAAAAAAAAADwAAAAwAAADZAAAA3QAAAONAAADoAAAA7kAAAPQAAAD6wAAA/4AAAQXAAAELgAABEMAAARcAAAEbwAABIwAAAShAAAEugAABM0AAATkAAAE/wAABRIAAAUrAAAFQgAABV0AAAVwAAAFiQAABaAAAAW1AAAFzgAABeEAAAX+AAAGEwAABiwAAAY/AAAGVgAABnEAAAaEAAAGnQAABrQAAAbPAAAG4gAABvUAAAcSAAAHJwAAB0AAAAdTAAAHcAAAB4UAAAeeAAAHsQAAB8gAAAfjAAAH9gAACA8AAAgmAAAIQQAACFQAAAhnAAAIhAAACJcAAAMsdHJhawAAAFx0a2hkAAAAA9WAgl/VgIJfAAAAAgAAAAAAAAf8AAAAAAAAAAAAAAABAQAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAACsm1kaWEAAAAgbWRoZAAAAADVgIJf1YCCXwAArEQAAWAAVcQAAAAAACdoZGxyAAAAAAAAAABzb3VuAAAAAAAAAAAAAAAAU3RlcmVvAAAAAmNtaW5mAAAAEHNtaGQAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAidzdGJsAAAAZ3N0c2QAAAAAAAAAAQAAAFdtcDRhAAAAAAAAAAEAAAAAAAAAAAACABAAAAAArEQAAAAAADNlc2RzAAAAAAOAgIAiAAIABICAgBRAFQAAAAADDUAAAAAABYCAgAISEAaAgIABAgAAABhzdHRzAAAAAAAAAAEAAABYAAAEAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAAGAAAAWAAAAXBzdGNvAAAAAAAAAFgAAAOBAAADhwAAA5oAAAOtAAADswAAA8oAAAPfAAAD5QAAA/gAAAQLAAAEEQAABCgAAAQ9AAAEUAAABFYAAARpAAAEgAAABIYAAASbAAAErgAABLQAAATHAAAE3gAABPMAAAT5AAAFDAAABR8AAAUlAAAFPAAABVEAAAVXAAAFagAABX0AAAWDAAAFmgAABa8AAAXCAAAFyAAABdsAAAXyAAAF+AAABg0AAAYgAAAGJgAABjkAAAZQAAAGZQAABmsAAAZ+AAAGkQAABpcAAAauAAAGwwAABskAAAbcAAAG7wAABwYAAAcMAAAHIQAABzQAAAc6AAAHTQAAB2QAAAdqAAAHfwAAB5IAAAeYAAAHqwAAB8IAAAfXAAAH3QAAB/AAAAgDAAAICQAACCAAAAg1AAAIOwAACE4AAAhhAAAIeAAACH4AAAiRAAAIpAAACKoAAAiwAAAItgAACLwAAAjCAAAAFnVkdGEAAAAObmFtZVN0ZXJlbwAAAHB1ZHRhAAAAaG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAO2lsc3QAAAAzqXRvbwAAACtkYXRhAAAAAQAAAABIYW5kQnJha2UgMC4xMC4yIDIwMTUwNjExMDA=';
      })
         ]);
});
});
var NoSleep$1 = unwrapExports$$1(NoSleep);
var nextDisplayId = 1000;
var defaultLeftBounds = [0, 0, 0.5, 1];
var defaultRightBounds = [0.5, 0, 0.5, 1];
var raf = window.requestAnimationFrame;
var caf = window.cancelAnimationFrame;
function VRFrameData() {
  this.leftProjectionMatrix = new Float32Array(16);
  this.leftViewMatrix = new Float32Array(16);
  this.rightProjectionMatrix = new Float32Array(16);
  this.rightViewMatrix = new Float32Array(16);
  this.pose = null;
}
function VRDisplayCapabilities(config) {
  Object.defineProperties(this, {
    hasPosition: {
      writable: false, enumerable: true, value: config.hasPosition
    },
    hasExternalDisplay: {
      writable: false, enumerable: true, value: config.hasExternalDisplay
    },
    canPresent: {
      writable: false, enumerable: true, value: config.canPresent
    },
    maxLayers: {
      writable: false, enumerable: true, value: config.maxLayers
    },
    hasOrientation: {
      enumerable: true, get: function get() {
        deprecateWarning('VRDisplayCapabilities.prototype.hasOrientation', 'VRDisplay.prototype.getFrameData');
        return config.hasOrientation;
      }
    }
  });
}
function VRDisplay(config) {
  config = config || {};
  var USE_WAKELOCK = 'wakelock' in config ? config.wakelock : true;
  this.isPolyfilled = true;
  this.displayId = nextDisplayId++;
  this.displayName = '';
  this.depthNear = 0.01;
  this.depthFar = 10000.0;
  this.isPresenting = false;
  Object.defineProperty(this, 'isConnected', {
    get: function get() {
      deprecateWarning('VRDisplay.prototype.isConnected', 'VRDisplayCapabilities.prototype.hasExternalDisplay');
      return false;
    }
  });
  this.capabilities = new VRDisplayCapabilities({
    hasPosition: false,
    hasOrientation: false,
    hasExternalDisplay: false,
    canPresent: false,
    maxLayers: 1
  });
  this.stageParameters = null;
  this.waitingForPresent_ = false;
  this.layer_ = null;
  this.originalParent_ = null;
  this.fullscreenElement_ = null;
  this.fullscreenWrapper_ = null;
  this.fullscreenElementCachedStyle_ = null;
  this.fullscreenEventTarget_ = null;
  this.fullscreenChangeHandler_ = null;
  this.fullscreenErrorHandler_ = null;
  if (USE_WAKELOCK && isMobile()) {
    this.wakelock_ = new NoSleep$1();
  }
}
VRDisplay.prototype.getFrameData = function (frameData) {
  return frameDataFromPose(frameData, this._getPose(), this);
};
VRDisplay.prototype.getPose = function () {
  deprecateWarning('VRDisplay.prototype.getPose', 'VRDisplay.prototype.getFrameData');
  return this._getPose();
};
VRDisplay.prototype.resetPose = function () {
  deprecateWarning('VRDisplay.prototype.resetPose');
  return this._resetPose();
};
VRDisplay.prototype.getImmediatePose = function () {
  deprecateWarning('VRDisplay.prototype.getImmediatePose', 'VRDisplay.prototype.getFrameData');
  return this._getPose();
};
VRDisplay.prototype.requestAnimationFrame = function (callback) {
  return raf(callback);
};
VRDisplay.prototype.cancelAnimationFrame = function (id) {
  return caf(id);
};
VRDisplay.prototype.wrapForFullscreen = function (element) {
  if (isIOS()) {
    return element;
  }
  if (!this.fullscreenWrapper_) {
    this.fullscreenWrapper_ = document.createElement('div');
    var cssProperties = ['height: ' + Math.min(screen.height, screen.width) + 'px !important', 'top: 0 !important', 'left: 0 !important', 'right: 0 !important', 'border: 0', 'margin: 0', 'padding: 0', 'z-index: 999999 !important', 'position: fixed'];
    this.fullscreenWrapper_.setAttribute('style', cssProperties.join('; ') + ';');
    this.fullscreenWrapper_.classList.add('webvr-polyfill-fullscreen-wrapper');
  }
  if (this.fullscreenElement_ == element) {
    return this.fullscreenWrapper_;
  }
  if (this.fullscreenElement_) {
    if (this.originalParent_) {
      this.originalParent_.appendChild(this.fullscreenElement_);
    } else {
      this.fullscreenElement_.parentElement.removeChild(this.fullscreenElement_);
    }
  }
  this.fullscreenElement_ = element;
  this.originalParent_ = element.parentElement;
  if (!this.originalParent_) {
    document.body.appendChild(element);
  }
  if (!this.fullscreenWrapper_.parentElement) {
    var parent = this.fullscreenElement_.parentElement;
    parent.insertBefore(this.fullscreenWrapper_, this.fullscreenElement_);
    parent.removeChild(this.fullscreenElement_);
  }
  this.fullscreenWrapper_.insertBefore(this.fullscreenElement_, this.fullscreenWrapper_.firstChild);
  this.fullscreenElementCachedStyle_ = this.fullscreenElement_.getAttribute('style');
  var self = this;
  function applyFullscreenElementStyle() {
    if (!self.fullscreenElement_) {
      return;
    }
    var cssProperties = ['position: absolute', 'top: 0', 'left: 0', 'width: ' + Math.max(screen.width, screen.height) + 'px', 'height: ' + Math.min(screen.height, screen.width) + 'px', 'border: 0', 'margin: 0', 'padding: 0'];
    self.fullscreenElement_.setAttribute('style', cssProperties.join('; ') + ';');
  }
  applyFullscreenElementStyle();
  return this.fullscreenWrapper_;
};
VRDisplay.prototype.removeFullscreenWrapper = function () {
  if (!this.fullscreenElement_) {
    return;
  }
  var element = this.fullscreenElement_;
  if (this.fullscreenElementCachedStyle_) {
    element.setAttribute('style', this.fullscreenElementCachedStyle_);
  } else {
    element.removeAttribute('style');
  }
  this.fullscreenElement_ = null;
  this.fullscreenElementCachedStyle_ = null;
  var parent = this.fullscreenWrapper_.parentElement;
  this.fullscreenWrapper_.removeChild(element);
  if (this.originalParent_ === parent) {
    parent.insertBefore(element, this.fullscreenWrapper_);
  }
  else if (this.originalParent_) {
      this.originalParent_.appendChild(element);
    }
  parent.removeChild(this.fullscreenWrapper_);
  return element;
};
VRDisplay.prototype.requestPresent = function (layers) {
  var wasPresenting = this.isPresenting;
  var self = this;
  if (!(layers instanceof Array)) {
    deprecateWarning('VRDisplay.prototype.requestPresent with non-array argument', 'an array of VRLayers as the first argument');
    layers = [layers];
  }
  return new Promise(function (resolve, reject) {
    if (!self.capabilities.canPresent) {
      reject(new Error('VRDisplay is not capable of presenting.'));
      return;
    }
    if (layers.length == 0 || layers.length > self.capabilities.maxLayers) {
      reject(new Error('Invalid number of layers.'));
      return;
    }
    var incomingLayer = layers[0];
    if (!incomingLayer.source) {
      resolve();
      return;
    }
    var leftBounds = incomingLayer.leftBounds || defaultLeftBounds;
    var rightBounds = incomingLayer.rightBounds || defaultRightBounds;
    if (wasPresenting) {
      var layer = self.layer_;
      if (layer.source !== incomingLayer.source) {
        layer.source = incomingLayer.source;
      }
      for (var i = 0; i < 4; i++) {
        layer.leftBounds[i] = leftBounds[i];
        layer.rightBounds[i] = rightBounds[i];
      }
      self.wrapForFullscreen(self.layer_.source);
      self.updatePresent_();
      resolve();
      return;
    }
    self.layer_ = {
      predistorted: incomingLayer.predistorted,
      source: incomingLayer.source,
      leftBounds: leftBounds.slice(0),
      rightBounds: rightBounds.slice(0)
    };
    self.waitingForPresent_ = false;
    if (self.layer_ && self.layer_.source) {
      var fullscreenElement = self.wrapForFullscreen(self.layer_.source);
      var onFullscreenChange = function onFullscreenChange() {
        var actualFullscreenElement = getFullscreenElement();
        self.isPresenting = fullscreenElement === actualFullscreenElement;
        if (self.isPresenting) {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape-primary').catch(function (error) {
              console.error('screen.orientation.lock() failed due to', error.message);
            });
          }
          self.waitingForPresent_ = false;
          self.beginPresent_();
          resolve();
        } else {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          self.removeFullscreenWrapper();
          self.disableWakeLock();
          self.endPresent_();
          self.removeFullscreenListeners_();
        }
        self.fireVRDisplayPresentChange_();
      };
      var onFullscreenError = function onFullscreenError() {
        if (!self.waitingForPresent_) {
          return;
        }
        self.removeFullscreenWrapper();
        self.removeFullscreenListeners_();
        self.disableWakeLock();
        self.waitingForPresent_ = false;
        self.isPresenting = false;
        reject(new Error('Unable to present.'));
      };
      self.addFullscreenListeners_(fullscreenElement, onFullscreenChange, onFullscreenError);
      if (requestFullscreen(fullscreenElement)) {
        self.enableWakeLock();
        self.waitingForPresent_ = true;
      } else if (isIOS() || isWebViewAndroid()) {
        self.enableWakeLock();
        self.isPresenting = true;
        self.beginPresent_();
        self.fireVRDisplayPresentChange_();
        resolve();
      }
    }
    if (!self.waitingForPresent_ && !isIOS()) {
      exitFullscreen();
      reject(new Error('Unable to present.'));
    }
  });
};
VRDisplay.prototype.exitPresent = function () {
  var wasPresenting = this.isPresenting;
  var self = this;
  this.isPresenting = false;
  this.layer_ = null;
  this.disableWakeLock();
  return new Promise(function (resolve, reject) {
    if (wasPresenting) {
      if (!exitFullscreen() && isIOS()) {
        self.endPresent_();
        self.fireVRDisplayPresentChange_();
      }
      if (isWebViewAndroid()) {
        self.removeFullscreenWrapper();
        self.removeFullscreenListeners_();
        self.endPresent_();
        self.fireVRDisplayPresentChange_();
      }
      resolve();
    } else {
      reject(new Error('Was not presenting to VRDisplay.'));
    }
  });
};
VRDisplay.prototype.getLayers = function () {
  if (this.layer_) {
    return [this.layer_];
  }
  return [];
};
VRDisplay.prototype.fireVRDisplayPresentChange_ = function () {
  var event = new CustomEvent('vrdisplaypresentchange', { detail: { display: this } });
  window.dispatchEvent(event);
};
VRDisplay.prototype.fireVRDisplayConnect_ = function () {
  var event = new CustomEvent('vrdisplayconnect', { detail: { display: this } });
  window.dispatchEvent(event);
};
VRDisplay.prototype.addFullscreenListeners_ = function (element, changeHandler, errorHandler) {
  this.removeFullscreenListeners_();
  this.fullscreenEventTarget_ = element;
  this.fullscreenChangeHandler_ = changeHandler;
  this.fullscreenErrorHandler_ = errorHandler;
  if (changeHandler) {
    if (document.fullscreenEnabled) {
      element.addEventListener('fullscreenchange', changeHandler, false);
    } else if (document.webkitFullscreenEnabled) {
      element.addEventListener('webkitfullscreenchange', changeHandler, false);
    } else if (document.mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenchange', changeHandler, false);
    } else if (document.msFullscreenEnabled) {
      element.addEventListener('msfullscreenchange', changeHandler, false);
    }
  }
  if (errorHandler) {
    if (document.fullscreenEnabled) {
      element.addEventListener('fullscreenerror', errorHandler, false);
    } else if (document.webkitFullscreenEnabled) {
      element.addEventListener('webkitfullscreenerror', errorHandler, false);
    } else if (document.mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenerror', errorHandler, false);
    } else if (document.msFullscreenEnabled) {
      element.addEventListener('msfullscreenerror', errorHandler, false);
    }
  }
};
VRDisplay.prototype.removeFullscreenListeners_ = function () {
  if (!this.fullscreenEventTarget_) return;
  var element = this.fullscreenEventTarget_;
  if (this.fullscreenChangeHandler_) {
    var changeHandler = this.fullscreenChangeHandler_;
    element.removeEventListener('fullscreenchange', changeHandler, false);
    element.removeEventListener('webkitfullscreenchange', changeHandler, false);
    document.removeEventListener('mozfullscreenchange', changeHandler, false);
    element.removeEventListener('msfullscreenchange', changeHandler, false);
  }
  if (this.fullscreenErrorHandler_) {
    var errorHandler = this.fullscreenErrorHandler_;
    element.removeEventListener('fullscreenerror', errorHandler, false);
    element.removeEventListener('webkitfullscreenerror', errorHandler, false);
    document.removeEventListener('mozfullscreenerror', errorHandler, false);
    element.removeEventListener('msfullscreenerror', errorHandler, false);
  }
  this.fullscreenEventTarget_ = null;
  this.fullscreenChangeHandler_ = null;
  this.fullscreenErrorHandler_ = null;
};
VRDisplay.prototype.enableWakeLock = function () {
  if (this.wakelock_) {
    this.wakelock_.enable();
  }
};
VRDisplay.prototype.disableWakeLock = function () {
  if (this.wakelock_) {
    this.wakelock_.disable();
  }
};
VRDisplay.prototype.beginPresent_ = function () {
};
VRDisplay.prototype.endPresent_ = function () {
};
VRDisplay.prototype.submitFrame = function (pose) {
};
VRDisplay.prototype.getEyeParameters = function (whichEye) {
  return null;
};
var config = {
  ADDITIONAL_VIEWERS: [],
  DEFAULT_VIEWER: '',
  MOBILE_WAKE_LOCK: true,
  DEBUG: false,
  DPDB_URL: 'https://dpdb.webvr.rocks/dpdb.json',
  K_FILTER: 0.98,
  PREDICTION_TIME_S: 0.040,
  CARDBOARD_UI_DISABLED: false,
  ROTATE_INSTRUCTIONS_DISABLED: false,
  YAW_ONLY: false,
  BUFFER_SCALE: 0.5,
  DIRTY_SUBMIT_FRAME_BINDINGS: false
};
var Eye = {
  LEFT: 'left',
  RIGHT: 'right'
};
function CardboardVRDisplay(config$$1) {
  var defaults = extend({}, config);
  config$$1 = extend(defaults, config$$1 || {});
  VRDisplay.call(this, {
    wakelock: config$$1.MOBILE_WAKE_LOCK
  });
  this.config = config$$1;
  this.displayName = 'Cardboard VRDisplay';
  this.capabilities = new VRDisplayCapabilities({
    hasPosition: false,
    hasOrientation: true,
    hasExternalDisplay: false,
    canPresent: true,
    maxLayers: 1
  });
  this.stageParameters = null;
  this.bufferScale_ = this.config.BUFFER_SCALE;
  this.poseSensor_ = new PoseSensor(this.config);
  this.distorter_ = null;
  this.cardboardUI_ = null;
  this.dpdb_ = new Dpdb(this.config.DPDB_URL, this.onDeviceParamsUpdated_.bind(this));
  this.deviceInfo_ = new DeviceInfo(this.dpdb_.getDeviceParams(), config$$1.ADDITIONAL_VIEWERS);
  this.viewerSelector_ = new ViewerSelector(config$$1.DEFAULT_VIEWER);
  this.viewerSelector_.onChange(this.onViewerChanged_.bind(this));
  this.deviceInfo_.setViewer(this.viewerSelector_.getCurrentViewer());
  if (!this.config.ROTATE_INSTRUCTIONS_DISABLED) {
    this.rotateInstructions_ = new RotateInstructions();
  }
  if (isIOS()) {
    window.addEventListener('resize', this.onResize_.bind(this));
  }
}
CardboardVRDisplay.prototype = Object.create(VRDisplay.prototype);
CardboardVRDisplay.prototype._getPose = function () {
  return {
    position: null,
    orientation: this.poseSensor_.getOrientation(),
    linearVelocity: null,
    linearAcceleration: null,
    angularVelocity: null,
    angularAcceleration: null
  };
};
CardboardVRDisplay.prototype._resetPose = function () {
  if (this.poseSensor_.resetPose) {
    this.poseSensor_.resetPose();
  }
};
CardboardVRDisplay.prototype._getFieldOfView = function (whichEye) {
  var fieldOfView;
  if (whichEye == Eye.LEFT) {
    fieldOfView = this.deviceInfo_.getFieldOfViewLeftEye();
  } else if (whichEye == Eye.RIGHT) {
    fieldOfView = this.deviceInfo_.getFieldOfViewRightEye();
  } else {
    console.error('Invalid eye provided: %s', whichEye);
    return null;
  }
  return fieldOfView;
};
CardboardVRDisplay.prototype._getEyeOffset = function (whichEye) {
  var offset;
  if (whichEye == Eye.LEFT) {
    offset = [-this.deviceInfo_.viewer.interLensDistance * 0.5, 0.0, 0.0];
  } else if (whichEye == Eye.RIGHT) {
    offset = [this.deviceInfo_.viewer.interLensDistance * 0.5, 0.0, 0.0];
  } else {
    console.error('Invalid eye provided: %s', whichEye);
    return null;
  }
  return offset;
};
CardboardVRDisplay.prototype.getEyeParameters = function (whichEye) {
  var offset = this._getEyeOffset(whichEye);
  var fieldOfView = this._getFieldOfView(whichEye);
  var eyeParams = {
    offset: offset,
    renderWidth: this.deviceInfo_.device.width * 0.5 * this.bufferScale_,
    renderHeight: this.deviceInfo_.device.height * this.bufferScale_
  };
  Object.defineProperty(eyeParams, 'fieldOfView', {
    enumerable: true,
    get: function get() {
      deprecateWarning('VRFieldOfView', 'VRFrameData\'s projection matrices');
      return fieldOfView;
    }
  });
  return eyeParams;
};
CardboardVRDisplay.prototype.onDeviceParamsUpdated_ = function (newParams) {
  if (this.config.DEBUG) {
    console.log('DPDB reported that device params were updated.');
  }
  this.deviceInfo_.updateDeviceParams(newParams);
  if (this.distorter_) {
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }
};
CardboardVRDisplay.prototype.updateBounds_ = function () {
  if (this.layer_ && this.distorter_ && (this.layer_.leftBounds || this.layer_.rightBounds)) {
    this.distorter_.setTextureBounds(this.layer_.leftBounds, this.layer_.rightBounds);
  }
};
CardboardVRDisplay.prototype.beginPresent_ = function () {
  var gl = this.layer_.source.getContext('webgl');
  if (!gl) gl = this.layer_.source.getContext('experimental-webgl');
  if (!gl) gl = this.layer_.source.getContext('webgl2');
  if (!gl) return;
  if (this.layer_.predistorted) {
    if (!this.config.CARDBOARD_UI_DISABLED) {
      gl.canvas.width = getScreenWidth() * this.bufferScale_;
      gl.canvas.height = getScreenHeight() * this.bufferScale_;
      this.cardboardUI_ = new CardboardUI(gl);
    }
  } else {
    if (!this.config.CARDBOARD_UI_DISABLED) {
      this.cardboardUI_ = new CardboardUI(gl);
    }
    this.distorter_ = new CardboardDistorter(gl, this.cardboardUI_, this.config.BUFFER_SCALE, this.config.DIRTY_SUBMIT_FRAME_BINDINGS);
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }
  if (this.cardboardUI_) {
    this.cardboardUI_.listen(function (e) {
      this.viewerSelector_.show(this.layer_.source.parentElement);
      e.stopPropagation();
      e.preventDefault();
    }.bind(this), function (e) {
      this.exitPresent();
      e.stopPropagation();
      e.preventDefault();
    }.bind(this));
  }
  if (this.rotateInstructions_) {
    if (isLandscapeMode() && isMobile()) {
      this.rotateInstructions_.showTemporarily(3000, this.layer_.source.parentElement);
    } else {
      this.rotateInstructions_.update();
    }
  }
  this.orientationHandler = this.onOrientationChange_.bind(this);
  window.addEventListener('orientationchange', this.orientationHandler);
  this.vrdisplaypresentchangeHandler = this.updateBounds_.bind(this);
  window.addEventListener('vrdisplaypresentchange', this.vrdisplaypresentchangeHandler);
  this.fireVRDisplayDeviceParamsChange_();
};
CardboardVRDisplay.prototype.endPresent_ = function () {
  if (this.distorter_) {
    this.distorter_.destroy();
    this.distorter_ = null;
  }
  if (this.cardboardUI_) {
    this.cardboardUI_.destroy();
    this.cardboardUI_ = null;
  }
  if (this.rotateInstructions_) {
    this.rotateInstructions_.hide();
  }
  this.viewerSelector_.hide();
  window.removeEventListener('orientationchange', this.orientationHandler);
  window.removeEventListener('vrdisplaypresentchange', this.vrdisplaypresentchangeHandler);
};
CardboardVRDisplay.prototype.updatePresent_ = function () {
  this.endPresent_();
  this.beginPresent_();
};
CardboardVRDisplay.prototype.submitFrame = function (pose) {
  if (this.distorter_) {
    this.updateBounds_();
    this.distorter_.submitFrame();
  } else if (this.cardboardUI_ && this.layer_) {
    var gl = this.layer_.source.getContext('webgl');
    if (!gl) gl = this.layer_.source.getContext('experimental-webgl');
    if (!gl) gl = this.layer_.source.getContext('webgl2');
    var canvas = gl.canvas;
    if (canvas.width != this.lastWidth || canvas.height != this.lastHeight) {
      this.cardboardUI_.onResize();
    }
    this.lastWidth = canvas.width;
    this.lastHeight = canvas.height;
    this.cardboardUI_.render();
  }
};
CardboardVRDisplay.prototype.onOrientationChange_ = function (e) {
  this.viewerSelector_.hide();
  if (this.rotateInstructions_) {
    this.rotateInstructions_.update();
  }
  this.onResize_();
};
CardboardVRDisplay.prototype.onResize_ = function (e) {
  if (this.layer_) {
    var gl = this.layer_.source.getContext('webgl');
    if (!gl) gl = this.layer_.source.getContext('experimental-webgl');
    if (!gl) gl = this.layer_.source.getContext('webgl2');
    var cssProperties = ['position: absolute', 'top: 0', 'left: 0',
    'width: 100vw', 'height: 100vh', 'border: 0', 'margin: 0',
    'padding: 0px', 'box-sizing: content-box'];
    gl.canvas.setAttribute('style', cssProperties.join('; ') + ';');
    safariCssSizeWorkaround(gl.canvas);
  }
};
CardboardVRDisplay.prototype.onViewerChanged_ = function (viewer) {
  this.deviceInfo_.setViewer(viewer);
  if (this.distorter_) {
    this.distorter_.updateDeviceInfo(this.deviceInfo_);
  }
  this.fireVRDisplayDeviceParamsChange_();
};
CardboardVRDisplay.prototype.fireVRDisplayDeviceParamsChange_ = function () {
  var event = new CustomEvent('vrdisplaydeviceparamschange', {
    detail: {
      vrdisplay: this,
      deviceInfo: this.deviceInfo_
    }
  });
  window.dispatchEvent(event);
};
CardboardVRDisplay.VRFrameData = VRFrameData;
CardboardVRDisplay.VRDisplay = VRDisplay;
return CardboardVRDisplay;
})));
});
var CardboardVRDisplay = unwrapExports(cardboardVrDisplay);

class XRDevice extends EventTarget {
  constructor(global) {
    super();
    this.global = global;
    this.onWindowResize = this.onWindowResize.bind(this);
    this.global.window.addEventListener('resize', this.onWindowResize);
    this.environmentBlendMode = 'opaque';
  }
  onBaseLayerSet(sessionId, layer) { throw new Error('Not implemented'); }
  isSessionSupported(mode) { throw new Error('Not implemented'); }
  isFeatureSupported(featureDescriptor) { throw new Error('Not implemented'); }
  async requestSession(mode, enabledFeatures) { throw new Error('Not implemented'); }
  requestAnimationFrame(callback) { throw new Error('Not implemented'); }
  onFrameStart(sessionId) { throw new Error('Not implemented'); }
  onFrameEnd(sessionId) { throw new Error('Not implemented'); }
  doesSessionSupportReferenceSpace(sessionId, type) { throw new Error('Not implemented'); }
  requestStageBounds() { throw new Error('Not implemented'); }
  async requestFrameOfReferenceTransform(type, options) {
    return undefined;
  }
  cancelAnimationFrame(handle) { throw new Error('Not implemented'); }
  endSession(sessionId) { throw new Error('Not implemented'); }
  getViewport(sessionId, eye, layer, target) { throw new Error('Not implemented'); }
  getProjectionMatrix(eye) { throw new Error('Not implemented'); }
  getBasePoseMatrix() { throw new Error('Not implemented'); }
  getBaseViewMatrix(eye) { throw new Error('Not implemented'); }
  getInputSources() { throw new Error('Not implemented'); }
  getInputPose(inputSource, coordinateSystem, poseType) { throw new Error('Not implemented'); }
  onWindowResize() {
    this.onWindowResize();
  }
}

let daydream = {
  mapping: '',
  profiles: ['google-daydream', 'generic-trigger-touchpad'],
  buttons: {
    length: 3,
    0: null,
    1: null,
    2: 0
  },
};
let viveFocus = {
  mapping: 'xr-standard',
  profiles: ['htc-vive-focus', 'generic-trigger-touchpad'],
  buttons: {
    length: 3,
    0: 1,
    1: null,
    2: 0
  },
};
let oculusGo = {
  mapping: 'xr-standard',
  profiles: ['oculus-go', 'generic-trigger-touchpad'],
  buttons: {
    length: 3,
    0: 1,
    1: null,
    2: 0
  },
  gripTransform: {
    orientation: [Math.PI * 0.11, 0, 0, 1]
  }
};
let oculusTouch = {
  mapping: 'xr-standard',
  displayProfiles: {
    'Oculus Quest': ['oculus-touch-v2', 'oculus-touch', 'generic-trigger-squeeze-thumbstick']
  },
  profiles: ['oculus-touch', 'generic-trigger-squeeze-thumbstick'],
  axes: {
    length: 4,
    0: null,
    1: null,
    2: 0,
    3: 1
  },
  buttons: {
    length: 7,
    0: 1,
    1: 2,
    2: null,
    3: 0,
    4: 3,
    5: 4,
    6: null
  },
  gripTransform: {
    position: [0, -0.02, 0.04, 1],
    orientation: [Math.PI * 0.11, 0, 0, 1]
  }
};
let openVr = {
  mapping: 'xr-standard',
  profiles: ['htc-vive', 'generic-trigger-squeeze-touchpad'],
  displayProfiles: {
    'HTC Vive': ['htc-vive', 'generic-trigger-squeeze-touchpad'],
    'HTC Vive DVT': ['htc-vive', 'generic-trigger-squeeze-touchpad'],
    'Valve Index': ['valve-index', 'generic-trigger-squeeze-touchpad-thumbstick']
  },
  buttons: {
    length: 3,
    0: 1,
    1: 2,
    2: 0
  },
  gripTransform: {
    position: [0, 0, 0.05, 1],
  },
  targetRayTransform: {
    orientation: [Math.PI * -0.08, 0, 0, 1]
  },
  userAgentOverrides: {
    "Firefox": {
      axes: {
        invert: [1, 3]
      }
    }
  }
};
let samsungGearVR = {
  mapping: 'xr-standard',
  profiles: ['samsung-gearvr', 'generic-trigger-touchpad'],
  buttons: {
    length: 3,
    0: 1,
    1: null,
    2: 0
  },
  gripTransform: {
    orientation: [Math.PI * 0.11, 0, 0, 1]
  }
};
let samsungOdyssey = {
  mapping: 'xr-standard',
  profiles: ['samsung-odyssey', 'microsoft-mixed-reality', 'generic-trigger-squeeze-touchpad-thumbstick'],
  buttons: {
    length: 4,
    0: 1,
    1: 0,
    2: 2,
    3: 4,
  },
  gripTransform: {
    position: [0, -0.02, 0.04, 1],
    orientation: [Math.PI * 0.11, 0, 0, 1]
  }
};
let windowsMixedReality = {
  mapping: 'xr-standard',
  profiles: ['microsoft-mixed-reality', 'generic-trigger-squeeze-touchpad-thumbstick'],
  buttons: {
    length: 4,
    0: 1,
    1: 0,
    2: 2,
    3: 4,
  },
  gripTransform: {
    position: [0, -0.02, 0.04, 1],
    orientation: [Math.PI * 0.11, 0, 0, 1]
  }
};
let GamepadMappings = {
  'Daydream Controller': daydream,
  'Gear VR Controller': samsungGearVR,
  'HTC Vive Focus Controller': viveFocus,
  'Oculus Go Controller': oculusGo,
  'Oculus Touch (Right)': oculusTouch,
  'Oculus Touch (Left)': oculusTouch,
  'OpenVR Gamepad': openVr,
  'Spatial Controller (Spatial Interaction Source) 045E-065A': windowsMixedReality,
  'Spatial Controller (Spatial Interaction Source) 045E-065D': samsungOdyssey,
  'Windows Mixed Reality (Right)': windowsMixedReality,
  'Windows Mixed Reality (Left)': windowsMixedReality,
};

const HEAD_ELBOW_OFFSET_RIGHTHANDED = fromValues$1(0.155, -0.465, -0.15);
const HEAD_ELBOW_OFFSET_LEFTHANDED = fromValues$1(-0.155, -0.465, -0.15);
const ELBOW_WRIST_OFFSET = fromValues$1(0, 0, -0.25);
const WRIST_CONTROLLER_OFFSET = fromValues$1(0, 0, 0.05);
const ARM_EXTENSION_OFFSET = fromValues$1(-0.08, 0.14, 0.08);
const ELBOW_BEND_RATIO = 0.4;
const EXTENSION_RATIO_WEIGHT = 0.4;
const MIN_ANGULAR_SPEED = 0.61;
const MIN_ANGLE_DELTA = 0.175;
const MIN_EXTENSION_COS = 0.12;
const MAX_EXTENSION_COS = 0.87;
const RAD_TO_DEG = 180 / Math.PI;
function eulerFromQuaternion(out, q, order) {
  function clamp(value, min$$1, max$$1) {
    return (value < min$$1 ? min$$1 : (value > max$$1 ? max$$1 : value));
  }
  var sqx = q[0] * q[0];
  var sqy = q[1] * q[1];
  var sqz = q[2] * q[2];
  var sqw = q[3] * q[3];
  if ( order === 'XYZ' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] - q[1] * q[2] ), ( sqw - sqx - sqy + sqz ) );
    out[1] = Math.asin(  clamp( 2 * ( q[0] * q[2] + q[1] * q[3] ), -1, 1 ) );
    out[2] = Math.atan2( 2 * ( q[2] * q[3] - q[0] * q[1] ), ( sqw + sqx - sqy - sqz ) );
  } else if ( order ===  'YXZ' ) {
    out[0] = Math.asin(  clamp( 2 * ( q[0] * q[3] - q[1] * q[2] ), -1, 1 ) );
    out[1] = Math.atan2( 2 * ( q[0] * q[2] + q[1] * q[3] ), ( sqw - sqx - sqy + sqz ) );
    out[2] = Math.atan2( 2 * ( q[0] * q[1] + q[2] * q[3] ), ( sqw - sqx + sqy - sqz ) );
  } else if ( order === 'ZXY' ) {
    out[0] = Math.asin(  clamp( 2 * ( q[0] * q[3] + q[1] * q[2] ), -1, 1 ) );
    out[1] = Math.atan2( 2 * ( q[1] * q[3] - q[2] * q[0] ), ( sqw - sqx - sqy + sqz ) );
    out[2] = Math.atan2( 2 * ( q[2] * q[3] - q[0] * q[1] ), ( sqw - sqx + sqy - sqz ) );
  } else if ( order === 'ZYX' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] + q[2] * q[1] ), ( sqw - sqx - sqy + sqz ) );
    out[1] = Math.asin(  clamp( 2 * ( q[1] * q[3] - q[0] * q[2] ), -1, 1 ) );
    out[2] = Math.atan2( 2 * ( q[0] * q[1] + q[2] * q[3] ), ( sqw + sqx - sqy - sqz ) );
  } else if ( order === 'YZX' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] - q[2] * q[1] ), ( sqw - sqx + sqy - sqz ) );
    out[1] = Math.atan2( 2 * ( q[1] * q[3] - q[0] * q[2] ), ( sqw + sqx - sqy - sqz ) );
    out[2] = Math.asin(  clamp( 2 * ( q[0] * q[1] + q[2] * q[3] ), -1, 1 ) );
  } else if ( order === 'XZY' ) {
    out[0] = Math.atan2( 2 * ( q[0] * q[3] + q[1] * q[2] ), ( sqw - sqx + sqy - sqz ) );
    out[1] = Math.atan2( 2 * ( q[0] * q[2] + q[1] * q[3] ), ( sqw + sqx - sqy - sqz ) );
    out[2] = Math.asin(  clamp( 2 * ( q[2] * q[3] - q[0] * q[1] ), -1, 1 ) );
  } else {
    console.log('No order given for quaternion to euler conversion.');
    return;
  }
}
class OrientationArmModel {
  constructor() {
    this.hand = 'right';
    this.headElbowOffset = HEAD_ELBOW_OFFSET_RIGHTHANDED;
    this.controllerQ = create$4();
    this.lastControllerQ = create$4();
    this.headQ = create$4();
    this.headPos = create$1();
    this.elbowPos = create$1();
    this.wristPos = create$1();
    this.time = null;
    this.lastTime = null;
    this.rootQ = create$4();
    this.position = create$1();
  }
  setHandedness(hand) {
    if (this.hand != hand) {
      this.hand = hand;
      if (this.hand == 'left') {
        this.headElbowOffset = HEAD_ELBOW_OFFSET_LEFTHANDED;
      } else {
        this.headElbowOffset = HEAD_ELBOW_OFFSET_RIGHTHANDED;
      }
    }
  }
  update(controllerOrientation, headPoseMatrix) {
    this.time = now$1();
    if (controllerOrientation) {
      copy$4(this.lastControllerQ, this.controllerQ);
      copy$4(this.controllerQ, controllerOrientation);
    }
    if (headPoseMatrix) {
      getTranslation(this.headPos, headPoseMatrix);
      getRotation(this.headQ, headPoseMatrix);
    }
    let headYawQ = this.getHeadYawOrientation_();
    let angleDelta = this.quatAngle_(this.lastControllerQ, this.controllerQ);
    let timeDelta = (this.time - this.lastTime) / 1000;
    let controllerAngularSpeed = angleDelta / timeDelta;
    if (controllerAngularSpeed > MIN_ANGULAR_SPEED) {
      slerp(this.rootQ, this.rootQ, headYawQ,
                 Math.min(angleDelta / MIN_ANGLE_DELTA, 1.0));
    } else {
      copy$4(this.rootQ, headYawQ);
    }
    let controllerForward = fromValues$1(0, 0, -1.0);
    transformQuat(controllerForward, controllerForward, this.controllerQ);
    let controllerDotY = dot(controllerForward, [0, 1, 0]);
    let extensionRatio = this.clamp_(
        (controllerDotY - MIN_EXTENSION_COS) / MAX_EXTENSION_COS, 0.0, 1.0);
    let controllerCameraQ = clone$4(this.rootQ);
    invert$2(controllerCameraQ, controllerCameraQ);
    multiply$4(controllerCameraQ, controllerCameraQ, this.controllerQ);
    let elbowPos = this.elbowPos;
    copy$1(elbowPos, this.headPos);
    add$1(elbowPos, elbowPos, this.headElbowOffset);
    let elbowOffset = clone$1(ARM_EXTENSION_OFFSET);
    scale$1(elbowOffset, elbowOffset, extensionRatio);
    add$1(elbowPos, elbowPos, elbowOffset);
    let totalAngle = this.quatAngle_(controllerCameraQ, create$4());
    let totalAngleDeg = totalAngle * RAD_TO_DEG;
    let lerpSuppression = 1 - Math.pow(totalAngleDeg / 180, 4);let elbowRatio = ELBOW_BEND_RATIO;
    let wristRatio = 1 - ELBOW_BEND_RATIO;
    let lerpValue = lerpSuppression *
        (elbowRatio + wristRatio * extensionRatio * EXTENSION_RATIO_WEIGHT);
    let wristQ = create$4();
    slerp(wristQ, wristQ, controllerCameraQ, lerpValue);
    let invWristQ = invert$2(create$4(), wristQ);
    let elbowQ = clone$4(controllerCameraQ);
    multiply$4(elbowQ, elbowQ, invWristQ);
    let wristPos = this.wristPos;
    copy$1(wristPos, WRIST_CONTROLLER_OFFSET);
    transformQuat(wristPos, wristPos, wristQ);
    add$1(wristPos, wristPos, ELBOW_WRIST_OFFSET);
    transformQuat(wristPos, wristPos, elbowQ);
    add$1(wristPos, wristPos, elbowPos);
    let offset = clone$1(ARM_EXTENSION_OFFSET);
    scale$1(offset, offset, extensionRatio);
    add$1(this.position, this.wristPos, offset);
    transformQuat(this.position, this.position, this.rootQ);
    this.lastTime = this.time;
  }
  getPosition() {
    return this.position;
  }
  getHeadYawOrientation_() {
    let headEuler = create$1();
    eulerFromQuaternion(headEuler, this.headQ, 'YXZ');
    let destinationQ = fromEuler(create$4(), 0, headEuler[1] * RAD_TO_DEG, 0);
    return destinationQ;
  }
  clamp_(value, min$$1, max$$1) {
    return Math.min(Math.max(value, min$$1), max$$1);
  }
  quatAngle_(q1, q2) {
    let vec1 = [0, 0, -1];
    let vec2 = [0, 0, -1];
    transformQuat(vec1, vec1, q1);
    transformQuat(vec2, vec2, q2);
    return angle(vec1, vec2);
  }
}

const PRIVATE$18 = Symbol('@@webxr-polyfill/XRRemappedGamepad');
const PLACEHOLDER_BUTTON = { pressed: false, touched: false, value: 0.0 };
Object.freeze(PLACEHOLDER_BUTTON);
class XRRemappedGamepad {
  constructor(gamepad, display, map) {
    if (!map) {
      map = {};
    }
    if (map.userAgentOverrides) {
      for (let agent in map.userAgentOverrides) {
        if (navigator.userAgent.includes(agent)) {
          let override = map.userAgentOverrides[agent];
          for (let key in override) {
            if (key in map) {
              Object.assign(map[key], override[key]);
            } else {
              map[key] = override[key];
            }
          }
          break;
        }
      }
    }
    let axes = new Array(map.axes && map.axes.length ? map.axes.length : gamepad.axes.length);
    let buttons = new Array(map.buttons && map.buttons.length ? map.buttons.length : gamepad.buttons.length);
    let gripTransform = null;
    if (map.gripTransform) {
      let orientation = map.gripTransform.orientation || [0, 0, 0, 1];
      gripTransform = create();
      fromRotationTranslation(
        gripTransform,
        normalize$2(orientation, orientation),
        map.gripTransform.position || [0, 0, 0]
      );
    }
    let targetRayTransform = null;
    if (map.targetRayTransform) {
      let orientation =  map.targetRayTransform.orientation || [0, 0, 0, 1];
      targetRayTransform = create();
      fromRotationTranslation(
        targetRayTransform,
        normalize$2(orientation, orientation),
        map.targetRayTransform.position || [0, 0, 0]
      );
    }
    let profiles = map.profiles;
    if (map.displayProfiles) {
      if (display.displayName in map.displayProfiles) {
        profiles = map.displayProfiles[display.displayName];
      }
    }
    this[PRIVATE$18] = {
      gamepad,
      map,
      profiles: profiles || [gamepad.id],
      mapping: map.mapping || gamepad.mapping,
      axes,
      buttons,
      gripTransform,
      targetRayTransform,
    };
    this._update();
  }
  _update() {
    let gamepad = this[PRIVATE$18].gamepad;
    let map = this[PRIVATE$18].map;
    let axes = this[PRIVATE$18].axes;
    for (let i = 0; i < axes.length; ++i) {
      if (map.axes && i in map.axes) {
        if (map.axes[i] === null) {
          axes[i] = 0;
        } else {
          axes[i] = gamepad.axes[map.axes[i]];
        }
      } else {
        axes[i] = gamepad.axes[i];
      }
    }
    if (map.axes && map.axes.invert) {
      for (let axis of map.axes.invert) {
        if (axis < axes.length) {
          axes[axis] *= -1;
        }
      }
    }
    let buttons = this[PRIVATE$18].buttons;
    for (let i = 0; i < buttons.length; ++i) {
      if (map.buttons && i in map.buttons) {
        if (map.buttons[i] === null) {
          buttons[i] = PLACEHOLDER_BUTTON;
        } else {
          buttons[i] = gamepad.buttons[map.buttons[i]];
        }
      } else {
        buttons[i] = gamepad.buttons[i];
      }
    }
  }
  get id() {
    return '';
  }
  get _profiles() {
    return this[PRIVATE$18].profiles;
  }
  get index() {
    return -1;
  }
  get connected() {
    return this[PRIVATE$18].gamepad.connected;
  }
  get timestamp() {
    return this[PRIVATE$18].gamepad.timestamp;
  }
  get mapping() {
    return this[PRIVATE$18].mapping;
  }
  get axes() {
    return this[PRIVATE$18].axes;
  }
  get buttons() {
    return this[PRIVATE$18].buttons;
  }
  get hapticActuators() {
    return this[PRIVATE$18].gamepad.hapticActuators;
  }
}
class GamepadXRInputSource {
  constructor(polyfill, display, primaryButtonIndex = 0, primarySqueezeButtonIndex = -1) {
    this.polyfill = polyfill;
    this.display = display;
    this.nativeGamepad = null;
    this.gamepad = null;
    this.inputSource = new XRInputSource(this);
    this.lastPosition = create$1();
    this.emulatedPosition = false;
    this.basePoseMatrix = create();
    this.outputMatrix = create();
    this.primaryButtonIndex = primaryButtonIndex;
    this.primaryActionPressed = false;
    this.primarySqueezeButtonIndex = primarySqueezeButtonIndex;
    this.primarySqueezeActionPressed = false;
    this.handedness = '';
    this.targetRayMode = 'gaze';
    this.armModel = null;
  }
  get profiles() {
    return this.gamepad ? this.gamepad._profiles : [];
  }
  updateFromGamepad(gamepad) {
    if (this.nativeGamepad !== gamepad) {
      this.nativeGamepad = gamepad;
      if (gamepad) {
        this.gamepad = new XRRemappedGamepad(gamepad, this.display, GamepadMappings[gamepad.id]);
      } else {
        this.gamepad = null;
      }
    }
    this.handedness = gamepad.hand === '' ? 'none' : gamepad.hand;
    if (this.gamepad) {
      this.gamepad._update();
    }
    if (gamepad.pose) {
      this.targetRayMode = 'tracked-pointer';
      this.emulatedPosition = !gamepad.pose.hasPosition;
    } else if (gamepad.hand === '') {
      this.targetRayMode = 'gaze';
      this.emulatedPosition = false;
    }
  }
  updateBasePoseMatrix() {
    if (this.nativeGamepad && this.nativeGamepad.pose) {
      let pose = this.nativeGamepad.pose;
      let position = pose.position;
      let orientation = pose.orientation;
      if (!position && !orientation) {
        return;
      }
      if (!position) {
        if (!pose.hasPosition) {
          if (!this.armModel) {
            this.armModel = new OrientationArmModel();
          }
          this.armModel.setHandedness(this.nativeGamepad.hand);
          this.armModel.update(orientation, this.polyfill.getBasePoseMatrix());
          position = this.armModel.getPosition();
        } else {
          position = this.lastPosition;
        }
      } else {
        this.lastPosition[0] = position[0];
        this.lastPosition[1] = position[1];
        this.lastPosition[2] = position[2];
      }
      fromRotationTranslation(this.basePoseMatrix, orientation, position);
    } else {
      copy(this.basePoseMatrix, this.polyfill.getBasePoseMatrix());
    }
    return this.basePoseMatrix;
  }
  getXRPose(coordinateSystem, poseType) {
    this.updateBasePoseMatrix();
    switch(poseType) {
      case "target-ray":
        coordinateSystem._transformBasePoseMatrix(this.outputMatrix, this.basePoseMatrix);
        if (this.gamepad && this.gamepad[PRIVATE$18].targetRayTransform) {
          multiply(this.outputMatrix, this.outputMatrix, this.gamepad[PRIVATE$18].targetRayTransform);
        }
        break;
      case "grip":
        if (!this.nativeGamepad || !this.nativeGamepad.pose) {
          return null;
        }
        coordinateSystem._transformBasePoseMatrix(this.outputMatrix, this.basePoseMatrix);
        if (this.gamepad && this.gamepad[PRIVATE$18].gripTransform) {
          multiply(this.outputMatrix, this.outputMatrix, this.gamepad[PRIVATE$18].gripTransform);
        }
        break;
      default:
        return null;
    }
    coordinateSystem._adjustForOriginOffset(this.outputMatrix);
    return new XRPose(new XRRigidTransform(this.outputMatrix), this.emulatedPosition);
  }
}

const TEST_ENV = "production" === 'test';
const EXTRA_PRESENTATION_ATTRIBUTES = {
  highRefreshRate: true,
};
const PRIMARY_BUTTON_MAP = {
  oculus: 1,
  openvr: 1,
  'spatial controller (spatial interaction source)': 1
};
let SESSION_ID = 0;
class Session {
  constructor(mode, enabledFeatures, polyfillOptions={}) {
    this.mode = mode;
    this.enabledFeatures = enabledFeatures;
    this.outputContext = null;
    this.immersive = mode == 'immersive-vr' || mode == 'immersive-ar';
    this.ended = null;
    this.baseLayer = null;
    this.id = ++SESSION_ID;
    this.modifiedCanvasLayer = false;
    if (this.outputContext && !TEST_ENV) {
      const renderContextType = polyfillOptions.renderContextType || '2d';
      this.renderContext = this.outputContext.canvas.getContext(renderContextType);
    }
  }
}
class WebVRDevice extends XRDevice {
  constructor(global, display) {
    const { canPresent } = display.capabilities;
    super(global);
    this.display = display;
    this.frame = new global.VRFrameData();
    this.sessions = new Map();
    this.immersiveSession = null;
    this.canPresent = canPresent;
    this.baseModelMatrix = create();
    this.gamepadInputSources = {};
    this.tempVec3 = new Float32Array(3);
    this.onVRDisplayPresentChange = this.onVRDisplayPresentChange.bind(this);
    global.window.addEventListener('vrdisplaypresentchange', this.onVRDisplayPresentChange);
    this.CAN_USE_GAMEPAD = global.navigator && ('getGamepads' in global.navigator);
    this.HAS_BITMAP_SUPPORT = isImageBitmapSupported(global);
  }
  get depthNear() { return this.display.depthNear; }
  set depthNear(val) { this.display.depthNear = val; }
  get depthFar() { return this.display.depthFar; }
  set depthFar(val) { this.display.depthFar = val; }
  onBaseLayerSet(sessionId, layer) {
    const session = this.sessions.get(sessionId);
    const canvas = layer.context.canvas;
    if (session.immersive) {
      const left = this.display.getEyeParameters('left');
      const right = this.display.getEyeParameters('right');
      canvas.width = Math.max(left.renderWidth, right.renderWidth) * 2;
      canvas.height = Math.max(left.renderHeight, right.renderHeight);
      this.display.requestPresent([{
          source: canvas, attributes: EXTRA_PRESENTATION_ATTRIBUTES
        }]).then(() => {
        if (!TEST_ENV && !this.global.document.body.contains(canvas)) {
          session.modifiedCanvasLayer = true;
          this.global.document.body.appendChild(canvas);
          applyCanvasStylesForMinimalRendering(canvas);
        }
        session.baseLayer = layer;
      });
    }
    else {
      session.baseLayer = layer;
    }
  }
  isSessionSupported(mode) {
    if (mode == 'immersive-ar') {
      return false;
    }
    if (mode == 'immersive-vr' && this.canPresent === false) {
      return false;
    }
    return true;
  }
  isFeatureSupported(featureDescriptor) {
    switch(featureDescriptor) {
      case 'viewer': return true;
      case 'local': return true;
      case 'local-floor': return true;
      case 'bounded': return false;
      case 'unbounded': return false;
      default: return false;
    }
  }
  async requestSession(mode, enabledFeatures) {
    if (!this.isSessionSupported(mode)) {
      return Promise.reject();
    }
    let immersive = mode == 'immersive-vr';
    if (immersive) {
      const canvas = this.global.document.createElement('canvas');
      if (!TEST_ENV) {
        const ctx = canvas.getContext('webgl');
      }
      await this.display.requestPresent([{
          source: canvas, attributes: EXTRA_PRESENTATION_ATTRIBUTES }]);
    }
    const session = new Session(mode, enabledFeatures, {
      renderContextType: this.HAS_BITMAP_SUPPORT ? 'bitmaprenderer' : '2d'
    });
    this.sessions.set(session.id, session);
    if (immersive) {
      this.immersiveSession = session;
      this.dispatchEvent('@@webxr-polyfill/vr-present-start', session.id);
    }
    return Promise.resolve(session.id);
  }
  requestAnimationFrame(callback) {
    return this.display.requestAnimationFrame(callback);
  }
  getPrimaryButtonIndex(gamepad) {
    let primaryButton = 0;
    let name = gamepad.id.toLowerCase();
    for (let key in PRIMARY_BUTTON_MAP) {
      if (name.includes(key)) {
        primaryButton = PRIMARY_BUTTON_MAP[key];
        break;
      }
    }
    return Math.min(primaryButton, gamepad.buttons.length - 1);
  }
  onFrameStart(sessionId, renderState) {
    this.display.depthNear = renderState.depthNear;
    this.display.depthFar = renderState.depthFar;
    this.display.getFrameData(this.frame);
    const session = this.sessions.get(sessionId);
    if (session.immersive && this.CAN_USE_GAMEPAD) {
      let prevInputSources = this.gamepadInputSources;
      this.gamepadInputSources = {};
      let gamepads = this.global.navigator.getGamepads();
      for (let i = 0; i < gamepads.length; ++i) {
        let gamepad = gamepads[i];
        if (gamepad && gamepad.displayId > 0) {
          let inputSourceImpl = prevInputSources[i];
          if (!inputSourceImpl) {
            inputSourceImpl = new GamepadXRInputSource(this, this.display, this.getPrimaryButtonIndex(gamepad));
          }
          inputSourceImpl.updateFromGamepad(gamepad);
          this.gamepadInputSources[i] = inputSourceImpl;
          if (inputSourceImpl.primaryButtonIndex != -1) {
            let primaryActionPressed = gamepad.buttons[inputSourceImpl.primaryButtonIndex].pressed;
            if (primaryActionPressed && !inputSourceImpl.primaryActionPressed) {
              this.dispatchEvent('@@webxr-polyfill/input-select-start', { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
            } else if (!primaryActionPressed && inputSourceImpl.primaryActionPressed) {
              this.dispatchEvent('@@webxr-polyfill/input-select-end', { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
            }
            inputSourceImpl.primaryActionPressed = primaryActionPressed;
          }
          if (inputSourceImpl.primarySqueezeButtonIndex != -1) {
            let primarySqueezeActionPressed = gamepad.buttons[inputSourceImpl.primarySqueezeButtonIndex].pressed;
            if (primarySqueezeActionPressed && !inputSourceImpl.primarySqueezeActionPressed) {
              this.dispatchEvent('@@webxr-polyfill/input-squeeze-start', { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
            } else if (!primarySqueezeActionPressed && inputSourceImpl.primarySqueezeActionPressed) {
              this.dispatchEvent('@@webxr-polyfill/input-squeeze-end', { sessionId: session.id, inputSource: inputSourceImpl.inputSource });
            }
            inputSourceImpl.primarySqueezeActionPressed = primarySqueezeActionPressed;
          }
        }
      }
    }
    if (TEST_ENV) {
      return;
    }
    if (!session.immersive && session.baseLayer) {
      const canvas = session.baseLayer.context.canvas;
      perspective(this.frame.leftProjectionMatrix, renderState.inlineVerticalFieldOfView,
          canvas.width/canvas.height, renderState.depthNear, renderState.depthFar);
    }
  }
  onFrameEnd(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session.ended || !session.baseLayer) {
      return;
    }
    if (session.outputContext &&
        !(session.immersive && !this.display.capabilities.hasExternalDisplay)) {
      const mirroring =
        session.immersive && this.display.capabilities.hasExternalDisplay;
      const iCanvas = session.baseLayer.context.canvas;
      const iWidth = mirroring ? iCanvas.width / 2 : iCanvas.width;
      const iHeight = iCanvas.height;
      if (!TEST_ENV) {
        const oCanvas = session.outputContext.canvas;
        const oWidth = oCanvas.width;
        const oHeight = oCanvas.height;
        const renderContext = session.renderContext;
        if (this.HAS_BITMAP_SUPPORT) {
          if (iCanvas.transferToImageBitmap) {
            renderContext.transferFromImageBitmap(iCanvas.transferToImageBitmap());
          }
          else {
            this.global.createImageBitmap(iCanvas, 0, 0, iWidth, iHeight, {
              resizeWidth: oWidth,
              resizeHeight: oHeight,
            }).then(bitmap => renderContext.transferFromImageBitmap(bitmap));
          }
        } else {
          renderContext.drawImage(iCanvas, 0, 0, iWidth, iHeight,
                                           0, 0, oWidth, oHeight);
        }
      }
    }
    if (session.immersive && session.baseLayer) {
      this.display.submitFrame();
    }
  }
  cancelAnimationFrame(handle) {
    this.display.cancelAnimationFrame(handle);
  }
  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session.ended) {
      return;
    }
    if (session.immersive) {
      return this.display.exitPresent();
    } else {
      session.ended = true;
    }
  }
  doesSessionSupportReferenceSpace(sessionId, type) {
    const session = this.sessions.get(sessionId);
    if (session.ended) {
      return false;
    }
    return session.enabledFeatures.has(type);
  }
  requestStageBounds() {
    if (this.display.stageParameters) {
      const width = this.display.stageParameters.sizeX;
      const depth = this.display.stageParameters.sizeZ;
      const data = [];
      data.push(-width / 2);
      data.push(-depth / 2);
      data.push(width / 2);
      data.push(-depth / 2);
      data.push(width / 2);
      data.push(depth / 2);
      data.push(-width / 2);
      data.push(depth / 2);
      return data;
    }
    return null;
  }
  async requestFrameOfReferenceTransform(type, options) {
    if ((type === 'local-floor' || type === 'bounded-floor') &&
        this.display.stageParameters &&
        this.display.stageParameters.sittingToStandingTransform) {
      return this.display.stageParameters.sittingToStandingTransform;
    }
    return null;
  }
  getProjectionMatrix(eye) {
    if (eye === 'left') {
      return this.frame.leftProjectionMatrix;
    } else if (eye === 'right') {
      return this.frame.rightProjectionMatrix;
    } else if (eye === 'none') {
      return this.frame.leftProjectionMatrix;
    } else {
      throw new Error(`eye must be of type 'left' or 'right'`);
    }
  }
  getViewport(sessionId, eye, layer, target) {
    const session = this.sessions.get(sessionId);
    const { width, height } = layer.context.canvas;
    if (!session.immersive) {
      target.x = target.y = 0;
      target.width = width;
      target.height = height;
      return true;
    }
    if (eye === 'left' || eye === 'none') {
      target.x = 0;
    } else if (eye === 'right') {
      target.x = width / 2;
    } else {
      return false;
    }
    target.y = 0;
    target.width = width / 2;
    target.height = height;
    return true;
  }
  getBasePoseMatrix() {
    let { position, orientation } = this.frame.pose;
    if (!position && !orientation) {
      return this.baseModelMatrix;
    }
    if (!position) {
      position = this.tempVec3;
      position[0] = position[1] = position[2] = 0;
    }
    fromRotationTranslation(this.baseModelMatrix, orientation, position);
    return this.baseModelMatrix;
  }
  getBaseViewMatrix(eye) {
    if (eye === 'left' || eye === 'none') {
      return this.frame.leftViewMatrix;
    } else if (eye === 'right') {
      return this.frame.rightViewMatrix;
    } else {
      throw new Error(`eye must be of type 'left' or 'right'`);
    }
  }
  getInputSources() {
    let inputSources = [];
    for (let i in this.gamepadInputSources) {
      inputSources.push(this.gamepadInputSources[i].inputSource);
    }
    return inputSources;
  }
  getInputPose(inputSource, coordinateSystem, poseType) {
    if (!coordinateSystem) {
      return null;
    }
    for (let i in this.gamepadInputSources) {
      let inputSourceImpl = this.gamepadInputSources[i];
      if (inputSourceImpl.inputSource === inputSource) {
        return inputSourceImpl.getXRPose(coordinateSystem, poseType);
      }
    }
    return null;
  }
  onWindowResize() {
  }
  onVRDisplayPresentChange(e) {
    if (!this.display.isPresenting) {
      this.sessions.forEach(session => {
        if (session.immersive && !session.ended) {
          if (session.modifiedCanvasLayer) {
            const canvas = session.baseLayer.context.canvas;
            document.body.removeChild(canvas);
            canvas.setAttribute('style', '');
          }
          if (this.immersiveSession === session) {
            this.immersiveSession = null;
          }
          this.dispatchEvent('@@webxr-polyfill/vr-present-end', session.id);
        }
      });
    }
  }
}

class CardboardXRDevice extends WebVRDevice {
  constructor(global, cardboardConfig) {
    const display = new CardboardVRDisplay(cardboardConfig || {});
    super(global, display);
    this.display = display;
    this.frame = {
      rightViewMatrix: new Float32Array(16),
      leftViewMatrix: new Float32Array(16),
      rightProjectionMatrix: new Float32Array(16),
      leftProjectionMatrix: new Float32Array(16),
      pose: null,
      timestamp: null,
    };
  }
}

const TEST_ENV$1 = "production" === 'test';
let SESSION_ID$1 = 0;
class Session$1 {
  constructor(mode, enabledFeatures) {
    this.mode = mode;
    this.enabledFeatures = enabledFeatures;
    this.ended = null;
    this.baseLayer = null;
    this.id = ++SESSION_ID$1;
  }
}
class InlineDevice extends XRDevice {
  constructor(global) {
    super(global);
    this.sessions = new Map();
    this.projectionMatrix = create();
    this.identityMatrix = create();
  }
  onBaseLayerSet(sessionId, layer) {
    const session = this.sessions.get(sessionId);
    session.baseLayer = layer;
  }
  isSessionSupported(mode) {
    return mode == 'inline';
  }
  isFeatureSupported(featureDescriptor) {
    switch(featureDescriptor) {
      case 'viewer': return true;
      default: return false;
    }
  }
  async requestSession(mode, enabledFeatures) {
    if (!this.isSessionSupported(mode)) {
      return Promise.reject();
    }
    const session = new Session$1(mode, enabledFeatures);
    this.sessions.set(session.id, session);
    return Promise.resolve(session.id);
  }
  requestAnimationFrame(callback) {
    return window.requestAnimationFrame(callback);
  }
  cancelAnimationFrame(handle) {
    window.cancelAnimationFrame(handle);
  }
  onFrameStart(sessionId, renderState) {
    if (TEST_ENV$1) {
      return;
    }
    const session = this.sessions.get(sessionId);
    if (session.baseLayer) {
      const canvas = session.baseLayer.context.canvas;
      perspective(this.projectionMatrix, renderState.inlineVerticalFieldOfView,
          canvas.width/canvas.height, renderState.depthNear, renderState.depthFar);
    }
  }
  onFrameEnd(sessionId) {
  }
  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    session.ended = true;
  }
  doesSessionSupportReferenceSpace(sessionId, type) {
    const session = this.sessions.get(sessionId);
    if (session.ended) {
      return false;
    }
    return session.enabledFeatures.has(type);
  }
  requestStageBounds() {
    return null;
  }
  async requestFrameOfReferenceTransform(type, options) {
    return null;
  }
  getProjectionMatrix(eye) {
    return this.projectionMatrix;
  }
  getViewport(sessionId, eye, layer, target) {
    const session = this.sessions.get(sessionId);
    const { width, height } = layer.context.canvas;
    target.x = target.y = 0;
    target.width = width;
    target.height = height;
    return true;
  }
  getBasePoseMatrix() {
    return this.identityMatrix;
  }
  getBaseViewMatrix(eye) {
    return this.identityMatrix;
  }
  getInputSources() {
    return [];
  }
  getInputPose(inputSource, coordinateSystem, poseType) {
    return null;
  }
  onWindowResize() {
  }
}

const getWebVRDevice = async function (global) {
  let device = null;
  if ('getVRDisplays' in global.navigator) {
    try {
      const displays = await global.navigator.getVRDisplays();
      if (displays && displays.length) {
        device = new WebVRDevice(global, displays[0]);
      }
    } catch (e) {}
  }
  return device;
};
const requestXRDevice = async function (global, config) {
  if (config.webvr) {
    let xr = await getWebVRDevice(global);
    if (xr) {
      return xr;
    }
  }
  let mobile = isMobile(global);
  if ((mobile && config.cardboard) ||
      (!mobile && config.allowCardboardOnDesktop)) {
    if (!global.VRFrameData) {
      global.VRFrameData = function () {
        this.rightViewMatrix = new Float32Array(16);
        this.leftViewMatrix = new Float32Array(16);
        this.rightProjectionMatrix = new Float32Array(16);
        this.leftProjectionMatrix = new Float32Array(16);
        this.pose = null;
      };
    }
    return new CardboardXRDevice(global, config.cardboardConfig);
  }
  return new InlineDevice(global);
};

const CONFIG_DEFAULTS = {
  global: _global,
  webvr: true,
  cardboard: true,
  cardboardConfig: null,
  allowCardboardOnDesktop: false,
};
const partials = ['navigator', 'HTMLCanvasElement', 'WebGLRenderingContext'];
class WebXRPolyfill {
  constructor(config={}) {
    this.config = Object.freeze(Object.assign({}, CONFIG_DEFAULTS, config));
    this.global = this.config.global;
    this.nativeWebXR = 'xr' in this.global.navigator;
    this.injected = false;
    if (!this.nativeWebXR) {
      this._injectPolyfill(this.global);
    } else {
      this._injectCompatibilityShims(this.global);
    }
  }
  _injectPolyfill(global) {
    if (!partials.every(iface => !!global[iface])) {
      throw new Error(`Global must have the following attributes : ${partials}`);
    }
    for (const className of Object.keys(API)) {
      if (global[className] !== undefined) {
        console.warn(`${className} already defined on global.`);
      } else {
        global[className] = API[className];
      }
    }
    {
      const polyfilledCtx = polyfillMakeXRCompatible(global.WebGLRenderingContext);
      if (polyfilledCtx) {
        polyfillGetContext(global.HTMLCanvasElement);
        if (global.OffscreenCanvas) {
          polyfillGetContext(global.OffscreenCanvas);
        }
        if (global.WebGL2RenderingContext){
          polyfillMakeXRCompatible(global.WebGL2RenderingContext);
        }
        if (!window.isSecureContext) {
          console.warn(`WebXR Polyfill Warning:
This page is not running in a secure context (https:// or localhost)!
This means that although the page may be able to use the WebXR Polyfill it will
not be able to use native WebXR implementations, and as such will not be able to
access dedicated VR or AR hardware, and will not be able to take advantage of
any performance improvements a native WebXR implementation may offer. Please
host this content on a secure origin for the best user experience.
`);
        }
      }
    }
    this.injected = true;
    this._patchNavigatorXR();
  }
  _patchNavigatorXR() {
    let devicePromise = requestXRDevice(this.global, this.config);
    this.xr = new API.XRSystem(devicePromise);
    Object.defineProperty(this.global.navigator, 'xr', {
      value: this.xr,
      configurable: true,
    });
  }
  _injectCompatibilityShims(global) {
    if (!partials.every(iface => !!global[iface])) {
      throw new Error(`Global must have the following attributes : ${partials}`);
    }
    if (global.navigator.xr &&
        'supportsSession' in global.navigator.xr &&
        !('isSessionSupported' in global.navigator.xr)) {
      let originalSupportsSession = global.navigator.xr.supportsSession;
      global.navigator.xr.isSessionSupported = function(mode) {
        return originalSupportsSession.call(this, mode).then(() => {
          return true;
        }).catch(() => {
          return false;
        });
      };
      global.navigator.xr.supportsSession = function(mode) {
        console.warn("navigator.xr.supportsSession() is deprecated. Please " +
        "call navigator.xr.isSessionSupported() instead and check the boolean " +
        "value returned when the promise resolves.");
        return originalSupportsSession.call(this, mode);
      };
    }
  }
}

/* harmony default export */ const webxr_polyfill_module = (WebXRPolyfill);

;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/webxr/VRButton.js
class VRButton_VRButton {

	static createButton( renderer, options ) {

		if ( options ) {

			console.error( 'THREE.VRButton: The "options" parameter has been removed. Please set the reference space type via renderer.xr.setReferenceSpaceType() instead.' );

		}

		const button = document.createElement( 'button' );

		function showEnterVR( /*device*/ ) {

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				await renderer.xr.setSession( session );
				button.textContent = 'EXIT VR';

				currentSession = session;

			}

			function onSessionEnded( /*event*/ ) {

				currentSession.removeEventListener( 'end', onSessionEnded );

				button.textContent = 'ENTER VR';

				currentSession = null;

			}

			//

			button.style.display = '';

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 50px)';
			button.style.width = '100px';

			button.textContent = 'ENTER VR';

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			button.onmouseleave = function () {

				button.style.opacity = '0.5';

			};

			button.onclick = function () {

				if ( currentSession === null ) {

					// WebXR's requestReferenceSpace only works if the corresponding feature
					// was requested at session creation time. For simplicity, just ask for
					// the interesting ones as optional features, but be aware that the
					// requestReferenceSpace call will fail if it turns out to be unavailable.
					// ('local' is always available for immersive sessions and doesn't need to
					// be requested separately.)

					const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking' ] };
					navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

				} else {

					currentSession.end();

				}

			};

		}

		function disableButton() {

			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(50% - 75px)';
			button.style.width = '150px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showWebXRNotFound() {

			disableButton();

			button.textContent = 'VR NOT SUPPORTED';

		}

		function stylizeElement( element ) {

			element.style.position = 'absolute';
			element.style.bottom = '20px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.background = 'rgba(0,0,0,0.1)';
			element.style.color = '#fff';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.5';
			element.style.outline = 'none';
			element.style.zIndex = '999';

		}

		if ( 'xr' in navigator ) {

			button.id = 'VRButton';
			button.style.display = 'none';

			stylizeElement( button );

			navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {

				supported ? showEnterVR() : showWebXRNotFound();

			} );

			return button;

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}

	}

}



;// CONCATENATED MODULE: ./src/utils.js



/**
 * Add a method to Three.js Vector3.
 * Return a human-readable version of the vector (for debugging purpose)
 * @return {string}
 */
external_three_namespaceObject.Vector3.prototype.toLog = function () {
    return `[${this.x}, ${this.y}, ${this.z}]`
}

/**
 * Add a method to Three.js Vector4.
 * Return a human-readable version of the vector (for debugging purpose)
 * @return {string}
 */
external_three_namespaceObject.Vector4.prototype.toLog = function () {
    return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`
}


/**
 * Add a method to Three.js Matrix3.
 * Return a human-readable version of the matrix (for debugging purpose)
 * @return {string}
 */
external_three_namespaceObject.Matrix3.prototype.toLog = function () {
    let res = '\r\n';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (j !== 0) {
                res = res + ",\t";
            }
            res = res + this.elements[i + 3 * j];
        }
        res = res + "\r\n";
    }
    return res;
}


/**
 * Return the given power of the current matrix
 * @param {number} n - the exponent. It should be an integer (non necessarily positive)
 * @return {Matrix3} - the power of the matrix
 */
external_three_namespaceObject.Matrix3.prototype.power = function (n) {
    if (n < 0) {
        return this.invert().power(-n);
    }
    if (n === 0) {
        return this.identity();
    }
    if (n === 1) {
        return this;
    }
    if (n % 2 === 0) {
        this.power(n / 2);
        return this.multiply(this);
    } else {
        const aux = this.clone();
        this.power(n - 1);
        return this.multiply(aux);
    }
}

/**
 * Add a method to Three.js Matrix4.
 * Return a human-readable version of the matrix (for debugging purpose)
 * @return {string}
 */
external_three_namespaceObject.Matrix4.prototype.toLog = function () {
    let res = '\r\n';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (j !== 0) {
                res = res + ",\t";
            }
            res = res + this.elements[i + 4 * j];
        }
        res = res + "\r\n";
    }
    return res;
}

/**
 * A a method to Three.js Matrix4
 * Addition of matrices
 * @param {Matrix4} matrix - the matrix to add
 * @returns {Matrix4} - the current matrix
 */
external_three_namespaceObject.Matrix4.prototype.add = function (matrix) {
    // addition of tow 4x4 matrices
    this.set.apply(this, [].map.call(this.elements, function (c, i) {
        return c + matrix.elements[i];
    }));
    return this;
};


/**
 * Add a method to Three.js Quaternion.
 * Return a human-readable version of the vector (for debugging purpose)
 * @return {string}
 */
external_three_namespaceObject.Quaternion.prototype.toLog = function () {
    return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`
}


/**
 * Multiply a quaternion by the given scalar
 * @param {number} c - a scalar
 * @return {Quaternion} - the current quaternion
 */
external_three_namespaceObject.Quaternion.prototype.multiplyScalar = function (c) {
    this.set(c * this.x, c * this.y, c * this.z, c * this.w);
    return this;
}

/**
 * Add two quaternions
 * @param {Quaternion} q - the quaternion to add
 * @return {Quaternion} - the current quaternion
 */
external_three_namespaceObject.Quaternion.prototype.add = function (q) {
    this.set(this.x + q.x, this.y + q.y, this.z + q.z, this.w + q.w);
    return this;
}

/**
 * Transform a method attached to an object into a function.
 * @param {Object} scope - the object on which the method is called
 * @param {function} fn - the method to call
 * @return {function(): *}
 */
function bind(scope, fn) {
    return function () {
        return fn.apply(scope, arguments);
    };
}


/**
 * Replace all the special characters in the string by an underscore
 * @param {string} str
 * @return {string}
 */
function safeString(str) {
    return str.replace(/\W/g, '_');
}

;// CONCATENATED MODULE: ./src/constants.js
/**
 * ID for the left side (in VR / Stereo)
 * @type {number}
 */
const LEFT = 0;

/**
 * ID for the right side (in VR / Stereo)
 * @type {number}
 */
const RIGHT = 1;
;// CONCATENATED MODULE: ./src/core/renderers/VRRenderer.js




















/**
 * @class
 *
 * @classdesc
 * Renderer for virtual reality.
 * Based on the tools provided by Three.js (which relies on WebXR).
 * We place in distinct layer of the Three.js scene two horizon spheres.
 * Each sphere will render the picture seen by one eye.
 *
 * @todo Check the impact of the pixel ratio (for the three.js camera)
 */
class VRRenderer extends AbstractRenderer {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the underlying teleportation set
     * @param {VRCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the underlying Three.js renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        // loading the polyfill if WebXR is not supported
        new webxr_polyfill_module();
        super(shader1, shader2, set, camera, scene, params, threeRenderer);

        this.threeRenderer.xr.enabled = true;
        this.threeRenderer.xr.setReferenceSpaceType('local');
        this.camera.threeCamera.layers.enable(1);

        const VRButton = VRButton_VRButton.createButton(this.threeRenderer);
        const _onClickVRButton = bind(this.camera, this.camera.switchStereo);
        VRButton.addEventListener('click', _onClickVRButton, false);
        document.body.appendChild(VRButton);

        /**
         * Builder for the fragment shader.
         * The first one correspond to the left eye, the second one to the right eye
         * @type {ShaderBuilder[]}
         * @private
         */
        this._fragmentBuilder = [new ShaderBuilder(), new ShaderBuilder()];
    }

    get isVRRenderer() {
        return true;
    }

    /**
     * Shortcut to access the Three.js WebXRManager
     * @return {WebXRManager}
     */
    get xr() {
        return this.threeRenderer.xr;
    }

    buildFragmentShader() {
        for (const side of [LEFT, RIGHT]) {
            // constants
            this._fragmentBuilder[side].addChunk((constants_default()));
            this._fragmentBuilder[side].addUniform('maxBounces', 'int', this.maxBounces);
            // geometry
            this._fragmentBuilder[side].addChunk(this.shader1);
            this._fragmentBuilder[side].addChunk((commons1_default()));
            this._fragmentBuilder[side].addChunk(this.shader2);
            this._fragmentBuilder[side].addChunk((commons2_default()));

            // data carried with RelVector
            this._fragmentBuilder[side].addChunk((vectorDataStruct_default()));
            // subgroup/quotient orbifold
            this.set.shader(this._fragmentBuilder[side]);

            // camera
            this.camera.sidedShader(this._fragmentBuilder[side], side);

            // scene
            this.scene.shader(this._fragmentBuilder[side]);
            this._fragmentBuilder[side].addChunk(scenes_glsl_mustache_default()(this));
            this._fragmentBuilder[side].addChunk(vectorDataUpdate_glsl_mustache_default()(this));


            // ray-march and main
            this._fragmentBuilder[side].addChunk((raymarch_default()));
            this._fragmentBuilder[side].addChunk((main_default()));
        }
    }

    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new external_three_namespaceObject.SphereBufferGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        this.buildFragmentShader();
        const leftMaterial = new external_three_namespaceObject.ShaderMaterial({
            uniforms: this._fragmentBuilder[LEFT].uniforms,
            vertexShader: (vertex_default()),
            fragmentShader: this._fragmentBuilder[LEFT].code,
        });
        const rightMaterial = new external_three_namespaceObject.ShaderMaterial({
            uniforms: this._fragmentBuilder[RIGHT].uniforms,
            vertexShader: (vertex_default()),
            fragmentShader: this._fragmentBuilder[RIGHT].code,
        });
        const leftHorizonSphere = new external_three_namespaceObject.Mesh(geometry, leftMaterial);
        const rightHorizonSphere = new external_three_namespaceObject.Mesh(geometry, rightMaterial);
        leftHorizonSphere.layers.set(1);
        rightHorizonSphere.layers.set(2);
        this.threeScene.add(leftHorizonSphere, rightHorizonSphere);
    }

    checkShader(side = LEFT) {
        console.log(this._fragmentBuilder[side].code);
    }

    render() {
        this.camera.chaseThreeCamera(this.threeRenderer.xr);
        this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }
}
;// CONCATENATED MODULE: ./src/core/renderers/specifyRenderer.js
/**
 * Take a generic renderer class and return the class specific for a geometry
 * @param {AbstractRenderer} rendererClass - the generic renderer
 * @param {string} shader1 - the first part of geometry dependent shader
 * @param {string} shader2 - the second part of geometry dependent shader
 * @return {GeomRenderer} - the renderer build for the suitable geometry
 */
function specifyRenderer(rendererClass, shader1, shader2) {
    class GeomRenderer extends rendererClass {
        constructor() {
            super(shader1, shader2, ...arguments);
        }
    }

    return GeomRenderer;
}
;// CONCATENATED MODULE: ./src/lib/dat.gui.module.js
/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);

  return css;
}

function colorToString (color, forceCSSHex) {
  var colorFormat = color.__state.conversionName.toString();
  var r = Math.round(color.r);
  var g = Math.round(color.g);
  var b = Math.round(color.b);
  var a = color.a;
  var h = Math.round(color.h);
  var s = color.s.toFixed(1);
  var v = color.v.toFixed(1);
  if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
    var str = color.hex.toString(16);
    while (str.length < 6) {
      str = '0' + str;
    }
    return '#' + str;
  } else if (colorFormat === 'CSS_RGB') {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  } else if (colorFormat === 'CSS_RGBA') {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  } else if (colorFormat === 'HEX') {
    return '0x' + color.hex.toString(16);
  } else if (colorFormat === 'RGB_ARRAY') {
    return '[' + r + ',' + g + ',' + b + ']';
  } else if (colorFormat === 'RGBA_ARRAY') {
    return '[' + r + ',' + g + ',' + b + ',' + a + ']';
  } else if (colorFormat === 'RGB_OBJ') {
    return '{r:' + r + ',g:' + g + ',b:' + b + '}';
  } else if (colorFormat === 'RGBA_OBJ') {
    return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
  } else if (colorFormat === 'HSV_OBJ') {
    return '{h:' + h + ',s:' + s + ',v:' + v + '}';
  } else if (colorFormat === 'HSVA_OBJ') {
    return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
  }
  return 'unknown format';
}

var ARR_EACH = Array.prototype.forEach;
var ARR_SLICE = Array.prototype.slice;
var Common = {
  BREAK: {},
  extend: function extend(target) {
    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function (key) {
        if (!this.isUndefined(obj[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  defaults: function defaults(target) {
    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function (key) {
        if (this.isUndefined(target[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  compose: function compose() {
    var toCall = ARR_SLICE.call(arguments);
    return function () {
      var args = ARR_SLICE.call(arguments);
      for (var i = toCall.length - 1; i >= 0; i--) {
        args = [toCall[i].apply(this, args)];
      }
      return args[0];
    };
  },
  each: function each(obj, itr, scope) {
    if (!obj) {
      return;
    }
    if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
      obj.forEach(itr, scope);
    } else if (obj.length === obj.length + 0) {
      var key = void 0;
      var l = void 0;
      for (key = 0, l = obj.length; key < l; key++) {
        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
          return;
        }
      }
    } else {
      for (var _key in obj) {
        if (itr.call(scope, obj[_key], _key) === this.BREAK) {
          return;
        }
      }
    }
  },
  defer: function defer(fnc) {
    setTimeout(fnc, 0);
  },
  debounce: function debounce(func, threshold, callImmediately) {
    var timeout = void 0;
    return function () {
      var obj = this;
      var args = arguments;
      function delayed() {
        timeout = null;
        if (!callImmediately) func.apply(obj, args);
      }
      var callNow = callImmediately || !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(delayed, threshold);
      if (callNow) {
        func.apply(obj, args);
      }
    };
  },
  toArray: function toArray(obj) {
    if (obj.toArray) return obj.toArray();
    return ARR_SLICE.call(obj);
  },
  isUndefined: function isUndefined(obj) {
    return obj === undefined;
  },
  isNull: function isNull(obj) {
    return obj === null;
  },
  isNaN: function (_isNaN) {
    function isNaN(_x) {
      return _isNaN.apply(this, arguments);
    }
    isNaN.toString = function () {
      return _isNaN.toString();
    };
    return isNaN;
  }(function (obj) {
    return isNaN(obj);
  }),
  isArray: Array.isArray || function (obj) {
    return obj.constructor === Array;
  },
  isObject: function isObject(obj) {
    return obj === Object(obj);
  },
  isNumber: function isNumber(obj) {
    return obj === obj + 0;
  },
  isString: function isString(obj) {
    return obj === obj + '';
  },
  isBoolean: function isBoolean(obj) {
    return obj === false || obj === true;
  },
  isFunction: function isFunction(obj) {
    return obj instanceof Function;
  }
};

var INTERPRETATIONS = [
{
  litmus: Common.isString,
  conversions: {
    THREE_CHAR_HEX: {
      read: function read(original) {
        var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
        if (test === null) {
          return false;
        }
        return {
          space: 'HEX',
          hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
        };
      },
      write: colorToString
    },
    SIX_CHAR_HEX: {
      read: function read(original) {
        var test = original.match(/^#([A-F0-9]{6})$/i);
        if (test === null) {
          return false;
        }
        return {
          space: 'HEX',
          hex: parseInt('0x' + test[1].toString(), 0)
        };
      },
      write: colorToString
    },
    CSS_RGB: {
      read: function read(original) {
        var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
        if (test === null) {
          return false;
        }
        return {
          space: 'RGB',
          r: parseFloat(test[1]),
          g: parseFloat(test[2]),
          b: parseFloat(test[3])
        };
      },
      write: colorToString
    },
    CSS_RGBA: {
      read: function read(original) {
        var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
        if (test === null) {
          return false;
        }
        return {
          space: 'RGB',
          r: parseFloat(test[1]),
          g: parseFloat(test[2]),
          b: parseFloat(test[3]),
          a: parseFloat(test[4])
        };
      },
      write: colorToString
    }
  }
},
{
  litmus: Common.isNumber,
  conversions: {
    HEX: {
      read: function read(original) {
        return {
          space: 'HEX',
          hex: original,
          conversionName: 'HEX'
        };
      },
      write: function write(color) {
        return color.hex;
      }
    }
  }
},
{
  litmus: Common.isArray,
  conversions: {
    RGB_ARRAY: {
      read: function read(original) {
        if (original.length !== 3) {
          return false;
        }
        return {
          space: 'RGB',
          r: original[0],
          g: original[1],
          b: original[2]
        };
      },
      write: function write(color) {
        return [color.r, color.g, color.b];
      }
    },
    RGBA_ARRAY: {
      read: function read(original) {
        if (original.length !== 4) return false;
        return {
          space: 'RGB',
          r: original[0],
          g: original[1],
          b: original[2],
          a: original[3]
        };
      },
      write: function write(color) {
        return [color.r, color.g, color.b, color.a];
      }
    }
  }
},
{
  litmus: Common.isObject,
  conversions: {
    RGBA_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
          return {
            space: 'RGB',
            r: original.r,
            g: original.g,
            b: original.b,
            a: original.a
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          r: color.r,
          g: color.g,
          b: color.b,
          a: color.a
        };
      }
    },
    RGB_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
          return {
            space: 'RGB',
            r: original.r,
            g: original.g,
            b: original.b
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          r: color.r,
          g: color.g,
          b: color.b
        };
      }
    },
    HSVA_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
          return {
            space: 'HSV',
            h: original.h,
            s: original.s,
            v: original.v,
            a: original.a
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          h: color.h,
          s: color.s,
          v: color.v,
          a: color.a
        };
      }
    },
    HSV_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
          return {
            space: 'HSV',
            h: original.h,
            s: original.s,
            v: original.v
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          h: color.h,
          s: color.s,
          v: color.v
        };
      }
    }
  }
}];
var result = void 0;
var toReturn = void 0;
var interpret = function interpret() {
  toReturn = false;
  var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
  Common.each(INTERPRETATIONS, function (family) {
    if (family.litmus(original)) {
      Common.each(family.conversions, function (conversion, conversionName) {
        result = conversion.read(original);
        if (toReturn === false && result !== false) {
          toReturn = result;
          result.conversionName = conversionName;
          result.conversion = conversion;
          return Common.BREAK;
        }
      });
      return Common.BREAK;
    }
  });
  return toReturn;
};

var tmpComponent = void 0;
var ColorMath = {
  hsv_to_rgb: function hsv_to_rgb(h, s, v) {
    var hi = Math.floor(h / 60) % 6;
    var f = h / 60 - Math.floor(h / 60);
    var p = v * (1.0 - s);
    var q = v * (1.0 - f * s);
    var t = v * (1.0 - (1.0 - f) * s);
    var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
    return {
      r: c[0] * 255,
      g: c[1] * 255,
      b: c[2] * 255
    };
  },
  rgb_to_hsv: function rgb_to_hsv(r, g, b) {
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h = void 0;
    var s = void 0;
    if (max !== 0) {
      s = delta / max;
    } else {
      return {
        h: NaN,
        s: 0,
        v: 0
      };
    }
    if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    h /= 6;
    if (h < 0) {
      h += 1;
    }
    return {
      h: h * 360,
      s: s,
      v: max / 255
    };
  },
  rgb_to_hex: function rgb_to_hex(r, g, b) {
    var hex = this.hex_with_component(0, 2, r);
    hex = this.hex_with_component(hex, 1, g);
    hex = this.hex_with_component(hex, 0, b);
    return hex;
  },
  component_from_hex: function component_from_hex(hex, componentIndex) {
    return hex >> componentIndex * 8 & 0xFF;
  },
  hex_with_component: function hex_with_component(hex, componentIndex, value) {
    return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
  }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Color = function () {
  function Color() {
    classCallCheck(this, Color);
    this.__state = interpret.apply(this, arguments);
    if (this.__state === false) {
      throw new Error('Failed to interpret color arguments');
    }
    this.__state.a = this.__state.a || 1;
  }
  createClass(Color, [{
    key: 'toString',
    value: function toString() {
      return colorToString(this);
    }
  }, {
    key: 'toHexString',
    value: function toHexString() {
      return colorToString(this, true);
    }
  }, {
    key: 'toOriginal',
    value: function toOriginal() {
      return this.__state.conversion.write(this);
    }
  }]);
  return Color;
}();
function defineRGBComponent(target, component, componentHexIndex) {
  Object.defineProperty(target, component, {
    get: function get$$1() {
      if (this.__state.space === 'RGB') {
        return this.__state[component];
      }
      Color.recalculateRGB(this, component, componentHexIndex);
      return this.__state[component];
    },
    set: function set$$1(v) {
      if (this.__state.space !== 'RGB') {
        Color.recalculateRGB(this, component, componentHexIndex);
        this.__state.space = 'RGB';
      }
      this.__state[component] = v;
    }
  });
}
function defineHSVComponent(target, component) {
  Object.defineProperty(target, component, {
    get: function get$$1() {
      if (this.__state.space === 'HSV') {
        return this.__state[component];
      }
      Color.recalculateHSV(this);
      return this.__state[component];
    },
    set: function set$$1(v) {
      if (this.__state.space !== 'HSV') {
        Color.recalculateHSV(this);
        this.__state.space = 'HSV';
      }
      this.__state[component] = v;
    }
  });
}
Color.recalculateRGB = function (color, component, componentHexIndex) {
  if (color.__state.space === 'HEX') {
    color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
  } else if (color.__state.space === 'HSV') {
    Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
  } else {
    throw new Error('Corrupted color state');
  }
};
Color.recalculateHSV = function (color) {
  var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
  Common.extend(color.__state, {
    s: result.s,
    v: result.v
  });
  if (!Common.isNaN(result.h)) {
    color.__state.h = result.h;
  } else if (Common.isUndefined(color.__state.h)) {
    color.__state.h = 0;
  }
};
Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
defineRGBComponent(Color.prototype, 'r', 2);
defineRGBComponent(Color.prototype, 'g', 1);
defineRGBComponent(Color.prototype, 'b', 0);
defineHSVComponent(Color.prototype, 'h');
defineHSVComponent(Color.prototype, 's');
defineHSVComponent(Color.prototype, 'v');
Object.defineProperty(Color.prototype, 'a', {
  get: function get$$1() {
    return this.__state.a;
  },
  set: function set$$1(v) {
    this.__state.a = v;
  }
});
Object.defineProperty(Color.prototype, 'hex', {
  get: function get$$1() {
    if (this.__state.space !== 'HEX') {
      this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      this.__state.space = 'HEX';
    }
    return this.__state.hex;
  },
  set: function set$$1(v) {
    this.__state.space = 'HEX';
    this.__state.hex = v;
  }
});

var Controller = function () {
  function Controller(object, property) {
    classCallCheck(this, Controller);
    this.initialValue = object[property];
    this.domElement = document.createElement('div');
    this.object = object;
    this.property = property;
    this.__onChange = undefined;
    this.__onFinishChange = undefined;
  }
  createClass(Controller, [{
    key: 'onChange',
    value: function onChange(fnc) {
      this.__onChange = fnc;
      return this;
    }
  }, {
    key: 'onFinishChange',
    value: function onFinishChange(fnc) {
      this.__onFinishChange = fnc;
      return this;
    }
  }, {
    key: 'setValue',
    value: function setValue(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.object[this.property];
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      return this;
    }
  }, {
    key: 'isModified',
    value: function isModified() {
      return this.initialValue !== this.getValue();
    }
  }]);
  return Controller;
}();

var EVENT_MAP = {
  HTMLEvents: ['change'],
  MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
  KeyboardEvents: ['keydown']
};
var EVENT_MAP_INV = {};
Common.each(EVENT_MAP, function (v, k) {
  Common.each(v, function (e) {
    EVENT_MAP_INV[e] = k;
  });
});
var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
function cssValueToPixels(val) {
  if (val === '0' || Common.isUndefined(val)) {
    return 0;
  }
  var match = val.match(CSS_VALUE_PIXELS);
  if (!Common.isNull(match)) {
    return parseFloat(match[1]);
  }
  return 0;
}
var dom = {
  makeSelectable: function makeSelectable(elem, selectable) {
    if (elem === undefined || elem.style === undefined) return;
    elem.onselectstart = selectable ? function () {
      return false;
    } : function () {};
    elem.style.MozUserSelect = selectable ? 'auto' : 'none';
    elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
    elem.unselectable = selectable ? 'on' : 'off';
  },
  makeFullscreen: function makeFullscreen(elem, hor, vert) {
    var vertical = vert;
    var horizontal = hor;
    if (Common.isUndefined(horizontal)) {
      horizontal = true;
    }
    if (Common.isUndefined(vertical)) {
      vertical = true;
    }
    elem.style.position = 'absolute';
    if (horizontal) {
      elem.style.left = 0;
      elem.style.right = 0;
    }
    if (vertical) {
      elem.style.top = 0;
      elem.style.bottom = 0;
    }
  },
  fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
    var params = pars || {};
    var className = EVENT_MAP_INV[eventType];
    if (!className) {
      throw new Error('Event type ' + eventType + ' not supported.');
    }
    var evt = document.createEvent(className);
    switch (className) {
      case 'MouseEvents':
        {
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
          0,
          clientX,
          clientY,
          false, false, false, false, 0, null);
          break;
        }
      case 'KeyboardEvents':
        {
          var init = evt.initKeyboardEvent || evt.initKeyEvent;
          Common.defaults(params, {
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            keyCode: undefined,
            charCode: undefined
          });
          init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
          break;
        }
      default:
        {
          evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
          break;
        }
    }
    Common.defaults(evt, aux);
    elem.dispatchEvent(evt);
  },
  bind: function bind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.addEventListener) {
      elem.addEventListener(event, func, bool);
    } else if (elem.attachEvent) {
      elem.attachEvent('on' + event, func);
    }
    return dom;
  },
  unbind: function unbind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.removeEventListener) {
      elem.removeEventListener(event, func, bool);
    } else if (elem.detachEvent) {
      elem.detachEvent('on' + event, func);
    }
    return dom;
  },
  addClass: function addClass(elem, className) {
    if (elem.className === undefined) {
      elem.className = className;
    } else if (elem.className !== className) {
      var classes = elem.className.split(/ +/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
      }
    }
    return dom;
  },
  removeClass: function removeClass(elem, className) {
    if (className) {
      if (elem.className === className) {
        elem.removeAttribute('class');
      } else {
        var classes = elem.className.split(/ +/);
        var index = classes.indexOf(className);
        if (index !== -1) {
          classes.splice(index, 1);
          elem.className = classes.join(' ');
        }
      }
    } else {
      elem.className = undefined;
    }
    return dom;
  },
  hasClass: function hasClass(elem, className) {
    return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
  },
  getWidth: function getWidth(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
  },
  getHeight: function getHeight(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
  },
  getOffset: function getOffset(el) {
    var elem = el;
    var offset = { left: 0, top: 0 };
    if (elem.offsetParent) {
      do {
        offset.left += elem.offsetLeft;
        offset.top += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    }
    return offset;
  },
  isActive: function isActive(elem) {
    return elem === document.activeElement && (elem.type || elem.href);
  }
};

var BooleanController = function (_Controller) {
  inherits(BooleanController, _Controller);
  function BooleanController(object, property) {
    classCallCheck(this, BooleanController);
    var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
    var _this = _this2;
    _this2.__prev = _this2.getValue();
    _this2.__checkbox = document.createElement('input');
    _this2.__checkbox.setAttribute('type', 'checkbox');
    function onChange() {
      _this.setValue(!_this.__prev);
    }
    dom.bind(_this2.__checkbox, 'change', onChange, false);
    _this2.domElement.appendChild(_this2.__checkbox);
    _this2.updateDisplay();
    return _this2;
  }
  createClass(BooleanController, [{
    key: 'setValue',
    value: function setValue(v) {
      var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn;
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (this.getValue() === true) {
        this.__checkbox.setAttribute('checked', 'checked');
        this.__checkbox.checked = true;
        this.__prev = true;
      } else {
        this.__checkbox.checked = false;
        this.__prev = false;
      }
      return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return BooleanController;
}(Controller);

var OptionController = function (_Controller) {
  inherits(OptionController, _Controller);
  function OptionController(object, property, opts) {
    classCallCheck(this, OptionController);
    var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
    var options = opts;
    var _this = _this2;
    _this2.__select = document.createElement('select');
    if (Common.isArray(options)) {
      var map = {};
      Common.each(options, function (element) {
        map[element] = element;
      });
      options = map;
    }
    Common.each(options, function (value, key) {
      var opt = document.createElement('option');
      opt.innerHTML = key;
      opt.setAttribute('value', value);
      _this.__select.appendChild(opt);
    });
    _this2.updateDisplay();
    dom.bind(_this2.__select, 'change', function () {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });
    _this2.domElement.appendChild(_this2.__select);
    return _this2;
  }
  createClass(OptionController, [{
    key: 'setValue',
    value: function setValue(v) {
      var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn;
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (dom.isActive(this.__select)) return this;
      this.__select.value = this.getValue();
      return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return OptionController;
}(Controller);

var StringController = function (_Controller) {
  inherits(StringController, _Controller);
  function StringController(object, property) {
    classCallCheck(this, StringController);
    var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
    var _this = _this2;
    function onChange() {
      _this.setValue(_this.__input.value);
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.__input = document.createElement('input');
    _this2.__input.setAttribute('type', 'text');
    dom.bind(_this2.__input, 'keyup', onChange);
    dom.bind(_this2.__input, 'change', onChange);
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(StringController, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (!dom.isActive(this.__input)) {
        this.__input.value = this.getValue();
      }
      return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return StringController;
}(Controller);

function numDecimals(x) {
  var _x = x.toString();
  if (_x.indexOf('.') > -1) {
    return _x.length - _x.indexOf('.') - 1;
  }
  return 0;
}
var NumberController = function (_Controller) {
  inherits(NumberController, _Controller);
  function NumberController(object, property, params) {
    classCallCheck(this, NumberController);
    var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
    var _params = params || {};
    _this.__min = _params.min;
    _this.__max = _params.max;
    _this.__step = _params.step;
    if (Common.isUndefined(_this.__step)) {
      if (_this.initialValue === 0) {
        _this.__impliedStep = 1;
      } else {
        _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
      }
    } else {
      _this.__impliedStep = _this.__step;
    }
    _this.__precision = numDecimals(_this.__impliedStep);
    return _this;
  }
  createClass(NumberController, [{
    key: 'setValue',
    value: function setValue(v) {
      var _v = v;
      if (this.__min !== undefined && _v < this.__min) {
        _v = this.__min;
      } else if (this.__max !== undefined && _v > this.__max) {
        _v = this.__max;
      }
      if (this.__step !== undefined && _v % this.__step !== 0) {
        _v = Math.round(_v / this.__step) * this.__step;
      }
      return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
    }
  }, {
    key: 'min',
    value: function min(minValue) {
      this.__min = minValue;
      return this;
    }
  }, {
    key: 'max',
    value: function max(maxValue) {
      this.__max = maxValue;
      return this;
    }
  }, {
    key: 'step',
    value: function step(stepValue) {
      this.__step = stepValue;
      this.__impliedStep = stepValue;
      this.__precision = numDecimals(stepValue);
      return this;
    }
  }]);
  return NumberController;
}(Controller);

function roundToDecimal(value, decimals) {
  var tenTo = Math.pow(10, decimals);
  return Math.round(value * tenTo) / tenTo;
}
var NumberControllerBox = function (_NumberController) {
  inherits(NumberControllerBox, _NumberController);
  function NumberControllerBox(object, property, params) {
    classCallCheck(this, NumberControllerBox);
    var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
    _this2.__truncationSuspended = false;
    var _this = _this2;
    var prevY = void 0;
    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!Common.isNaN(attempted)) {
        _this.setValue(attempted);
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onBlur() {
      onFinish();
    }
    function onMouseDrag(e) {
      var diff = prevY - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
      prevY = e.clientY;
    }
    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      onFinish();
    }
    function onMouseDown(e) {
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      prevY = e.clientY;
    }
    _this2.__input = document.createElement('input');
    _this2.__input.setAttribute('type', 'text');
    dom.bind(_this2.__input, 'change', onChange);
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__input, 'mousedown', onMouseDown);
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
        onFinish();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(NumberControllerBox, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
      return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return NumberControllerBox;
}(NumberController);

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}
var NumberControllerSlider = function (_NumberController) {
  inherits(NumberControllerSlider, _NumberController);
  function NumberControllerSlider(object, property, min, max, step) {
    classCallCheck(this, NumberControllerSlider);
    var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
    var _this = _this2;
    _this2.__background = document.createElement('div');
    _this2.__foreground = document.createElement('div');
    dom.bind(_this2.__background, 'mousedown', onMouseDown);
    dom.bind(_this2.__background, 'touchstart', onTouchStart);
    dom.addClass(_this2.__background, 'slider');
    dom.addClass(_this2.__foreground, 'slider-fg');
    function onMouseDown(e) {
      document.activeElement.blur();
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      onMouseDrag(e);
    }
    function onMouseDrag(e) {
      e.preventDefault();
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      return false;
    }
    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onTouchStart(e) {
      if (e.touches.length !== 1) {
        return;
      }
      dom.bind(window, 'touchmove', onTouchMove);
      dom.bind(window, 'touchend', onTouchEnd);
      onTouchMove(e);
    }
    function onTouchMove(e) {
      var clientX = e.touches[0].clientX;
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
    }
    function onTouchEnd() {
      dom.unbind(window, 'touchmove', onTouchMove);
      dom.unbind(window, 'touchend', onTouchEnd);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.updateDisplay();
    _this2.__background.appendChild(_this2.__foreground);
    _this2.domElement.appendChild(_this2.__background);
    return _this2;
  }
  createClass(NumberControllerSlider, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
      this.__foreground.style.width = pct * 100 + '%';
      return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return NumberControllerSlider;
}(NumberController);

var FunctionController = function (_Controller) {
  inherits(FunctionController, _Controller);
  function FunctionController(object, property, text) {
    classCallCheck(this, FunctionController);
    var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
    var _this = _this2;
    _this2.__button = document.createElement('div');
    _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
    dom.bind(_this2.__button, 'click', function (e) {
      e.preventDefault();
      _this.fire();
      return false;
    });
    dom.addClass(_this2.__button, 'button');
    _this2.domElement.appendChild(_this2.__button);
    return _this2;
  }
  createClass(FunctionController, [{
    key: 'fire',
    value: function fire() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      this.getValue().call(this.object);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
    }
  }]);
  return FunctionController;
}(Controller);

var ColorController = function (_Controller) {
  inherits(ColorController, _Controller);
  function ColorController(object, property) {
    classCallCheck(this, ColorController);
    var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
    _this2.__color = new Color(_this2.getValue());
    _this2.__temp = new Color(0);
    var _this = _this2;
    _this2.domElement = document.createElement('div');
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement('div');
    _this2.__selector.className = 'selector';
    _this2.__saturation_field = document.createElement('div');
    _this2.__saturation_field.className = 'saturation-field';
    _this2.__field_knob = document.createElement('div');
    _this2.__field_knob.className = 'field-knob';
    _this2.__field_knob_border = '2px solid ';
    _this2.__hue_knob = document.createElement('div');
    _this2.__hue_knob.className = 'hue-knob';
    _this2.__hue_field = document.createElement('div');
    _this2.__hue_field.className = 'hue-field';
    _this2.__input = document.createElement('input');
    _this2.__input.type = 'text';
    _this2.__input_textShadow = '0 1px 1px ';
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        onBlur.call(this);
      }
    });
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__selector, 'mousedown', function ()        {
      dom.addClass(this, 'drag').bind(window, 'mouseup', function ()        {
        dom.removeClass(_this.__selector, 'drag');
      });
    });
    dom.bind(_this2.__selector, 'touchstart', function ()        {
      dom.addClass(this, 'drag').bind(window, 'touchend', function ()        {
        dom.removeClass(_this.__selector, 'drag');
      });
    });
    var valueField = document.createElement('div');
    Common.extend(_this2.__selector.style, {
      width: '122px',
      height: '102px',
      padding: '3px',
      backgroundColor: '#222',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
    });
    Common.extend(_this2.__field_knob.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
      borderRadius: '12px',
      zIndex: 1
    });
    Common.extend(_this2.__hue_knob.style, {
      position: 'absolute',
      width: '15px',
      height: '2px',
      borderRight: '4px solid #fff',
      zIndex: 1
    });
    Common.extend(_this2.__saturation_field.style, {
      width: '100px',
      height: '100px',
      border: '1px solid #555',
      marginRight: '3px',
      display: 'inline-block',
      cursor: 'pointer'
    });
    Common.extend(valueField.style, {
      width: '100%',
      height: '100%',
      background: 'none'
    });
    linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
    Common.extend(_this2.__hue_field.style, {
      width: '15px',
      height: '100px',
      border: '1px solid #555',
      cursor: 'ns-resize',
      position: 'absolute',
      top: '3px',
      right: '3px'
    });
    hueGradient(_this2.__hue_field);
    Common.extend(_this2.__input.style, {
      outline: 'none',
      textAlign: 'center',
      color: '#fff',
      border: 0,
      fontWeight: 'bold',
      textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
    });
    dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
    dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
    dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
    dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
    dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
    dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, 'mousemove', setSV);
      dom.bind(window, 'touchmove', setSV);
      dom.bind(window, 'mouseup', fieldUpSV);
      dom.bind(window, 'touchend', fieldUpSV);
    }
    function fieldDownH(e) {
      setH(e);
      dom.bind(window, 'mousemove', setH);
      dom.bind(window, 'touchmove', setH);
      dom.bind(window, 'mouseup', fieldUpH);
      dom.bind(window, 'touchend', fieldUpH);
    }
    function fieldUpSV() {
      dom.unbind(window, 'mousemove', setSV);
      dom.unbind(window, 'touchmove', setSV);
      dom.unbind(window, 'mouseup', fieldUpSV);
      dom.unbind(window, 'touchend', fieldUpSV);
      onFinish();
    }
    function fieldUpH() {
      dom.unbind(window, 'mousemove', setH);
      dom.unbind(window, 'touchmove', setH);
      dom.unbind(window, 'mouseup', fieldUpH);
      dom.unbind(window, 'touchend', fieldUpH);
      onFinish();
    }
    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.__color.toOriginal());
      }
    }
    _this2.__saturation_field.appendChild(valueField);
    _this2.__selector.appendChild(_this2.__field_knob);
    _this2.__selector.appendChild(_this2.__saturation_field);
    _this2.__selector.appendChild(_this2.__hue_field);
    _this2.__hue_field.appendChild(_this2.__hue_knob);
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__selector);
    _this2.updateDisplay();
    function setSV(e) {
      if (e.type.indexOf('touch') === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__saturation_field.getBoundingClientRect();
      var _ref = e.touches && e.touches[0] || e,
          clientX = _ref.clientX,
          clientY = _ref.clientY;
      var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
      var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (v > 1) {
        v = 1;
      } else if (v < 0) {
        v = 0;
      }
      if (s > 1) {
        s = 1;
      } else if (s < 0) {
        s = 0;
      }
      _this.__color.v = v;
      _this.__color.s = s;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    function setH(e) {
      if (e.type.indexOf('touch') === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__hue_field.getBoundingClientRect();
      var _ref2 = e.touches && e.touches[0] || e,
          clientY = _ref2.clientY;
      var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (h > 1) {
        h = 1;
      } else if (h < 0) {
        h = 0;
      }
      _this.__color.h = h * 360;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    return _this2;
  }
  createClass(ColorController, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      var i = interpret(this.getValue());
      if (i !== false) {
        var mismatch = false;
        Common.each(Color.COMPONENTS, function (component) {
          if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
            mismatch = true;
            return {};
          }
        }, this);
        if (mismatch) {
          Common.extend(this.__color.__state, i);
        }
      }
      Common.extend(this.__temp.__state, this.__color.__state);
      this.__temp.a = 1;
      var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
      var _flip = 255 - flip;
      Common.extend(this.__field_knob.style, {
        marginLeft: 100 * this.__color.s - 7 + 'px',
        marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
        backgroundColor: this.__temp.toHexString(),
        border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
      });
      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
      this.__temp.s = 1;
      this.__temp.v = 1;
      linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
      this.__input.value = this.__color.toString();
      Common.extend(this.__input.style, {
        backgroundColor: this.__color.toHexString(),
        color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
        textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
      });
    }
  }]);
  return ColorController;
}(Controller);
var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
function linearGradient(elem, x, a, b) {
  elem.style.background = '';
  Common.each(vendors, function (vendor) {
    elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
  });
}
function hueGradient(elem) {
  elem.style.background = '';
  elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
  elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
}

var css = {
  load: function load(url, indoc) {
    var doc = indoc || document;
    var link = doc.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    doc.getElementsByTagName('head')[0].appendChild(link);
  },
  inject: function inject(cssContent, indoc) {
    var doc = indoc || document;
    var injected = document.createElement('style');
    injected.type = 'text/css';
    injected.innerHTML = cssContent;
    var head = doc.getElementsByTagName('head')[0];
    try {
      head.appendChild(injected);
    } catch (e) {
    }
  }
};

var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

var ControllerFactory = function ControllerFactory(object, property) {
  var initialValue = object[property];
  if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
    return new OptionController(object, property, arguments[2]);
  }
  if (Common.isNumber(initialValue)) {
    if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
      }
      return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
    }
    if (Common.isNumber(arguments[4])) {
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
    }
    return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
  }
  if (Common.isString(initialValue)) {
    return new StringController(object, property);
  }
  if (Common.isFunction(initialValue)) {
    return new FunctionController(object, property, '');
  }
  if (Common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }
  return null;
};

function requestAnimationFrame(callback) {
  setTimeout(callback, 1000 / 60);
}
var requestAnimationFrame$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame;

var CenteredDiv = function () {
  function CenteredDiv() {
    classCallCheck(this, CenteredDiv);
    this.backgroundElement = document.createElement('div');
    Common.extend(this.backgroundElement.style, {
      backgroundColor: 'rgba(0,0,0,0.8)',
      top: 0,
      left: 0,
      display: 'none',
      zIndex: '1000',
      opacity: 0,
      WebkitTransition: 'opacity 0.2s linear',
      transition: 'opacity 0.2s linear'
    });
    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = 'fixed';
    this.domElement = document.createElement('div');
    Common.extend(this.domElement.style, {
      position: 'fixed',
      display: 'none',
      zIndex: '1001',
      opacity: 0,
      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
      transition: 'transform 0.2s ease-out, opacity 0.2s linear'
    });
    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);
    var _this = this;
    dom.bind(this.backgroundElement, 'click', function () {
      _this.hide();
    });
  }
  createClass(CenteredDiv, [{
    key: 'show',
    value: function show() {
      var _this = this;
      this.backgroundElement.style.display = 'block';
      this.domElement.style.display = 'block';
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = 'scale(1.1)';
      this.layout();
      Common.defer(function () {
        _this.backgroundElement.style.opacity = 1;
        _this.domElement.style.opacity = 1;
        _this.domElement.style.webkitTransform = 'scale(1)';
      });
    }
  }, {
    key: 'hide',
    value: function hide() {
      var _this = this;
      var hide = function hide() {
        _this.domElement.style.display = 'none';
        _this.backgroundElement.style.display = 'none';
        dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
        dom.unbind(_this.domElement, 'transitionend', hide);
        dom.unbind(_this.domElement, 'oTransitionEnd', hide);
      };
      dom.bind(this.domElement, 'webkitTransitionEnd', hide);
      dom.bind(this.domElement, 'transitionend', hide);
      dom.bind(this.domElement, 'oTransitionEnd', hide);
      this.backgroundElement.style.opacity = 0;
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = 'scale(1.1)';
    }
  }, {
    key: 'layout',
    value: function layout() {
      this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
      this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
    }
  }]);
  return CenteredDiv;
}();

var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

css.inject(styleSheet);
var CSS_NAMESPACE = 'dg';
var HIDE_KEY_CODE = 72;
var CLOSE_BUTTON_HEIGHT = 20;
var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
var SUPPORTS_LOCAL_STORAGE = function () {
  try {
    return !!window.localStorage;
  } catch (e) {
    return false;
  }
}();
var SAVE_DIALOGUE = void 0;
var autoPlaceVirgin = true;
var autoPlaceContainer = void 0;
var hide = false;
var hideableGuis = [];
var GUI = function GUI(pars) {
  var _this = this;
  var params = pars || {};
  this.domElement = document.createElement('div');
  this.__ul = document.createElement('ul');
  this.domElement.appendChild(this.__ul);
  dom.addClass(this.domElement, CSS_NAMESPACE);
  this.__folders = {};
  this.__controllers = [];
  this.__rememberedObjects = [];
  this.__rememberedObjectIndecesToControllers = [];
  this.__listening = [];
  params = Common.defaults(params, {
    closeOnTop: false,
    autoPlace: true,
    width: GUI.DEFAULT_WIDTH
  });
  params = Common.defaults(params, {
    resizable: params.autoPlace,
    hideable: params.autoPlace
  });
  if (!Common.isUndefined(params.load)) {
    if (params.preset) {
      params.load.preset = params.preset;
    }
  } else {
    params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
  }
  if (Common.isUndefined(params.parent) && params.hideable) {
    hideableGuis.push(this);
  }
  params.resizable = Common.isUndefined(params.parent) && params.resizable;
  if (params.autoPlace && Common.isUndefined(params.scrollable)) {
    params.scrollable = true;
  }
  var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
  var saveToLocalStorage = void 0;
  var titleRow = void 0;
  Object.defineProperties(this,
  {
    parent: {
      get: function get$$1() {
        return params.parent;
      }
    },
    scrollable: {
      get: function get$$1() {
        return params.scrollable;
      }
    },
    autoPlace: {
      get: function get$$1() {
        return params.autoPlace;
      }
    },
    closeOnTop: {
      get: function get$$1() {
        return params.closeOnTop;
      }
    },
    preset: {
      get: function get$$1() {
        if (_this.parent) {
          return _this.getRoot().preset;
        }
        return params.load.preset;
      },
      set: function set$$1(v) {
        if (_this.parent) {
          _this.getRoot().preset = v;
        } else {
          params.load.preset = v;
        }
        setPresetSelectIndex(this);
        _this.revert();
      }
    },
    width: {
      get: function get$$1() {
        return params.width;
      },
      set: function set$$1(v) {
        params.width = v;
        setWidth(_this, v);
      }
    },
    name: {
      get: function get$$1() {
        return params.name;
      },
      set: function set$$1(v) {
        params.name = v;
        if (titleRow) {
          titleRow.innerHTML = params.name;
        }
      }
    },
    closed: {
      get: function get$$1() {
        return params.closed;
      },
      set: function set$$1(v) {
        params.closed = v;
        if (params.closed) {
          dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
        } else {
          dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
        }
        this.onResize();
        if (_this.__closeButton) {
          _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
        }
      }
    },
    load: {
      get: function get$$1() {
        return params.load;
      }
    },
    useLocalStorage: {
      get: function get$$1() {
        return useLocalStorage;
      },
      set: function set$$1(bool) {
        if (SUPPORTS_LOCAL_STORAGE) {
          useLocalStorage = bool;
          if (bool) {
            dom.bind(window, 'unload', saveToLocalStorage);
          } else {
            dom.unbind(window, 'unload', saveToLocalStorage);
          }
          localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
        }
      }
    }
  });
  if (Common.isUndefined(params.parent)) {
    this.closed = params.closed || false;
    dom.addClass(this.domElement, GUI.CLASS_MAIN);
    dom.makeSelectable(this.domElement, false);
    if (SUPPORTS_LOCAL_STORAGE) {
      if (useLocalStorage) {
        _this.useLocalStorage = true;
        var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
        if (savedGui) {
          params.load = JSON.parse(savedGui);
        }
      }
    }
    this.__closeButton = document.createElement('div');
    this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
    dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
    if (params.closeOnTop) {
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
      this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
    } else {
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
      this.domElement.appendChild(this.__closeButton);
    }
    dom.bind(this.__closeButton, 'click', function () {
      _this.closed = !_this.closed;
    });
  } else {
    if (params.closed === undefined) {
      params.closed = true;
    }
    var titleRowName = document.createTextNode(params.name);
    dom.addClass(titleRowName, 'controller-name');
    titleRow = addRow(_this, titleRowName);
    var onClickTitle = function onClickTitle(e) {
      e.preventDefault();
      _this.closed = !_this.closed;
      return false;
    };
    dom.addClass(this.__ul, GUI.CLASS_CLOSED);
    dom.addClass(titleRow, 'title');
    dom.bind(titleRow, 'click', onClickTitle);
    if (!params.closed) {
      this.closed = false;
    }
  }
  if (params.autoPlace) {
    if (Common.isUndefined(params.parent)) {
      if (autoPlaceVirgin) {
        autoPlaceContainer = document.createElement('div');
        dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
        dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
        document.body.appendChild(autoPlaceContainer);
        autoPlaceVirgin = false;
      }
      autoPlaceContainer.appendChild(this.domElement);
      dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
    }
    if (!this.parent) {
      setWidth(_this, params.width);
    }
  }
  this.__resizeHandler = function () {
    _this.onResizeDebounced();
  };
  dom.bind(window, 'resize', this.__resizeHandler);
  dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
  dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
  dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
  this.onResize();
  if (params.resizable) {
    addResizeHandle(this);
  }
  saveToLocalStorage = function saveToLocalStorage() {
    if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
    }
  };
  this.saveToLocalStorageIfPossible = saveToLocalStorage;
  function resetWidth() {
    var root = _this.getRoot();
    root.width += 1;
    Common.defer(function () {
      root.width -= 1;
    });
  }
  if (!params.parent) {
    resetWidth();
  }
};
GUI.toggleHide = function () {
  hide = !hide;
  Common.each(hideableGuis, function (gui) {
    gui.domElement.style.display = hide ? 'none' : '';
  });
};
GUI.CLASS_AUTO_PLACE = 'a';
GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
GUI.CLASS_MAIN = 'main';
GUI.CLASS_CONTROLLER_ROW = 'cr';
GUI.CLASS_TOO_TALL = 'taller-than-window';
GUI.CLASS_CLOSED = 'closed';
GUI.CLASS_CLOSE_BUTTON = 'close-button';
GUI.CLASS_CLOSE_TOP = 'close-top';
GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
GUI.CLASS_DRAG = 'drag';
GUI.DEFAULT_WIDTH = 245;
GUI.TEXT_CLOSED = 'Close Controls';
GUI.TEXT_OPEN = 'Open Controls';
GUI._keydownHandler = function (e) {
  if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
    GUI.toggleHide();
  }
};
dom.bind(window, 'keydown', GUI._keydownHandler, false);
Common.extend(GUI.prototype,
{
  add: function add(object, property) {
    return _add(this, object, property, {
      factoryArgs: Array.prototype.slice.call(arguments, 2)
    });
  },
  addColor: function addColor(object, property) {
    return _add(this, object, property, {
      color: true
    });
  },
  remove: function remove(controller) {
    this.__ul.removeChild(controller.__li);
    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
    var _this = this;
    Common.defer(function () {
      _this.onResize();
    });
  },
  destroy: function destroy() {
    if (this.parent) {
      throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
    }
    if (this.autoPlace) {
      autoPlaceContainer.removeChild(this.domElement);
    }
    var _this = this;
    Common.each(this.__folders, function (subfolder) {
      _this.removeFolder(subfolder);
    });
    dom.unbind(window, 'keydown', GUI._keydownHandler, false);
    removeListeners(this);
  },
  addFolder: function addFolder(name) {
    if (this.__folders[name] !== undefined) {
      throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
    }
    var newGuiParams = { name: name, parent: this };
    newGuiParams.autoPlace = this.autoPlace;
    if (this.load &&
    this.load.folders &&
    this.load.folders[name]) {
      newGuiParams.closed = this.load.folders[name].closed;
      newGuiParams.load = this.load.folders[name];
    }
    var gui = new GUI(newGuiParams);
    this.__folders[name] = gui;
    var li = addRow(this, gui.domElement);
    dom.addClass(li, 'folder');
    return gui;
  },
  removeFolder: function removeFolder(folder) {
    this.__ul.removeChild(folder.domElement.parentElement);
    delete this.__folders[folder.name];
    if (this.load &&
    this.load.folders &&
    this.load.folders[folder.name]) {
      delete this.load.folders[folder.name];
    }
    removeListeners(folder);
    var _this = this;
    Common.each(folder.__folders, function (subfolder) {
      folder.removeFolder(subfolder);
    });
    Common.defer(function () {
      _this.onResize();
    });
  },
  open: function open() {
    this.closed = false;
  },
  close: function close() {
    this.closed = true;
  },
  hide: function hide() {
    this.domElement.style.display = 'none';
  },
  show: function show() {
    this.domElement.style.display = '';
  },
  onResize: function onResize() {
    var root = this.getRoot();
    if (root.scrollable) {
      var top = dom.getOffset(root.__ul).top;
      var h = 0;
      Common.each(root.__ul.childNodes, function (node) {
        if (!(root.autoPlace && node === root.__save_row)) {
          h += dom.getHeight(node);
        }
      });
      if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
        dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
      } else {
        dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = 'auto';
      }
    }
    if (root.__resize_handle) {
      Common.defer(function () {
        root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
      });
    }
    if (root.__closeButton) {
      root.__closeButton.style.width = root.width + 'px';
    }
  },
  onResizeDebounced: Common.debounce(function () {
    this.onResize();
  }, 50),
  remember: function remember() {
    if (Common.isUndefined(SAVE_DIALOGUE)) {
      SAVE_DIALOGUE = new CenteredDiv();
      SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
    }
    if (this.parent) {
      throw new Error('You can only call remember on a top level GUI.');
    }
    var _this = this;
    Common.each(Array.prototype.slice.call(arguments), function (object) {
      if (_this.__rememberedObjects.length === 0) {
        addSaveMenu(_this);
      }
      if (_this.__rememberedObjects.indexOf(object) === -1) {
        _this.__rememberedObjects.push(object);
      }
    });
    if (this.autoPlace) {
      setWidth(this, this.width);
    }
  },
  getRoot: function getRoot() {
    var gui = this;
    while (gui.parent) {
      gui = gui.parent;
    }
    return gui;
  },
  getSaveObject: function getSaveObject() {
    var toReturn = this.load;
    toReturn.closed = this.closed;
    if (this.__rememberedObjects.length > 0) {
      toReturn.preset = this.preset;
      if (!toReturn.remembered) {
        toReturn.remembered = {};
      }
      toReturn.remembered[this.preset] = getCurrentPreset(this);
    }
    toReturn.folders = {};
    Common.each(this.__folders, function (element, key) {
      toReturn.folders[key] = element.getSaveObject();
    });
    return toReturn;
  },
  save: function save() {
    if (!this.load.remembered) {
      this.load.remembered = {};
    }
    this.load.remembered[this.preset] = getCurrentPreset(this);
    markPresetModified(this, false);
    this.saveToLocalStorageIfPossible();
  },
  saveAs: function saveAs(presetName) {
    if (!this.load.remembered) {
      this.load.remembered = {};
      this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
    }
    this.load.remembered[presetName] = getCurrentPreset(this);
    this.preset = presetName;
    addPresetOption(this, presetName, true);
    this.saveToLocalStorageIfPossible();
  },
  revert: function revert(gui) {
    Common.each(this.__controllers, function (controller) {
      if (!this.getRoot().load.remembered) {
        controller.setValue(controller.initialValue);
      } else {
        recallSavedValue(gui || this.getRoot(), controller);
      }
      if (controller.__onFinishChange) {
        controller.__onFinishChange.call(controller, controller.getValue());
      }
    }, this);
    Common.each(this.__folders, function (folder) {
      folder.revert(folder);
    });
    if (!gui) {
      markPresetModified(this.getRoot(), false);
    }
  },
  listen: function listen(controller) {
    var init = this.__listening.length === 0;
    this.__listening.push(controller);
    if (init) {
      updateDisplays(this.__listening);
    }
  },
  updateDisplay: function updateDisplay() {
    Common.each(this.__controllers, function (controller) {
      controller.updateDisplay();
    });
    Common.each(this.__folders, function (folder) {
      folder.updateDisplay();
    });
  }
});
function addRow(gui, newDom, liBefore) {
  var li = document.createElement('li');
  if (newDom) {
    li.appendChild(newDom);
  }
  if (liBefore) {
    gui.__ul.insertBefore(li, liBefore);
  } else {
    gui.__ul.appendChild(li);
  }
  gui.onResize();
  return li;
}
function removeListeners(gui) {
  dom.unbind(window, 'resize', gui.__resizeHandler);
  if (gui.saveToLocalStorageIfPossible) {
    dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
  }
}
function markPresetModified(gui, modified) {
  var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
  if (modified) {
    opt.innerHTML = opt.value + '*';
  } else {
    opt.innerHTML = opt.value;
  }
}
function augmentController(gui, li, controller) {
  controller.__li = li;
  controller.__gui = gui;
  Common.extend(controller,                                   {
    options: function options(_options) {
      if (arguments.length > 1) {
        var nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: nextSibling,
          factoryArgs: [Common.toArray(arguments)]
        });
      }
      if (Common.isArray(_options) || Common.isObject(_options)) {
        var _nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: _nextSibling,
          factoryArgs: [_options]
        });
      }
    },
    name: function name(_name) {
      controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
      return controller;
    },
    listen: function listen() {
      controller.__gui.listen(controller);
      return controller;
    },
    remove: function remove() {
      controller.__gui.remove(controller);
      return controller;
    }
  });
  if (controller instanceof NumberControllerSlider) {
    var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
    Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
      var pc = controller[method];
      var pb = box[method];
      controller[method] = box[method] = function () {
        var args = Array.prototype.slice.call(arguments);
        pb.apply(box, args);
        return pc.apply(controller, args);
      };
    });
    dom.addClass(li, 'has-slider');
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
  } else if (controller instanceof NumberControllerBox) {
    var r = function r(returned) {
      if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
        var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
        var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
        controller.remove();
        var newController = _add(gui, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [controller.__min, controller.__max, controller.__step]
        });
        newController.name(oldName);
        if (wasListening) newController.listen();
        return newController;
      }
      return returned;
    };
    controller.min = Common.compose(r, controller.min);
    controller.max = Common.compose(r, controller.max);
  } else if (controller instanceof BooleanController) {
    dom.bind(li, 'click', function () {
      dom.fakeEvent(controller.__checkbox, 'click');
    });
    dom.bind(controller.__checkbox, 'click', function (e) {
      e.stopPropagation();
    });
  } else if (controller instanceof FunctionController) {
    dom.bind(li, 'click', function () {
      dom.fakeEvent(controller.__button, 'click');
    });
    dom.bind(li, 'mouseover', function () {
      dom.addClass(controller.__button, 'hover');
    });
    dom.bind(li, 'mouseout', function () {
      dom.removeClass(controller.__button, 'hover');
    });
  } else if (controller instanceof ColorController) {
    dom.addClass(li, 'color');
    controller.updateDisplay = Common.compose(function (val) {
      li.style.borderLeftColor = controller.__color.toString();
      return val;
    }, controller.updateDisplay);
    controller.updateDisplay();
  }
  controller.setValue = Common.compose(function (val) {
    if (gui.getRoot().__preset_select && controller.isModified()) {
      markPresetModified(gui.getRoot(), true);
    }
    return val;
  }, controller.setValue);
}
function recallSavedValue(gui, controller) {
  var root = gui.getRoot();
  var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
  if (matchedIndex !== -1) {
    var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
    if (controllerMap === undefined) {
      controllerMap = {};
      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
    }
    controllerMap[controller.property] = controller;
    if (root.load && root.load.remembered) {
      var presetMap = root.load.remembered;
      var preset = void 0;
      if (presetMap[gui.preset]) {
        preset = presetMap[gui.preset];
      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        return;
      }
      if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
        var value = preset[matchedIndex][controller.property];
        controller.initialValue = value;
        controller.setValue(value);
      }
    }
  }
}
function _add(gui, object, property, params) {
  if (object[property] === undefined) {
    throw new Error('Object "' + object + '" has no property "' + property + '"');
  }
  var controller = void 0;
  if (params.color) {
    controller = new ColorController(object, property);
  } else {
    var factoryArgs = [object, property].concat(params.factoryArgs);
    controller = ControllerFactory.apply(gui, factoryArgs);
  }
  if (params.before instanceof Controller) {
    params.before = params.before.__li;
  }
  recallSavedValue(gui, controller);
  dom.addClass(controller.domElement, 'c');
  var name = document.createElement('span');
  dom.addClass(name, 'property-name');
  name.innerHTML = controller.property;
  var container = document.createElement('div');
  container.appendChild(name);
  container.appendChild(controller.domElement);
  var li = addRow(gui, container, params.before);
  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
  if (controller instanceof ColorController) {
    dom.addClass(li, 'color');
  } else {
    dom.addClass(li, _typeof(controller.getValue()));
  }
  augmentController(gui, li, controller);
  gui.__controllers.push(controller);
  return controller;
}
function getLocalStorageHash(gui, key) {
  return document.location.href + '.' + key;
}
function addPresetOption(gui, name, setSelected) {
  var opt = document.createElement('option');
  opt.innerHTML = name;
  opt.value = name;
  gui.__preset_select.appendChild(opt);
  if (setSelected) {
    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
  }
}
function showHideExplain(gui, explain) {
  explain.style.display = gui.useLocalStorage ? 'block' : 'none';
}
function addSaveMenu(gui) {
  var div = gui.__save_row = document.createElement('li');
  dom.addClass(gui.domElement, 'has-save');
  gui.__ul.insertBefore(div, gui.__ul.firstChild);
  dom.addClass(div, 'save-row');
  var gears = document.createElement('span');
  gears.innerHTML = '&nbsp;';
  dom.addClass(gears, 'button gears');
  var button = document.createElement('span');
  button.innerHTML = 'Save';
  dom.addClass(button, 'button');
  dom.addClass(button, 'save');
  var button2 = document.createElement('span');
  button2.innerHTML = 'New';
  dom.addClass(button2, 'button');
  dom.addClass(button2, 'save-as');
  var button3 = document.createElement('span');
  button3.innerHTML = 'Revert';
  dom.addClass(button3, 'button');
  dom.addClass(button3, 'revert');
  var select = gui.__preset_select = document.createElement('select');
  if (gui.load && gui.load.remembered) {
    Common.each(gui.load.remembered, function (value, key) {
      addPresetOption(gui, key, key === gui.preset);
    });
  } else {
    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
  }
  dom.bind(select, 'change', function () {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
    }
    gui.preset = this.value;
  });
  div.appendChild(select);
  div.appendChild(gears);
  div.appendChild(button);
  div.appendChild(button2);
  div.appendChild(button3);
  if (SUPPORTS_LOCAL_STORAGE) {
    var explain = document.getElementById('dg-local-explain');
    var localStorageCheckBox = document.getElementById('dg-local-storage');
    var saveLocally = document.getElementById('dg-save-locally');
    saveLocally.style.display = 'block';
    if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
      localStorageCheckBox.setAttribute('checked', 'checked');
    }
    showHideExplain(gui, explain);
    dom.bind(localStorageCheckBox, 'change', function () {
      gui.useLocalStorage = !gui.useLocalStorage;
      showHideExplain(gui, explain);
    });
  }
  var newConstructorTextArea = document.getElementById('dg-new-constructor');
  dom.bind(newConstructorTextArea, 'keydown', function (e) {
    if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
      SAVE_DIALOGUE.hide();
    }
  });
  dom.bind(gears, 'click', function () {
    newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
    SAVE_DIALOGUE.show();
    newConstructorTextArea.focus();
    newConstructorTextArea.select();
  });
  dom.bind(button, 'click', function () {
    gui.save();
  });
  dom.bind(button2, 'click', function () {
    var presetName = prompt('Enter a new preset name.');
    if (presetName) {
      gui.saveAs(presetName);
    }
  });
  dom.bind(button3, 'click', function () {
    gui.revert();
  });
}
function addResizeHandle(gui) {
  var pmouseX = void 0;
  gui.__resize_handle = document.createElement('div');
  Common.extend(gui.__resize_handle.style, {
    width: '6px',
    marginLeft: '-3px',
    height: '200px',
    cursor: 'ew-resize',
    position: 'absolute'
  });
  function drag(e) {
    e.preventDefault();
    gui.width += pmouseX - e.clientX;
    gui.onResize();
    pmouseX = e.clientX;
    return false;
  }
  function dragStop() {
    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.unbind(window, 'mousemove', drag);
    dom.unbind(window, 'mouseup', dragStop);
  }
  function dragStart(e) {
    e.preventDefault();
    pmouseX = e.clientX;
    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.bind(window, 'mousemove', drag);
    dom.bind(window, 'mouseup', dragStop);
    return false;
  }
  dom.bind(gui.__resize_handle, 'mousedown', dragStart);
  dom.bind(gui.__closeButton, 'mousedown', dragStart);
  gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
}
function setWidth(gui, w) {
  gui.domElement.style.width = w + 'px';
  if (gui.__save_row && gui.autoPlace) {
    gui.__save_row.style.width = w + 'px';
  }
  if (gui.__closeButton) {
    gui.__closeButton.style.width = w + 'px';
  }
}
function getCurrentPreset(gui, useInitialValues) {
  var toReturn = {};
  Common.each(gui.__rememberedObjects, function (val, index) {
    var savedValues = {};
    var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
    Common.each(controllerMap, function (controller, property) {
      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
    });
    toReturn[index] = savedValues;
  });
  return toReturn;
}
function setPresetSelectIndex(gui) {
  for (var index = 0; index < gui.__preset_select.length; index++) {
    if (gui.__preset_select[index].value === gui.preset) {
      gui.__preset_select.selectedIndex = index;
    }
  }
}
function updateDisplays(controllerArray) {
  if (controllerArray.length !== 0) {
    requestAnimationFrame$1.call(window, function () {
      updateDisplays(controllerArray);
    });
  }
  Common.each(controllerArray, function (c) {
    c.updateDisplay();
  });
}

var color = {
  Color: Color,
  math: ColorMath,
  interpret: interpret
};
var controllers = {
  Controller: Controller,
  BooleanController: BooleanController,
  OptionController: OptionController,
  StringController: StringController,
  NumberController: NumberController,
  NumberControllerBox: NumberControllerBox,
  NumberControllerSlider: NumberControllerSlider,
  FunctionController: FunctionController,
  ColorController: ColorController
};
var dom$1 = { dom: dom };
var gui = { GUI: GUI };
var GUI$1 = GUI;
var index = {
  color: color,
  controllers: controllers,
  dom: dom$1,
  gui: gui,
  GUI: GUI$1
};


/* harmony default export */ const dat_gui_module = ((/* unused pure expression or super */ null && (index)));
//# sourceMappingURL=dat.gui.module.js.map

;// CONCATENATED MODULE: ./src/lib/stats.module.js
var Stats = function () {

	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
	container.addEventListener( 'click', function ( event ) {

		event.preventDefault();
		showPanel( ++ mode % container.children.length );

	}, false );

	//

	function addPanel( panel ) {

		container.appendChild( panel.dom );
		return panel;

	}

	function showPanel( id ) {

		for ( var i = 0; i < container.children.length; i ++ ) {

			container.children[ i ].style.display = i === id ? 'block' : 'none';

		}

		mode = id;

	}

	//

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

	if ( self.performance && self.performance.memory ) {

		var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

	}

	showPanel( 0 );

	return {

		REVISION: 16,

		dom: container,

		addPanel: addPanel,
		showPanel: showPanel,

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;

			var time = ( performance || Date ).now();

			msPanel.update( time - beginTime, 200 );

			if ( time >= prevTime + 1000 ) {

				fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

				prevTime = time;
				frames = 0;

				if ( memPanel ) {

					var memory = performance.memory;
					memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

				}

			}

			return time;

		},

		update: function () {

			beginTime = this.end();

		},

		// Backwards Compatibility

		domElement: container,
		setMode: showPanel

	};

};

Stats.Panel = function ( name, fg, bg ) {

	var min = Infinity, max = 0, round = Math.round;
	var PR = round( window.devicePixelRatio || 1 );

	var WIDTH = 80 * PR, HEIGHT = 48 * PR,
		TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
		GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
		GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

	var canvas = document.createElement( 'canvas' );
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.cssText = 'width:80px;height:48px';

	var context = canvas.getContext( '2d' );
	context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
	context.textBaseline = 'top';

	context.fillStyle = bg;
	context.fillRect( 0, 0, WIDTH, HEIGHT );

	context.fillStyle = fg;
	context.fillText( name, TEXT_X, TEXT_Y );
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	context.fillStyle = bg;
	context.globalAlpha = 0.9;
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	return {

		dom: canvas,

		update: function ( value, maxValue ) {

			min = Math.min( min, value );
			max = Math.max( max, value );

			context.fillStyle = bg;
			context.globalAlpha = 1;
			context.fillRect( 0, 0, WIDTH, GRAPH_Y );
			context.fillStyle = fg;
			context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

			context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

			context.fillStyle = bg;
			context.globalAlpha = 0.9;
			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

		}

	};

};

/* harmony default export */ const stats_module = (Stats);

;// CONCATENATED MODULE: ./src/core/groups/GroupElement.js


/**
 * @class
 *
 * @classdesc
 * Group element.
 * This class allows to define a symbolic representation for element of a discrete subgroup of isometries.
 */
class GroupElement_GroupElement {

    /**
     * Constructor.
     * The constructor should not be called directly.
     * Use instead the `element` method of the class `Group`
     * @param {Group} group - the underlying group
     */
    constructor(group) {
        this.group = group;
        /**
         * Universal unique ID.
         * The dashes are replaced by underscored to avoid problems in the shaders
         * @type {string}
         * @readonly
         */
        this.uuid = external_three_namespaceObject.MathUtils.generateUUID().replaceAll('-', '_');
    }

    /**
     * The name of the item.
     * This name is computed (from the uuid) the first time the getter is called.
     * @type {string}
     */
    get name() {
        if (this._name === undefined) {
            this._name = `groupElement_${this.uuid}`;
        }
        return this._name;
    }

    /**
     * Set the current element to the identity.
     * @return {GroupElement} the current element
     */
    identity() {
        throw new Error("GroupElement: This method need be overloaded.");
    }


    /**
     * Multiply the current element by elt on the left, i.e. replace `this` by `this * elt`.
     * @abstract
     * @param {GroupElement} elt
     * @return {GroupElement} The current element
     */
    multiply(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Multiply the current element by elt on the right, i.e. replace `this` by `elt * this`.
     * @abstract
     * @param {GroupElement} elt
     * @return {GroupElement} The current element
     */
    premultiply(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Invert the current element
     * @return {GroupElement} the current element
     */
    invert() {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Convert the current element to an isometry
     * @return{Isometry}
     */
    toIsometry() {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Check if the current element and `isom` are the same.
     * Mainly for debugging purposes.
     * @abstract
     * @param {GroupElement} elt
     * @return {boolean} true if the elements are equal, false otherwise
     */
    equals(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Return a new copy of the current element.
     * @abstract
     * @return {GroupElement} The clone of the current element
     */
    clone() {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Set the current element with the given element
     * @abstract
     * @param {GroupElement} elt - the element to copy
     * @return {GroupElement} The current element
     */
    copy(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }
}
;// CONCATENATED MODULE: ./src/core/groups/RelPosition.js








/**
 * @class
 *
 * @classdesc
 * Relative position.
 * A general position is represented as a pair (h,p) where
 * - h (cellBoost) is an GroupElement representing an element of a discrete subgroups
 * - p (local) is a Position
 * The frame represented by the relative position is the image by h of the frame represented by the position p
 *
 * We split the isometry part (hg) in two pieces.
 * The idea is to g should gives a position in the fundamental domain of the (implicit) underlying lattice.
 * This will keep the coordinates of g in a bounded range.
 *
 * For simplicity we also keep track of the inverse of the cellBoost.
 */
class RelPosition {

    /**
     * Constructor.
     * Return the position corresponding to the origin with the reference frame.
     *
     * @param {TeleportationSet} set - the underlying discrete subgroups.
     */
    constructor(set) {
        /**
         * the local position
         * @type {Position}
         */
        this.local = new Position();
        /**
         * the isometry component of the position inside the fundamental domain
         * @type {TeleportationSet}
         */
        this.set = set;
        /**
         * the "discrete" component of the isometry par of the boost
         * @type {GroupElement}
         */
        this.cellBoost = this.set.group.element();
        /**
         * the inverse of cellBoost
         * @type {GroupElement}
         */
        this.invCellBoost = this.set.group.element();

    }

    /**
     * Reduce the eventual numerical error of the current boost.
     * @return {RelPosition} the current relative position
     */
    reduceErrorBoost() {
        this.local.reduceErrorBoost();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {RelPosition} the current relative position
     * @todo To be completed
     */
    reduceErrorFacing() {
        this.local.reduceErrorFacing();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current facing.
     * @return {RelPosition} the current relative position
     * @todo To be completed
     */
    reduceErrorLocal() {
        this.local.reduceError();
        return this;
    }

    /**
     * Reduce the eventual numerical error of the current position.
     * @return {RelPosition} the current relative position
     */
    reduceError() {
        this.reduceErrorLocal();
        return this;
    }

    /**
     * Facing of the local part of the relative position
     * @return {Matrix4}
     */
    get facing(){
        return this.local.facing;
    }

    /**
     * The underlying local point (i.e. ignoring the cell boost)
     * @type {Point}
     */
    get localPoint() {
        return this.local.point;
    }

    /**
     * The underlying point (taking into account the cell boost)
     * @type {Point}
     */
    get point() {
        return this.local.point.applyIsometry(this.cellBoost.toIsometry());
    }

    /**
     * Return the global isometry (cellBoost * local boost) of the current position
     * @return {Isometry}
     */
    get globalBoost() {
        return this.cellBoost.toIsometry().multiply(this.local.boost);
    }

    /**
     * Return a global position (with no cell boost) representing the current relative position
     * @type{Position}
     */
    get globalPosition() {
        const res = new Position();
        res.boost.copy(this.globalBoost);
        res.quaternion.copy(this.local.quaternion);
        return res;
    }

    /**
     * Reset the position in its default position (boost = identity, quaternion = 1)
     * @return {RelPosition} The current position
     */
    reset(){
        this.local.reset();
        this.cellBoost.identity();
        this.invCellBoost.identity();
    }

    /**
     * Rotate the facing by `m` (right action of O(3) in the set of positions).
     * @param {Quaternion} quaternion - An isometry of the tangent space at the origin, i.e. a matrix in O(3).
     * @return {RelPosition} the updated version of the current Position
     */
    applyQuaternion(quaternion) {
        this.local.applyQuaternion(quaternion);
        return this;
    }

    /**
     * Apply if needed a teleportation to bring back the local boos in the fundamental domain
     * @return {RelPosition} the current relative position
     */
    teleport() {
        let inside;
        let localPoint;
        while (true) {
            // compute the location of the local part of the position
            localPoint = this.localPoint;
            inside = true;
            for (const teleportation of this.set.teleportations) {
                inside = inside && !teleportation.jsTest(localPoint);
                // if we failed the test, a teleportation is needed.
                // we perform the teleportation and exit the loop
                // (to restart the checks from the beginning).
                if (!inside) {
                    this.local.applyIsometry(teleportation.elt.toIsometry());
                    this.cellBoost.multiply(teleportation.inv);
                    // console.log("Elt (inv)", teleportation.inv.toIsometry().matrix.toLog())
                    // console.log("Boost", this.cellBoost.toIsometry().matrix.toLog())
                    this.invCellBoost.premultiply(teleportation.elt);
                    break;
                }
            }
            if (inside) {
                break;
            }
        }
        return this;
    }

    /**
     * Flow the current position.
     * `v` is the pull back at the origin by the position of the direction in which we flow
     * The time by which we flow is the norm of `v`
     * This method makes sure that the boost stays in the fundamental domain
     * @param {Vector} v - the direction (and length) to follow
     * @return {RelPosition} the current relative position
     */
    flow(v) {
        this.local.flow(v);
        this.teleport();
        return this;
    }


    /**
     * Fake version of the differential of the exponential map.
     * We do not incorporate any teleportation here.
     * (See {@link Position} for details)
     * @param {Matrix4} matrix - an affine isometry of the tangent space at the origin
     * @return {RelPosition}
     */
    fakeDiffExpMap(matrix) {
        this.local.fakeDiffExpMap(matrix);
        return this;
    }


    /**
     * Check if the current position and `position ` are the same.
     * Mainly for debugging purposes
     * @param {RelPosition} position
     * @return {boolean} true if the relative positions are the same, false otherwise
     */
    equals(position) {
        let res = true;
        res = res && this.local.equals(position.local);
        res = res && this.cellBoost.equals(position.cellBoost);
        return res;
    }

    /**
     * Return a new copy of the current position.
     * @return {RelPosition} the clone of the current relative position
     */
    clone() {
        let res = new RelPosition(this.set);
        res.cellBoost.copy(this.cellBoost);
        res.invCellBoost.copy(this.invCellBoost);
        res.local.copy(this.local);
        return res;
    }

    /**
     * Set the current position with the given position.
     * @param {RelPosition} position - the relative position to copy
     * @return {RelPosition} the current relative position
     */
    copy(position) {
        this.cellBoost.copy(position.cellBoost);
        this.invCellBoost.copy(position.invCellBoost);
        this.local.copy(position.local);
    }
}


;// CONCATENATED MODULE: ./src/core/geometry/General.js







;// CONCATENATED MODULE: ./src/controls/keyboard/FlyControls.js






/**
 * @desc
 * Keyboard bindings.
 * Each main entry correspond to a keyboard type (American, French, etc).
 * KeyCode are replaced by Key (as KeyCode are now deprecated).
 * To each key is associated an action
 * @const
 */
const KEYBOARD_BINDINGS = {
    'us': {
        "a": "yawLeft",
        "d": "yawRight",
        "w": "pitchUp",
        "s": "pitchDown",
        "q": "rollLeft",
        "e": "rollRight",
        "ArrowUp": "forward",
        "ArrowDown": "back",
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "'": "up",
        "/": "down"
    },
    'fr': {
        "q": "yawLeft",
        "d": "yawRight",
        "z": "pitchUp",
        "s": "pitchDown",
        "a": "rollLeft",
        "e": "rollRight",
        "ArrowUp": 'forward',
        "ArrowDown": "back",
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "ù": "up",
        "=": "down"
    }
};


/**
 * @class
 *
 * @classdesc
 * Implements controls to fly in the geometry using the keyboard.
 * This is inspired from Three.js
 * {@link https://threejs.org/docs/#examples/en/controls/FlyControls | FlyControls}
 */
class FlyControls extends external_three_namespaceObject.EventDispatcher {


    /**
     * Constructor
     * (and not the one of the three.js camera in the virtual euclidean space).
     * @param {BasicCamera} camera - the non-euclidean camera
     * (needed to get the orientation of the observer when using both VR and keyboard).
     * @param {string} keyboard - the keyboard type (us, fr, etc)
     */
    constructor(camera, keyboard = 'us') {
        super();
        this.camera = camera;

        this.keyboard = keyboard;

        this.movementSpeed = 0.5;
        this.rollSpeed = 0.8;


        // private fields
        this._moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0
        };
        this._moveVector = new Vector(0, 0, 0);
        this._rotationVector = new Vector(0, 0, 0);

        this._onKeyDown = bind(this, this.onKeyDown);
        this._onKeyUp = bind(this, this.onKeyUp);

        window.addEventListener('keydown', this._onKeyDown, false);
        window.addEventListener('keyup', this._onKeyUp, false);
    }

    /**
     * Stop listening to the event
     */
    pause() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }

    /**
     * Restor the event listener
     */
    restore() {
        window.addEventListener('keydown', this._onKeyDown, false);
        window.addEventListener('keyup', this._onKeyUp, false);
    }

    /**
     * Set the type of keyboard used for the controls.
     * Just an alias of the setter, that can be called easily as a function.
     * @param {string} keyboard - the new keyboard ('fr', 'us', etc).
     */
    setKeyboard(keyboard) {
        this.keyboard = keyboard;
    }

    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyDown(event) {
        if (event.key in KEYBOARD_BINDINGS[this.keyboard]) {
            const action = KEYBOARD_BINDINGS[this.keyboard][event.key]
            this._moveState[action] = 1;
            this.updateMovementVector();
            this.updateRotationVector();

        }
    }


    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyUp(event) {
        if (event.key in KEYBOARD_BINDINGS[this.keyboard]) {
            const action = KEYBOARD_BINDINGS[this.keyboard][event.key]
            this._moveState[action] = 0;
            this.updateMovementVector();
            this.updateRotationVector();

        }
    }


    /**
     * Update the movement vector
     */
    updateMovementVector() {
        this._moveVector.x = (-this._moveState.left + this._moveState.right);
        this._moveVector.y = (-this._moveState.down + this._moveState.up);
        this._moveVector.z = (-this._moveState.forward + this._moveState.back);

        // console.log( 'move:', [ this._moveVector.x, this._moveVector.y, this._moveVector.z ] );

    };

    /**
     * Update the rotation vector
     */
    updateRotationVector() {
        this._rotationVector.x = (-this._moveState.pitchDown + this._moveState.pitchUp);
        this._rotationVector.y = (-this._moveState.yawRight + this._moveState.yawLeft);
        this._rotationVector.z = (-this._moveState.rollRight + this._moveState.rollLeft);

        //console.log( 'rotate:', [ this._rotationVector.x, this._rotationVector.y, this._rotationVector.z ] );

    };

    /**
     * Function to update the position
     *
     * Assume that the current position is `(g,m)` where
     * - `g` is the boost, i.e. subgroup element * local boost
     * - `m` is the facing, i.e. an element of O(3)
     *
     * Denote by `a` the Matrix4 representing the Three.js camera orientation, understood as an element of O(3) as well.
     * Denote by `e = (e1, e2, e3)` the reference frame in the tangent space at the origin.
     * Then the frame at `p = go` attach to the camera is `f = d_og . m . a . e`
     * That is the camera is looking at the direction `-f3 = - d_og . m . a . e3`
     *
     * Assume now that we want to move in the direction of `v = (v1,v2,v3)` where the vector is given in the frame `f`,
     * i.e. `v = v1. f1 + v2 . f2 + v3. f3`.
     * We need to flow the current position in the direction `w`,
     * where `w` corresponds to `v` written in the "position frame", i.e. `d_og . m . e`.
     * In other words `w = a . u`, where `u = v1 . e1 + v2 . e2 + v3 . e3`.
     * Note that we do not change the camera orientation.
     *
     * A similar strategy works for the rotations.
     * @todo Dispatch an event, when the position has sufficiently changed.
     *
     * @param {number} delta - time delta between two updates
     */
    update(delta) {
        // Somehow, in VR mode, the cameras' quaternion is not updated.
        // Thus we use the cameras' matrixWorld for our computations.
        const deltaPosition = this._moveVector
            .clone()
            .multiplyScalar(this.movementSpeed * delta)
            .applyMatrix4(this.camera.matrix);
        this.camera.position.flow(deltaPosition);

        const deltaRotation = this._rotationVector
            .clone()
            .multiplyScalar(this.movementSpeed * delta)
            .applyMatrix4(this.camera.matrix);
        // the parameter delta is assumed to be very small
        // in this way, so is the corresponding rotation angle
        // this explains why the w-coordinate of the quaternion is not zero.
        const quaternion = new external_three_namespaceObject.Quaternion(deltaRotation.x, deltaRotation.y, deltaRotation.z, 1).normalize();
        this.camera.position.applyQuaternion(quaternion);


        // if (false) {
        //     this.dispatchEvent(CHANGE_EVENT);
        // }
    }

}



// EXTERNAL MODULE: ./src/core/cameras/basic/shaders/struct.glsl
var struct = __webpack_require__(7591);
var struct_default = /*#__PURE__*/__webpack_require__.n(struct);
// EXTERNAL MODULE: ./src/core/cameras/basic/shaders/mapping.glsl
var mapping = __webpack_require__(1685);
var mapping_default = /*#__PURE__*/__webpack_require__.n(mapping);
;// CONCATENATED MODULE: ./src/core/cameras/basic/BasicCamera.js






/**
 * @class
 *
 * @classdesc
 * Camera in the non-euclidean scene.
 * It should not be confused with the Three.js camera in the virtual euclidean scene.
 * The minimal GLSL struct should contains
 * - fov
 * - minDist
 * - maxDist
 * - maxSteps
 * - threshold
 * - position
 * - matrix
 * The GLSL code needs to contains (after the declaration) a function `mapping`.
 * The role of this function is to map a point on the horizon sphere
 * to the initial direction to follow during the ray-marching.
 */
class BasicCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * This parameters are
     * - {number} fov - the field of view
     * - {number} minDist - the minimal distance we ray-march
     * - {number} maxDist - the maximal distance we ray-march
     * - {number} maxSteps - the maximal number of steps during the ray-marching
     * - {number} threshold - the threshold to stop the ray-marching
     * - {TeleportationSet} set - the underlying subgroup of the geometry (to create the position)
     */
    constructor(parameters) {

        /**
         * The underlying Three.js camera
         * @type {PerspectiveCamera}
         */
        this.threeCamera = new external_three_namespaceObject.PerspectiveCamera(
            parameters.fov !== undefined ? parameters.fov : 70,
            window.innerWidth / window.innerHeight,
            0.01,
            2000
        );
        this.threeCamera.position.set(0, 0, 0);
        this.threeCamera.lookAt(0, 0, -1);

        /**
         * Minimal distance we ray-march
         * @type {number}
         */
        this.minDist = parameters.minDist !== undefined ? parameters.minDist : 0;
        /**
         * Maximal distance we ray-march
         * @type {number}
         */
        this.maxDist = parameters.maxDist !== undefined ? parameters.maxDist : 50;
        /**
         * Maximal number of steps during the ray-marching
         * @type {number}
         */
        this.maxSteps = parameters.maxSteps !== undefined ? parameters.maxSteps : 100;
        /**
         * Threshold to stop the ray-marching
         * @type {number}
         */
        this.threshold = parameters.threshold !== undefined ? parameters.threshold : 0.0001;
        /**
         * Position of the camera
         * @type {RelPosition}
         */
        this.position = new RelPosition(parameters.set);
    }

    /**
     * Shortcut to reset the aspect of the underlying Three.js camera
     * @param {number} value
     */
    set aspect(value) {
        this.threeCamera.aspect = value;
    }

    /**
     * Shortcut to access the field of view of the underlying Three.js camera
     * (Recall that in Three.js the field of view is the vertical one.)
     * @type {number}
     */
    get fov() {
        return this.threeCamera.fov;
    }

    /**
     * Shortcut to reset the field of view of the underlying Three.js camera
     * (Recall that in Three.js the field of view is the vertical one.)
     * @param {number} value
     */
    set fov(value) {
        this.threeCamera.fov = value;
        this.threeCamera.updateProjectionMatrix();
    }

    /**
     * Matrix of the underlying Three.js camera in the virtual euclidean scene
     * @type {Matrix4}
     */
    get matrix() {
        return this.threeCamera.matrixWorld;
    }

    /**
     * Shortcut to update the projection matrix of the underlying Three.js camera
     */
    updateProjectionMatrix() {
        this.threeCamera.updateProjectionMatrix();
    }


    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        shaderBuilder.addClass('Camera', (struct_default()));
        shaderBuilder.addUniform('camera', 'Camera', this);
        shaderBuilder.addChunk((mapping_default()));
    }
}
// EXTERNAL MODULE: ./src/core/cameras/vr/shaders/struct.glsl
var shaders_struct = __webpack_require__(6539);
var shaders_struct_default = /*#__PURE__*/__webpack_require__.n(shaders_struct);
// EXTERNAL MODULE: ./src/core/cameras/vr/shaders/mapping.glsl
var shaders_mapping = __webpack_require__(5074);
var shaders_mapping_default = /*#__PURE__*/__webpack_require__.n(shaders_mapping);
;// CONCATENATED MODULE: ./src/core/cameras/vr/VRCamera.js












/**
 * @class
 *
 * @classdesc
 * Stereographic camera.
 * Used for VR.
 * The position of the camera corresponds to the midpoint between the two eyes.
 */
class VRCamera extends BasicCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * This parameters are
     * - {number} fov - the field of view
     * - {number} minDist - the minimal distance we ray-march
     * - {number} maxDist - the maximal distance we ray-march
     * - {number} maxSteps - the maximal number of steps during the ray-marching
     * - {number} threshold - the threshold to stop the ray-marching
     * - {TeleportationSet} set - the underlying subgroup of the geometry (to create the position)
     * - {number} ipDist - the interpupillary distance
     */
    constructor(parameters) {
        super(parameters);
        /**
         * True if stereo is on
         * @type {boolean}
         */
        this.isStereoOn = false;
        /**
         * **Half** the interpupillary distance
         * @return {number}
         */
        this.ipDist = parameters.ipDist !== undefined ? parameters.ipDist : 0.03200000151991844;
        /**
         * Two fake copies of the cameras meant to be passed to the shader as uniforms.
         * @type {Object[]}
         */
        this.fakeCameras = [];
        for (const side in [LEFT, RIGHT]) {
            this.fakeCameras[side] = {
                fov: this.fov,
                minDist: this.minDist,
                maxDist: this.maxDist,
                maxSteps: this.maxSteps,
                threshold: this.threshold,
                position: this.position.clone(),
                matrix: this.matrix,
            }
        }
    }

    /**
     * True if stereo is off
     * @type {boolean}
     */
    get isStereoOff() {
        return !this.isStereoOn
    }

    /**
     * Turn the stereo mode on or off
     */
    switchStereo() {
        this.isStereoOn = !this.isStereoOn;
    }

    /**
     * Update the fake camera position.
     * Shift the left and right camera from the current position using parallel transport.
     */
    updateFakeCamerasPosition() {
        this.fakeCameras[LEFT].position.copy(this.position);
        this.fakeCameras[RIGHT].position.copy(this.position);

        if (this.isStereoOn) {
            // if we are in VR mode we offset the position of the left and right eyes
            // to that end, we flow the position along the left / right direction
            // we have to be careful that left and right are meant in the point of view of the camera.
            const rightDir = new Vector(1, 0, 0)
                .multiplyScalar(this.ipDist)
                .applyMatrix4(this.matrix);
            const leftDir = rightDir.clone().negate();
            this.fakeCameras[RIGHT].position.flow(rightDir);
            this.fakeCameras[LEFT].position.flow(leftDir);
        }
    }

    /**
     * In VR mode the position of the Three.js camera (in the euclidean Three.js scene)
     * is directly controlled by the VR headset.
     * This method update the position of the observer in the geometry accordingly.
     * Every displacement is the Three.js scene is interpreted as a tangent vector.
     * We move the observer by following the geodesic in this direction.
     * The method also update the left and right eyes positions.
     * The method should be called at each frame.
     *
     * @return{Function}
     */
    get chaseThreeCamera() {
        if (this._chaseThreeCamera === undefined) {
            const oldThreePosition = new Vector();

            /**
             * @param {WebXRManager} webXRManager - the WebXRManager used by Three.js
             * @private
             */
            this._chaseThreeCamera = function (webXRManager) {
                const newThreePosition = new Vector()
                if (this.isStereoOn) {
                    // If XR is enable, we get the position of the left and right camera.
                    // Note that when XR is on, then main Three.js Camera is shifted to coincide with the right eye.
                    // Do its position is NOT the midpoint between the eyes of the observer.
                    // Thus we take here the midpoint between the two VR cameras.
                    // Those can only be accessed using the WebXRManager.
                    const camerasVR = webXRManager.getCamera(this.threeCamera).cameras;
                    const newThreePositionL = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[LEFT].matrixWorld);
                    const newThreePositionR = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[RIGHT].matrixWorld);
                    newThreePosition.lerpVectors(newThreePositionL, newThreePositionR, 0.5);
                } else {
                    newThreePosition.setFromMatrixPosition(this.matrix);
                }
                const deltaPosition = new Vector().subVectors(newThreePosition, oldThreePosition);
                this.position.flow(deltaPosition);
                this.updateFakeCamerasPosition();
                oldThreePosition.copy(newThreePosition);
            };
        }
        return this._chaseThreeCamera;
    }

    shader(shaderBuilder) {
        throw new Error('StereoCamera: for stereographic cameras, use sidedShader instead');
    }

    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     * @param {number} side - the side (left of right) (used for stereographic camera)
     */
    sidedShader(shaderBuilder, side) {
        shaderBuilder.addClass('VRCamera', (shaders_struct_default()));
        shaderBuilder.addUniform('camera', 'VRCamera', this.fakeCameras[side]);
        shaderBuilder.addChunk((shaders_mapping_default()));
    }


}
// EXTERNAL MODULE: ./src/core/cameras/pathTracer/shaders/struct.glsl
var pathTracer_shaders_struct = __webpack_require__(766);
var pathTracer_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(pathTracer_shaders_struct);
// EXTERNAL MODULE: ./src/core/cameras/pathTracer/shaders/mapping.glsl
var pathTracer_shaders_mapping = __webpack_require__(4651);
var pathTracer_shaders_mapping_default = /*#__PURE__*/__webpack_require__.n(pathTracer_shaders_mapping);
;// CONCATENATED MODULE: ./src/core/cameras/pathTracer/PathTracerCamera.js





class PathTracerCamera extends BasicCamera {

    /**
     *
     * @param parameters
     */
    constructor(parameters) {
        super(parameters);
        /**
         * Focal length
         * @type {number}
         */
        this.focalLength = parameters.focalLength !== undefined ? parameters.focalLength : 1;
        /**
         * Aperture
         * @type {number}
         */
        this.aperture = parameters.aperture !== undefined ? parameters.aperture : 0;
    }

    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        shaderBuilder.addClass('Camera', (pathTracer_shaders_struct_default()));
        shaderBuilder.addUniform('camera', 'PathTracerCamera', this);
        shaderBuilder.addChunk((pathTracer_shaders_mapping_default()));
    }
}
;// CONCATENATED MODULE: ./src/core/Generic.js



/**
 * @class
 * @abstract
 *
 * @classdesc
 * Generic class for Shape, Material, Solid, etc.
 * Factorize ID Management and other stuff.
 */
class Generic {

    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
        /**
         * Universal unique ID.
         * The dashes are replaced by underscored to avoid problems in the shaders
         * @type {string}
         * @readonly
         */
        this.uuid = external_three_namespaceObject.MathUtils.generateUUID().replaceAll('-', '_');
        /**
         * ID of the object in the scene
         * This number is computed automatically when the object is added to the scene.
         * It should not be changed
         * @type{number}
         * @readonly
         */
        this.id = undefined;
        /**
         * A list of GLSL code chunks that are needed for this shape (and could also be reused somewhere else).
         * Default is the empty list.
         * @type {string[]}
         */
        this.imports = [];
    }

    /**
     * The name of the class.
     * Useful to generate the name of items
     * @return {string}
     */
    get className() {
        return this.constructor.name;
    }

    /**
     * The name of the item.
     * This name is computed (from the uuid) the first time the getter is called.
     * @type {string}
     */
    get name() {
        if (this._name === undefined) {
            this._name = `${safeString(this.className)}_${this.uuid}`;
        }
        return this._name;
    }


    /**
     * Return the type under which the data is passed as uniform.
     * Return the empty string, if the data should not be passed as a uniform.
     * @return {string}
     */
    get uniformType() {
        return '';
    }

    /**
     * Set the ID of the shape.
     * Propagate the process if needed
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.id = scene.nextId;
        scene.nextId = scene.nextId + 1;
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * By default, do nothing.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {

    }

    /**
     * Extend the list of imports
     * @param {...string} imports - the imports to add
     */
    addImport(imports) {
        for (const imp of arguments) {
            this.imports.push(imp);
        }
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure,
     * And eventually basic functions associated to the structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        throw new Error('Generic: this function should be implemented');
    }

    /**
     * Compile all the function directly related to the instance of the class (e.g. sdf, gradient, direction field, etc).
     * @return {string}
     */
    glslInstance() {
        throw new Error('Generic: this function should be implemented');
    }

    /**
     * Extend the given shader with the appropriate code
     * @param {ShaderBuilder}  shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        // add all the imports for this instance
        for (const imp of this.imports) {
            shaderBuilder.addImport(imp);
        }

        // add the struct dependencies (which only depends on the class and not the instance)
        shaderBuilder.addClass(this.constructor.name, this.constructor.glslClass());

        // if needed declare the uniform for this instance
        if (this.uniformType !== '') {
            shaderBuilder.addUniform(this.name, this.uniformType, this);
        }

        // add the logic specific to this instance
        shaderBuilder.addInstance(this.name, this.glslInstance());
    }
}
;// CONCATENATED MODULE: ./src/core/materials/Material.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * Abstract class for materials
 */
class Material extends Generic {

    /**
     * Constructor.
     */
    constructor() {
        super();
        /**
         * The light eventually affecting the material.
         * If `lights` is not set up when the solid carrying the material is added to the scene,
         * then `lights` is set up to the list of lights in the scene.
         * @type{Light[]}
         */
        this.lights = undefined;
        /**
         * Reflectivity of the material.
         * Each channel (red, blue, green), interpreted as number between 0 and 1,
         * is the reflectivity coefficient of the corresponding color
         * (0 = no reflectivity, 1 = all light is reflected).
         * @type {Color}
         */
        this.reflectivity = undefined;
    }

    /**
     * Says that the object inherits from `Material`
     * @type {boolean}
     */
    get isMaterial() {
        return true;
    }

    /**
     * Says whether the material requires the normal to the shape for its computation.
     * Default is true.
     * @return {boolean}
     */
    get usesNormal() {
        return true;
    }

    /**
     * Says whether the material requires a UV map on the shape for its computation.
     * Default is false.
     * @return {boolean}
     */
    get usesUVMap() {
        return false;
    }

    /**
     * Says whether the material reacts to (certain) lights in the scene.
     * Default is false.
     * @return {boolean}
     */
    get usesLight() {
        return false;
    }

    /**
     * Says whether the material is reflecting
     * Default is false.
     * @return {boolean}
     */
    get isReflecting() {
        return false;
    }

    onAdd(scene) {
        if (this.usesLight) {
            if (!this.hasOwnProperty('lights') || this['lights'] === undefined) {
                this.lights = scene.lights;
            }
        }
    }

    /**
     * Return the chunk of GLSL code used to compute the color of the material at the given point
     * The render function on the GLSL side should have one of the following signatures
     * - `vec3 {{name}}_render(ExtVector v)`
     * - `vec3 {{name}}_render(ExtVector v, RelVector normal)`
     * - `vec3 {{name}}_render(ExtVector v, vec2 uv)`
     * - `vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv)`
     * The exact signature depends whether the material requires a normal or UV coordinates.
     * Here v is the vector obtained when we hit the shape.
     * It should return the color as a vec3 of the material at the given point, without taking into account reflections.
     * @abstract
     * @return {string}
     */
    glslRender() {
        throw new Error('Material: this method should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. render).
     * @return {string}
     */
    glslInstance() {
        return this.glslRender();
    }
}

// EXTERNAL MODULE: ./src/commons/materials/singleColor/shaders/struct.glsl
var singleColor_shaders_struct = __webpack_require__(2664);
var singleColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(singleColor_shaders_struct);
// EXTERNAL MODULE: ./src/core/materials/shaders/render.glsl.mustache
var render_glsl_mustache = __webpack_require__(8778);
var render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(render_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/singleColor/SingleColorMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
class SingleColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} color - the color of the material
     */
    constructor(color) {
        super();
        this.color = color;
    }

    get uniformType() {
        return 'SingleColorMaterial';
    }

    get usesNormal(){
        return false;
    }

    static glslClass() {
        return (singleColor_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
;// CONCATENATED MODULE: ./src/core/materials/PTMaterial.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * Abstract class for materials for path tracer
 */
class PTMaterial extends Generic {

    /**
     * Constructor.
     */
    constructor() {
        super();
    }

    /**
     * Says that the object inherits from `PTMaterial`
     * @type {boolean}
     */
    get isPTMaterial() {
        return true;
    }

    /**
     * Says whether the material requires the normal to the shape for its computation.
     * Default is true.
     * @return {boolean}
     */
    get usesNormal() {
        return true;
    }

    /**
     * Says whether the material requires a UV map on the shape for its computation.
     * Default is false.
     * @return {boolean}
     */
    get usesUVMap() {
        return false;
    }

    onAdd(scene) {
    }

    /**
     * Return the chunk of GLSL code used to compute the color of the material at the given point
     * The render function on the GLSL side should have one of the signatures
     * - `vec3 {{name}}_render(RelVector v)`
     * - `vec3 {{name}}_render(RelVector v, RelVector normal)`
     * - `vec3 {{name}}_render(RelVector v, vec2 uv)`
     * - `vec3 {{name}}_render(RelVector v, RelVector normal, vec2 uv)`
     * The exact signature depends whether the material requires a normal or UV coordinates.
     * Here v is the vector obtained when we hit the shape.
     * It should return the color as a vec3 of the material at the given point, without taking into account reflections.
     * @abstract
     * @return {string}
     */
    glslRender() {
        throw new Error('Material: this method should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. render).
     * @return {string}
     */
    glslInstance() {
        return this.glslRender();
    }
}

// EXTERNAL MODULE: ./src/commons/materials/basicPTMaterial/shaders/struct.glsl
var basicPTMaterial_shaders_struct = __webpack_require__(2143);
var basicPTMaterial_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(basicPTMaterial_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/basicPTMaterial/shaders/render.glsl.mustache
var shaders_render_glsl_mustache = __webpack_require__(9606);
var shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_render_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/imports/fresnelReflectAmount.glsl
var fresnelReflectAmount = __webpack_require__(5363);
var fresnelReflectAmount_default = /*#__PURE__*/__webpack_require__.n(fresnelReflectAmount);
;// CONCATENATED MODULE: ./src/commons/materials/basicPTMaterial/BasicPTMaterial.js








class BasicPTMaterial extends PTMaterial {

    /**
     * Constructor
     * @param {Object} params - all the parameters of the material.
     */
    constructor(params) {
        super();
        /**
         * Surface Emission Color
         * @type {Color}
         */
        this.emission = params.emission !== undefined ? params.emission : new external_three_namespaceObject.Color(0, 0, 0);
        /**
         * Volumetric Emission Color
         * @type {Color}
         */
        this.volumeEmission = params.volumeEmission !== undefined ? params.volumeEmission : new external_three_namespaceObject.Color(0, 0, 0);
        /**
         * Optical Depth (Probability of scattering inside a material)
         * Initialize to some large number.
         * Right now in scatterRayMarch, over 100 means clear.
         * @type {number}
         */
        this.opticalDepth = params.opticalDepth !== undefined ? params.opticalDepth : 1000;
        /**
         * Diffuse color (basically the base color of the material)
         * @type {Color}
         */
        this.diffuse = params.diffuse !== undefined ? params.diffuse : new external_three_namespaceObject.Color(1, 1, 1);
        /**
         * Specular color
         * @type {Color}
         */
        this.specular = params.specular !== undefined ? params.specular : new external_three_namespaceObject.Color(1, 1, 1);
        /**
         * Absorb color (if the material is transparent)
         * @type {Color}
         */
        this.absorb = params.absorb !== undefined ? params.absorb : new external_three_namespaceObject.Color(0.1, 0.1, 0.1);
        /**
         * Index of refraction
         * @type {number}
         */
        this.ior = params.ior !== undefined ? params.ior : 1;
        /**
         * Roughness of the material
         * @type {number}
         */
        this.roughness = params.roughness !== undefined ? params.roughness : 0.2;
        /**
         * Reflection chance
         * Chance of reflection.
         * Between 0 and 1
         * @type {number}
         */
        this.reflectionChance = params.reflectionChance !== undefined ? params.reflectionChance : 0.1;
        /**
         * Refraction chance
         * Chance of refraction.
         * Between 0 and 1
         * @type {number}
         */
        this.refractionChance = params.refractionChance !== undefined ? params.refractionChance : 0;
        /**
         * Diffuse chance
         * Chance of diffuse.
         * Between 0 and 1
         * @type {number}
         */
        this.diffuseChance = params.diffuseChance !== undefined ? params.diffuseChance : 0.9;
        // the three chances should add up to one
        const total = this.reflectionChance + this.refractionChance + this.diffuseChance;
        this.reflectionChance = this.reflectionChance / total;
        this.refractionChance = this.refractionChance / total;
        this.diffuseChance = this.diffuseChance / total;

        // computation for Fresnel reflection amount
        this.addImport((fresnelReflectAmount_default()));
    }

    get uniformType() {
        return 'BasicPTMaterial';
    }

    static glslClass() {
        return (basicPTMaterial_shaders_struct_default());
    }

    glslRender() {
        return shaders_render_glsl_mustache_default()(this);
    }
}
;// CONCATENATED MODULE: ./src/core/scene/Scene.js







/**
 * @class
 *
 * @classdesc
 * Non-euclidean scene.
 * All the objects added to the scene should belong to the same geometry
 */
class Scene {

    /**
     * Constructor.
     * @param {Object} params - parameters of the scene including
     * - {Fog} fog - the fog in the scene
     */
    constructor(params = {}) {
        /**
         * List of all the lights in the scene.
         * @type {Light[]}
         */
        this.lights = [];

        /**
         * List of all the solids in the scene.
         * @type {Solid[]}
         */
        this.solids = [];

        /**
         * Next available ID in the scene.
         * @type {number}
         */
        this.nextId = 0;

        /**
         * Fog in the scene
         * @type{Fog}
         */
        this.fog = params.fog;

        /**
         * Background material
         * @type{Material|PTMaterial}
         */
        this.background = params.background !== undefined ? params.background : new SingleColorMaterial(new external_three_namespaceObject.Color(0, 0, 0));
        /**
         * Background material (for path tracing)
         * @type{PTMaterial}
         */
        this.ptBackground = params.ptBackground !== undefined ? params.ptBackground : new BasicPTMaterial({
            diffuse: new external_three_namespaceObject.Color(0, 0, 0),
            specular: new external_three_namespaceObject.Color(0, 0, 0),
            absorb: new external_three_namespaceObject.Color(0.25, 0.25, 0.25)
        });
    }

    /**
     * Add exactly one object to the scene
     * @param {Solid|Light} obj - the object to add to the scene
     * @return {Scene} the current scene
     */
    _add(obj) {
        // setup the id for the object
        obj.setId(this);
        // run the callback
        obj.onAdd(this);
        // add the object to the appropriate list
        if (obj.isLight) {
            this.lights.push(obj);
        }
        if (obj.isSolid) {
            this.solids.push(obj);
        }
        return this;
    }

    /**
     * Add one or more object in the scene
     * @param {...(Solid|Light)} obj - the objects to add
     * @return {Scene} the current scene
     */
    add(obj) {
        for (const obj of arguments) {
            this._add(obj);
        }
        return this;
    }

    /**
     * Build the shader relative to the scene.
     * Only the dependencies (solids, shapes, materials, lights, etc) are loaded here.
     * The scenes SDF (local and global) are built at the Renderer level.
     * Indeed these chunk need to know what is the teleportation set to implement nearest neighbors
     * Another strategy would be to link the scene to the teleportation set (in the constructor for instance)
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        // background material
        if (shaderBuilder.useCase === PATHTRACER_RENDERER) {
            this.ptBackground.shader(shaderBuilder);
        } else {
            this.background.shader(shaderBuilder);
        }

        // run through all the objects in the scene and combine the relevant chunks of GLSL code.
        for (const light of this.lights) {
            if (shaderBuilder.useCase !== PATHTRACER_RENDERER) {
                light.shader(shaderBuilder);
            }
        }
        for (const solid of this.solids) {
            solid.shader(shaderBuilder);
        }
        if (this.fog !== undefined) {
            this.fog.shader(shaderBuilder);
        }
    }
}
;// CONCATENATED MODULE: ./src/core/General.js











;// CONCATENATED MODULE: ./src/core/scene/Fog.js
/**
 * @class
 * @abstract
 *
 * @classdesc
 * Defines a fog to be used in the scene.
 */
class Fog {
    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
    }

    /**
     * Extend the given shader with the appropriate code
     * @abstract
     * @param {ShaderBuilder}  shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        throw new Error('Fog: this method need be implemented');
    }
}
// EXTERNAL MODULE: ./src/commons/scenes/expFog/shaders/struct.glsl
var expFog_shaders_struct = __webpack_require__(7885);
var expFog_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(expFog_shaders_struct);
// EXTERNAL MODULE: ./src/commons/scenes/expFog/shaders/apply.glsl
var apply = __webpack_require__(5348);
var apply_default = /*#__PURE__*/__webpack_require__.n(apply);
;// CONCATENATED MODULE: ./src/commons/scenes/expFog/ExpFog.js







/**
 * @class
 * @extends Fog
 *
 * @classdesc
 * Exponential fog
 */
class ExpFog extends Fog {

    /**
     * Constructor.
     * @param {Color} color - the fog color
     * @param {number} scattering - parameter controlling the scattering rate
     */
    constructor(color, scattering) {
        super();
        /**
         * Fog color
         * @type {Color}
         */
        this.color = color;
        /**
         * Parameter controlling the scattering rate
         * @type {number}
         */
        this.scattering = scattering
    }

    /**
     * Extend the given shader with the appropriate code
     * @param {ShaderBuilder}  shaderBuilder - the shader builder
     */
    shader(shaderBuilder) {
        shaderBuilder.addClass('ExpFog', (expFog_shaders_struct_default()));
        shaderBuilder.addUniform('fog', 'ExpFog', this);
        shaderBuilder.addChunk((apply_default()));
    }
}
;// CONCATENATED MODULE: ./src/commons/app/thurston/PathTracerUI.js


const STATE_SLEEPING = 0;
const STATE_DIALOG = 1;
const STATE_TRACING = 2;


/**
 * @class
 *
 * @classdesc
 * A class handling a dialog box for the path tracer settings
 */
class PathTracerUI {

    constructor(thurston) {
        /**
         * The Thurston object controlled by this controls
         * @type {Thurston}
         */
        this.thurston = thurston
        /**
         * State of the UI
         * The possible states are defined as constants
         * @type {number}
         */
        this.state = STATE_SLEEPING;
        /**
         * Wrap of the dialog box
         * @type {HTMLElement}
         */
        this.dialogBoxWrap = document.getElementById('thurstonDialogBoxWrap');
        /**
         * Download button
         * @type {HTMLElement}
         */
        this.downloadButton = document.getElementById('thurstonDownloadButton');

        const _onPressP = bind(this, this.onPressP);
        window.addEventListener('keydown', _onPressP);
        const _onClickGo = bind(this, this.onClickGo);
        document.querySelector('#thurstonDialogBox input[type=submit]').addEventListener('click', _onClickGo);
        const _onClickDownload = bind(this, this.onClickDownload);
        document.getElementById('thurstonDownloadButton').addEventListener('click', _onClickDownload);


    }

    /**
     * When user press the key P, enter/leave the path tracer UI
     * @param {KeyboardEvent} event
     */
    onPressP(event) {
        if (event.key === 'p') {
            switch (this.state) {
                case STATE_SLEEPING:
                    const widthInput = document.getElementById('widthInput');
                    widthInput.value = window.innerWidth;
                    const heightInput = document.getElementById('heightInput');
                    heightInput.value = window.innerHeight;
                    this.dialogBoxWrap.classList.add('visible');
                    this.state = STATE_DIALOG;
                    break;
                case STATE_TRACING:
                    this.downloadButton.classList.remove('visible');
                    this.thurston.setSize(window.innerWidth, window.innerHeight);
                    this.thurston.switchRenderer();
                    this.state = STATE_SLEEPING;
                    break;
                default:
                    this.dialogBoxWrap.classList.remove('visible');
                    this.state = STATE_SLEEPING;
            }
        }
    }

    /**
     * When the user validate the choice of resolution
     * @param {MouseEvent} event
     */
    onClickGo(event) {
        if (this.state === STATE_DIALOG) {
            const widthInput = document.getElementById('widthInput');
            const heightInput = document.getElementById('heightInput');
            this.thurston.setSize(widthInput.value, heightInput.value);
            this.thurston.ptCamera.aspect = widthInput.value / heightInput.value;
            this.thurston.ptCamera.updateProjectionMatrix();
            this.dialogBoxWrap.classList.remove('visible');
            this.downloadButton.classList.add('visible');
            this.thurston.switchRenderer();
            this.state = STATE_TRACING;
        }
    }

    /**
     * When the user start the download
     * @param {MouseEvent} event
     */
    onClickDownload(event) {
        if (this.state === STATE_TRACING) {
            this.thurston.ptRenderer.renderAccTarget();
            this.downloadButton.href = this.thurston.ptRenderer.domElement.toDataURL('image/png', 1);
            this.downloadButton.download = 'export.png';
        }
    }

}
;// CONCATENATED MODULE: ./src/commons/app/thurston/html/dialogBoxHTML.js
// language = html
/* harmony default export */ const dialogBoxHTML = (`
<div id="thurstonDialogBoxWrap">
    <div id="thurstonDialogBox">
    <p>
        Choose the resolution of the picture, and click on "Go".
        You can download the image any time, with the "Download" button in the bottom right corner.
        To leave the path tracer mode, hit 'p'.
    </p>
        <form action="javascript:void(0);">
            <label for="widthInput">Width :</label> <input id="widthInput" type="number"><br>
            <label for="heightInput">Height:</label> <input id="heightInput" type="number"><br>
            <input type="submit" value="Go!">
        </form>
    </div>
</div>
`);
;// CONCATENATED MODULE: ./src/commons/app/thurston/html/downloadButtonHTML.js
/* harmony default export */ const downloadButtonHTML = (`
<a id="thurstonDownloadButton" href="#">Download</a>
`);
;// CONCATENATED MODULE: ./src/commons/app/thurston/css/thurstonCSS.js
// language=css
/* harmony default export */ const thurstonCSS = (`
    #thurstonDialogBoxWrap {
        margin: 0;
        background: rgba(0, 0, 0, 0.8);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        visibility: hidden;
    }

    #thurstonDialogBox {
        background: #9b9b9b;
        opacity: 1;
        width: 300px;
        margin-top: 100px;
        margin-left: auto;
        margin-right: auto;
        padding: 20px;
    }

    #thurstonDownloadButton {
        display: block;
        position: fixed;
        bottom: 0;
        right: 0;
        padding: 10px;
        background: black;
        color: white;
        visibility: hidden;
    }

    #thurstonDialogBoxWrap.visible,
    #thurstonDownloadButton.visible {
        visibility: visible;
    }
`);
;// CONCATENATED MODULE: ./src/commons/app/thurston/Thurston.js















/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
class Thurston {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(shader1, shader2, set, params = {}) {
        /**
         * The underlying subgroup
         * @type {TeleportationSet}
         */
        this.set = set;
        /**
         * A callback called at each frame
         * @type {Function}
         */
        this.callback = undefined;


        const fog = new ExpFog(new external_three_namespaceObject.Color(0, 0, 0), 0.07);
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene({fog: fog});

        /**
         * The non-euclidean camera for the basic renderer
         * @type {BasicCamera}
         */
        this.camera = new BasicCamera({set: this.set});
        /**
         * The non-euclidean camera for the path tracer
         * @type {PathTracerCamera}
         */
        this.ptCamera = new PathTracerCamera({set: this.set});
        /**
         * Three.js renderer
         * @type {WebGLRenderer}
         */
        this.threeRenderer = new external_three_namespaceObject.WebGLRenderer();
        this.threeRenderer.setClearColor(new external_three_namespaceObject.Color(0, 0, 0.2), 1);
        document.body.appendChild(this.threeRenderer.domElement);

        /**
         * Non-euclidean renderer for basic renderer
         * @type {BasicRenderer}
         */
        this.renderer = new BasicRenderer(shader1, shader2, this.set, this.camera, this.scene, {}, this.threeRenderer);
        /**
         * Non-euclidean renderer for path tracer
         * @type {PathTracerRenderer}
         */
        this.ptRenderer = new PathTracerRenderer(shader1, shader2, this.set, this.ptCamera, this.scene, {}, this.threeRenderer);
        /**
         * The renderer we are currently using
         * @type {BasicRenderer|PathTracerRenderer}
         */
        this.currentRenderer = this.renderer;

        // set the renderer size
        this.setSize(window.innerWidth, window.innerHeight);
        // event listener
        this._onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener('resize', this._onWindowResize, false);

        /**
         * The keyboard controls to fly in the scene
         * @type {FlyControls}
         * @protected
         */
        this.flyControls = new FlyControls(
            this.camera,
            params.keyboard !== undefined ? params.keyboard : 'us'
        );

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @protected
         */
        this.clock = new external_three_namespaceObject.Clock();

        /**
         * The performance stats.
         * Setup when the renderer is built.
         * @type {Stats}
         */
        this.stats = undefined;

        /**
         * The graphical user interface.
         * Setup when the renderer is built.
         * @type {GUI}
         */
        this.gui = undefined;

        /**
         * The UI for path tracing
         * @type {PathTracerUI}
         */
        this.pathTracerUI = undefined;

        this.onLoad();
    }


    onLoad() {
        const thurstonStyle = document.createElement('style');
        thurstonStyle.setAttribute('type', 'text/css');
        thurstonStyle.textContent = thurstonCSS.trim();
        document.head.appendChild(thurstonStyle);
        document.body.insertAdjacentHTML('beforeend', dialogBoxHTML);
        document.body.insertAdjacentHTML('beforeend', downloadButtonHTML);
    }

    setPixelRatio(value) {
        this.renderer.setPixelRatio(value);
        this.ptRenderer.setPixelRatio(value);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
        this.ptRenderer.setSize(width, height);
    }


    /**
     * Initialize the graphic user interface
     * @return {Thurston} the current Thurston object
     */
    initGUI() {
        this.gui = new GUI$1();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://github.com/henryseg/non-euclidean_VR');
            }
        }, 'help').name("Help/About");
        this.gui.add(
            this.flyControls,
            'keyboard', {QWERTY: 'us', AZERTY: 'fr'}
        ).name("Keyboard");


        // controls for the camera
        const cameraGUI = this.gui.addFolder('Camera');
        cameraGUI.add(this.camera, 'fov', 45, 120)
            .name('Field of view');
        cameraGUI.add(this.camera, 'maxDist', 0, 100, 1)
            .name('Max distance');
        cameraGUI.add(this.camera, 'maxSteps', 20, 500, 1)
            .name('Max steps');
        cameraGUI.add(this.camera, 'threshold')
            .name('Threshold');

        return this;
    }

    /**
     * Initialize the performance stats
     * @return {Thurston} the current Thurston object
     */
    initStats() {
        this.stats = new stats_module();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        return this;
    }

    initPathTracerUI() {
        this.pathTracerUI = new PathTracerUI(this);
    }

    /**
     * Shortcut to add objects to the scene.
     * @param {...(Solid|Light)} obj - the objects to add
     */
    add(obj) {
        this.scene.add(/**@type {(Solid|Light)} */...arguments);
    }

    /**
     * Action when the window is resized.
     * @param {UIEvent} event
     */
    onWindowResize(event) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }


    /**
     * Switch between the two renderer
     */
    switchRenderer() {
        if (this.currentRenderer.isBasicRenderer) {
            this.flyControls.pause();
            window.removeEventListener('resize', this._onWindowResize);
            this.ptCamera.position.copy(this.camera.position);
            this.ptRenderer.iFrame = 0;
            this.threeRenderer.setRenderTarget(this.ptRenderer.accReadTarget);
            this.threeRenderer.clear();
            this.currentRenderer = this.ptRenderer;
        } else {
            this.flyControls.restore();
            window.addEventListener('resize', this._onWindowResize);
            this.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.currentRenderer = this.renderer;
        }
    }

    /**
     * animation function
     */
    animate() {
        const delta = this.clock.getDelta();
        if (this.callback !== undefined) {
            this.callback();
        }
        this.flyControls.update(delta);
        this.currentRenderer.render();
        this.stats.update();
    }

    /**
     * Build the renderer and run the animation.
     */
    run() {
        this.initStats();
        this.initGUI();
        this.initPathTracerUI();
        this.renderer.build();
        this.ptRenderer.build();
        const _animate = bind(this, this.animate);
        this.threeRenderer.setAnimationLoop(_animate);
    }
}
;// CONCATENATED MODULE: ./src/commons/app/thurstonLite/ThurstonLite.js









/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
class ThurstonLite {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(shader1, shader2, set, params = {}) {
        /**
         * The underlying subgroup
         * @type {TeleportationSet}
         */
        this.set = set;
        /**
         * A callback called at each frame
         * @type {Function}
         */
        this.callback = undefined;


        const fog = new ExpFog(new external_three_namespaceObject.Color(0, 0, 0), 0.07);
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene({fog: fog});

        /**
         * The non-euclidean camera for the basic renderer
         * @type {BasicCamera}
         */
        this.camera = new BasicCamera({set: this.set});

        /**
         * Non-euclidean renderer for basic renderer
         * @type {BasicRenderer}
         */
        this.renderer = new BasicRenderer(shader1, shader2, this.set, this.camera, this.scene, {});
        this.setPixelRatio(window.devicePixelRatio);
        this.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new external_three_namespaceObject.Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);

        // event listener
        const _onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener("resize", _onWindowResize, false);

        /**
         * The keyboard controls to fly in the scene
         * @type {FlyControls}
         * @protected
         */
        this.flyControls = new FlyControls(
            this.camera,
            params.keyboard !== undefined ? params.keyboard : 'us'
        );

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @protected
         */
        this.clock = new external_three_namespaceObject.Clock();

        /**
         * The performance stats.
         * Setup when the renderer is built.
         * @type {Stats}
         */
        this.stats = undefined;

        /**
         * The graphical user interface.
         * Setup when the renderer is built.
         * @type {GUI}
         */
        this.gui = undefined;
    }

    setPixelRatio(value) {
        this.renderer.setPixelRatio(value);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }


    /**
     * Initialize the graphic user interface
     * @return {ThurstonLite} the current Thurston object
     */
    initGUI() {
        this.gui = new GUI$1();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://github.com/henryseg/non-euclidean_VR');
            }
        }, 'help').name("Help/About");
        this.gui.add(
            this.flyControls,
            'keyboard', {QWERTY: 'us', AZERTY: 'fr'}
        ).name("Keyboard");


        // controls for the camera
        const cameraGUI = this.gui.addFolder('Camera');
        cameraGUI.add(this.camera, 'fov', 45, 120)
            .name('Field of view');
        cameraGUI.add(this.camera, 'maxDist', 0, 100, 1)
            .name('Max distance');
        cameraGUI.add(this.camera, 'maxSteps', 20, 500, 1)
            .name('Max steps');
        cameraGUI.add(this.camera, 'threshold')
            .name('Threshold');

        return this;
    }

    /**
     * Initialize the performance stats
     * @return {Thurston} the current Thurston object
     */
    initStats() {
        this.stats = new stats_module();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        return this;
    }

    /**
     * Shortcut to add objects to the scene.
     * @param {...(Solid|Light)} obj - the objects to add
     */
    add(obj) {
        this.scene.add(/**@type {(Solid|Light)} */...arguments);
    }

    /**
     * Action when the window is resized.
     * @param {UIEvent} event
     */
    onWindowResize(event) {
        this.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }


    /**
     * animation function
     */
    animate() {
        const delta = this.clock.getDelta();

        this.flyControls.update(delta);
        this.renderer.render();
        if (this.callback !== undefined) {
            this.callback();
        }

        this.stats.update();
    }

    /**
     * Build the renderer and run the animation.
     */
    run() {
        this.initStats();
        this.initGUI();
        this.renderer.build();
        const _animate = bind(this, this.animate);
        this.renderer.threeRenderer.setAnimationLoop(_animate);
    }
}
;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/loaders/GLTFLoader.js


class GLTFLoader extends external_three_namespaceObject.Loader {

	constructor( manager ) {

		super( manager );

		this.dracoLoader = null;
		this.ktx2Loader = null;
		this.meshoptDecoder = null;

		this.pluginCallbacks = [];

		this.register( function ( parser ) {

			return new GLTFMaterialsClearcoatExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFTextureBasisUExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFTextureWebPExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsTransmissionExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFLightsExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMeshoptCompression( parser );

		} );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		let resourcePath;

		if ( this.resourcePath !== '' ) {

			resourcePath = this.resourcePath;

		} else if ( this.path !== '' ) {

			resourcePath = this.path;

		} else {

			resourcePath = external_three_namespaceObject.LoaderUtils.extractUrlBase( url );

		}

		// Tells the LoadingManager to track an extra item, which resolves after
		// the model is fully loaded. This means the count of items loaded will
		// be incorrect, but ensures manager.onLoad() does not fire early.
		this.manager.itemStart( url );

		const _onError = function ( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

			scope.manager.itemError( url );
			scope.manager.itemEnd( url );

		};

		const loader = new external_three_namespaceObject.FileLoader( this.manager );

		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( data ) {

			try {

				scope.parse( data, resourcePath, function ( gltf ) {

					onLoad( gltf );

					scope.manager.itemEnd( url );

				}, _onError );

			} catch ( e ) {

				_onError( e );

			}

		}, onProgress, _onError );

	}

	setDRACOLoader( dracoLoader ) {

		this.dracoLoader = dracoLoader;
		return this;

	}

	setDDSLoader() {

		throw new Error(

			'THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".'

		);

	}

	setKTX2Loader( ktx2Loader ) {

		this.ktx2Loader = ktx2Loader;
		return this;

	}

	setMeshoptDecoder( meshoptDecoder ) {

		this.meshoptDecoder = meshoptDecoder;
		return this;

	}

	register( callback ) {

		if ( this.pluginCallbacks.indexOf( callback ) === - 1 ) {

			this.pluginCallbacks.push( callback );

		}

		return this;

	}

	unregister( callback ) {

		if ( this.pluginCallbacks.indexOf( callback ) !== - 1 ) {

			this.pluginCallbacks.splice( this.pluginCallbacks.indexOf( callback ), 1 );

		}

		return this;

	}

	parse( data, path, onLoad, onError ) {

		let content;
		const extensions = {};
		const plugins = {};

		if ( typeof data === 'string' ) {

			content = data;

		} else {

			const magic = external_three_namespaceObject.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

			if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

				try {

					extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );

				} catch ( error ) {

					if ( onError ) onError( error );
					return;

				}

				content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

			} else {

				content = external_three_namespaceObject.LoaderUtils.decodeText( new Uint8Array( data ) );

			}

		}

		const json = JSON.parse( content );

		if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

			if ( onError ) onError( new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.' ) );
			return;

		}

		const parser = new GLTFParser( json, {

			path: path || this.resourcePath || '',
			crossOrigin: this.crossOrigin,
			requestHeader: this.requestHeader,
			manager: this.manager,
			ktx2Loader: this.ktx2Loader,
			meshoptDecoder: this.meshoptDecoder

		} );

		parser.fileLoader.setRequestHeader( this.requestHeader );

		for ( let i = 0; i < this.pluginCallbacks.length; i ++ ) {

			const plugin = this.pluginCallbacks[ i ]( parser );
			plugins[ plugin.name ] = plugin;

			// Workaround to avoid determining as unknown extension
			// in addUnknownExtensionsToUserData().
			// Remove this workaround if we move all the existing
			// extension handlers to plugin system
			extensions[ plugin.name ] = true;

		}

		if ( json.extensionsUsed ) {

			for ( let i = 0; i < json.extensionsUsed.length; ++ i ) {

				const extensionName = json.extensionsUsed[ i ];
				const extensionsRequired = json.extensionsRequired || [];

				switch ( extensionName ) {

					case EXTENSIONS.KHR_MATERIALS_UNLIT:
						extensions[ extensionName ] = new GLTFMaterialsUnlitExtension();
						break;

					case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
						extensions[ extensionName ] = new GLTFMaterialsPbrSpecularGlossinessExtension();
						break;

					case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
						extensions[ extensionName ] = new GLTFDracoMeshCompressionExtension( json, this.dracoLoader );
						break;

					case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
						extensions[ extensionName ] = new GLTFTextureTransformExtension();
						break;

					case EXTENSIONS.KHR_MESH_QUANTIZATION:
						extensions[ extensionName ] = new GLTFMeshQuantizationExtension();
						break;

					default:

						if ( extensionsRequired.indexOf( extensionName ) >= 0 && plugins[ extensionName ] === undefined ) {

							console.warn( 'THREE.GLTFLoader: Unknown extension "' + extensionName + '".' );

						}

				}

			}

		}

		parser.setExtensions( extensions );
		parser.setPlugins( plugins );
		parser.parse( onLoad, onError );

	}

}

/* GLTFREGISTRY */

function GLTFRegistry() {

	let objects = {};

	return	{

		get: function ( key ) {

			return objects[ key ];

		},

		add: function ( key, object ) {

			objects[ key ] = object;

		},

		remove: function ( key ) {

			delete objects[ key ];

		},

		removeAll: function () {

			objects = {};

		}

	};

}

/*********************************/
/********** EXTENSIONS ***********/
/*********************************/

const EXTENSIONS = {
	KHR_BINARY_GLTF: 'KHR_binary_glTF',
	KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
	KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
	KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
	KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
	KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
	KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
	KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
	KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
	KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
	EXT_TEXTURE_WEBP: 'EXT_texture_webp',
	EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression'
};

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
class GLTFLightsExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

		// Object3D instance caches
		this.cache = { refs: {}, uses: {} };

	}

	_markDefs() {

		const parser = this.parser;
		const nodeDefs = this.parser.json.nodes || [];

		for ( let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

			const nodeDef = nodeDefs[ nodeIndex ];

			if ( nodeDef.extensions
					&& nodeDef.extensions[ this.name ]
					&& nodeDef.extensions[ this.name ].light !== undefined ) {

				parser._addNodeRef( this.cache, nodeDef.extensions[ this.name ].light );

			}

		}

	}

	_loadLight( lightIndex ) {

		const parser = this.parser;
		const cacheKey = 'light:' + lightIndex;
		let dependency = parser.cache.get( cacheKey );

		if ( dependency ) return dependency;

		const json = parser.json;
		const extensions = ( json.extensions && json.extensions[ this.name ] ) || {};
		const lightDefs = extensions.lights || [];
		const lightDef = lightDefs[ lightIndex ];
		let lightNode;

		const color = new external_three_namespaceObject.Color( 0xffffff );

		if ( lightDef.color !== undefined ) color.fromArray( lightDef.color );

		const range = lightDef.range !== undefined ? lightDef.range : 0;

		switch ( lightDef.type ) {

			case 'directional':
				lightNode = new external_three_namespaceObject.DirectionalLight( color );
				lightNode.target.position.set( 0, 0, - 1 );
				lightNode.add( lightNode.target );
				break;

			case 'point':
				lightNode = new external_three_namespaceObject.PointLight( color );
				lightNode.distance = range;
				break;

			case 'spot':
				lightNode = new external_three_namespaceObject.SpotLight( color );
				lightNode.distance = range;
				// Handle spotlight properties.
				lightDef.spot = lightDef.spot || {};
				lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
				lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
				lightNode.angle = lightDef.spot.outerConeAngle;
				lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
				lightNode.target.position.set( 0, 0, - 1 );
				lightNode.add( lightNode.target );
				break;

			default:
				throw new Error( 'THREE.GLTFLoader: Unexpected light type: ' + lightDef.type );

		}

		// Some lights (e.g. spot) default to a position other than the origin. Reset the position
		// here, because node-level parsing will only override position if explicitly specified.
		lightNode.position.set( 0, 0, 0 );

		lightNode.decay = 2;

		if ( lightDef.intensity !== undefined ) lightNode.intensity = lightDef.intensity;

		lightNode.name = parser.createUniqueName( lightDef.name || ( 'light_' + lightIndex ) );

		dependency = Promise.resolve( lightNode );

		parser.cache.add( cacheKey, dependency );

		return dependency;

	}

	createNodeAttachment( nodeIndex ) {

		const self = this;
		const parser = this.parser;
		const json = parser.json;
		const nodeDef = json.nodes[ nodeIndex ];
		const lightDef = ( nodeDef.extensions && nodeDef.extensions[ this.name ] ) || {};
		const lightIndex = lightDef.light;

		if ( lightIndex === undefined ) return null;

		return this._loadLight( lightIndex ).then( function ( light ) {

			return parser._getNodeRef( self.cache, lightIndex, light );

		} );

	}

}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
class GLTFMaterialsUnlitExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;

	}

	getMaterialType() {

		return external_three_namespaceObject.MeshBasicMaterial;

	}

	extendParams( materialParams, materialDef, parser ) {

		const pending = [];

		materialParams.color = new external_three_namespaceObject.Color( 1.0, 1.0, 1.0 );
		materialParams.opacity = 1.0;

		const metallicRoughness = materialDef.pbrMetallicRoughness;

		if ( metallicRoughness ) {

			if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

				const array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray( array );
				materialParams.opacity = array[ 3 ];

			}

			if ( metallicRoughness.baseColorTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

			}

		}

		return Promise.all( pending );

	}

}

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
class GLTFMaterialsClearcoatExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return external_three_namespaceObject.MeshPhysicalMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const pending = [];

		const extension = materialDef.extensions[ this.name ];

		if ( extension.clearcoatFactor !== undefined ) {

			materialParams.clearcoat = extension.clearcoatFactor;

		}

		if ( extension.clearcoatTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatMap', extension.clearcoatTexture ) );

		}

		if ( extension.clearcoatRoughnessFactor !== undefined ) {

			materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;

		}

		if ( extension.clearcoatRoughnessTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture ) );

		}

		if ( extension.clearcoatNormalTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture ) );

			if ( extension.clearcoatNormalTexture.scale !== undefined ) {

				const scale = extension.clearcoatNormalTexture.scale;

				// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
				materialParams.clearcoatNormalScale = new external_three_namespaceObject.Vector2( scale, - scale );

			}

		}

		return Promise.all( pending );

	}

}

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
class GLTFMaterialsTransmissionExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;

	}

	getMaterialType( materialIndex ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) return null;

		return external_three_namespaceObject.MeshPhysicalMaterial;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const pending = [];

		const extension = materialDef.extensions[ this.name ];

		if ( extension.transmissionFactor !== undefined ) {

			materialParams.transmission = extension.transmissionFactor;

		}

		if ( extension.transmissionTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'transmissionMap', extension.transmissionTexture ) );

		}

		return Promise.all( pending );

	}

}

/**
 * BasisU Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
 */
class GLTFTextureBasisUExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_TEXTURE_BASISU;

	}

	loadTexture( textureIndex ) {

		const parser = this.parser;
		const json = parser.json;

		const textureDef = json.textures[ textureIndex ];

		if ( ! textureDef.extensions || ! textureDef.extensions[ this.name ] ) {

			return null;

		}

		const extension = textureDef.extensions[ this.name ];
		const source = json.images[ extension.source ];
		const loader = parser.options.ktx2Loader;

		if ( ! loader ) {

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( this.name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures' );

			} else {

				// Assumes that the extension is optional and that a fallback texture is present
				return null;

			}

		}

		return parser.loadTextureImage( textureIndex, source, loader );

	}

}

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
class GLTFTextureWebPExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
		this.isSupported = null;

	}

	loadTexture( textureIndex ) {

		const name = this.name;
		const parser = this.parser;
		const json = parser.json;

		const textureDef = json.textures[ textureIndex ];

		if ( ! textureDef.extensions || ! textureDef.extensions[ name ] ) {

			return null;

		}

		const extension = textureDef.extensions[ name ];
		const source = json.images[ extension.source ];

		let loader = parser.textureLoader;
		if ( source.uri ) {

			const handler = parser.options.manager.getHandler( source.uri );
			if ( handler !== null ) loader = handler;

		}

		return this.detectSupport().then( function ( isSupported ) {

			if ( isSupported ) return parser.loadTextureImage( textureIndex, source, loader );

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: WebP required by asset but unsupported.' );

			}

			// Fall back to PNG or JPEG.
			return parser.loadTexture( textureIndex );

		} );

	}

	detectSupport() {

		if ( ! this.isSupported ) {

			this.isSupported = new Promise( function ( resolve ) {

				const image = new Image();

				// Lossy test image. Support for lossy images doesn't guarantee support for all
				// WebP images, unfortunately.
				image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

				image.onload = image.onerror = function () {

					resolve( image.height === 1 );

				};

			} );

		}

		return this.isSupported;

	}

}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
class GLTFMeshoptCompression {

	constructor( parser ) {

		this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
		this.parser = parser;

	}

	loadBufferView( index ) {

		const json = this.parser.json;
		const bufferView = json.bufferViews[ index ];

		if ( bufferView.extensions && bufferView.extensions[ this.name ] ) {

			const extensionDef = bufferView.extensions[ this.name ];

			const buffer = this.parser.getDependency( 'buffer', extensionDef.buffer );
			const decoder = this.parser.options.meshoptDecoder;

			if ( ! decoder || ! decoder.supported ) {

				if ( json.extensionsRequired && json.extensionsRequired.indexOf( this.name ) >= 0 ) {

					throw new Error( 'THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files' );

				} else {

					// Assumes that the extension is optional and that fallback buffer data is present
					return null;

				}

			}

			return Promise.all( [ buffer, decoder.ready ] ).then( function ( res ) {

				const byteOffset = extensionDef.byteOffset || 0;
				const byteLength = extensionDef.byteLength || 0;

				const count = extensionDef.count;
				const stride = extensionDef.byteStride;

				const result = new ArrayBuffer( count * stride );
				const source = new Uint8Array( res[ 0 ], byteOffset, byteLength );

				decoder.decodeGltfBuffer( new Uint8Array( result ), count, stride, source, extensionDef.mode, extensionDef.filter );
				return result;

			} );

		} else {

			return null;

		}

	}

}

/* BINARY EXTENSION */
const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

class GLTFBinaryExtension {

	constructor( data ) {

		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;

		const headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

		this.header = {
			magic: external_three_namespaceObject.LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
			version: headerView.getUint32( 4, true ),
			length: headerView.getUint32( 8, true )
		};

		if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

			throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );

		} else if ( this.header.version < 2.0 ) {

			throw new Error( 'THREE.GLTFLoader: Legacy binary file detected.' );

		}

		const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
		const chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
		let chunkIndex = 0;

		while ( chunkIndex < chunkContentsLength ) {

			const chunkLength = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			const chunkType = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

				const contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
				this.content = external_three_namespaceObject.LoaderUtils.decodeText( contentArray );

			} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

				const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice( byteOffset, byteOffset + chunkLength );

			}

			// Clients must ignore chunks with unknown types.

			chunkIndex += chunkLength;

		}

		if ( this.content === null ) {

			throw new Error( 'THREE.GLTFLoader: JSON content not found.' );

		}

	}

}

/**
 * DRACO Mesh Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
class GLTFDracoMeshCompressionExtension {

	constructor( json, dracoLoader ) {

		if ( ! dracoLoader ) {

			throw new Error( 'THREE.GLTFLoader: No DRACOLoader instance provided.' );

		}

		this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
		this.json = json;
		this.dracoLoader = dracoLoader;
		this.dracoLoader.preload();

	}

	decodePrimitive( primitive, parser ) {

		const json = this.json;
		const dracoLoader = this.dracoLoader;
		const bufferViewIndex = primitive.extensions[ this.name ].bufferView;
		const gltfAttributeMap = primitive.extensions[ this.name ].attributes;
		const threeAttributeMap = {};
		const attributeNormalizedMap = {};
		const attributeTypeMap = {};

		for ( const attributeName in gltfAttributeMap ) {

			const threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

			threeAttributeMap[ threeAttributeName ] = gltfAttributeMap[ attributeName ];

		}

		for ( const attributeName in primitive.attributes ) {

			const threeAttributeName = ATTRIBUTES[ attributeName ] || attributeName.toLowerCase();

			if ( gltfAttributeMap[ attributeName ] !== undefined ) {

				const accessorDef = json.accessors[ primitive.attributes[ attributeName ] ];
				const componentType = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

				attributeTypeMap[ threeAttributeName ] = componentType;
				attributeNormalizedMap[ threeAttributeName ] = accessorDef.normalized === true;

			}

		}

		return parser.getDependency( 'bufferView', bufferViewIndex ).then( function ( bufferView ) {

			return new Promise( function ( resolve ) {

				dracoLoader.decodeDracoFile( bufferView, function ( geometry ) {

					for ( const attributeName in geometry.attributes ) {

						const attribute = geometry.attributes[ attributeName ];
						const normalized = attributeNormalizedMap[ attributeName ];

						if ( normalized !== undefined ) attribute.normalized = normalized;

					}

					resolve( geometry );

				}, threeAttributeMap, attributeTypeMap );

			} );

		} );

	}

}

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
class GLTFTextureTransformExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;

	}

	extendTexture( texture, transform ) {

		if ( transform.texCoord !== undefined ) {

			console.warn( 'THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.' );

		}

		if ( transform.offset === undefined && transform.rotation === undefined && transform.scale === undefined ) {

			// See https://github.com/mrdoob/three.js/issues/21819.
			return texture;

		}

		texture = texture.clone();

		if ( transform.offset !== undefined ) {

			texture.offset.fromArray( transform.offset );

		}

		if ( transform.rotation !== undefined ) {

			texture.rotation = transform.rotation;

		}

		if ( transform.scale !== undefined ) {

			texture.repeat.fromArray( transform.scale );

		}

		texture.needsUpdate = true;

		return texture;

	}

}

/**
 * Specular-Glossiness Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
 */

/**
 * A sub class of StandardMaterial with some of the functionality
 * changed via the `onBeforeCompile` callback
 * @pailhead
 */
class GLTFMeshStandardSGMaterial extends external_three_namespaceObject.MeshStandardMaterial {

	constructor( params ) {

		super();

		this.isGLTFSpecularGlossinessMaterial = true;

		//various chunks that need replacing
		const specularMapParsFragmentChunk = [
			'#ifdef USE_SPECULARMAP',
			'	uniform sampler2D specularMap;',
			'#endif'
		].join( '\n' );

		const glossinessMapParsFragmentChunk = [
			'#ifdef USE_GLOSSINESSMAP',
			'	uniform sampler2D glossinessMap;',
			'#endif'
		].join( '\n' );

		const specularMapFragmentChunk = [
			'vec3 specularFactor = specular;',
			'#ifdef USE_SPECULARMAP',
			'	vec4 texelSpecular = texture2D( specularMap, vUv );',
			'	texelSpecular = sRGBToLinear( texelSpecular );',
			'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	specularFactor *= texelSpecular.rgb;',
			'#endif'
		].join( '\n' );

		const glossinessMapFragmentChunk = [
			'float glossinessFactor = glossiness;',
			'#ifdef USE_GLOSSINESSMAP',
			'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
			'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	glossinessFactor *= texelGlossiness.a;',
			'#endif'
		].join( '\n' );

		const lightPhysicalFragmentChunk = [
			'PhysicalMaterial material;',
			'material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );',
			'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
			'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
			'material.specularRoughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.',
			'material.specularRoughness += geometryRoughness;',
			'material.specularRoughness = min( material.specularRoughness, 1.0 );',
			'material.specularColor = specularFactor;',
		].join( '\n' );

		const uniforms = {
			specular: { value: new external_three_namespaceObject.Color().setHex( 0xffffff ) },
			glossiness: { value: 1 },
			specularMap: { value: null },
			glossinessMap: { value: null }
		};

		this._extraUniforms = uniforms;

		this.onBeforeCompile = function ( shader ) {

			for ( const uniformName in uniforms ) {

				shader.uniforms[ uniformName ] = uniforms[ uniformName ];

			}

			shader.fragmentShader = shader.fragmentShader
				.replace( 'uniform float roughness;', 'uniform vec3 specular;' )
				.replace( 'uniform float metalness;', 'uniform float glossiness;' )
				.replace( '#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk )
				.replace( '#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk )
				.replace( '#include <roughnessmap_fragment>', specularMapFragmentChunk )
				.replace( '#include <metalnessmap_fragment>', glossinessMapFragmentChunk )
				.replace( '#include <lights_physical_fragment>', lightPhysicalFragmentChunk );

		};

		Object.defineProperties( this, {

			specular: {
				get: function () {

					return uniforms.specular.value;

				},
				set: function ( v ) {

					uniforms.specular.value = v;

				}
			},

			specularMap: {
				get: function () {

					return uniforms.specularMap.value;

				},
				set: function ( v ) {

					uniforms.specularMap.value = v;

					if ( v ) {

						this.defines.USE_SPECULARMAP = ''; // USE_UV is set by the renderer for specular maps

					} else {

						delete this.defines.USE_SPECULARMAP;

					}

				}
			},

			glossiness: {
				get: function () {

					return uniforms.glossiness.value;

				},
				set: function ( v ) {

					uniforms.glossiness.value = v;

				}
			},

			glossinessMap: {
				get: function () {

					return uniforms.glossinessMap.value;

				},
				set: function ( v ) {

					uniforms.glossinessMap.value = v;

					if ( v ) {

						this.defines.USE_GLOSSINESSMAP = '';
						this.defines.USE_UV = '';

					} else {

						delete this.defines.USE_GLOSSINESSMAP;
						delete this.defines.USE_UV;

					}

				}
			}

		} );

		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;

		this.setValues( params );

	}

	copy( source ) {

		super.copy( source );

		this.specularMap = source.specularMap;
		this.specular.copy( source.specular );
		this.glossinessMap = source.glossinessMap;
		this.glossiness = source.glossiness;
		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;
		return this;

	}

}


class GLTFMaterialsPbrSpecularGlossinessExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS;

		this.specularGlossinessParams = [
			'color',
			'map',
			'lightMap',
			'lightMapIntensity',
			'aoMap',
			'aoMapIntensity',
			'emissive',
			'emissiveIntensity',
			'emissiveMap',
			'bumpMap',
			'bumpScale',
			'normalMap',
			'normalMapType',
			'displacementMap',
			'displacementScale',
			'displacementBias',
			'specularMap',
			'specular',
			'glossinessMap',
			'glossiness',
			'alphaMap',
			'envMap',
			'envMapIntensity',
			'refractionRatio',
		];

	}

	getMaterialType() {

		return GLTFMeshStandardSGMaterial;

	}

	extendParams( materialParams, materialDef, parser ) {

		const pbrSpecularGlossiness = materialDef.extensions[ this.name ];

		materialParams.color = new external_three_namespaceObject.Color( 1.0, 1.0, 1.0 );
		materialParams.opacity = 1.0;

		const pending = [];

		if ( Array.isArray( pbrSpecularGlossiness.diffuseFactor ) ) {

			const array = pbrSpecularGlossiness.diffuseFactor;

			materialParams.color.fromArray( array );
			materialParams.opacity = array[ 3 ];

		}

		if ( pbrSpecularGlossiness.diffuseTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'map', pbrSpecularGlossiness.diffuseTexture ) );

		}

		materialParams.emissive = new external_three_namespaceObject.Color( 0.0, 0.0, 0.0 );
		materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
		materialParams.specular = new external_three_namespaceObject.Color( 1.0, 1.0, 1.0 );

		if ( Array.isArray( pbrSpecularGlossiness.specularFactor ) ) {

			materialParams.specular.fromArray( pbrSpecularGlossiness.specularFactor );

		}

		if ( pbrSpecularGlossiness.specularGlossinessTexture !== undefined ) {

			const specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
			pending.push( parser.assignTexture( materialParams, 'glossinessMap', specGlossMapDef ) );
			pending.push( parser.assignTexture( materialParams, 'specularMap', specGlossMapDef ) );

		}

		return Promise.all( pending );

	}

	createMaterial( materialParams ) {

		const material = new GLTFMeshStandardSGMaterial( materialParams );
		material.fog = true;

		material.color = materialParams.color;

		material.map = materialParams.map === undefined ? null : materialParams.map;

		material.lightMap = null;
		material.lightMapIntensity = 1.0;

		material.aoMap = materialParams.aoMap === undefined ? null : materialParams.aoMap;
		material.aoMapIntensity = 1.0;

		material.emissive = materialParams.emissive;
		material.emissiveIntensity = 1.0;
		material.emissiveMap = materialParams.emissiveMap === undefined ? null : materialParams.emissiveMap;

		material.bumpMap = materialParams.bumpMap === undefined ? null : materialParams.bumpMap;
		material.bumpScale = 1;

		material.normalMap = materialParams.normalMap === undefined ? null : materialParams.normalMap;
		material.normalMapType = external_three_namespaceObject.TangentSpaceNormalMap;

		if ( materialParams.normalScale ) material.normalScale = materialParams.normalScale;

		material.displacementMap = null;
		material.displacementScale = 1;
		material.displacementBias = 0;

		material.specularMap = materialParams.specularMap === undefined ? null : materialParams.specularMap;
		material.specular = materialParams.specular;

		material.glossinessMap = materialParams.glossinessMap === undefined ? null : materialParams.glossinessMap;
		material.glossiness = materialParams.glossiness;

		material.alphaMap = null;

		material.envMap = materialParams.envMap === undefined ? null : materialParams.envMap;
		material.envMapIntensity = 1.0;

		material.refractionRatio = 0.98;

		return material;

	}

}

/**
 * Mesh Quantization Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
 */
class GLTFMeshQuantizationExtension {

	constructor() {

		this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;

	}

}

/*********************************/
/********** INTERPOLATION ********/
/*********************************/

// Spline Interpolation
// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
class GLTFCubicSplineInterpolant extends external_three_namespaceObject.Interpolant {

	constructor( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	copySampleValue_( index ) {

		// Copies a sample value to the result buffer. See description of glTF
		// CUBICSPLINE values layout in interpolate_() function below.

		const result = this.resultBuffer,
			values = this.sampleValues,
			valueSize = this.valueSize,
			offset = index * valueSize * 3 + valueSize;

		for ( let i = 0; i !== valueSize; i ++ ) {

			result[ i ] = values[ offset + i ];

		}

		return result;

	}

}

GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

GLTFCubicSplineInterpolant.prototype.interpolate_ = function ( i1, t0, t, t1 ) {

	const result = this.resultBuffer;
	const values = this.sampleValues;
	const stride = this.valueSize;

	const stride2 = stride * 2;
	const stride3 = stride * 3;

	const td = t1 - t0;

	const p = ( t - t0 ) / td;
	const pp = p * p;
	const ppp = pp * p;

	const offset1 = i1 * stride3;
	const offset0 = offset1 - stride3;

	const s2 = - 2 * ppp + 3 * pp;
	const s3 = ppp - pp;
	const s0 = 1 - s2;
	const s1 = s3 - pp + p;

	// Layout of keyframe output values for CUBICSPLINE animations:
	//   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
	for ( let i = 0; i !== stride; i ++ ) {

		const p0 = values[ offset0 + i + stride ]; // splineVertex_k
		const m0 = values[ offset0 + i + stride2 ] * td; // outTangent_k * (t_k+1 - t_k)
		const p1 = values[ offset1 + i + stride ]; // splineVertex_k+1
		const m1 = values[ offset1 + i ] * td; // inTangent_k+1 * (t_k+1 - t_k)

		result[ i ] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

	}

	return result;

};

/*********************************/
/********** INTERNALS ************/
/*********************************/

/* CONSTANTS */

const WEBGL_CONSTANTS = {
	FLOAT: 5126,
	//FLOAT_MAT2: 35674,
	FLOAT_MAT3: 35675,
	FLOAT_MAT4: 35676,
	FLOAT_VEC2: 35664,
	FLOAT_VEC3: 35665,
	FLOAT_VEC4: 35666,
	LINEAR: 9729,
	REPEAT: 10497,
	SAMPLER_2D: 35678,
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6,
	UNSIGNED_BYTE: 5121,
	UNSIGNED_SHORT: 5123
};

const WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};

const WEBGL_FILTERS = {
	9728: external_three_namespaceObject.NearestFilter,
	9729: external_three_namespaceObject.LinearFilter,
	9984: external_three_namespaceObject.NearestMipmapNearestFilter,
	9985: external_three_namespaceObject.LinearMipmapNearestFilter,
	9986: external_three_namespaceObject.NearestMipmapLinearFilter,
	9987: external_three_namespaceObject.LinearMipmapLinearFilter
};

const WEBGL_WRAPPINGS = {
	33071: external_three_namespaceObject.ClampToEdgeWrapping,
	33648: external_three_namespaceObject.MirroredRepeatWrapping,
	10497: external_three_namespaceObject.RepeatWrapping
};

const WEBGL_TYPE_SIZES = {
	'SCALAR': 1,
	'VEC2': 2,
	'VEC3': 3,
	'VEC4': 4,
	'MAT2': 4,
	'MAT3': 9,
	'MAT4': 16
};

const ATTRIBUTES = {
	POSITION: 'position',
	NORMAL: 'normal',
	TANGENT: 'tangent',
	TEXCOORD_0: 'uv',
	TEXCOORD_1: 'uv2',
	COLOR_0: 'color',
	WEIGHTS_0: 'skinWeight',
	JOINTS_0: 'skinIndex',
};

const PATH_PROPERTIES = {
	scale: 'scale',
	translation: 'position',
	rotation: 'quaternion',
	weights: 'morphTargetInfluences'
};

const INTERPOLATION = {
	CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
		                        // keyframe track will be initialized with a default interpolation type, then modified.
	LINEAR: external_three_namespaceObject.InterpolateLinear,
	STEP: external_three_namespaceObject.InterpolateDiscrete
};

const ALPHA_MODES = {
	OPAQUE: 'OPAQUE',
	MASK: 'MASK',
	BLEND: 'BLEND'
};

/* UTILITY FUNCTIONS */

function resolveURL( url, path ) {

	// Invalid URL
	if ( typeof url !== 'string' || url === '' ) return '';

	// Host Relative URL
	if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

		path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

	}

	// Absolute URL http://,https://,//
	if ( /^(https?:)?\/\//i.test( url ) ) return url;

	// Data URI
	if ( /^data:.*,.*$/i.test( url ) ) return url;

	// Blob URL
	if ( /^blob:.*$/i.test( url ) ) return url;

	// Relative URL
	return path + url;

}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
 */
function createDefaultMaterial( cache ) {

	if ( cache[ 'DefaultMaterial' ] === undefined ) {

		cache[ 'DefaultMaterial' ] = new external_three_namespaceObject.MeshStandardMaterial( {
			color: 0xFFFFFF,
			emissive: 0x000000,
			metalness: 1,
			roughness: 1,
			transparent: false,
			depthTest: true,
			side: external_three_namespaceObject.FrontSide
		} );

	}

	return cache[ 'DefaultMaterial' ];

}

function addUnknownExtensionsToUserData( knownExtensions, object, objectDef ) {

	// Add unknown glTF extensions to an object's userData.

	for ( const name in objectDef.extensions ) {

		if ( knownExtensions[ name ] === undefined ) {

			object.userData.gltfExtensions = object.userData.gltfExtensions || {};
			object.userData.gltfExtensions[ name ] = objectDef.extensions[ name ];

		}

	}

}

/**
 * @param {Object3D|Material|BufferGeometry} object
 * @param {GLTF.definition} gltfDef
 */
function assignExtrasToUserData( object, gltfDef ) {

	if ( gltfDef.extras !== undefined ) {

		if ( typeof gltfDef.extras === 'object' ) {

			Object.assign( object.userData, gltfDef.extras );

		} else {

			console.warn( 'THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras );

		}

	}

}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
 *
 * @param {BufferGeometry} geometry
 * @param {Array<GLTF.Target>} targets
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
function addMorphTargets( geometry, targets, parser ) {

	let hasMorphPosition = false;
	let hasMorphNormal = false;

	for ( let i = 0, il = targets.length; i < il; i ++ ) {

		const target = targets[ i ];

		if ( target.POSITION !== undefined ) hasMorphPosition = true;
		if ( target.NORMAL !== undefined ) hasMorphNormal = true;

		if ( hasMorphPosition && hasMorphNormal ) break;

	}

	if ( ! hasMorphPosition && ! hasMorphNormal ) return Promise.resolve( geometry );

	const pendingPositionAccessors = [];
	const pendingNormalAccessors = [];

	for ( let i = 0, il = targets.length; i < il; i ++ ) {

		const target = targets[ i ];

		if ( hasMorphPosition ) {

			const pendingAccessor = target.POSITION !== undefined
				? parser.getDependency( 'accessor', target.POSITION )
				: geometry.attributes.position;

			pendingPositionAccessors.push( pendingAccessor );

		}

		if ( hasMorphNormal ) {

			const pendingAccessor = target.NORMAL !== undefined
				? parser.getDependency( 'accessor', target.NORMAL )
				: geometry.attributes.normal;

			pendingNormalAccessors.push( pendingAccessor );

		}

	}

	return Promise.all( [
		Promise.all( pendingPositionAccessors ),
		Promise.all( pendingNormalAccessors )
	] ).then( function ( accessors ) {

		const morphPositions = accessors[ 0 ];
		const morphNormals = accessors[ 1 ];

		if ( hasMorphPosition ) geometry.morphAttributes.position = morphPositions;
		if ( hasMorphNormal ) geometry.morphAttributes.normal = morphNormals;
		geometry.morphTargetsRelative = true;

		return geometry;

	} );

}

/**
 * @param {Mesh} mesh
 * @param {GLTF.Mesh} meshDef
 */
function updateMorphTargets( mesh, meshDef ) {

	mesh.updateMorphTargets();

	if ( meshDef.weights !== undefined ) {

		for ( let i = 0, il = meshDef.weights.length; i < il; i ++ ) {

			mesh.morphTargetInfluences[ i ] = meshDef.weights[ i ];

		}

	}

	// .extras has user-defined data, so check that .extras.targetNames is an array.
	if ( meshDef.extras && Array.isArray( meshDef.extras.targetNames ) ) {

		const targetNames = meshDef.extras.targetNames;

		if ( mesh.morphTargetInfluences.length === targetNames.length ) {

			mesh.morphTargetDictionary = {};

			for ( let i = 0, il = targetNames.length; i < il; i ++ ) {

				mesh.morphTargetDictionary[ targetNames[ i ] ] = i;

			}

		} else {

			console.warn( 'THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.' );

		}

	}

}

function createPrimitiveKey( primitiveDef ) {

	const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ];
	let geometryKey;

	if ( dracoExtension ) {

		geometryKey = 'draco:' + dracoExtension.bufferView
				+ ':' + dracoExtension.indices
				+ ':' + createAttributesKey( dracoExtension.attributes );

	} else {

		geometryKey = primitiveDef.indices + ':' + createAttributesKey( primitiveDef.attributes ) + ':' + primitiveDef.mode;

	}

	return geometryKey;

}

function createAttributesKey( attributes ) {

	let attributesKey = '';

	const keys = Object.keys( attributes ).sort();

	for ( let i = 0, il = keys.length; i < il; i ++ ) {

		attributesKey += keys[ i ] + ':' + attributes[ keys[ i ] ] + ';';

	}

	return attributesKey;

}

function getNormalizedComponentScale( constructor ) {

	// Reference:
	// https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization#encoding-quantized-data

	switch ( constructor ) {

		case Int8Array:
			return 1 / 127;

		case Uint8Array:
			return 1 / 255;

		case Int16Array:
			return 1 / 32767;

		case Uint16Array:
			return 1 / 65535;

		default:
			throw new Error( 'THREE.GLTFLoader: Unsupported normalized accessor component type.' );

	}

}

/* GLTF PARSER */

class GLTFParser {

	constructor( json = {}, options = {} ) {

		this.json = json;
		this.extensions = {};
		this.plugins = {};
		this.options = options;

		// loader object cache
		this.cache = new GLTFRegistry();

		// associations between Three.js objects and glTF elements
		this.associations = new Map();

		// BufferGeometry caching
		this.primitiveCache = {};

		// Object3D instance caches
		this.meshCache = { refs: {}, uses: {} };
		this.cameraCache = { refs: {}, uses: {} };
		this.lightCache = { refs: {}, uses: {} };

		this.textureCache = {};

		// Track node names, to ensure no duplicates
		this.nodeNamesUsed = {};

		// Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
		// expensive work of uploading a texture to the GPU off the main thread.
		if ( typeof createImageBitmap !== 'undefined' && /Firefox/.test( navigator.userAgent ) === false ) {

			this.textureLoader = new external_three_namespaceObject.ImageBitmapLoader( this.options.manager );

		} else {

			this.textureLoader = new external_three_namespaceObject.TextureLoader( this.options.manager );

		}

		this.textureLoader.setCrossOrigin( this.options.crossOrigin );
		this.textureLoader.setRequestHeader( this.options.requestHeader );

		this.fileLoader = new external_three_namespaceObject.FileLoader( this.options.manager );
		this.fileLoader.setResponseType( 'arraybuffer' );

		if ( this.options.crossOrigin === 'use-credentials' ) {

			this.fileLoader.setWithCredentials( true );

		}

	}

	setExtensions( extensions ) {

		this.extensions = extensions;

	}

	setPlugins( plugins ) {

		this.plugins = plugins;

	}

	parse( onLoad, onError ) {

		const parser = this;
		const json = this.json;
		const extensions = this.extensions;

		// Clear the loader cache
		this.cache.removeAll();

		// Mark the special nodes/meshes in json for efficient parse
		this._invokeAll( function ( ext ) {

			return ext._markDefs && ext._markDefs();

		} );

		Promise.all( this._invokeAll( function ( ext ) {

			return ext.beforeRoot && ext.beforeRoot();

		} ) ).then( function () {

			return Promise.all( [

				parser.getDependencies( 'scene' ),
				parser.getDependencies( 'animation' ),
				parser.getDependencies( 'camera' ),

			] );

		} ).then( function ( dependencies ) {

			const result = {
				scene: dependencies[ 0 ][ json.scene || 0 ],
				scenes: dependencies[ 0 ],
				animations: dependencies[ 1 ],
				cameras: dependencies[ 2 ],
				asset: json.asset,
				parser: parser,
				userData: {}
			};

			addUnknownExtensionsToUserData( extensions, result, json );

			assignExtrasToUserData( result, json );

			Promise.all( parser._invokeAll( function ( ext ) {

				return ext.afterRoot && ext.afterRoot( result );

			} ) ).then( function () {

				onLoad( result );

			} );

		} ).catch( onError );

	}

	/**
	 * Marks the special nodes/meshes in json for efficient parse.
	 */
	_markDefs() {

		const nodeDefs = this.json.nodes || [];
		const skinDefs = this.json.skins || [];
		const meshDefs = this.json.meshes || [];

		// Nothing in the node definition indicates whether it is a Bone or an
		// Object3D. Use the skins' joint references to mark bones.
		for ( let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex ++ ) {

			const joints = skinDefs[ skinIndex ].joints;

			for ( let i = 0, il = joints.length; i < il; i ++ ) {

				nodeDefs[ joints[ i ] ].isBone = true;

			}

		}

		// Iterate over all nodes, marking references to shared resources,
		// as well as skeleton joints.
		for ( let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

			const nodeDef = nodeDefs[ nodeIndex ];

			if ( nodeDef.mesh !== undefined ) {

				this._addNodeRef( this.meshCache, nodeDef.mesh );

				// Nothing in the mesh definition indicates whether it is
				// a SkinnedMesh or Mesh. Use the node's mesh reference
				// to mark SkinnedMesh if node has skin.
				if ( nodeDef.skin !== undefined ) {

					meshDefs[ nodeDef.mesh ].isSkinnedMesh = true;

				}

			}

			if ( nodeDef.camera !== undefined ) {

				this._addNodeRef( this.cameraCache, nodeDef.camera );

			}

		}

	}

	/**
	 * Counts references to shared node / Object3D resources. These resources
	 * can be reused, or "instantiated", at multiple nodes in the scene
	 * hierarchy. Mesh, Camera, and Light instances are instantiated and must
	 * be marked. Non-scenegraph resources (like Materials, Geometries, and
	 * Textures) can be reused directly and are not marked here.
	 *
	 * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
	 */
	_addNodeRef( cache, index ) {

		if ( index === undefined ) return;

		if ( cache.refs[ index ] === undefined ) {

			cache.refs[ index ] = cache.uses[ index ] = 0;

		}

		cache.refs[ index ] ++;

	}

	/** Returns a reference to a shared resource, cloning it if necessary. */
	_getNodeRef( cache, index, object ) {

		if ( cache.refs[ index ] <= 1 ) return object;

		const ref = object.clone();

		ref.name += '_instance_' + ( cache.uses[ index ] ++ );

		return ref;

	}

	_invokeOne( func ) {

		const extensions = Object.values( this.plugins );
		extensions.push( this );

		for ( let i = 0; i < extensions.length; i ++ ) {

			const result = func( extensions[ i ] );

			if ( result ) return result;

		}

		return null;

	}

	_invokeAll( func ) {

		const extensions = Object.values( this.plugins );
		extensions.unshift( this );

		const pending = [];

		for ( let i = 0; i < extensions.length; i ++ ) {

			const result = func( extensions[ i ] );

			if ( result ) pending.push( result );

		}

		return pending;

	}

	/**
	 * Requests the specified dependency asynchronously, with caching.
	 * @param {string} type
	 * @param {number} index
	 * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
	 */
	getDependency( type, index ) {

		const cacheKey = type + ':' + index;
		let dependency = this.cache.get( cacheKey );

		if ( ! dependency ) {

			switch ( type ) {

				case 'scene':
					dependency = this.loadScene( index );
					break;

				case 'node':
					dependency = this.loadNode( index );
					break;

				case 'mesh':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadMesh && ext.loadMesh( index );

					} );
					break;

				case 'accessor':
					dependency = this.loadAccessor( index );
					break;

				case 'bufferView':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadBufferView && ext.loadBufferView( index );

					} );
					break;

				case 'buffer':
					dependency = this.loadBuffer( index );
					break;

				case 'material':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadMaterial && ext.loadMaterial( index );

					} );
					break;

				case 'texture':
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadTexture && ext.loadTexture( index );

					} );
					break;

				case 'skin':
					dependency = this.loadSkin( index );
					break;

				case 'animation':
					dependency = this.loadAnimation( index );
					break;

				case 'camera':
					dependency = this.loadCamera( index );
					break;

				default:
					throw new Error( 'Unknown type: ' + type );

			}

			this.cache.add( cacheKey, dependency );

		}

		return dependency;

	}

	/**
	 * Requests all dependencies of the specified type asynchronously, with caching.
	 * @param {string} type
	 * @return {Promise<Array<Object>>}
	 */
	getDependencies( type ) {

		let dependencies = this.cache.get( type );

		if ( ! dependencies ) {

			const parser = this;
			const defs = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || [];

			dependencies = Promise.all( defs.map( function ( def, index ) {

				return parser.getDependency( type, index );

			} ) );

			this.cache.add( type, dependencies );

		}

		return dependencies;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	loadBuffer( bufferIndex ) {

		const bufferDef = this.json.buffers[ bufferIndex ];
		const loader = this.fileLoader;

		if ( bufferDef.type && bufferDef.type !== 'arraybuffer' ) {

			throw new Error( 'THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.' );

		}

		// If present, GLB container is required to be the first buffer.
		if ( bufferDef.uri === undefined && bufferIndex === 0 ) {

			return Promise.resolve( this.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body );

		}

		const options = this.options;

		return new Promise( function ( resolve, reject ) {

			loader.load( resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {

				reject( new Error( 'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".' ) );

			} );

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferViewIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	loadBufferView( bufferViewIndex ) {

		const bufferViewDef = this.json.bufferViews[ bufferViewIndex ];

		return this.getDependency( 'buffer', bufferViewDef.buffer ).then( function ( buffer ) {

			const byteLength = bufferViewDef.byteLength || 0;
			const byteOffset = bufferViewDef.byteOffset || 0;
			return buffer.slice( byteOffset, byteOffset + byteLength );

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
	 * @param {number} accessorIndex
	 * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
	 */
	loadAccessor( accessorIndex ) {

		const parser = this;
		const json = this.json;

		const accessorDef = this.json.accessors[ accessorIndex ];

		if ( accessorDef.bufferView === undefined && accessorDef.sparse === undefined ) {

			// Ignore empty accessors, which may be used to declare runtime
			// information about attributes coming from another source (e.g. Draco
			// compression extension).
			return Promise.resolve( null );

		}

		const pendingBufferViews = [];

		if ( accessorDef.bufferView !== undefined ) {

			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.bufferView ) );

		} else {

			pendingBufferViews.push( null );

		}

		if ( accessorDef.sparse !== undefined ) {

			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.indices.bufferView ) );
			pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.values.bufferView ) );

		}

		return Promise.all( pendingBufferViews ).then( function ( bufferViews ) {

			const bufferView = bufferViews[ 0 ];

			const itemSize = WEBGL_TYPE_SIZES[ accessorDef.type ];
			const TypedArray = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

			// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
			const elementBytes = TypedArray.BYTES_PER_ELEMENT;
			const itemBytes = elementBytes * itemSize;
			const byteOffset = accessorDef.byteOffset || 0;
			const byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[ accessorDef.bufferView ].byteStride : undefined;
			const normalized = accessorDef.normalized === true;
			let array, bufferAttribute;

			// The buffer is not interleaved if the stride is the item size in bytes.
			if ( byteStride && byteStride !== itemBytes ) {

				// Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
				// This makes sure that IBA.count reflects accessor.count properly
				const ibSlice = Math.floor( byteOffset / byteStride );
				const ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
				let ib = parser.cache.get( ibCacheKey );

				if ( ! ib ) {

					array = new TypedArray( bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes );

					// Integer parameters to IB/IBA are in array elements, not bytes.
					ib = new external_three_namespaceObject.InterleavedBuffer( array, byteStride / elementBytes );

					parser.cache.add( ibCacheKey, ib );

				}

				bufferAttribute = new external_three_namespaceObject.InterleavedBufferAttribute( ib, itemSize, ( byteOffset % byteStride ) / elementBytes, normalized );

			} else {

				if ( bufferView === null ) {

					array = new TypedArray( accessorDef.count * itemSize );

				} else {

					array = new TypedArray( bufferView, byteOffset, accessorDef.count * itemSize );

				}

				bufferAttribute = new external_three_namespaceObject.BufferAttribute( array, itemSize, normalized );

			}

			// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
			if ( accessorDef.sparse !== undefined ) {

				const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
				const TypedArrayIndices = WEBGL_COMPONENT_TYPES[ accessorDef.sparse.indices.componentType ];

				const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
				const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

				const sparseIndices = new TypedArrayIndices( bufferViews[ 1 ], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices );
				const sparseValues = new TypedArray( bufferViews[ 2 ], byteOffsetValues, accessorDef.sparse.count * itemSize );

				if ( bufferView !== null ) {

					// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
					bufferAttribute = new external_three_namespaceObject.BufferAttribute( bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized );

				}

				for ( let i = 0, il = sparseIndices.length; i < il; i ++ ) {

					const index = sparseIndices[ i ];

					bufferAttribute.setX( index, sparseValues[ i * itemSize ] );
					if ( itemSize >= 2 ) bufferAttribute.setY( index, sparseValues[ i * itemSize + 1 ] );
					if ( itemSize >= 3 ) bufferAttribute.setZ( index, sparseValues[ i * itemSize + 2 ] );
					if ( itemSize >= 4 ) bufferAttribute.setW( index, sparseValues[ i * itemSize + 3 ] );
					if ( itemSize >= 5 ) throw new Error( 'THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.' );

				}

			}

			return bufferAttribute;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
	 * @param {number} textureIndex
	 * @return {Promise<THREE.Texture>}
	 */
	loadTexture( textureIndex ) {

		const json = this.json;
		const options = this.options;
		const textureDef = json.textures[ textureIndex ];
		const source = json.images[ textureDef.source ];

		let loader = this.textureLoader;

		if ( source.uri ) {

			const handler = options.manager.getHandler( source.uri );
			if ( handler !== null ) loader = handler;

		}

		return this.loadTextureImage( textureIndex, source, loader );

	}

	loadTextureImage( textureIndex, source, loader ) {

		const parser = this;
		const json = this.json;
		const options = this.options;

		const textureDef = json.textures[ textureIndex ];

		const cacheKey = ( source.uri || source.bufferView ) + ':' + textureDef.sampler;

		if ( this.textureCache[ cacheKey ] ) {

			// See https://github.com/mrdoob/three.js/issues/21559.
			return this.textureCache[ cacheKey ];

		}

		const URL = self.URL || self.webkitURL;

		let sourceURI = source.uri || '';
		let isObjectURL = false;
		let hasAlpha = true;

		const isJPEG = sourceURI.search( /\.jpe?g($|\?)/i ) > 0 || sourceURI.search( /^data\:image\/jpeg/ ) === 0;

		if ( source.mimeType === 'image/jpeg' || isJPEG ) hasAlpha = false;

		if ( source.bufferView !== undefined ) {

			// Load binary image data from bufferView, if provided.

			sourceURI = parser.getDependency( 'bufferView', source.bufferView ).then( function ( bufferView ) {

				if ( source.mimeType === 'image/png' ) {

					// Inspect the PNG 'IHDR' chunk to determine whether the image could have an
					// alpha channel. This check is conservative — the image could have an alpha
					// channel with all values == 1, and the indexed type (colorType == 3) only
					// sometimes contains alpha.
					//
					// https://en.wikipedia.org/wiki/Portable_Network_Graphics#File_header
					const colorType = new DataView( bufferView, 25, 1 ).getUint8( 0, false );
					hasAlpha = colorType === 6 || colorType === 4 || colorType === 3;

				}

				isObjectURL = true;
				const blob = new Blob( [ bufferView ], { type: source.mimeType } );
				sourceURI = URL.createObjectURL( blob );
				return sourceURI;

			} );

		} else if ( source.uri === undefined ) {

			throw new Error( 'THREE.GLTFLoader: Image ' + textureIndex + ' is missing URI and bufferView' );

		}

		const promise = Promise.resolve( sourceURI ).then( function ( sourceURI ) {

			return new Promise( function ( resolve, reject ) {

				let onLoad = resolve;

				if ( loader.isImageBitmapLoader === true ) {

					onLoad = function ( imageBitmap ) {

						resolve( new external_three_namespaceObject.CanvasTexture( imageBitmap ) );

					};

				}

				loader.load( resolveURL( sourceURI, options.path ), onLoad, undefined, reject );

			} );

		} ).then( function ( texture ) {

			// Clean up resources and configure Texture.

			if ( isObjectURL === true ) {

				URL.revokeObjectURL( sourceURI );

			}

			texture.flipY = false;

			if ( textureDef.name ) texture.name = textureDef.name;

			// When there is definitely no alpha channel in the texture, set RGBFormat to save space.
			if ( ! hasAlpha ) texture.format = external_three_namespaceObject.RGBFormat;

			const samplers = json.samplers || {};
			const sampler = samplers[ textureDef.sampler ] || {};

			texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || external_three_namespaceObject.LinearFilter;
			texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || external_three_namespaceObject.LinearMipmapLinearFilter;
			texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || external_three_namespaceObject.RepeatWrapping;
			texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || external_three_namespaceObject.RepeatWrapping;

			parser.associations.set( texture, {
				type: 'textures',
				index: textureIndex
			} );

			return texture;

		} );

		this.textureCache[ cacheKey ] = promise;

		return promise;

	}

	/**
	 * Asynchronously assigns a texture to the given material parameters.
	 * @param {Object} materialParams
	 * @param {string} mapName
	 * @param {Object} mapDef
	 * @return {Promise}
	 */
	assignTexture( materialParams, mapName, mapDef ) {

		const parser = this;

		return this.getDependency( 'texture', mapDef.index ).then( function ( texture ) {

			// Materials sample aoMap from UV set 1 and other maps from UV set 0 - this can't be configured
			// However, we will copy UV set 0 to UV set 1 on demand for aoMap
			if ( mapDef.texCoord !== undefined && mapDef.texCoord != 0 && ! ( mapName === 'aoMap' && mapDef.texCoord == 1 ) ) {

				console.warn( 'THREE.GLTFLoader: Custom UV set ' + mapDef.texCoord + ' for texture ' + mapName + ' not yet supported.' );

			}

			if ( parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] ) {

				const transform = mapDef.extensions !== undefined ? mapDef.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ] : undefined;

				if ( transform ) {

					const gltfReference = parser.associations.get( texture );
					texture = parser.extensions[ EXTENSIONS.KHR_TEXTURE_TRANSFORM ].extendTexture( texture, transform );
					parser.associations.set( texture, gltfReference );

				}

			}

			materialParams[ mapName ] = texture;

		} );

	}

	/**
	 * Assigns final material to a Mesh, Line, or Points instance. The instance
	 * already has a material (generated from the glTF material options alone)
	 * but reuse of the same glTF material may require multiple threejs materials
	 * to accommodate different primitive types, defines, etc. New materials will
	 * be created if necessary, and reused from a cache.
	 * @param  {Object3D} mesh Mesh, Line, or Points instance.
	 */
	assignFinalMaterial( mesh ) {

		const geometry = mesh.geometry;
		let material = mesh.material;

		const useVertexTangents = geometry.attributes.tangent !== undefined;
		const useVertexColors = geometry.attributes.color !== undefined;
		const useFlatShading = geometry.attributes.normal === undefined;
		const useMorphTargets = Object.keys( geometry.morphAttributes ).length > 0;
		const useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;

		if ( mesh.isPoints ) {

			const cacheKey = 'PointsMaterial:' + material.uuid;

			let pointsMaterial = this.cache.get( cacheKey );

			if ( ! pointsMaterial ) {

				pointsMaterial = new external_three_namespaceObject.PointsMaterial();
				external_three_namespaceObject.Material.prototype.copy.call( pointsMaterial, material );
				pointsMaterial.color.copy( material.color );
				pointsMaterial.map = material.map;
				pointsMaterial.sizeAttenuation = false; // glTF spec says points should be 1px

				this.cache.add( cacheKey, pointsMaterial );

			}

			material = pointsMaterial;

		} else if ( mesh.isLine ) {

			const cacheKey = 'LineBasicMaterial:' + material.uuid;

			let lineMaterial = this.cache.get( cacheKey );

			if ( ! lineMaterial ) {

				lineMaterial = new external_three_namespaceObject.LineBasicMaterial();
				external_three_namespaceObject.Material.prototype.copy.call( lineMaterial, material );
				lineMaterial.color.copy( material.color );

				this.cache.add( cacheKey, lineMaterial );

			}

			material = lineMaterial;

		}

		// Clone the material if it will be modified
		if ( useVertexTangents || useVertexColors || useFlatShading || useMorphTargets ) {

			let cacheKey = 'ClonedMaterial:' + material.uuid + ':';

			if ( material.isGLTFSpecularGlossinessMaterial ) cacheKey += 'specular-glossiness:';
			if ( useVertexTangents ) cacheKey += 'vertex-tangents:';
			if ( useVertexColors ) cacheKey += 'vertex-colors:';
			if ( useFlatShading ) cacheKey += 'flat-shading:';
			if ( useMorphTargets ) cacheKey += 'morph-targets:';
			if ( useMorphNormals ) cacheKey += 'morph-normals:';

			let cachedMaterial = this.cache.get( cacheKey );

			if ( ! cachedMaterial ) {

				cachedMaterial = material.clone();

				if ( useVertexColors ) cachedMaterial.vertexColors = true;
				if ( useFlatShading ) cachedMaterial.flatShading = true;
				if ( useMorphTargets ) cachedMaterial.morphTargets = true;
				if ( useMorphNormals ) cachedMaterial.morphNormals = true;

				if ( useVertexTangents ) {

					cachedMaterial.vertexTangents = true;

					// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
					if ( cachedMaterial.normalScale ) cachedMaterial.normalScale.y *= - 1;
					if ( cachedMaterial.clearcoatNormalScale ) cachedMaterial.clearcoatNormalScale.y *= - 1;

				}

				this.cache.add( cacheKey, cachedMaterial );

				this.associations.set( cachedMaterial, this.associations.get( material ) );

			}

			material = cachedMaterial;

		}

		// workarounds for mesh and geometry

		if ( material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined ) {

			geometry.setAttribute( 'uv2', geometry.attributes.uv );

		}

		mesh.material = material;

	}

	getMaterialType( /* materialIndex */ ) {

		return external_three_namespaceObject.MeshStandardMaterial;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
	 * @param {number} materialIndex
	 * @return {Promise<Material>}
	 */
	loadMaterial( materialIndex ) {

		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		const materialDef = json.materials[ materialIndex ];

		let materialType;
		const materialParams = {};
		const materialExtensions = materialDef.extensions || {};

		const pending = [];

		if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] ) {

			const sgExtension = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ];
			materialType = sgExtension.getMaterialType();
			pending.push( sgExtension.extendParams( materialParams, materialDef, parser ) );

		} else if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ] ) {

			const kmuExtension = extensions[ EXTENSIONS.KHR_MATERIALS_UNLIT ];
			materialType = kmuExtension.getMaterialType();
			pending.push( kmuExtension.extendParams( materialParams, materialDef, parser ) );

		} else {

			// Specification:
			// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

			const metallicRoughness = materialDef.pbrMetallicRoughness || {};

			materialParams.color = new external_three_namespaceObject.Color( 1.0, 1.0, 1.0 );
			materialParams.opacity = 1.0;

			if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

				const array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray( array );
				materialParams.opacity = array[ 3 ];

			}

			if ( metallicRoughness.baseColorTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture ) );

			}

			materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
			materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

			if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture ) );
				pending.push( parser.assignTexture( materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture ) );

			}

			materialType = this._invokeOne( function ( ext ) {

				return ext.getMaterialType && ext.getMaterialType( materialIndex );

			} );

			pending.push( Promise.all( this._invokeAll( function ( ext ) {

				return ext.extendMaterialParams && ext.extendMaterialParams( materialIndex, materialParams );

			} ) ) );

		}

		if ( materialDef.doubleSided === true ) {

			materialParams.side = external_three_namespaceObject.DoubleSide;

		}

		const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

		if ( alphaMode === ALPHA_MODES.BLEND ) {

			materialParams.transparent = true;

			// See: https://github.com/mrdoob/three.js/issues/17706
			materialParams.depthWrite = false;

		} else {

			materialParams.transparent = false;

			if ( alphaMode === ALPHA_MODES.MASK ) {

				materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

			}

		}

		if ( materialDef.normalTexture !== undefined && materialType !== external_three_namespaceObject.MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'normalMap', materialDef.normalTexture ) );

			// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
			materialParams.normalScale = new external_three_namespaceObject.Vector2( 1, - 1 );

			if ( materialDef.normalTexture.scale !== undefined ) {

				materialParams.normalScale.set( materialDef.normalTexture.scale, - materialDef.normalTexture.scale );

			}

		}

		if ( materialDef.occlusionTexture !== undefined && materialType !== external_three_namespaceObject.MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'aoMap', materialDef.occlusionTexture ) );

			if ( materialDef.occlusionTexture.strength !== undefined ) {

				materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

			}

		}

		if ( materialDef.emissiveFactor !== undefined && materialType !== external_three_namespaceObject.MeshBasicMaterial ) {

			materialParams.emissive = new external_three_namespaceObject.Color().fromArray( materialDef.emissiveFactor );

		}

		if ( materialDef.emissiveTexture !== undefined && materialType !== external_three_namespaceObject.MeshBasicMaterial ) {

			pending.push( parser.assignTexture( materialParams, 'emissiveMap', materialDef.emissiveTexture ) );

		}

		return Promise.all( pending ).then( function () {

			let material;

			if ( materialType === GLTFMeshStandardSGMaterial ) {

				material = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].createMaterial( materialParams );

			} else {

				material = new materialType( materialParams );

			}

			if ( materialDef.name ) material.name = materialDef.name;

			// baseColorTexture, emissiveTexture, and specularGlossinessTexture use sRGB encoding.
			if ( material.map ) material.map.encoding = external_three_namespaceObject.sRGBEncoding;
			if ( material.emissiveMap ) material.emissiveMap.encoding = external_three_namespaceObject.sRGBEncoding;

			assignExtrasToUserData( material, materialDef );

			parser.associations.set( material, { type: 'materials', index: materialIndex } );

			if ( materialDef.extensions ) addUnknownExtensionsToUserData( extensions, material, materialDef );

			return material;

		} );

	}

	/** When Object3D instances are targeted by animation, they need unique names. */
	createUniqueName( originalName ) {

		const sanitizedName = external_three_namespaceObject.PropertyBinding.sanitizeNodeName( originalName || '' );

		let name = sanitizedName;

		for ( let i = 1; this.nodeNamesUsed[ name ]; ++ i ) {

			name = sanitizedName + '_' + i;

		}

		this.nodeNamesUsed[ name ] = true;

		return name;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
	 *
	 * Creates BufferGeometries from primitives.
	 *
	 * @param {Array<GLTF.Primitive>} primitives
	 * @return {Promise<Array<BufferGeometry>>}
	 */
	loadGeometries( primitives ) {

		const parser = this;
		const extensions = this.extensions;
		const cache = this.primitiveCache;

		function createDracoPrimitive( primitive ) {

			return extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ]
				.decodePrimitive( primitive, parser )
				.then( function ( geometry ) {

					return addPrimitiveAttributes( geometry, primitive, parser );

				} );

		}

		const pending = [];

		for ( let i = 0, il = primitives.length; i < il; i ++ ) {

			const primitive = primitives[ i ];
			const cacheKey = createPrimitiveKey( primitive );

			// See if we've already created this geometry
			const cached = cache[ cacheKey ];

			if ( cached ) {

				// Use the cached geometry if it exists
				pending.push( cached.promise );

			} else {

				let geometryPromise;

				if ( primitive.extensions && primitive.extensions[ EXTENSIONS.KHR_DRACO_MESH_COMPRESSION ] ) {

					// Use DRACO geometry if available
					geometryPromise = createDracoPrimitive( primitive );

				} else {

					// Otherwise create a new geometry
					geometryPromise = addPrimitiveAttributes( new external_three_namespaceObject.BufferGeometry(), primitive, parser );

				}

				// Cache this geometry
				cache[ cacheKey ] = { primitive: primitive, promise: geometryPromise };

				pending.push( geometryPromise );

			}

		}

		return Promise.all( pending );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
	 * @param {number} meshIndex
	 * @return {Promise<Group|Mesh|SkinnedMesh>}
	 */
	loadMesh( meshIndex ) {

		const parser = this;
		const json = this.json;
		const extensions = this.extensions;

		const meshDef = json.meshes[ meshIndex ];
		const primitives = meshDef.primitives;

		const pending = [];

		for ( let i = 0, il = primitives.length; i < il; i ++ ) {

			const material = primitives[ i ].material === undefined
				? createDefaultMaterial( this.cache )
				: this.getDependency( 'material', primitives[ i ].material );

			pending.push( material );

		}

		pending.push( parser.loadGeometries( primitives ) );

		return Promise.all( pending ).then( function ( results ) {

			const materials = results.slice( 0, results.length - 1 );
			const geometries = results[ results.length - 1 ];

			const meshes = [];

			for ( let i = 0, il = geometries.length; i < il; i ++ ) {

				const geometry = geometries[ i ];
				const primitive = primitives[ i ];

				// 1. create Mesh

				let mesh;

				const material = materials[ i ];

				if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
						primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
						primitive.mode === undefined ) {

					// .isSkinnedMesh isn't in glTF spec. See ._markDefs()
					mesh = meshDef.isSkinnedMesh === true
						? new external_three_namespaceObject.SkinnedMesh( geometry, material )
						: new external_three_namespaceObject.Mesh( geometry, material );

					if ( mesh.isSkinnedMesh === true && ! mesh.geometry.attributes.skinWeight.normalized ) {

						// we normalize floating point skin weight array to fix malformed assets (see #15319)
						// it's important to skip this for non-float32 data since normalizeSkinWeights assumes non-normalized inputs
						mesh.normalizeSkinWeights();

					}

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ) {

						mesh.geometry = toTrianglesDrawMode( mesh.geometry, external_three_namespaceObject.TriangleStripDrawMode );

					} else if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ) {

						mesh.geometry = toTrianglesDrawMode( mesh.geometry, external_three_namespaceObject.TriangleFanDrawMode );

					}

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

					mesh = new external_three_namespaceObject.LineSegments( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_STRIP ) {

					mesh = new external_three_namespaceObject.Line( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_LOOP ) {

					mesh = new external_three_namespaceObject.LineLoop( geometry, material );

				} else if ( primitive.mode === WEBGL_CONSTANTS.POINTS ) {

					mesh = new external_three_namespaceObject.Points( geometry, material );

				} else {

					throw new Error( 'THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode );

				}

				if ( Object.keys( mesh.geometry.morphAttributes ).length > 0 ) {

					updateMorphTargets( mesh, meshDef );

				}

				mesh.name = parser.createUniqueName( meshDef.name || ( 'mesh_' + meshIndex ) );

				assignExtrasToUserData( mesh, meshDef );

				if ( primitive.extensions ) addUnknownExtensionsToUserData( extensions, mesh, primitive );

				parser.assignFinalMaterial( mesh );

				meshes.push( mesh );

			}

			if ( meshes.length === 1 ) {

				return meshes[ 0 ];

			}

			const group = new external_three_namespaceObject.Group();

			for ( let i = 0, il = meshes.length; i < il; i ++ ) {

				group.add( meshes[ i ] );

			}

			return group;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
	 * @param {number} cameraIndex
	 * @return {Promise<THREE.Camera>}
	 */
	loadCamera( cameraIndex ) {

		let camera;
		const cameraDef = this.json.cameras[ cameraIndex ];
		const params = cameraDef[ cameraDef.type ];

		if ( ! params ) {

			console.warn( 'THREE.GLTFLoader: Missing camera parameters.' );
			return;

		}

		if ( cameraDef.type === 'perspective' ) {

			camera = new external_three_namespaceObject.PerspectiveCamera( external_three_namespaceObject.MathUtils.radToDeg( params.yfov ), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6 );

		} else if ( cameraDef.type === 'orthographic' ) {

			camera = new external_three_namespaceObject.OrthographicCamera( - params.xmag, params.xmag, params.ymag, - params.ymag, params.znear, params.zfar );

		}

		if ( cameraDef.name ) camera.name = this.createUniqueName( cameraDef.name );

		assignExtrasToUserData( camera, cameraDef );

		return Promise.resolve( camera );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
	 * @param {number} skinIndex
	 * @return {Promise<Object>}
	 */
	loadSkin( skinIndex ) {

		const skinDef = this.json.skins[ skinIndex ];

		const skinEntry = { joints: skinDef.joints };

		if ( skinDef.inverseBindMatrices === undefined ) {

			return Promise.resolve( skinEntry );

		}

		return this.getDependency( 'accessor', skinDef.inverseBindMatrices ).then( function ( accessor ) {

			skinEntry.inverseBindMatrices = accessor;

			return skinEntry;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
	 * @param {number} animationIndex
	 * @return {Promise<AnimationClip>}
	 */
	loadAnimation( animationIndex ) {

		const json = this.json;

		const animationDef = json.animations[ animationIndex ];

		const pendingNodes = [];
		const pendingInputAccessors = [];
		const pendingOutputAccessors = [];
		const pendingSamplers = [];
		const pendingTargets = [];

		for ( let i = 0, il = animationDef.channels.length; i < il; i ++ ) {

			const channel = animationDef.channels[ i ];
			const sampler = animationDef.samplers[ channel.sampler ];
			const target = channel.target;
			const name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
			const input = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.input ] : sampler.input;
			const output = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.output ] : sampler.output;

			pendingNodes.push( this.getDependency( 'node', name ) );
			pendingInputAccessors.push( this.getDependency( 'accessor', input ) );
			pendingOutputAccessors.push( this.getDependency( 'accessor', output ) );
			pendingSamplers.push( sampler );
			pendingTargets.push( target );

		}

		return Promise.all( [

			Promise.all( pendingNodes ),
			Promise.all( pendingInputAccessors ),
			Promise.all( pendingOutputAccessors ),
			Promise.all( pendingSamplers ),
			Promise.all( pendingTargets )

		] ).then( function ( dependencies ) {

			const nodes = dependencies[ 0 ];
			const inputAccessors = dependencies[ 1 ];
			const outputAccessors = dependencies[ 2 ];
			const samplers = dependencies[ 3 ];
			const targets = dependencies[ 4 ];

			const tracks = [];

			for ( let i = 0, il = nodes.length; i < il; i ++ ) {

				const node = nodes[ i ];
				const inputAccessor = inputAccessors[ i ];
				const outputAccessor = outputAccessors[ i ];
				const sampler = samplers[ i ];
				const target = targets[ i ];

				if ( node === undefined ) continue;

				node.updateMatrix();
				node.matrixAutoUpdate = true;

				let TypedKeyframeTrack;

				switch ( PATH_PROPERTIES[ target.path ] ) {

					case PATH_PROPERTIES.weights:

						TypedKeyframeTrack = external_three_namespaceObject.NumberKeyframeTrack;
						break;

					case PATH_PROPERTIES.rotation:

						TypedKeyframeTrack = external_three_namespaceObject.QuaternionKeyframeTrack;
						break;

					case PATH_PROPERTIES.position:
					case PATH_PROPERTIES.scale:
					default:

						TypedKeyframeTrack = external_three_namespaceObject.VectorKeyframeTrack;
						break;

				}

				const targetName = node.name ? node.name : node.uuid;

				const interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : external_three_namespaceObject.InterpolateLinear;

				const targetNames = [];

				if ( PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.weights ) {

					// Node may be a Group (glTF mesh with several primitives) or a Mesh.
					node.traverse( function ( object ) {

						if ( object.isMesh === true && object.morphTargetInfluences ) {

							targetNames.push( object.name ? object.name : object.uuid );

						}

					} );

				} else {

					targetNames.push( targetName );

				}

				let outputArray = outputAccessor.array;

				if ( outputAccessor.normalized ) {

					const scale = getNormalizedComponentScale( outputArray.constructor );
					const scaled = new Float32Array( outputArray.length );

					for ( let j = 0, jl = outputArray.length; j < jl; j ++ ) {

						scaled[ j ] = outputArray[ j ] * scale;

					}

					outputArray = scaled;

				}

				for ( let j = 0, jl = targetNames.length; j < jl; j ++ ) {

					const track = new TypedKeyframeTrack(
						targetNames[ j ] + '.' + PATH_PROPERTIES[ target.path ],
						inputAccessor.array,
						outputArray,
						interpolation
					);

					// Override interpolation with custom factory method.
					if ( sampler.interpolation === 'CUBICSPLINE' ) {

						track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline( result ) {

							// A CUBICSPLINE keyframe in glTF has three output values for each input value,
							// representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
							// must be divided by three to get the interpolant's sampleSize argument.

							return new GLTFCubicSplineInterpolant( this.times, this.values, this.getValueSize() / 3, result );

						};

						// Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
						track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;

					}

					tracks.push( track );

				}

			}

			const name = animationDef.name ? animationDef.name : 'animation_' + animationIndex;

			return new external_three_namespaceObject.AnimationClip( name, undefined, tracks );

		} );

	}

	createNodeMesh( nodeIndex ) {

		const json = this.json;
		const parser = this;
		const nodeDef = json.nodes[ nodeIndex ];

		if ( nodeDef.mesh === undefined ) return null;

		return parser.getDependency( 'mesh', nodeDef.mesh ).then( function ( mesh ) {

			const node = parser._getNodeRef( parser.meshCache, nodeDef.mesh, mesh );

			// if weights are provided on the node, override weights on the mesh.
			if ( nodeDef.weights !== undefined ) {

				node.traverse( function ( o ) {

					if ( ! o.isMesh ) return;

					for ( let i = 0, il = nodeDef.weights.length; i < il; i ++ ) {

						o.morphTargetInfluences[ i ] = nodeDef.weights[ i ];

					}

				} );

			}

			return node;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
	 * @param {number} nodeIndex
	 * @return {Promise<Object3D>}
	 */
	loadNode( nodeIndex ) {

		const json = this.json;
		const extensions = this.extensions;
		const parser = this;

		const nodeDef = json.nodes[ nodeIndex ];

		// reserve node's name before its dependencies, so the root has the intended name.
		const nodeName = nodeDef.name ? parser.createUniqueName( nodeDef.name ) : '';

		return ( function () {

			const pending = [];

			const meshPromise = parser._invokeOne( function ( ext ) {

				return ext.createNodeMesh && ext.createNodeMesh( nodeIndex );

			} );

			if ( meshPromise ) {

				pending.push( meshPromise );

			}

			if ( nodeDef.camera !== undefined ) {

				pending.push( parser.getDependency( 'camera', nodeDef.camera ).then( function ( camera ) {

					return parser._getNodeRef( parser.cameraCache, nodeDef.camera, camera );

				} ) );

			}

			parser._invokeAll( function ( ext ) {

				return ext.createNodeAttachment && ext.createNodeAttachment( nodeIndex );

			} ).forEach( function ( promise ) {

				pending.push( promise );

			} );

			return Promise.all( pending );

		}() ).then( function ( objects ) {

			let node;

			// .isBone isn't in glTF spec. See ._markDefs
			if ( nodeDef.isBone === true ) {

				node = new external_three_namespaceObject.Bone();

			} else if ( objects.length > 1 ) {

				node = new external_three_namespaceObject.Group();

			} else if ( objects.length === 1 ) {

				node = objects[ 0 ];

			} else {

				node = new external_three_namespaceObject.Object3D();

			}

			if ( node !== objects[ 0 ] ) {

				for ( let i = 0, il = objects.length; i < il; i ++ ) {

					node.add( objects[ i ] );

				}

			}

			if ( nodeDef.name ) {

				node.userData.name = nodeDef.name;
				node.name = nodeName;

			}

			assignExtrasToUserData( node, nodeDef );

			if ( nodeDef.extensions ) addUnknownExtensionsToUserData( extensions, node, nodeDef );

			if ( nodeDef.matrix !== undefined ) {

				const matrix = new external_three_namespaceObject.Matrix4();
				matrix.fromArray( nodeDef.matrix );
				node.applyMatrix4( matrix );

			} else {

				if ( nodeDef.translation !== undefined ) {

					node.position.fromArray( nodeDef.translation );

				}

				if ( nodeDef.rotation !== undefined ) {

					node.quaternion.fromArray( nodeDef.rotation );

				}

				if ( nodeDef.scale !== undefined ) {

					node.scale.fromArray( nodeDef.scale );

				}

			}

			parser.associations.set( node, { type: 'nodes', index: nodeIndex } );

			return node;

		} );

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
	 * @param {number} sceneIndex
	 * @return {Promise<Group>}
	 */
	loadScene( sceneIndex ) {

		const json = this.json;
		const extensions = this.extensions;
		const sceneDef = this.json.scenes[ sceneIndex ];
		const parser = this;

		// Loader returns Group, not Scene.
		// See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
		const scene = new external_three_namespaceObject.Group();
		if ( sceneDef.name ) scene.name = parser.createUniqueName( sceneDef.name );

		assignExtrasToUserData( scene, sceneDef );

		if ( sceneDef.extensions ) addUnknownExtensionsToUserData( extensions, scene, sceneDef );

		const nodeIds = sceneDef.nodes || [];

		const pending = [];

		for ( let i = 0, il = nodeIds.length; i < il; i ++ ) {

			pending.push( buildNodeHierachy( nodeIds[ i ], scene, json, parser ) );

		}

		return Promise.all( pending ).then( function () {

			return scene;

		} );

	}

}

function buildNodeHierachy( nodeId, parentObject, json, parser ) {

	const nodeDef = json.nodes[ nodeId ];

	return parser.getDependency( 'node', nodeId ).then( function ( node ) {

		if ( nodeDef.skin === undefined ) return node;

		// build skeleton here as well

		let skinEntry;

		return parser.getDependency( 'skin', nodeDef.skin ).then( function ( skin ) {

			skinEntry = skin;

			const pendingJoints = [];

			for ( let i = 0, il = skinEntry.joints.length; i < il; i ++ ) {

				pendingJoints.push( parser.getDependency( 'node', skinEntry.joints[ i ] ) );

			}

			return Promise.all( pendingJoints );

		} ).then( function ( jointNodes ) {

			node.traverse( function ( mesh ) {

				if ( ! mesh.isMesh ) return;

				const bones = [];
				const boneInverses = [];

				for ( let j = 0, jl = jointNodes.length; j < jl; j ++ ) {

					const jointNode = jointNodes[ j ];

					if ( jointNode ) {

						bones.push( jointNode );

						const mat = new external_three_namespaceObject.Matrix4();

						if ( skinEntry.inverseBindMatrices !== undefined ) {

							mat.fromArray( skinEntry.inverseBindMatrices.array, j * 16 );

						}

						boneInverses.push( mat );

					} else {

						console.warn( 'THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[ j ] );

					}

				}

				mesh.bind( new external_three_namespaceObject.Skeleton( bones, boneInverses ), mesh.matrixWorld );

			} );

			return node;

		} );

	} ).then( function ( node ) {

		// build node hierachy

		parentObject.add( node );

		const pending = [];

		if ( nodeDef.children ) {

			const children = nodeDef.children;

			for ( let i = 0, il = children.length; i < il; i ++ ) {

				const child = children[ i ];
				pending.push( buildNodeHierachy( child, node, json, parser ) );

			}

		}

		return Promise.all( pending );

	} );

}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 */
function computeBounds( geometry, primitiveDef, parser ) {

	const attributes = primitiveDef.attributes;

	const box = new external_three_namespaceObject.Box3();

	if ( attributes.POSITION !== undefined ) {

		const accessor = parser.json.accessors[ attributes.POSITION ];

		const min = accessor.min;
		const max = accessor.max;

		// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

		if ( min !== undefined && max !== undefined ) {

			box.set(
				new external_three_namespaceObject.Vector3( min[ 0 ], min[ 1 ], min[ 2 ] ),
				new external_three_namespaceObject.Vector3( max[ 0 ], max[ 1 ], max[ 2 ] )
			);

			if ( accessor.normalized ) {

				const boxScale = getNormalizedComponentScale( WEBGL_COMPONENT_TYPES[ accessor.componentType ] );
				box.min.multiplyScalar( boxScale );
				box.max.multiplyScalar( boxScale );

			}

		} else {

			console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

			return;

		}

	} else {

		return;

	}

	const targets = primitiveDef.targets;

	if ( targets !== undefined ) {

		const maxDisplacement = new external_three_namespaceObject.Vector3();
		const vector = new external_three_namespaceObject.Vector3();

		for ( let i = 0, il = targets.length; i < il; i ++ ) {

			const target = targets[ i ];

			if ( target.POSITION !== undefined ) {

				const accessor = parser.json.accessors[ target.POSITION ];
				const min = accessor.min;
				const max = accessor.max;

				// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

				if ( min !== undefined && max !== undefined ) {

					// we need to get max of absolute components because target weight is [-1,1]
					vector.setX( Math.max( Math.abs( min[ 0 ] ), Math.abs( max[ 0 ] ) ) );
					vector.setY( Math.max( Math.abs( min[ 1 ] ), Math.abs( max[ 1 ] ) ) );
					vector.setZ( Math.max( Math.abs( min[ 2 ] ), Math.abs( max[ 2 ] ) ) );


					if ( accessor.normalized ) {

						const boxScale = getNormalizedComponentScale( WEBGL_COMPONENT_TYPES[ accessor.componentType ] );
						vector.multiplyScalar( boxScale );

					}

					// Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
					// to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
					// are used to implement key-frame animations and as such only two are active at a time - this results in very large
					// boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
					maxDisplacement.max( vector );

				} else {

					console.warn( 'THREE.GLTFLoader: Missing min/max properties for accessor POSITION.' );

				}

			}

		}

		// As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
		box.expandByVector( maxDisplacement );

	}

	geometry.boundingBox = box;

	const sphere = new external_three_namespaceObject.Sphere();

	box.getCenter( sphere.center );
	sphere.radius = box.min.distanceTo( box.max ) / 2;

	geometry.boundingSphere = sphere;

}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
function addPrimitiveAttributes( geometry, primitiveDef, parser ) {

	const attributes = primitiveDef.attributes;

	const pending = [];

	function assignAttributeAccessor( accessorIndex, attributeName ) {

		return parser.getDependency( 'accessor', accessorIndex )
			.then( function ( accessor ) {

				geometry.setAttribute( attributeName, accessor );

			} );

	}

	for ( const gltfAttributeName in attributes ) {

		const threeAttributeName = ATTRIBUTES[ gltfAttributeName ] || gltfAttributeName.toLowerCase();

		// Skip attributes already provided by e.g. Draco extension.
		if ( threeAttributeName in geometry.attributes ) continue;

		pending.push( assignAttributeAccessor( attributes[ gltfAttributeName ], threeAttributeName ) );

	}

	if ( primitiveDef.indices !== undefined && ! geometry.index ) {

		const accessor = parser.getDependency( 'accessor', primitiveDef.indices ).then( function ( accessor ) {

			geometry.setIndex( accessor );

		} );

		pending.push( accessor );

	}

	assignExtrasToUserData( geometry, primitiveDef );

	computeBounds( geometry, primitiveDef, parser );

	return Promise.all( pending ).then( function () {

		return primitiveDef.targets !== undefined
			? addMorphTargets( geometry, primitiveDef.targets, parser )
			: geometry;

	} );

}

/**
 * @param {BufferGeometry} geometry
 * @param {Number} drawMode
 * @return {BufferGeometry}
 */
function toTrianglesDrawMode( geometry, drawMode ) {

	let index = geometry.getIndex();

	// generate index if not present

	if ( index === null ) {

		const indices = [];

		const position = geometry.getAttribute( 'position' );

		if ( position !== undefined ) {

			for ( let i = 0; i < position.count; i ++ ) {

				indices.push( i );

			}

			geometry.setIndex( indices );
			index = geometry.getIndex();

		} else {

			console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
			return geometry;

		}

	}

	//

	const numberOfTriangles = index.count - 2;
	const newIndices = [];

	if ( drawMode === external_three_namespaceObject.TriangleFanDrawMode ) {

		// gl.TRIANGLE_FAN

		for ( let i = 1; i <= numberOfTriangles; i ++ ) {

			newIndices.push( index.getX( 0 ) );
			newIndices.push( index.getX( i ) );
			newIndices.push( index.getX( i + 1 ) );

		}

	} else {

		// gl.TRIANGLE_STRIP

		for ( let i = 0; i < numberOfTriangles; i ++ ) {

			if ( i % 2 === 0 ) {

				newIndices.push( index.getX( i ) );
				newIndices.push( index.getX( i + 1 ) );
				newIndices.push( index.getX( i + 2 ) );


			} else {

				newIndices.push( index.getX( i + 2 ) );
				newIndices.push( index.getX( i + 1 ) );
				newIndices.push( index.getX( i ) );

			}

		}

	}

	if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

		console.error( 'THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

	}

	// build final geometry

	const newGeometry = geometry.clone();
	newGeometry.setIndex( newIndices );

	return newGeometry;

}



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/libs/motion-controllers.module.js
/**
 * @webxr-input-profiles/motion-controllers 1.0.0 https://github.com/immersive-web/webxr-input-profiles
 */

const Constants = {
  Handedness: Object.freeze({
    NONE: 'none',
    LEFT: 'left',
    RIGHT: 'right'
  }),

  ComponentState: Object.freeze({
    DEFAULT: 'default',
    TOUCHED: 'touched',
    PRESSED: 'pressed'
  }),

  ComponentProperty: Object.freeze({
    BUTTON: 'button',
    X_AXIS: 'xAxis',
    Y_AXIS: 'yAxis',
    STATE: 'state'
  }),

  ComponentType: Object.freeze({
    TRIGGER: 'trigger',
    SQUEEZE: 'squeeze',
    TOUCHPAD: 'touchpad',
    THUMBSTICK: 'thumbstick',
    BUTTON: 'button'
  }),

  ButtonTouchThreshold: 0.05,

  AxisTouchThreshold: 0.1,

  VisualResponseProperty: Object.freeze({
    TRANSFORM: 'transform',
    VISIBILITY: 'visibility'
  })
};

/**
 * @description Static helper function to fetch a JSON file and turn it into a JS object
 * @param {string} path - Path to JSON file to be fetched
 */
async function fetchJsonFile(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(response.statusText);
  } else {
    return response.json();
  }
}

async function fetchProfilesList(basePath) {
  if (!basePath) {
    throw new Error('No basePath supplied');
  }

  const profileListFileName = 'profilesList.json';
  const profilesList = await fetchJsonFile(`${basePath}/${profileListFileName}`);
  return profilesList;
}

async function fetchProfile(xrInputSource, basePath, defaultProfile = null, getAssetPath = true) {
  if (!xrInputSource) {
    throw new Error('No xrInputSource supplied');
  }

  if (!basePath) {
    throw new Error('No basePath supplied');
  }

  // Get the list of profiles
  const supportedProfilesList = await fetchProfilesList(basePath);

  // Find the relative path to the first requested profile that is recognized
  let match;
  xrInputSource.profiles.some((profileId) => {
    const supportedProfile = supportedProfilesList[profileId];
    if (supportedProfile) {
      match = {
        profileId,
        profilePath: `${basePath}/${supportedProfile.path}`,
        deprecated: !!supportedProfile.deprecated
      };
    }
    return !!match;
  });

  if (!match) {
    if (!defaultProfile) {
      throw new Error('No matching profile name found');
    }

    const supportedProfile = supportedProfilesList[defaultProfile];
    if (!supportedProfile) {
      throw new Error(`No matching profile name found and default profile "${defaultProfile}" missing.`);
    }

    match = {
      profileId: defaultProfile,
      profilePath: `${basePath}/${supportedProfile.path}`,
      deprecated: !!supportedProfile.deprecated
    };
  }

  const profile = await fetchJsonFile(match.profilePath);

  let assetPath;
  if (getAssetPath) {
    let layout;
    if (xrInputSource.handedness === 'any') {
      layout = profile.layouts[Object.keys(profile.layouts)[0]];
    } else {
      layout = profile.layouts[xrInputSource.handedness];
    }
    if (!layout) {
      throw new Error(
        `No matching handedness, ${xrInputSource.handedness}, in profile ${match.profileId}`
      );
    }

    if (layout.assetPath) {
      assetPath = match.profilePath.replace('profile.json', layout.assetPath);
    }
  }

  return { profile, assetPath };
}

/** @constant {Object} */
const defaultComponentValues = {
  xAxis: 0,
  yAxis: 0,
  button: 0,
  state: Constants.ComponentState.DEFAULT
};

/**
 * @description Converts an X, Y coordinate from the range -1 to 1 (as reported by the Gamepad
 * API) to the range 0 to 1 (for interpolation). Also caps the X, Y values to be bounded within
 * a circle. This ensures that thumbsticks are not animated outside the bounds of their physical
 * range of motion and touchpads do not report touch locations off their physical bounds.
 * @param {number} x The original x coordinate in the range -1 to 1
 * @param {number} y The original y coordinate in the range -1 to 1
 */
function normalizeAxes(x = 0, y = 0) {
  let xAxis = x;
  let yAxis = y;

  // Determine if the point is outside the bounds of the circle
  // and, if so, place it on the edge of the circle
  const hypotenuse = Math.sqrt((x * x) + (y * y));
  if (hypotenuse > 1) {
    const theta = Math.atan2(y, x);
    xAxis = Math.cos(theta);
    yAxis = Math.sin(theta);
  }

  // Scale and move the circle so values are in the interpolation range.  The circle's origin moves
  // from (0, 0) to (0.5, 0.5). The circle's radius scales from 1 to be 0.5.
  const result = {
    normalizedXAxis: (xAxis * 0.5) + 0.5,
    normalizedYAxis: (yAxis * 0.5) + 0.5
  };
  return result;
}

/**
 * Contains the description of how the 3D model should visually respond to a specific user input.
 * This is accomplished by initializing the object with the name of a node in the 3D model and
 * property that need to be modified in response to user input, the name of the nodes representing
 * the allowable range of motion, and the name of the input which triggers the change. In response
 * to the named input changing, this object computes the appropriate weighting to use for
 * interpolating between the range of motion nodes.
 */
class VisualResponse {
  constructor(visualResponseDescription) {
    this.componentProperty = visualResponseDescription.componentProperty;
    this.states = visualResponseDescription.states;
    this.valueNodeName = visualResponseDescription.valueNodeName;
    this.valueNodeProperty = visualResponseDescription.valueNodeProperty;

    if (this.valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM) {
      this.minNodeName = visualResponseDescription.minNodeName;
      this.maxNodeName = visualResponseDescription.maxNodeName;
    }

    // Initializes the response's current value based on default data
    this.value = 0;
    this.updateFromComponent(defaultComponentValues);
  }

  /**
   * Computes the visual response's interpolation weight based on component state
   * @param {Object} componentValues - The component from which to update
   * @param {number} xAxis - The reported X axis value of the component
   * @param {number} yAxis - The reported Y axis value of the component
   * @param {number} button - The reported value of the component's button
   * @param {string} state - The component's active state
   */
  updateFromComponent({
    xAxis, yAxis, button, state
  }) {
    const { normalizedXAxis, normalizedYAxis } = normalizeAxes(xAxis, yAxis);
    switch (this.componentProperty) {
      case Constants.ComponentProperty.X_AXIS:
        this.value = (this.states.includes(state)) ? normalizedXAxis : 0.5;
        break;
      case Constants.ComponentProperty.Y_AXIS:
        this.value = (this.states.includes(state)) ? normalizedYAxis : 0.5;
        break;
      case Constants.ComponentProperty.BUTTON:
        this.value = (this.states.includes(state)) ? button : 0;
        break;
      case Constants.ComponentProperty.STATE:
        if (this.valueNodeProperty === Constants.VisualResponseProperty.VISIBILITY) {
          this.value = (this.states.includes(state));
        } else {
          this.value = this.states.includes(state) ? 1.0 : 0.0;
        }
        break;
      default:
        throw new Error(`Unexpected visualResponse componentProperty ${this.componentProperty}`);
    }
  }
}

class Component {
  /**
   * @param {Object} componentId - Id of the component
   * @param {Object} componentDescription - Description of the component to be created
   */
  constructor(componentId, componentDescription) {
    if (!componentId
     || !componentDescription
     || !componentDescription.visualResponses
     || !componentDescription.gamepadIndices
     || Object.keys(componentDescription.gamepadIndices).length === 0) {
      throw new Error('Invalid arguments supplied');
    }

    this.id = componentId;
    this.type = componentDescription.type;
    this.rootNodeName = componentDescription.rootNodeName;
    this.touchPointNodeName = componentDescription.touchPointNodeName;

    // Build all the visual responses for this component
    this.visualResponses = {};
    Object.keys(componentDescription.visualResponses).forEach((responseName) => {
      const visualResponse = new VisualResponse(componentDescription.visualResponses[responseName]);
      this.visualResponses[responseName] = visualResponse;
    });

    // Set default values
    this.gamepadIndices = Object.assign({}, componentDescription.gamepadIndices);

    this.values = {
      state: Constants.ComponentState.DEFAULT,
      button: (this.gamepadIndices.button !== undefined) ? 0 : undefined,
      xAxis: (this.gamepadIndices.xAxis !== undefined) ? 0 : undefined,
      yAxis: (this.gamepadIndices.yAxis !== undefined) ? 0 : undefined
    };
  }

  get data() {
    const data = { id: this.id, ...this.values };
    return data;
  }

  /**
   * @description Poll for updated data based on current gamepad state
   * @param {Object} gamepad - The gamepad object from which the component data should be polled
   */
  updateFromGamepad(gamepad) {
    // Set the state to default before processing other data sources
    this.values.state = Constants.ComponentState.DEFAULT;

    // Get and normalize button
    if (this.gamepadIndices.button !== undefined
        && gamepad.buttons.length > this.gamepadIndices.button) {
      const gamepadButton = gamepad.buttons[this.gamepadIndices.button];
      this.values.button = gamepadButton.value;
      this.values.button = (this.values.button < 0) ? 0 : this.values.button;
      this.values.button = (this.values.button > 1) ? 1 : this.values.button;

      // Set the state based on the button
      if (gamepadButton.pressed || this.values.button === 1) {
        this.values.state = Constants.ComponentState.PRESSED;
      } else if (gamepadButton.touched || this.values.button > Constants.ButtonTouchThreshold) {
        this.values.state = Constants.ComponentState.TOUCHED;
      }
    }

    // Get and normalize x axis value
    if (this.gamepadIndices.xAxis !== undefined
        && gamepad.axes.length > this.gamepadIndices.xAxis) {
      this.values.xAxis = gamepad.axes[this.gamepadIndices.xAxis];
      this.values.xAxis = (this.values.xAxis < -1) ? -1 : this.values.xAxis;
      this.values.xAxis = (this.values.xAxis > 1) ? 1 : this.values.xAxis;

      // If the state is still default, check if the xAxis makes it touched
      if (this.values.state === Constants.ComponentState.DEFAULT
        && Math.abs(this.values.xAxis) > Constants.AxisTouchThreshold) {
        this.values.state = Constants.ComponentState.TOUCHED;
      }
    }

    // Get and normalize Y axis value
    if (this.gamepadIndices.yAxis !== undefined
        && gamepad.axes.length > this.gamepadIndices.yAxis) {
      this.values.yAxis = gamepad.axes[this.gamepadIndices.yAxis];
      this.values.yAxis = (this.values.yAxis < -1) ? -1 : this.values.yAxis;
      this.values.yAxis = (this.values.yAxis > 1) ? 1 : this.values.yAxis;

      // If the state is still default, check if the yAxis makes it touched
      if (this.values.state === Constants.ComponentState.DEFAULT
        && Math.abs(this.values.yAxis) > Constants.AxisTouchThreshold) {
        this.values.state = Constants.ComponentState.TOUCHED;
      }
    }

    // Update the visual response weights based on the current component data
    Object.values(this.visualResponses).forEach((visualResponse) => {
      visualResponse.updateFromComponent(this.values);
    });
  }
}

/**
  * @description Builds a motion controller with components and visual responses based on the
  * supplied profile description. Data is polled from the xrInputSource's gamepad.
  * @author Nell Waliczek / https://github.com/NellWaliczek
*/
class MotionController {
  /**
   * @param {Object} xrInputSource - The XRInputSource to build the MotionController around
   * @param {Object} profile - The best matched profile description for the supplied xrInputSource
   * @param {Object} assetUrl
   */
  constructor(xrInputSource, profile, assetUrl) {
    if (!xrInputSource) {
      throw new Error('No xrInputSource supplied');
    }

    if (!profile) {
      throw new Error('No profile supplied');
    }

    this.xrInputSource = xrInputSource;
    this.assetUrl = assetUrl;
    this.id = profile.profileId;

    // Build child components as described in the profile description
    this.layoutDescription = profile.layouts[xrInputSource.handedness];
    this.components = {};
    Object.keys(this.layoutDescription.components).forEach((componentId) => {
      const componentDescription = this.layoutDescription.components[componentId];
      this.components[componentId] = new Component(componentId, componentDescription);
    });

    // Initialize components based on current gamepad state
    this.updateFromGamepad();
  }

  get gripSpace() {
    return this.xrInputSource.gripSpace;
  }

  get targetRaySpace() {
    return this.xrInputSource.targetRaySpace;
  }

  /**
   * @description Returns a subset of component data for simplified debugging
   */
  get data() {
    const data = [];
    Object.values(this.components).forEach((component) => {
      data.push(component.data);
    });
    return data;
  }

  /**
   * @description Poll for updated data based on current gamepad state
   */
  updateFromGamepad() {
    Object.values(this.components).forEach((component) => {
      component.updateFromGamepad(this.xrInputSource.gamepad);
    });
  }
}



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js






const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

class XRControllerModel extends external_three_namespaceObject.Object3D {

	constructor() {

		super();

		this.motionController = null;
		this.envMap = null;

	}

	setEnvironmentMap( envMap ) {

		if ( this.envMap == envMap ) {

			return this;

		}

		this.envMap = envMap;
		this.traverse( ( child ) => {

			if ( child.isMesh ) {

				child.material.envMap = this.envMap;
				child.material.needsUpdate = true;

			}

		} );

		return this;

	}

	/**
	 * Polls data from the XRInputSource and updates the model's components to match
	 * the real world data
	 */
	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( ! this.motionController ) return;

		// Cause the MotionController to poll the Gamepad for data
		this.motionController.updateFromGamepad();

		// Update the 3D model to reflect the button, thumbstick, and touchpad state
		Object.values( this.motionController.components ).forEach( ( component ) => {

			// Update node data based on the visual responses' current states
			Object.values( component.visualResponses ).forEach( ( visualResponse ) => {

				const { valueNode, minNode, maxNode, value, valueNodeProperty } = visualResponse;

				// Skip if the visual response node is not found. No error is needed,
				// because it will have been reported at load time.
				if ( ! valueNode ) return;

				// Calculate the new properties based on the weight supplied
				if ( valueNodeProperty === Constants.VisualResponseProperty.VISIBILITY ) {

					valueNode.visible = value;

				} else if ( valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM ) {

					valueNode.quaternion.slerpQuaternions(
						minNode.quaternion,
						maxNode.quaternion,
						value
					);

					valueNode.position.lerpVectors(
						minNode.position,
						maxNode.position,
						value
					);

				}

			} );

		} );

	}

}

/**
 * Walks the model's tree to find the nodes needed to animate the components and
 * saves them to the motionContoller components for use in the frame loop. When
 * touchpads are found, attaches a touch dot to them.
 */
function findNodes( motionController, scene ) {

	// Loop through the components and find the nodes needed for each components' visual responses
	Object.values( motionController.components ).forEach( ( component ) => {

		const { type, touchPointNodeName, visualResponses } = component;

		if ( type === Constants.ComponentType.TOUCHPAD ) {

			component.touchPointNode = scene.getObjectByName( touchPointNodeName );
			if ( component.touchPointNode ) {

				// Attach a touch dot to the touchpad.
				const sphereGeometry = new external_three_namespaceObject.SphereGeometry( 0.001 );
				const material = new external_three_namespaceObject.MeshBasicMaterial( { color: 0x0000FF } );
				const sphere = new external_three_namespaceObject.Mesh( sphereGeometry, material );
				component.touchPointNode.add( sphere );

			} else {

				console.warn( `Could not find touch dot, ${component.touchPointNodeName}, in touchpad component ${component.id}` );

			}

		}

		// Loop through all the visual responses to be applied to this component
		Object.values( visualResponses ).forEach( ( visualResponse ) => {

			const { valueNodeName, minNodeName, maxNodeName, valueNodeProperty } = visualResponse;

			// If animating a transform, find the two nodes to be interpolated between.
			if ( valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM ) {

				visualResponse.minNode = scene.getObjectByName( minNodeName );
				visualResponse.maxNode = scene.getObjectByName( maxNodeName );

				// If the extents cannot be found, skip this animation
				if ( ! visualResponse.minNode ) {

					console.warn( `Could not find ${minNodeName} in the model` );
					return;

				}

				if ( ! visualResponse.maxNode ) {

					console.warn( `Could not find ${maxNodeName} in the model` );
					return;

				}

			}

			// If the target node cannot be found, skip this animation
			visualResponse.valueNode = scene.getObjectByName( valueNodeName );
			if ( ! visualResponse.valueNode ) {

				console.warn( `Could not find ${valueNodeName} in the model` );

			}

		} );

	} );

}

function addAssetSceneToControllerModel( controllerModel, scene ) {

	// Find the nodes needed for animation and cache them on the motionController.
	findNodes( controllerModel.motionController, scene );

	// Apply any environment map that the mesh already has set.
	if ( controllerModel.envMap ) {

		scene.traverse( ( child ) => {

			if ( child.isMesh ) {

				child.material.envMap = controllerModel.envMap;
				child.material.needsUpdate = true;

			}

		} );

	}

	// Add the glTF scene to the controllerModel.
	controllerModel.add( scene );

}

class XRControllerModelFactory {

	constructor( gltfLoader = null ) {

		this.gltfLoader = gltfLoader;
		this.path = DEFAULT_PROFILES_PATH;
		this._assetCache = {};

		// If a GLTFLoader wasn't supplied to the constructor create a new one.
		if ( ! this.gltfLoader ) {

			this.gltfLoader = new GLTFLoader();

		}

	}

	createControllerModel( controller ) {

		const controllerModel = new XRControllerModel();
		let scene = null;

		controller.addEventListener( 'connected', ( event ) => {

			const xrInputSource = event.data;

			if ( xrInputSource.targetRayMode !== 'tracked-pointer' || ! xrInputSource.gamepad ) return;

			fetchProfile( xrInputSource, this.path, DEFAULT_PROFILE ).then( ( { profile, assetPath } ) => {

				controllerModel.motionController = new MotionController(
					xrInputSource,
					profile,
					assetPath
				);

				const cachedAsset = this._assetCache[ controllerModel.motionController.assetUrl ];
				if ( cachedAsset ) {

					scene = cachedAsset.scene.clone();

					addAssetSceneToControllerModel( controllerModel, scene );

				} else {

					if ( ! this.gltfLoader ) {

						throw new Error( 'GLTFLoader not set.' );

					}

					this.gltfLoader.setPath( '' );
					this.gltfLoader.load( controllerModel.motionController.assetUrl, ( asset ) => {

						this._assetCache[ controllerModel.motionController.assetUrl ] = asset;

						scene = asset.scene.clone();

						addAssetSceneToControllerModel( controllerModel, scene );

					},
					null,
					() => {

						throw new Error( `Asset ${controllerModel.motionController.assetUrl} missing or malformed.` );

					} );

				}

			} ).catch( ( err ) => {

				console.warn( err );

			} );

		} );

		controller.addEventListener( 'disconnected', () => {

			controllerModel.motionController = null;
			controllerModel.remove( scene );
			scene = null;

		} );

		return controllerModel;

	}

}



;// CONCATENATED MODULE: ./src/controls/vr/MoveVRControls.js






/**
 * @class
 *
 * @classdesc
 * Implements controls to fly in the geometry using the VR controllers.
 * - The squeeze button is used to drag (and rotate) the scene.
 * - The select button is used to move in the direction of the controller
 * This is inspired from Three.js
 * {@link https://threejs.org/docs/#examples/en/controls/FlyControls | FlyControls}
 */
class MoveVRControls extends external_three_namespaceObject.EventDispatcher {

    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer
     * @param {Group} controller - the group representing the controller
     */
    constructor(position, controller) {
        super();
        this.position = position;
        this.controller = controller;

        this.movementSpeed = 0.5;

        this._isSelecting = false;
        this._isSqueezing = false;

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);
        const _onSqueezeStart = bind(this, this.onSqueezeStart);
        const _onSqueezeEnd = bind(this, this.onSqueezeEnd);


        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
        this.controller.addEventListener('squeezestart', _onSqueezeStart);
        this.controller.addEventListener('squeezeend', _onSqueezeEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        this._isSelecting = true;
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
        this._isSelecting = false;
    }

    /**
     * Event handler when the user starts squeezing
     */
    onSqueezeStart() {
        this._isSqueezing = true;
    }

    /**
     * Event handler when the user stops squeezing
     */
    onSqueezeEnd() {
        this._isSqueezing = false;
    }

    /**
     * Function to update the position
     * @todo Dispatch an event, when the position has sufficiently changed.
     */
    update(delta) {
        // call the new direction of the controller
        if (this._isSelecting) {
            // flow if the select button is pressed
            const deltaPosition = new Vector();
            this.controller.getWorldDirection(deltaPosition);
            deltaPosition
                .normalize()
                .multiplyScalar(-this.movementSpeed * delta)
            this.position.flow(deltaPosition);
        }
    }
}

;// CONCATENATED MODULE: ./src/controls/vr/DragVRControls.js







/**
 * @class
 *
 * @classdesc
 * Implements controls to fly in the geometry using the VR controllers.
 * - The squeeze button is used to drag (and rotate) the scene.
 * - The select button is used to move in the direction of the controller
 * This is inspired from Three.js
 * {@link https://threejs.org/docs/#examples/en/controls/FlyControls | FlyControls}
 */
class DragVRControls extends external_three_namespaceObject.EventDispatcher {

    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer
     * @param {Group} controller - the group representing the controller
     */
    constructor(position, controller) {
        super();
        this.position = position;
        this.controller = controller;

        this._isSelecting = false;
        this._isSqueezing = false;

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);
        const _onSqueezeStart = bind(this, this.onSqueezeStart);
        const _onSqueezeEnd = bind(this, this.onSqueezeEnd);


        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
        this.controller.addEventListener('squeezestart', _onSqueezeStart);
        this.controller.addEventListener('squeezeend', _onSqueezeEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        this._isSelecting = true;
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
        this._isSelecting = false;
    }

    /**
     * Event handler when the user starts squeezing
     */
    onSqueezeStart() {
        this._isSqueezing = true;
    }

    /**
     * Event handler when the user stops squeezing
     */
    onSqueezeEnd() {
        this._isSqueezing = false;
    }

    /**
     * Function to update the position
     * @todo Dispatch an event, when the position has sufficiently changed.
     *
     * @type {Function}
     */
    get update() {
        if (this._update === undefined) {
            const n = 10;
            const avgDirection0 = new Vector();
            const avgDirection1 = new Vector();
            let directions = [];
            let i = 0;
            let start = false;

            this._update = function (delta) {
                // call the new direction of the controller

                  const newDirection = new Vector();
                  this.controller.getWorldDirection(newDirection);
                  newDirection.normalize().multiplyScalar(1 / n);

                  avgDirection1.add(newDirection);
                  if (start) {
                      avgDirection1.sub(directions[i]);
                  }
                  directions[i] = newDirection;

                  if (start && this._isSelecting) {
                      const target = avgDirection1.clone().normalize();
                      const source = avgDirection0.clone().normalize();
                      const quaternion = new external_three_namespaceObject.Quaternion().setFromUnitVectors(target, source).normalize();
                      this.position.applyQuaternion(quaternion);
                  }

                  avgDirection0.copy(avgDirection1);
                  i = (i + 1) % n;
                  if(i === 0){
                      start = true;
                  }

            }
        }
        return this._update;


    }


}


;// CONCATENATED MODULE: ./src/commons/app/thurstonVR/ThurstonVR.js














/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
class ThurstonVR {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     */
    constructor(shader1, shader2, set, params = {}) {
        /**
         * The underlying subgroup
         * @type {TeleportationSet}
         */
        this.set = set;

        /**
         * A callback called at each frame
         * @type {Function}
         */
        this.callback = undefined;

        /**
         * The non-euclidean camera
         * @type {VRCamera}
         */
        this.camera = params.camera !== undefined ? params.camera : new VRCamera({set: this.set});

        const fog = new ExpFog(new external_three_namespaceObject.Color(0, 0, 0), 0.07);
        /**
         * The non-euclidean scene
         * @type {Scene}
         */
        this.scene = new Scene({fog: fog});

        /**
         * The non-euclidean renderer
         * @type {VRRenderer}
         */
        this.renderer = new VRRenderer(shader1, shader2, this.set, this.camera, this.scene);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new external_three_namespaceObject.Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);


        // event listener
        const _onWindowResize = bind(this, this.onWindowResize);
        window.addEventListener("resize", _onWindowResize, false);


        /**
         * The keyboard controls
         * @type {FlyControls}
         * @protected
         */
        this.flyControls = new FlyControls(
            this.camera,
            params.keyboard !== undefined ? params.keyboard : 'us'
        );

        /**
         * A clock to measure the time between two call of animate
         * @type {Clock}
         * @protected
         */
        this.clock = new external_three_namespaceObject.Clock();

        /**
         * The performance stats.
         * Setup when the renderer is built.
         * @type {Stats}
         */
        this.stats = undefined;

        /**
         * The graphical user interface.
         * Setup when the renderer is built.
         * @type {GUI}
         */
        this.gui = undefined;


        const controllerModelFactory = new XRControllerModelFactory();

        const controllerGrip0 = this.renderer.xr.getControllerGrip(0);
        const model0 = controllerModelFactory.createControllerModel(controllerGrip0);
        controllerGrip0.add(model0);
        this.renderer.threeScene.add(controllerGrip0);

        const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
        const model1 = controllerModelFactory.createControllerModel(controllerGrip1);
        controllerGrip1.add(model1);
        this.renderer.threeScene.add(controllerGrip1);

        const controller0 = this.renderer.xr.getController(0);
        this.renderer.threeScene.add(controller0);
        const controller1 = this.renderer.xr.getController(1);
        this.renderer.threeScene.add(controller1);

        /**
         * Moving in the scene with the VR controller
         * @protected
         * @type {MoveVRControls}
         */
        this.VRControlsMove = new MoveVRControls(this.camera.position, controller0);
        /**
         * Rotating the scene with the VR controller
         * @protected
         * @type {DragVRControls}
         */
        this.VRControlsDrag = new DragVRControls(this.camera.position, controller1);
    }


    /**
     * Initialize the graphic user interface
     * @return {Thurston} the current Thurston object
     */
    initGUI() {
        this.gui = new GUI$1();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://github.com/henryseg/non-euclidean_VR');
            }
        }, 'help').name("Help/About");
        this.gui.add(
            this.flyControls,
            'keyboard', {QWERTY: 'us', AZERTY: 'fr'}
        ).name("Keyboard");

        // controls for the camera
        const cameraGUI = this.gui.addFolder('Camera');
        cameraGUI.add(this.camera, 'fov', 45, 120)
            .name('Field of view');
        cameraGUI.add(this.camera, 'maxDist', 0, 100, 1)
            .name('Max distance');
        cameraGUI.add(this.camera, 'maxSteps', 20, 500, 1)
            .name('Max steps');
        cameraGUI.add(this.camera, 'threshold')
            .name('Threshold');

        return this;
    }

    /**
     * Initialize the performance stats
     * @return {Thurston} the current Thurston object
     */
    initStats() {
        this.stats = new stats_module();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
        return this;
    }

    /**
     * Shortcut to add objects to the scene.
     * @param {...(Solid|Light)} obj - the objects to add
     */
    add(obj) {
        this.scene.add(/**@type {(Solid|Light)} */...arguments);
    }

    /**
     * Action when the window is resized.
     * @param {UIEvent} event
     */
    onWindowResize(event) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix();
    }


    /**
     * animation function
     */
    animate() {
        const delta = this.clock.getDelta();
        if (this.callback !== undefined) {
            this.callback();
        }
        this.flyControls.update(delta);
        this.VRControlsMove.update(delta);
        this.VRControlsDrag.update(delta);

        this.renderer.render();
        this.stats.update();
    }


    /**
     * Build the renderer and run the animation.
     */
    run() {
        this.initStats();
        this.initGUI();
        this.renderer.build();
        const _animate = bind(this, this.animate);
        this.renderer.setAnimationLoop(_animate);
    }
}
;// CONCATENATED MODULE: ./src/commons/app/specifyThurston.js
/**
 * Take a generic Thurston class and return the class specific for a geometry
 * @param {Thurston|ThurstonLite|ThurstonVR} thurstonClass - the generic Thurston class
 * @param {string} shader1 - the first part of geometry dependent shader
 * @param {string} shader2 - the second part of geometry dependent shader
 * @return {GeomThurston} - the Thurston class build for the suitable geometry
 */
function specifyThurston(thurstonClass, shader1, shader2) {
    class GeomThurston extends thurstonClass {
        constructor() {
            super(shader1, shader2, ...arguments);
        }
    }

    return GeomThurston;
}
;// CONCATENATED MODULE: ./src/core/groups/Group.js


/**
 * @class
 *
 * @classdesc
 * Group (in the mathematical sense).
 * This class is mainly a contained to receive the data common to all elements of the group.
 */
class Group_Group {
    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Create an element in the group.
     * If no data is passed it should be the identity.
     * @abstract
     * @return {GroupElement}
     */
    element() {
        throw new Error('Group: this method should be implemented');
    }

    /**
     * Build the shader associated to the group.
     * @abstract
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        throw new Error('Group: this method should be implemented');
    }
}
;// CONCATENATED MODULE: ./src/commons/groups/trivial/GroupElement.js



/**
 * @class
 *
 * @classdesc
 * Element of the trivial group... just nothing to do!
 */
class GroupElement extends GroupElement_GroupElement {

    constructor(group) {
        super(group)
        // Define a fake property to pass to the GLSL side.
        // Indeed a GLSL structure cannot be empty
        this.fake = true;
    }

    identity() {
        return this;
    }

    multiply(elt) {
        return this;
    }

    premultiply(elt) {
        return this;
    }

    invert() {
        return this;
    }

    toIsometry() {
        return new Isometry();
    }

    equals(elt) {
        return true;
    }

    clone() {
        return new GroupElement();
    }

    copy(elt) {
        return this;
    }
}
// EXTERNAL MODULE: ./src/commons/groups/trivial/shaders/element.glsl
var shaders_element = __webpack_require__(9188);
var element_default = /*#__PURE__*/__webpack_require__.n(shaders_element);
;// CONCATENATED MODULE: ./src/commons/groups/trivial/Group.js





class Group extends Group_Group {

    constructor() {
        super();
    }

    element() {
        return new GroupElement(this);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk((element_default()));
    }
}
// EXTERNAL MODULE: ./src/core/groups/shaders/creeping.glsl.mustache
var creeping_glsl_mustache = __webpack_require__(8008);
var creeping_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(creeping_glsl_mustache);
;// CONCATENATED MODULE: ./src/core/groups/Teleportation.js





const regexpTest = /bool\s*(\w+)\(Point.*\)/m;
const regexpCreep = /ExtVector\s*(\w+)\(ExtVector.*\)/m;

/**
 * @class
 *
 * @classdesc
 * A teleportation is a tool to bring back a point in a prescribed fundamental domain of a discrete group.
 * It consists of a test to decide if teleportation is needed and the group element to apply to teleport the point
 */
class Teleportation {

    /**
     * Constructor
     * Use instead the `add` method of the class `TeleportationSet`
     * @param {TeleportationSet} set - The set the teleportation belongs to
     * @param {Function} jsTest - A JS test saying if a teleportation is needed.
     * The test is a function with the signature Point -> boolean.
     * @param {string} glslTest - a chunk of GLSL performing the same test.
     * The test should be encapsulated in a function with signature Point -> bool
     * @param {GroupElement} elt - the isometry to apply when teleporting
     * @param {GroupElement} inv - the inverse of the isometry (optional)
     * If the inverse is not passed as an argument, it is computed automatically.
     * @param {string} glslCreep -  a chunk of GLSL to move to the boundary defined by the test
     */
    constructor(set, jsTest, glslTest, elt, inv = undefined, glslCreep = undefined) {
        /**
         * The set the teleportation belongs to.
         * @type {TeleportationSet}
         */
        this.set = set;
        let aux;
        /**
         * Universal unique ID.
         * The dashes are replaced by underscored to avoid problems in the shaders
         * @type {string}
         * @readonly
         */
        this.uuid = external_three_namespaceObject.MathUtils.generateUUID().replaceAll('-', '_');
        /**
         * A JS test saying if a teleportation is needed
         * The test is a function with the signature Point -> boolean
         * The test returns true if a teleportation is needed and false otherwise.
         * @type {Function}
         */
        this.jsTest = jsTest;

        /**
         * A GLSL test saying if a teleportation is needed
         * The test returns true if a teleportation is needed and false otherwise.
         * @type {string}
         */
        this.glslTest = glslTest;

        /**
         * Name of the GLSL function performing the test.
         * Computed with a regular expression
         * @type {string}
         */
        this.glslTestName = undefined;
        aux = glslTest.match(regexpTest);
        if (!aux) {
            throw new Error('Teleportation: unable to find the name of the GLSL test');
        } else {
            this.glslTestName = aux[1];
        }

        /**
         * The element to apply when teleporting
         * @type {GroupElement}
         */
        this.elt = elt;

        /**
         * The inverse of the  teleporting element
         * @type {GroupElement}
         */
        this.inv = inv !== undefined ? inv : elt.clone().invert();
        /**
         * Say if the creeping uses a custom function of the default one
         * The two functions do not have the same signature.
         * @type {boolean}
         */
        this.glslCreepCustom = undefined;
        /**
         * Chunk of GLSL to move to the boundary defined by the test
         * @type {string}
         */
        this.glslCreep = undefined;
        /**
         * Name of the GLSL function performing the test.
         * Computed with a regular expression
         * @type {string}
         */
        this.glslCreepName = undefined;

        if (glslCreep !== undefined) {
            this.glslCreepCustom = true;
            this.glslCreep = glslCreep;
            aux = glslCreep.match(regexpCreep);
            if (!aux) {
                throw new Error('Teleportation: unable to find the name of the GLSL creep');
            } else {
                this.glslCreepName = aux[1];
            }
        } else {
            this.glslCreepCustom = false;
            this.glslCreepName = `creep${this.uuid}`;
            this.glslCreep = creeping_glsl_mustache_default()(this);
        }

    }

    /**
     * The name of the item.
     * This name is computed (from the uuid) the first time the getter is called.
     * @type {string}
     */
    get name() {
        if (this._name === undefined) {
            this._name = `teleportation_${this.uuid}`;
        }
        return this._name;
    }

    /**
     * Return true if the following conditions are satisfies
     * - the teleportation set uses creeping (strict or full)
     * - the a custom creeping function exists
     * @type {boolean}
     */
    get usesCreepingCustom() {
        return this.set.usesCreeping && this.glslCreepCustom;
    }

    /**
     * Return true if the following conditions are satisfies
     * - the teleportation set uses full creeping
     * - no custom creeping function exists
     * @type {boolean}
     */
    get usesCreepingBinary() {
        return this.set.creepingType === CREEPING_FULL && !this.glslCreepCustom;
    }

    /**
     * Build the GLSL code performing the associated test.
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk(this.glslTest);
        if (this.set.usesCreeping) {
            shaderBuilder.addChunk(this.glslCreep);
        }
        //shaderBuilder.addChunk("//pre elt");
        shaderBuilder.addUniform(this.elt.name, 'GroupElement', this.elt);
        //shaderBuilder.addChunk("//interlude");
        shaderBuilder.addUniform(this.elt.name, 'GroupElement', this.inv);
        //shaderBuilder.addChunk("//post inv");
    }
}
// EXTERNAL MODULE: ./src/core/groups/shaders/relative.glsl
var relative = __webpack_require__(2792);
var relative_default = /*#__PURE__*/__webpack_require__.n(relative);
// EXTERNAL MODULE: ./src/core/groups/shaders/teleport.glsl.mustache
var teleport_glsl_mustache = __webpack_require__(968);
var teleport_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(teleport_glsl_mustache);
;// CONCATENATED MODULE: ./src/core/groups/TeleportationSet.js







/**
 * Possible value for usesCreeping
 * No creeping is used
 * @type {number}
 */
const CREEPING_OFF = 0;
/**
 * Possible value for usesCreeping
 * Only the creeping defined by the user are used
 * @type {number}
 */
const CREEPING_STRICT = 1;
/**
 * Possible value for usesCreeping
 * Uses creeping for all possible teleportations,
 * if the user did not define the creeping function, the computation is done with a binary search
 * @type {number}
 */
const CREEPING_FULL = 2;


/**
 * @class
 *
 * @classdesc
 * Set of teleportations.
 * It implicitly a set of generators of a discrete subgroup and a fundamental domain for this subgroup
 */
class TeleportationSet {

    /**
     * Constructor
     * @param {Array.<{elt:GroupElement, inv:GroupElement}>} neighbors - the list of neighbors when using nearest neighbors.
     * The elements come by pair : an element and its inverse.
     * defining the structure of the group element and the related functions
     * @param {boolean} usesNearestNeighbors
     * @param {number} creepingType - type of creeping used for quotient manifold (see description in the constants)
     */
    constructor(
        neighbors = [],
        usesNearestNeighbors = false,
        creepingType = CREEPING_OFF
    ) {
        /**
         * The list of teleports "generating" the subgroups.
         * The order matters (see the class description).
         * @type {Teleportation[]}
         */
        this.teleportations = [];
        /**
         * The list of neighbors when using nearest neighbors.
         * @type{{elt:GroupElement, inv:GroupElement}[]}
         */
        this.neighbors = neighbors;
        /**
         * Flag : uses nearest neighbor or not (for local SDF)
         * Default is false.
         * @type{boolean}
         */
        this.usesNearestNeighbors = usesNearestNeighbors;
        /**
         * Flag : type of creeping used
         * Default is CREEPING_OFF.
         * @type{number}
         */
        this.creepingType = creepingType;
    }

    /**
     * Return true if the set uses some kind of creeping
     * @return {boolean}
     */
    get usesCreeping() {
        return this.creepingType === CREEPING_STRICT || this.creepingType === CREEPING_FULL;
    }

    /**
     * Add a teleportation to the list of teleportations
     * @param {Function} jsTest - A JS test saying if a teleportation is needed.
     * The test is a function with the signature Point -> boolean.
     * @param {string} glslTest - a chunk of GLSL performing the same test.
     * The test should be encapsulated in a function with signature Point -> bool
     * @param {GroupElement} elt - the isometry to apply when teleporting
     * @param {GroupElement} inv - the inverse of the isometry (optional)
     * If the inverse is not passed as an argument, it is computed automatically.
     * @param {string} glslCreep -  a chunk of GLSL to move to the boundary defined by the test
     * @return {TeleportationSet} - the teleportation set
     */
    add(jsTest, glslTest, elt, inv = undefined, glslCreep = undefined) {
        const length = this.teleportations.push(new Teleportation(this, jsTest, glslTest, elt, inv, glslCreep));
        return this;
    }

    /**
     * Shortcut to the underlying group.
     * If the list of teleportations is empty, use the trivial group.
     * @type {Group}
     */
    get group() {
        if (this.teleportations.length !== 0) {
            return this.teleportations[0].elt.group;
        } else {
            return new Group();
        }
    }

    /**
     * Goes through all the teleportations in the discrete subgroup
     * and build the GLSL code performing the associated test.
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        this.group.shader(shaderBuilder);
        shaderBuilder.addChunk((relative_default()));
        for (const teleportation of this.teleportations) {
            teleportation.shader(shaderBuilder);
        }
        for (const pair of this.neighbors) {
            shaderBuilder.addUniform(pair.elt.name, 'GroupElement', pair.elt);
            shaderBuilder.addUniform(pair.inv.name, 'GroupElement', pair.inv);
        }
        shaderBuilder.addChunk(teleport_glsl_mustache_default()(this));
    }

}
;// CONCATENATED MODULE: ./src/core/lights/Light.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * Abstract class for lights
 */
class Light extends Generic {

    /**
     * Constructor.
     * @param {number} maxDirs - the maximum number of directions computed for this light.
      */
    constructor(maxDirs) {
        super();
        /**
         * Maximum number of directions computed for this light.
         * @type {number}
         */
        this.maxDirs = maxDirs
    }

    /**
     * Says that the object inherits from `Light`
     * @type {boolean}
     */
    get isLight() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        throw new Error('Generic: this method should be implemented');
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    /**
     * Return the chunk of GLSL code corresponding to the direction field.
     * The GLSL direction function should have the following signature
     * `bool {{name}}_directions(RelVector v, int i, out RelVector dir, out float intensity)`
     * where
     * - `v` gives the position at which we compute the direction
     * - `i` means that we are computed the i-th direction (the index start at i = 0)
     * The function returns true if the i-th direction exists and false otherwise.
     * If the i-th direction exists, then it populates dir with the direction
     * and intensity with the light intensity (in this direction).
     * @abstract
     * @return {string}
     */
    glslDirections() {
        throw new Error('Light: this method should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. direction field).
     * @return {string}
     */
    glslInstance() {
        return this.glslDirections();
    }
}
;// CONCATENATED MODULE: ./src/commons/groups/trivial/set.js


/* harmony default export */ const set = (new TeleportationSet());
// EXTERNAL MODULE: ./src/commons/materials/normal/shaders/struct.glsl
var normal_shaders_struct = __webpack_require__(3496);
var normal_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(normal_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/normal/shaders/render.glsl.mustache
var normal_shaders_render_glsl_mustache = __webpack_require__(6077);
var normal_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(normal_shaders_render_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/normal/NormalMaterial.js





/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that maps the normal vectors to RGB colors.
 */
class NormalMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     */
    constructor() {
        super();
    }

    get uniformType() {
        return '';
    }

    static glslClass() {
        return (normal_shaders_struct_default());
    }

    glslRender() {
        return normal_shaders_render_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/phong/shaders/struct.glsl
var phong_shaders_struct = __webpack_require__(6045);
var phong_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(phong_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/phong/shaders/render.glsl.mustache
var phong_shaders_render_glsl_mustache = __webpack_require__(8149);
var phong_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(phong_shaders_render_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/phong/PhongMaterial.js








/**
 * @class
 *
 * @classdesc
 * Material for objects in the scene
 *
 * @see Further information on the {@link https://en.wikipedia.org/wiki/Phong_reflection_model|Phong lighting model}
 */
class PhongMaterial extends Material {
    /**
     * Constructor. Build a new material from the given data
     * @param {Object} params - the parameters of the material:
     * - {Color} color - the color of the material
     * - {number} ambient - the ambient reflection constant
     * - {number} diffuse - the diffuse reflection constant
     * - {number} specular - the specular reflection constant
     * - {number} shininess - the shininess reflection constant
     * - {Light[]} lights - light affecting the material
     */
    constructor(params = {}) {
        super();
        /**
         * Color of the material
         * @type {Color}
         */
        this.color = params.color !== undefined ? params.color : new external_three_namespaceObject.Color(1, 1, 1);
        /**
         * ambient reflection constant
         * @type {number}
         */
        this.ambient = params.ambient !== undefined ? params.ambient : 0.5;
        /**
         * diffuse reflection constant
         * @type {number}
         */
        this.diffuse = params.diffuse !== undefined ? params.diffuse : 0.4;
        /**
         * specular reflection constant
         * @type {number}
         */
        this.specular = params.specular !== undefined ? params.specular : 0.1;

        // make sure that the three coefficient add up to one.
        const sum = this.ambient + this.diffuse + this.specular;
        this.ambient = this.ambient / sum;
        this.diffuse = this.diffuse / sum;
        this.specular = this.specular / sum;
        /**
         * shininess reflection constant
         * @type {number}
         */
        this.shininess = params.shininess !== undefined ? params.shininess : 10;
        /**
         * Reflectivity of the material
         * @type {Color}
         */
        this.reflectivity = params.reflectivity !== undefined ? params.reflectivity : new external_three_namespaceObject.Color(0, 0, 0);
        /**
         * lights affecting the material
         * @type {Light[]}
         */
        this.lights = params.lights;
    }

    get uniformType() {
        return 'PhongMaterial';
    }

    get usesLight() {
        return true;
    }

    get isReflecting() {
        return true;
    }

    static glslClass() {
        return (phong_shaders_struct_default());
    }

    glslRender() {
        return phong_shaders_render_glsl_mustache_default()(this);
    }

    shader(shaderBuilder) {
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        super.shader(shaderBuilder);
    }
}
// EXTERNAL MODULE: ./src/commons/materials/checkerboard/shaders/struct.glsl
var checkerboard_shaders_struct = __webpack_require__(2197);
var checkerboard_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(checkerboard_shaders_struct);
// EXTERNAL MODULE: ./src/core/materials/shaders/renderUV.glsl.mustache
var renderUV_glsl_mustache = __webpack_require__(1215);
var renderUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(renderUV_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/checkerboard/CheckerboardMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
class CheckerboardMaterial extends Material {

    /**
     * Constructor
     * @param {Vector2} dir1 - first direction of the checkerboard
     * @param {Vector2} dir2 - second direction of the checkerboard
     * @param {Color} color1 - first color
     * @param {Color} color2 - second color
     */
    constructor(dir1, dir2, color1, color2) {
        super();
        /**
         * first direction of the checkerboard
         * @type {Vector2}
         */
        this.dir1 = dir1;
        /**
         * second direction of the checkerboard
         * @type {Vector2}
         */
        this.dir2 = dir2;
        /**
         * first color
         * @type {Color}
         */
        this.color1 = color1;
        /**
         * second color
         * @type {Color}
         */
        this.color2 = color2;
    }

    get uniformType() {
        return 'CheckerboardMaterial';
    }

    get usesNormal(){
        return false;
    }

    get usesUVMap(){
        return true;
    }

    static glslClass() {
        return (checkerboard_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/debug/shaders/struct.glsl
var debug_shaders_struct = __webpack_require__(7793);
var debug_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(debug_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/debug/shaders/render.glsl.mustache
var debug_shaders_render_glsl_mustache = __webpack_require__(9909);
var debug_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(debug_shaders_render_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/debug/DebugMaterial.js






/**
 * @class
 *
 * @classdesc
 * Debug material
 */
class DebugMaterial extends Material {
    /**
     * Constructor. Build a new material from the given data
     */
    constructor() {
        super();
    }

    get uniformType() {
        return '';
    }

    /**
     * Says whether the material requires the normal to the shape for its computation.
     * Default is true.
     * @return {boolean}
     */
    get usesNormal() {
        return false;
    }

    /**
     * Says whether the material requires a UV map on the shape for its computation.
     * Default is false.
     * @return {boolean}
     */
    get usesUVMap() {
        return false;
    }

    get usesLight() {
        return false;
    }

    get isReflecting() {
        return false;
    }

    static glslClass() {
        return (debug_shaders_struct_default());
    }

    glslRender() {
        return debug_shaders_render_glsl_mustache_default()(this);
    }

    shader(shaderBuilder) {
        super.shader(shaderBuilder);
    }
}
// EXTERNAL MODULE: ./src/commons/materials/simpleTexture/shaders/struct.glsl
var simpleTexture_shaders_struct = __webpack_require__(9095);
var simpleTexture_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(simpleTexture_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/simpleTexture/SimpleTextureMaterial.js








/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by a image file
 *
 */
class SimpleTextureMaterial extends Material {

    /**
     * Constructor
     * @param {string} file - path to the image file
     * @param {Object} params - options for the material
     */
    constructor(file, params = {}) {
        super();
        /**
         * Texture built from the given image
         * @type {Texture}
         */
        this.sampler = new external_three_namespaceObject.TextureLoader().load(file);
        this.sampler.wrapS = params.wrapS !== undefined ? params.wrapS : external_three_namespaceObject.RepeatWrapping;
        this.sampler.wrapT = params.wrapT !== undefined ? params.wrapT : external_three_namespaceObject.RepeatWrapping;
        this.sampler.magFilter = external_three_namespaceObject.LinearFilter;
        this.sampler.minFilter = external_three_namespaceObject.LinearFilter;

        /**
         * Point in the UV coordinates that will be map to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new external_three_namespaceObject.Vector2(0, 0);

        /**
         * Scaling factor applied the the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new external_three_namespaceObject.Vector2(1, 1);
    }

    get uniformType() {
        return 'SimpleTextureMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (simpleTexture_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/astronomy/earth/img/earthmap2k.png
var earthmap2k = __webpack_require__(466);
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/earth/EarthTexture.js






/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the earth
 *
 */
class EarthTexture extends SimpleTextureMaterial {

    constructor() {
        super(earthmap2k, {
            start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
            scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}
// EXTERNAL MODULE: ./src/commons/materials/astronomy/moon/img/lroc_color_poles_2k.png
var lroc_color_poles_2k = __webpack_require__(2971);
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/moon/MoonTexture.js






/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the moon
 * Image from https://svs.gsfc.nasa.gov/4720
 * Credits : NASA's Scientific Visualization Studio
 */
class MoonTexture extends SimpleTextureMaterial {

    constructor() {
        super(lroc_color_poles_2k, {
            start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
            scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}
// EXTERNAL MODULE: ./src/commons/materials/astronomy/sun/img/2k_sun.jpg
var _2k_sun = __webpack_require__(5753);
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/sun/SunTexture.js






/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of the sun
 * Image from https://www.solarsystemscope.com/textures/
 */
class SunTexture extends SimpleTextureMaterial {

    constructor() {
        super(_2k_sun, {
            start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
            scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}
// EXTERNAL MODULE: ./src/commons/materials/astronomy/mars/img/2k_mars.jpg
var _2k_mars = __webpack_require__(8367);
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/mars/MarsTexture.js






/**
 * @class
 * @extends SimpleTextureMaterial
 *
 * @classdesc
 * Texture of Mars
 * Image from https://www.solarsystemscope.com/textures/
 *
 */
class MarsTexture extends SimpleTextureMaterial {

    constructor() {
        super(_2k_mars, {
            start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
            scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), 1 / Math.PI),
        });
    }
}
// EXTERNAL MODULE: ./src/commons/materials/phongWrap/shaders/struct.glsl
var phongWrap_shaders_struct = __webpack_require__(5836);
var phongWrap_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(phongWrap_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/phongWrap/shaders/render.glsl.mustache
var phongWrap_shaders_render_glsl_mustache = __webpack_require__(3838);
var phongWrap_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(phongWrap_shaders_render_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/phongWrap/shaders/renderNormal.glsl.mustache
var renderNormal_glsl_mustache = __webpack_require__(472);
var renderNormal_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(renderNormal_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/phongWrap/shaders/renderUV.glsl.mustache
var shaders_renderUV_glsl_mustache = __webpack_require__(8204);
var shaders_renderUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_renderUV_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/phongWrap/shaders/renderNormalUV.glsl.mustache
var renderNormalUV_glsl_mustache = __webpack_require__(7660);
var renderNormalUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(renderNormalUV_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/phongWrap/PhongWrapMaterial.js











/**
 * @class
 *
 * @classdesc
 * Add a "Phong layer" to a given material.
 * The material passed in the constructor is used as the ambient color of the Phong shading model
 */
class PhongWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} material - the material defining the base color
     * @param {Object} params - the parameters of the Phong layer:
     * - {number} ambient - the ambient reflection constant
     * - {number} diffuse - the diffuse reflection constant
     * - {number} specular - the specular reflection constant
     * - {number} shininess - the shininess reflection constant
     * - {Light[]} lights - light affecting the material
     */
    constructor(material, params = {}) {
        super();
        /**
         * material defining the base color
         * @type {Material}
         */
        this.material = material;
        /**
         * ambient reflection constant
         * @type {number}
         */
        this.ambient = params.ambient !== undefined ? params.ambient : 0.5;
        /**
         * diffuse reflection constant
         * @type {number}
         */
        this.diffuse = params.diffuse !== undefined ? params.diffuse : 0.5;
        /**
         * specular reflection constant
         * @type {number}
         */
        this.specular = params.specular !== undefined ? params.specular : 0.5;
        /**
         * shininess reflection constant
         * @type {number}
         */
        this.shininess = params.shininess !== undefined ? params.shininess : 10;
        /**
         * Reflectivity of the material
         * @type {Color}
         */
        this.reflectivity = params.reflectivity !== undefined ? params.reflectivity : new external_three_namespaceObject.Vector3(0, 0, 0);
        /**
         * lights affecting the material
         * @type {Light[]}
         */
        this.lights = params.lights;
    }

    get uniformType() {
        return 'PhongWrapMaterial';
    }

    static glslClass() {
        return (phongWrap_shaders_struct_default());
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return this.material.usesUVMap;
    }

    get usesLight() {
        return true;
    }

    get isReflecting() {
        return true;
    }

    glslRender() {
        if (this.material.usesNormal) {
            if (this.material.usesUVMap) {
                return renderNormalUV_glsl_mustache_default()(this);
            } else {
                return renderNormal_glsl_mustache_default()(this);
            }
        } else {
            if (this.material.usesUVMap) {
                return shaders_renderUV_glsl_mustache_default()(this);
            } else {
                return phongWrap_shaders_render_glsl_mustache_default()(this);
            }
        }
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.material.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.material.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.material.shader(shaderBuilder);
        for (const light of this.lights) {
            light.shader(shaderBuilder);
        }
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} material - the material defining the ambient color of the Phong model
 * @param {Object} params - the parameters of the Phong model
 * @return {PhongWrapMaterial} - the wrapped material.
 */
function phongWrap(material, params = {}) {
    return new PhongWrapMaterial(material, params);
}
// EXTERNAL MODULE: ./src/commons/materials/pathTracerWrap/shaders/struct.glsl
var pathTracerWrap_shaders_struct = __webpack_require__(7198);
var pathTracerWrap_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(pathTracerWrap_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/pathTracerWrap/shaders/rayType.glsl.mustache
var rayType_glsl_mustache = __webpack_require__(1202);
var rayType_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(rayType_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/pathTracerWrap/shaders/render.glsl.mustache
var pathTracerWrap_shaders_render_glsl_mustache = __webpack_require__(2330);
var pathTracerWrap_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(pathTracerWrap_shaders_render_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/pathTracerWrap/shaders/renderNormalUV.glsl.mustache
var shaders_renderNormalUV_glsl_mustache = __webpack_require__(588);
var shaders_renderNormalUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_renderNormalUV_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/pathTracerWrap/shaders/renderNormal.glsl.mustache
var shaders_renderNormal_glsl_mustache = __webpack_require__(9040);
var shaders_renderNormal_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_renderNormal_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/pathTracerWrap/shaders/renderUV.glsl.mustache
var pathTracerWrap_shaders_renderUV_glsl_mustache = __webpack_require__(1365);
var pathTracerWrap_shaders_renderUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(pathTracerWrap_shaders_renderUV_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/pathTracerWrap/PathTracerWrapMaterial.js













class PathTracerWrapMaterial extends PTMaterial {

    /**
     * Constructor
     * @param {Material} material - the material giving the diffuse color.
     * @param {Object} params - all the parameters of the material.
     */
    constructor(material, params) {
        super();
        /**
         * Base material
         * This material should not uses light or be reflecting.
         * Otherwise it will conflict with the path tracer
         * @param {Material} material - the material giving the diffuse color
         */
        this.material = material;
        /**
         * Surface Emission Color
         * @type {Color}
         */
        this.emission = params.emission !== undefined ? params.emission : new external_three_namespaceObject.Color(0, 0, 0);
        /**
         * Volumetric Emission Color
         * @type {Color}
         */
        this.volumeEmission = params.volumeEmission !== undefined ? params.volumeEmission : new external_three_namespaceObject.Color(0, 0, 0);
        /**
         * Optical Depth (Probability of scattering inside a material)
         * @type {number}
         */
        this.opticalDepth = params.opticalDepth !== undefined ? params.opticalDepth : 0;
        /**
         * Specular color
         * @type {Color}
         */
        this.specular = params.specular !== undefined ? params.specular : new external_three_namespaceObject.Color(1, 1, 1);
        /**
         * Absorb color (if the material is transparent)
         * @type {Color}
         */
        this.absorb = params.absorb !== undefined ? params.absorb : new external_three_namespaceObject.Color(0.1, 0.1, 0.1);
        /**
         * Index of refraction
         * @type {number}
         */
        this.ior = params.ior !== undefined ? params.ior : 1;
        /**
         * Roughness of the material
         * @type {number}
         */
        this.roughness = params.roughness !== undefined ? params.roughness : 0.2;
        /**
         * Reflection chance
         * Chance of reflection.
         * Between 0 and 1
         * @type {number}
         */
        this.reflectionChance = params.reflectionChance !== undefined ? params.reflectionChance : 0.1;
        /**
         * Refraction chance
         * Chance of refraction.
         * Between 0 and 1
         * @type {number}
         */
        this.refractionChance = params.refractionChance !== undefined ? params.refractionChance : 0;
        /**
         * Diffuse chance
         * Chance of diffuse.
         * Between 0 and 1
         * @type {number}
         */
        this.diffuseChance = params.diffuseChance !== undefined ? params.diffuseChance : 0.9;
        // the three chances should add up to one
        const total = this.reflectionChance + this.refractionChance + this.diffuseChance;
        this.reflectionChance = this.reflectionChance / total;
        this.refractionChance = this.refractionChance / total;
        this.diffuseChance = this.diffuseChance / total;

        // computation for Fresnel reflection amount
        this.addImport((fresnelReflectAmount_default()));
    }

    get uniformType() {
        return 'PathTracerWrapMaterial';
    }

    static glslClass() {
        return (pathTracerWrap_shaders_struct_default());
    }

    get usesUVMap() {
        return this.material.usesUVMap;
    }

    glslRender() {
        let res = "";
        res = res + rayType_glsl_mustache_default()(this);

        if (this.material.usesNormal) {
            if (this.material.usesUVMap) {
                res = res + shaders_renderNormalUV_glsl_mustache_default()(this);
            } else {
                res = res + shaders_renderNormal_glsl_mustache_default()(this);
            }
        } else {
            if (this.material.usesUVMap) {
                res = res + pathTracerWrap_shaders_renderUV_glsl_mustache_default()(this);
            } else {
                res = res + pathTracerWrap_shaders_render_glsl_mustache_default()(this);
            }
        }
        return res;
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.material.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.material.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.material.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}


/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} material - the material defining the ambient color of the Phong model
 * @param {Object} params - the parameters of the Phong model
 * @return {PathTracerWrapMaterial} - the wrapped material.
 */
function pathTracerWrap(material, params = {}) {
    return new PathTracerWrapMaterial(material, params);
}
;// CONCATENATED MODULE: ./src/commons/materials/all.js
// Basic materials










// Composite basic materials


// Path tracer material


// Composite tracer material

// EXTERNAL MODULE: ./src/core/shapes/shaders/numericalGradient.glsl.mustache
var numericalGradient_glsl_mustache = __webpack_require__(8266);
var numericalGradient_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(numericalGradient_glsl_mustache);
;// CONCATENATED MODULE: ./src/core/shapes/Shape.js






/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of a 3D geometric shape.
 * It should not be confused with Three.js `Shape` class.
 * It is more an analogue of the class `BufferGeometry` in Three.js.
 */
class Shape extends Generic {

    /**
     * Constructor.
     * @param {Isometry} isom - the position of the shape
     */
    constructor(isom = undefined) {
        super();
        /**
         * Isometry defining the position of the shape (relative to any potential parent)
         * @type {Isometry}
         */
        this.isom = isom !== undefined ? isom : new Isometry();
        /**
         * Inverse of the isometry
         * @type {Isometry}
         */
        this.isomInv = this.isom.clone().invert();
        /**
         * Parent of the shape (if this shape is part of an advanced shape)
         * @type {Shape}
         */
        this.parent = undefined;
        /**
         * Isometry defining the absolute position of the shape (taking into account the position of the parent)
         * The actual value is computed the first time `absoluteIsom` is called.
         * If the object is moving, the updates should be made by the developer.
         * @type {Isometry}
         */
        this._absoluteIsom = undefined;
        /**
         * Inverse of the absolute isometry
         * @type {Isometry}
         */
        this._absoluteIsomInv = undefined;
    }

    /**
     * Recompute the absolute isometry from the current data
     * The update is "descending", updating a shape will updates the children but not the parents.
     * @todo include an ascending / bidirectional mode ?
     * The descending update should be done individually in each advanced shape.
     * @todo factorize the code at the level of AdvancedShape ? How to not have two copies of the children
     * (one at the level of AdvancedShape, one at the level of UnionShape, for instance)?
     */
    updateAbsoluteIsom() {
        if (this._absoluteIsom === undefined) {
            this._absoluteIsom = new Isometry();
            this._absoluteIsomInv = new Isometry();
        }

        this.isomInv = this.isom.clone().invert();
        this._absoluteIsom.copy(this.isom);
        this._absoluteIsomInv.copy(this.isomInv);
        if (this.parent !== undefined) {
            this._absoluteIsom.premultiply(this.parent.absoluteIsom);
            this._absoluteIsomInv.multiply(this.parent.absoluteIsomInv)

        }
    }

    /**
     * The shape may contains data which depends on the isometry (like the center of a ball)
     * This method can be overlaoded to update all these data when needed
     */
    updateData() {
        this.updateAbsoluteIsom();
    }

    /**
     * If the shape is part of an advanced shape, the underlying isometry is a position relative to the parent shape.
     * absoluteIsom, on the contrary return the isometry encoding the absolute position
     * @type {Isometry}
     */
    get absoluteIsom() {
        if (this._absoluteIsom === undefined) {
            this.updateAbsoluteIsom();
        }
        return this._absoluteIsom;
    }

    /**
     * Return the inverse of absoluteIsom
     * @type {Isometry}
     */
    get absoluteIsomInv() {
        if (this._absoluteIsomInv === undefined) {
            this.updateAbsoluteIsom();

        }
        return this._absoluteIsomInv;
    }

    /**
     * Says that the object inherits from `Shape`
     * @type {boolean}
     */
    get isShape() {
        return true;
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isBasicShape() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isAdvancedShape() {
        return !this.isBasicShape;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Says whether the shape is local. True if local, false otherwise.
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    /**
     * Says whether the shape comes with a UV map.
     * Default is false
     * If true, the shape should implement the method glslUVMap.
     * @type {boolean}
     */
    get hasUVMap() {
        return false;
    }

    /**
     * Return the chunk of GLSL code corresponding to the signed distance function.
     * The SDF on the GLSL side should have the following signature
     * `float {{name}}_sdf(RelVector v)`
     * It takes a vector, corresponding the position and direction of the geodesic we are following
     * and return an under-estimation of the distance from this position to the shape along this geodesic.
     * @abstract
     * @return {string}
     */
    glslSDF() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Return the chunk of GLSL code corresponding to the gradient field.
     * The default computation approximates numerically the gradient.
     * This function can be overwritten for an explicit computation.
     * If so, the gradient function on the GLSL side should have the following signature
     * `RelVector {{name}}_gradient(RelVector v)`
     * It takes the vector obtained when we hit the shape and render the normal to the shape at this point.
     * @return {string}
     */
    glslGradient() {
        return numericalGradient_glsl_mustache_default()(this);
    }

    /**
     * Return the chunk of GLSL code corresponding to the UV map
     * The UV map on the GLSL side should have the signature
     * `vec2 {{name}}_uvMap(RelVector v)`
     * It takes the vector obtained when we hit the shape and render the UV coordinates at this point.
     */
    glslUVMap() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     * Compile all the function directly related to the object (e.g. sdf, gradient, etc).
     * @return {string}
     */
    glslInstance() {
        let res = this.glslSDF() + "\r\n" + this.glslGradient();
        if (this.hasUVMap) {
            res = res + "\r\n" + this.glslUVMap();
        }
        return res;
    }
}


;// CONCATENATED MODULE: ./src/core/shapes/AdvancedShape.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of 3D advanced shapes.
 * An advanced shape is a shape that is built on top of other shapes.
 * The types of the properties of an advanced shape may depend on the instance of this shape.
 * Theses properties will not be passed to the shader.
 * Only the signed distance function will carry the relevant data.
 */
class AdvancedShape extends Shape {

    /**
     * Constructor.
     * @param {Isometry} isom - the position of the shape
     */
    constructor(isom = undefined) {
        super(isom);
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isBasicShape() {
        return false;
    }
}
// EXTERNAL MODULE: ./src/commons/shapes/complement/shaders/sdf.glsl.mustache
var sdf_glsl_mustache = __webpack_require__(7939);
var sdf_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(sdf_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/complement/shaders/gradient.glsl.mustache
var gradient_glsl_mustache = __webpack_require__(6142);
var gradient_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(gradient_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/complement/shaders/uv.glsl.mustache
var uv_glsl_mustache = __webpack_require__(7260);
var uv_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(uv_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/shapes/complement/ComplementShape.js






/**
 * @class
 *
 * @classdesc
 * Union of two shapes
 */
class ComplementShape extends AdvancedShape {

    /**
     * Constructor.
     * @param {Shape} shape
     */
    constructor(shape) {
        super();
        this.shape = shape;
        this.shape.parent = this;
    }

    updateAbsoluteIsom() {
        super.updateAbsoluteIsom();
        this.shape.updateAbsoluteIsom();
    }

    updateData() {
        super.updateData();
        this.shape.updateData();
    }

    get isGlobal() {
        return this.shape.isGlobal;
    }

    get hasUVMap() {
        return this.shape.hasUVMap;
    }

    static glslClass() {
        return '';
    }

    glslSDF() {
        return sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return gradient_glsl_mustache_default()(this);
    }

    glslUVMap() {
        return uv_glsl_mustache_default()(this);
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.shape.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.shape.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.shape.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Return the complement of the given shape.
 * The goal is a to have behavior similar to `union` and `intersection`.
 * @param {Shape} shape - the shape to invert
 * @return {ComplementShape} the complement of the given shape.
 */
function complement(shape) {
    return new ComplementShape(shape);
}
// EXTERNAL MODULE: ./src/commons/imports/smoothMaxPoly.glsl
var smoothMaxPoly = __webpack_require__(2093);
var smoothMaxPoly_default = /*#__PURE__*/__webpack_require__.n(smoothMaxPoly);
// EXTERNAL MODULE: ./src/commons/shapes/instersection/shaders/sdfRegular.glsl.mustache
var sdfRegular_glsl_mustache = __webpack_require__(2076);
var sdfRegular_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(sdfRegular_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/instersection/shaders/gradientRegular.glsl.mustache
var gradientRegular_glsl_mustache = __webpack_require__(3335);
var gradientRegular_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(gradientRegular_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/instersection/shaders/sdfPoly.glsl.mustache
var sdfPoly_glsl_mustache = __webpack_require__(6428);
var sdfPoly_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(sdfPoly_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/instersection/shaders/gradientPoly.glsl.mustache
var gradientPoly_glsl_mustache = __webpack_require__(6861);
var gradientPoly_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(gradientPoly_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/instersection/shaders/uv.glsl.mustache
var shaders_uv_glsl_mustache = __webpack_require__(2905);
var shaders_uv_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_uv_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/instersection/shaders/struct.glsl
var instersection_shaders_struct = __webpack_require__(7333);
var instersection_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(instersection_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/shapes/instersection/IntersectionShape.js











const REGULAR_MAX = 0;
const SMOOTH_MAX_POLY = 1;
const SMOOTH_MAX_EXP = 2;
const SMOOTH_MAX_POWER = 3;

/**
 * @class
 *
 * @classdesc
 * Intersection of two shapes
 */
class IntersectionShape extends AdvancedShape {

    /**
     * Constructor.
     * The two shapes should be both local or both global
     * @param {Shape} shape1 - the first shape
     * @param {Shape} shape2 - the second shape
     * @param {Object} params - parameters (basically which kind of max is used)
     */
    constructor(shape1, shape2, params = {}) {
        if (shape1.isGlobal !== shape2.isGlobal) {
            throw new Error('IntersectionShape: the two shapes should be both local or both global');
        }
        super();
        this.shape1 = shape1;
        this.shape2 = shape2;
        this.shape1.parent = this;
        this.shape2.parent = this;

        this.maxType = params.maxType !== undefined ? params.maxType : REGULAR_MAX;
        this.maxCoeff = 0;
        switch (this.maxType) {
            case SMOOTH_MAX_POLY:
                this.addImport((smoothMaxPoly_default()));
                this.maxCoeff = params.maxCoeff !== undefined ? params.maxCoeff : 0.1;
                break;
        }
    }

    updateAbsoluteIsom() {
        super.updateAbsoluteIsom();
        this.shape1.updateAbsoluteIsom();
        this.shape2.updateAbsoluteIsom();
    }

    updateData() {
        super.updateData();
        this.shape1.updateData();
        this.shape2.updateData();
    }

    get uniformType() {
        return 'IntersectionShape';
    }

    static glslClass() {
        return (instersection_shaders_struct_default());
    }

    get isGlobal() {
        return this.shape1.isGlobal;
    }

    get hasUVMap() {
        return this.shape1.hasUVMap && this.shape2.hasUVMap;
    }

    glslSDF() {
        switch (this.maxType) {
            case SMOOTH_MAX_POLY:
                return sdfPoly_glsl_mustache_default()(this);
            default:
                return sdfRegular_glsl_mustache_default()(this);
        }
    }

    glslGradient() {
        switch (this.maxType) {
            case SMOOTH_MAX_POLY:
                return gradientPoly_glsl_mustache_default()(this);
            default:
                return gradientRegular_glsl_mustache_default()(this);
        }
    }

    glslUVMap() {
        return shaders_uv_glsl_mustache_default()(this);
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.shape1.setId(scene);
        this.shape2.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.shape1.onAdd(scene);
        this.shape2.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.shape1.shader(shaderBuilder);
        this.shape2.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * The intersection of an arbitrary number of shapes
 */
function intersection() {
    let res;
    let params = {};
    const n = arguments.length;
    if (n === 0) {
        throw new Error('union: the function expect at least one argument');
    }
    if (!arguments[n - 1].isShape) {
        params = arguments[n - 1];
    }
    res = arguments[0];
    for (let i = 1; i < n; i++) {
        if (arguments[i].isShape) {
            res = new IntersectionShape(res, arguments[i], params);
        }
    }
    return res;
}
// EXTERNAL MODULE: ./src/commons/imports/smoothMinPoly.glsl
var smoothMinPoly = __webpack_require__(5442);
var smoothMinPoly_default = /*#__PURE__*/__webpack_require__.n(smoothMinPoly);
// EXTERNAL MODULE: ./src/commons/shapes/union/shaders/sdfRegular.glsl.mustache
var shaders_sdfRegular_glsl_mustache = __webpack_require__(3908);
var shaders_sdfRegular_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_sdfRegular_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/union/shaders/gradientRegular.glsl.mustache
var shaders_gradientRegular_glsl_mustache = __webpack_require__(7762);
var shaders_gradientRegular_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_gradientRegular_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/union/shaders/uv.glsl.mustache
var union_shaders_uv_glsl_mustache = __webpack_require__(7500);
var union_shaders_uv_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(union_shaders_uv_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/union/shaders/sdfPoly.glsl.mustache
var shaders_sdfPoly_glsl_mustache = __webpack_require__(3238);
var shaders_sdfPoly_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_sdfPoly_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/union/shaders/struct.glsl
var union_shaders_struct = __webpack_require__(519);
var union_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(union_shaders_struct);
// EXTERNAL MODULE: ./src/commons/shapes/union/shaders/gradientPoly.glsl.mustache
var shaders_gradientPoly_glsl_mustache = __webpack_require__(8655);
var shaders_gradientPoly_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_gradientPoly_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/shapes/union/UnionShape.js










const REGULAR_MIN = 0;
const SMOOTH_MIN_POLY = 1;
const SMOOTH_MIN_EXP = 2;
const SMOOTH_MIN_POWER = 3;

/**
 * @class
 *
 * @classdesc
 * Union of two shapes
 */
class UnionShape extends AdvancedShape {

    /**
     * Constructor.
     * The two shapes should be both local or both global.
     * @param {Shape} shape1 - the first shape
     * @param {Shape} shape2 - the second shape
     * @param {Object} params - parameters (basically which kind of min is used)
     */
    constructor(shape1, shape2, params = {}) {
        if (shape1.isGlobal !== shape2.isGlobal) {
            throw new Error('UnionShape: the two shapes should be both local or both global');
        }
        super();
        this.shape1 = shape1;
        this.shape2 = shape2;
        this.shape1.parent = this;
        this.shape2.parent = this;

        this.minType = params.minType !== undefined ? params.minType : REGULAR_MIN;
        this.minCoeff = 0;
        switch (this.minType) {
            case SMOOTH_MIN_POLY:
                this.addImport((smoothMinPoly_default()));
                this.minCoeff = params.minCoeff !== undefined ? params.minCoeff : 0.1;
                break;
        }
    }

    updateAbsoluteIsom() {
        super.updateAbsoluteIsom();
        this.shape1.updateAbsoluteIsom();
        this.shape2.updateAbsoluteIsom();
    }

    updateData() {
        super.updateData();
        this.shape1.updateData();
        this.shape2.updateData();
    }

    get uniformType() {
        return 'UnionShape';
    }

    static glslClass() {
        return (union_shaders_struct_default());
    }

    get isGlobal() {
        return this.shape1.isGlobal;
    }

    get hasUVMap() {
        return this.shape1.hasUVMap && this.shape2.hasUVMap;
    }


    glslSDF() {
        switch (this.minType) {
            case SMOOTH_MIN_POLY:
                return shaders_sdfPoly_glsl_mustache_default()(this);
            default:
                return shaders_sdfRegular_glsl_mustache_default()(this);
        }

    }

    glslGradient() {
        switch (this.minType) {
            case SMOOTH_MIN_POLY:
                return shaders_gradientPoly_glsl_mustache_default()(this);
            default:
                return shaders_gradientRegular_glsl_mustache_default()(this);
        }
    }

    glslUVMap() {
        return union_shaders_uv_glsl_mustache_default()(this);
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.shape1.setId(scene);
        this.shape2.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.shape1.onAdd(scene);
        this.shape2.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.shape1.shader(shaderBuilder);
        this.shape2.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * The union of an arbitrary number of shapes
 * The function takes a bunch of shapes
 * The last argument (if not a shape) are the parameters of the union
 */
function union() {
    let res;
    let params = {};
    const n = arguments.length;
    if (n === 0) {
        throw new Error('union: the function expect at least one argument');
    }
    if (!arguments[n - 1].isShape) {
        params = arguments[n - 1];
    }
    res = arguments[0];
    for (let i = 1; i < n; i++) {
        if (arguments[i].isShape) {
            res = new UnionShape(res, arguments[i], params);
        }
    }
    return res;
}
// EXTERNAL MODULE: ./src/commons/shapes/wrap/shaders/sdf.glsl.mustache
var shaders_sdf_glsl_mustache = __webpack_require__(3105);
var shaders_sdf_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_sdf_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/wrap/shaders/gradient.glsl.mustache
var shaders_gradient_glsl_mustache = __webpack_require__(6242);
var shaders_gradient_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_gradient_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/shapes/wrap/shaders/uv.glsl.mustache
var wrap_shaders_uv_glsl_mustache = __webpack_require__(9338);
var wrap_shaders_uv_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(wrap_shaders_uv_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/shapes/wrap/WrapShape.js







/**
 * @class
 *
 * @classdesc
 * Wrap a complicated shape inside a simpler one.
 */
class WrapShape extends AdvancedShape {

    /**
     * Constructor.
     * @param {Shape} wrap - the wrapping shape
     * @param {Shape} shape - the wrapped shape
     */
    constructor(wrap, shape) {
        if (wrap.isGlobal !== shape.isGlobal) {
            throw new Error('WrapShape: the two shapes should be both local or both global');
        }
        super();
        this.wrap = wrap;
        this.shape = shape;
        this.shape.parent = this;
        this.wrap.parent = this;
    }

    updateAbsoluteIsom() {
        super.updateAbsoluteIsom();
        this.shape.updateAbsoluteIsom();
        this.wrap.updateAbsoluteIsom();
    }

    updateData() {
        super.updateData();
        this.shape.updateData();
        this.wrap.updateData();
    }

    get isWrapShape() {
        return true;
    }

    get isGlobal() {
        return this.shape.isGlobal;
    }

    get hasUVMap() {
        return this.shape.hasUVMap;
    }

    static glslClass() {
        return '';
    }

    glslSDF() {
        return shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shaders_gradient_glsl_mustache_default()(this);
    }

    glslUVMap() {
        return wrap_shaders_uv_glsl_mustache_default()(this);
    }

    /**
     * Set the ID of the shape.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.wrap.setId(scene);
        this.shape.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.wrap.onAdd(scene);
        this.shape.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.wrap.shader(shaderBuilder);
        this.shape.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the given shape
 * The goal is a to have behavior similar to `union` and `intersection`.
 * @param {Shape} wrap - the wrap
 * @param {Shape} shape - the shape to wrap
 * @return {WrapShape} the wrapped shape
 */
function wrap(wrap, shape) {
    return new WrapShape(wrap, shape);
}

;// CONCATENATED MODULE: ./src/commons/shapes/all.js




;// CONCATENATED MODULE: ./src/controls/keyboard/InfoControls.js


/**
 * @class
 *
 * @classdesc
 * Add an event when a certain key is pressed.
 * The event run a callback
 */
class InfoControls {

    /**
     * Constructor.
     * @param {string} key - the key triggering the event, by default `i`
     */
    constructor( key = 'i') {
        /**
         * The callback called by the event
         * @type {Function}
         */
        this.action = undefined;
        /**
         * The key triggering the event
         * @type {string}
         */
        this.key = key;

        const _onKeyDown = bind(this, this.onKeyDown);
        window.addEventListener('keydown', _onKeyDown, false);
    }

    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyDown(event) {
        if (event.key === this.key) {
            if (this.action !== undefined) {
                this.action();
            }
        }
    }

}
;// CONCATENATED MODULE: ./src/controls/vr/IsotropicChaseVRControls.js






/**
 * @class
 *
 * @classdesc
 * Makes sure that an given solid in the geometry follows a VR controller (living in the tangent space).
 * The position of the underlying shape should be given by an isometry of the geometry
 */
class IsotropicChaseVRControls {

    /**
     * Constructor
     * @param {Group} controller - the group representing the controller
     * @param {VRCamera} camera - the camera (giving the position of the observer)
     * @param {Solid} solid - the solid following the controller.
     * The position of the underlying shape should be given by an isometry.
     */
    constructor(controller, camera, solid) {
        this.controller = controller;
        this.camera = camera;
        this.solid = solid;

        this._isSelecting = false;
        this._isSqueezing = false;

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);
        const _onSqueezeStart = bind(this, this.onSqueezeStart);
        const _onSqueezeEnd = bind(this, this.onSqueezeEnd);


        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
        this.controller.addEventListener('squeezestart', _onSqueezeStart);
        this.controller.addEventListener('squeezeend', _onSqueezeEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        this._isSelecting = true;
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
        this._isSelecting = false;
    }

    /**
     * Event handler when the user starts squeezing
     */
    onSqueezeStart() {
        this._isSqueezing = true;
    }

    /**
     * Event handler when the user stops squeezing
     */
    onSqueezeEnd() {
        this._isSqueezing = false;
    }


    /**
     * @param {WebXRManager} webXRManager - the WebXRManager used by Three.js
     */
    chase(webXRManager) {
        this.solid.isRendered = this._isSelecting;

        const controllerPosition = new Vector().setFromMatrixPosition(this.controller.matrixWorld);
        let cameraPosition = new Vector();
        if (this.camera.isStereoOn) {
            // If XR is enable, we get the position of the left and right camera.
            // Note that when XR is on, then main Three.js Camera is shifted to coincide with the right eye.
            // So its position is NOT the midpoint between the eyes of the observer.
            // Thus we take here the midpoint between the two VR cameras.
            // Those can only be accessed using the WebXRManager.
            const camerasVR = webXRManager.getCamera(this.camera.threeCamera).cameras;
            const newThreePositionL = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[LEFT].matrixWorld);
            const newThreePositionR = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[RIGHT].matrixWorld);
            cameraPosition.lerpVectors(newThreePositionL, newThreePositionR, 0.5);
        } else {
            cameraPosition.setFromMatrixPosition(this.camera.matrix);
        }
        const relativeControllerPosition = controllerPosition.clone().sub(cameraPosition);
        const relativeControllerMatrixWorld = this.controller.matrixWorld.clone().setPosition(relativeControllerPosition);
        const position = this.camera.position.clone().fakeDiffExpMap(relativeControllerMatrixWorld);
        this.solid.isom.copy(position.globalBoost);
        this.solid.isom.matrix.multiply(position.facing);
        this.solid.updateData();
    }
}
;// CONCATENATED MODULE: ./src/controls/keyboard/KeyGenericControls.js
/**
 * @class
 *
 * @classdesc
 * Add an event when a certain key is pressed.
 * The event run a callback
 */


class KeyGenericControls {

    /**
     * Constructor.
     * @param {string} key - the key triggering the event, by default `p`
     */
    constructor(key = 'p') {
        /**
         * The callback called by the event when a key is pressed
         * @type {Function}
         */
        this.actionKeyDown = undefined;
        /**
         * The callback called by the event when a key is released
         * @type {Function}
         */
        this.actionKeyUp = undefined;
        /**
         * The key triggering the event
         * @type {string}
         */
        this.key = key;

        const _onKeyDown = bind(this, this.onKeyDown);
        const _onKeyUp = bind(this, this.onKeyUp);
        window.addEventListener('keydown', _onKeyDown, false);
        window.addEventListener('keyup', _onKeyUp, false);
    }

    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyDown(event) {
        if (event.key === this.key) {
            if (this.actionKeyDown !== undefined) {
                this.actionKeyDown();
            }
        }
    }

    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyUp(event) {
        if (event.key === this.key) {
            if (this.actionKeyUp !== undefined) {
                this.actionKeyUp();
            }
        }
    }


}
;// CONCATENATED MODULE: ./src/controls/vr/ShootVRControls.js







const STATUS_REST = 0;
const STATUS_TRIGGERED = 1;

/**
 * @class
 *
 * @classdesc
 * Makes sure that an given solid in the geometry follows a VR controller (living in the tangent space).
 * The position of the underlying shape should be given by an isometry of the geometry
 */
class ShootVRControls {

    /**
     * Constructor
     * @param {Group} controller - the group representing the controller
     * @param {VRCamera} camera - the camera (giving the position of the observer)
     * @param {Solid[]} solids - the solid following the controller.
     * @param {number} speed - speed of the bullet
     * The position of the underlying shape should be given by an isometry.
     */
    constructor(controller, camera, solids, speed) {
        this.controller = controller;
        this.camera = camera;
        this.solids = solids;
        this.speed = speed;

        /**
         * Status of the gun
         * - STATUS_REST: at rest
         * - STATUS_TRIGGERED: the user pressed the button, the the bullet has not been launched
         * @type {number}
         * @private
         */
        this._status = STATUS_REST;
        /**
         * The id of the next solid to shoot
         * @type {number}
         * @private
         */
        this._nextBullet = 0;
        /**
         * Clock to update the position of the bullets
         * @type {Clock}
         * @private
         */
        this._clock = new external_three_namespaceObject.Clock();

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);

        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        if (this._status === STATUS_REST) {
            this._status = STATUS_TRIGGERED;
        }
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
    }

    /**
     * Shoot the next bullet
     * @param {Position} position - initial position of the bullet
     */
    shoot(position) {
        const bullet = this.solids[this._nextBullet];

        bullet.bulletData = {
            time: this._clock.getElapsedTime(),
            position: position
        }
        bullet.isRendered = true;
        this._nextBullet = (this._nextBullet + 1) % this.solids.length;
    }

    /**
     * Update the position of the given bullet
     * @param {number} index - the index of the bullet
     */
    updateBullet(index) {
        const bullet = this.solids[index];
        // no bulletData means the bullet has not been shot yet
        if (bullet.hasOwnProperty('bulletData')) {
            const delta = this._clock.getElapsedTime() - bullet.bulletData.time;
            const aux = bullet.bulletData.position.clone().flow(new Vector(0, 0, -this.speed * delta));
            bullet.isom.copy(aux.boost);
            bullet.updateData();
        }
    }

    /**
     * Update the position of all bullets
     */
    updateAllBullets() {
        for (let i = 0; i < this.solids.length; i++) {
            this.updateBullet(i);
        }
    }

    /**
     * @param {WebXRManager} webXRManager - the WebXRManager used by Three.js
     *
     */
    update(webXRManager) {
        if (this._status === STATUS_TRIGGERED) {

            const controllerPosition = new Vector().setFromMatrixPosition(this.controller.matrixWorld);
            let cameraPosition = new Vector();
            if (this.camera.isStereoOn) {
                // If XR is enable, we get the position of the left and right camera.
                // Note that when XR is on, then main Three.js Camera is shifted to coincide with the right eye.
                // Do its position is NOT the midpoint between the eyes of the observer.
                // Thus we take here the midpoint between the two VR cameras.
                // Those can only be accessed using the WebXRManager.
                const camerasVR = webXRManager.getCamera(this.camera.threeCamera).cameras;
                const newThreePositionL = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[LEFT].matrixWorld);
                const newThreePositionR = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[RIGHT].matrixWorld);
                cameraPosition.lerpVectors(newThreePositionL, newThreePositionR, 0.5);
            } else {
                cameraPosition.setFromMatrixPosition(this.camera.matrix);
            }
            const relativeControllerPosition = controllerPosition.clone().sub(cameraPosition);
            const relativeControllerMatrixWorld = this.controller.matrixWorld.clone().setPosition(relativeControllerPosition);
            const position = this.camera.position.clone().fakeDiffExpMap(relativeControllerMatrixWorld);
            this.shoot(position.globalPosition);

            this._status = STATUS_REST;
        }
        this.updateAllBullets();

    }
}
;// CONCATENATED MODULE: ./src/controls/keyboard/SwitchControls.js
/**
 * @class
 *
 * @classdesc
 * Change state each time a given key is pressed
 *
 */


class SwitchControls {

    /**
     * Constructor.
     * @param {string} key - the key triggering the event, by default `p`
     * @param {number} stateNumber - number of states
     * @param {number} initialSate - initial state
     *
     */
    constructor(key = 'p', stateNumber = 2, initialSate = 0) {

        /**
         * The key triggering the event
         * @type {string}
         */
        this.key = key;
        this.stateNumber = stateNumber;
        this.state = initialSate;
        this.justChanged = false;

        const _onKeyDown = bind(this, this.onKeyDown);
        window.addEventListener('keydown', _onKeyDown, false);
    }

    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyDown(event) {
        if (event.key === this.key) {
            this.state = (this.state + 1) % this.stateNumber;
            this.justChanged = true;
        }
    }
}
;// CONCATENATED MODULE: ./src/controls/vr/LightVRControls.js







/**
 * @class
 *
 * @classdesc
 * Implements controls to fly in the geometry using the VR controllers.
 * - The squeeze button is used to drag (and rotate) the scene.
 * - The select button is used to move in the direction of the controller
 * This is inspired from Three.js
 * {@link https://threejs.org/docs/#examples/en/controls/FlyControls | FlyControls}
 */
class LightVRControls {

    /**
     * Constructor
     * @param {Group} controller - the group representing the controller
     * @param {VRCamera} camera - the camera (giving the position of the observer)
     * @param {PointLight} light - the light attached to the controller.
     */
    constructor(controller, camera, light) {
        this.controller = controller;
        this.camera = camera;
        this.light = light
    }

    /**
     * @param {WebXRManager} webXRManager - the WebXRManager used by Three.js
     */
    chase(webXRManager) {
        const controllerPosition = new Vector().setFromMatrixPosition(this.controller.matrixWorld);
        let cameraPosition = new Vector();
        if (this.camera.isStereoOn) {
            // If XR is enable, we get the position of the left and right camera.
            // Note that when XR is on, then main Three.js Camera is shifted to coincide with the right eye.
            // Do its position is NOT the midpoint between the eyes of the observer.
            // Thus we take here the midpoint between the two VR cameras.
            // Those can only be accessed using the WebXRManager.
            const camerasVR = webXRManager.getCamera(this.camera.threeCamera).cameras;
            const newThreePositionL = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[LEFT].matrixWorld);
            const newThreePositionR = new external_three_namespaceObject.Vector3().setFromMatrixPosition(camerasVR[RIGHT].matrixWorld);
            cameraPosition.lerpVectors(newThreePositionL, newThreePositionR, 0.5);
        } else {
            cameraPosition.setFromMatrixPosition(this.camera.matrix);
        }
        const relativeControllerPosition = controllerPosition.clone().sub(cameraPosition);
        const relativeControllerMatrixWorld = this.controller.matrixWorld.clone().setPosition(relativeControllerPosition);
        const position = this.camera.position.clone().fakeDiffExpMap(relativeControllerMatrixWorld);
        this.light.position = new Point().applyIsometry(position.globalBoost);
    }
}

;// CONCATENATED MODULE: ./src/controls/vr/ResetVRControls.js



/**
 * @class
 *
 * @classdesc
 * When pressing the button, reset the position of the user (in the scene) to the default position (the origin).
 * It can be used, when a VR experiment need be started at a very precise position (cf hexagon.html in H3)
 */

const RESET_CALLED = 1;
const RESET_WAIT = 0;

class ResetVRControls {

    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer
     * @param {Group} controller - the group representing the controller
     * @param {boolean} alignFacing - option for updating the facing
     *  - if False, the facing of the position is reset to its default value (quaternion = 1).
     *  - if True, the facing is set up to that the camera is directed toward the negative z axis.
     *    in this case the camera should be passed to the constructor as an argument
     * @param {VRCamera} camera - the camera (giving the position of the observer)
     *
     */
    constructor(position, controller, alignFacing = false, camera = undefined) {
        this.position = position;
        this.controller = controller;

        this._reset = RESET_WAIT;
        this._alignFacing = alignFacing;
        this._camera = camera;
        if (this._alignFacing && camera === undefined) {
            throw new Error("VRControlsReset.constructor, the camera is needed when the alignFacing option is on");
        }

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);

        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        this._reset = RESET_CALLED;
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
    }

    /**
     * Function to update the position
     */
    update() {
        if (this._reset === RESET_CALLED) {
            this.position.reset();
            if (this._alignFacing) {
                const matrix = this._camera.threeCamera.matrixWorld;
                this.position.local.quaternion.setFromRotationMatrix(matrix);
                this.position.local.quaternion.invert();
            }
            this._reset = RESET_WAIT;
        }
    }
}
;// CONCATENATED MODULE: ./src/controls/all.js










;// CONCATENATED MODULE: ./src/utils/quadRing/QuadRingElement.js
/**
 * @class
 *
 * @classdesc
 * Elements of the form a + b sqrt(d) where `d` is defined at the level of the `QuadRing`
 */
class QuadRingElement {

    /**
     * Constructor.
     * @param {QuadRing} ring - the underlying quadratic ring
     * @param {number} a - an integer
     * @param {number} b - an integer
     */
    constructor(ring, a = 0, b = 0) {
        /**
         * The underlying quadratic ring
         * @type {QuadRing}
         */
        this.ring = ring;
        this.a = a;
        this.b = b;
        this.reduce();
    }

    /**
     * Make the that gcd(a,b,c) = 1
     * @return {QuadRingElement} the current element
     */
    reduce() {
        this.a = Math.round(this.a);
        this.b = Math.round(this.b);
        return this;
    }

    /**
     * Replace the element by its opposite
     * @return {QuadRingElement} the current element
     */
    negate() {
        this.a = -this.a;
        this.b = -this.b;
        return this;
    }

    /**
     * Multiplication
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    multiply(elt) {
        const auxA = this.a;
        const auxB = this.b;
        this.a = auxA * elt.a + this.ring.d * auxB * elt.b;
        this.b = auxA * elt.b + auxB * elt.a;
        return this.reduce();
    }

    /**
     * Addition
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    add(elt) {
        this.a = this.a + elt.a;
        this.b = this.b + elt.b;
        return this.reduce();
    }

    /**
     * Subtraction
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    sub(elt) {
        this.a = this.a - elt.a;
        this.b = this.b - elt.b;
        return this.reduce();
    }

    /**
     * Set the current element to the sum of the given arguments
     * @return {QuadRingElement} the current element
     */
    sum() {
        this.copy(this.ring.zero);
        for (const elt of arguments) {
            this.add(elt);
        }
        return this;
    }

    /**
     * Set the current element of the product of the given arguments
     * @return {QuadRingElement} the current element
     */
    product() {
        this.copy(this.ring.one);
        for (const elt of arguments) {
            this.multiply(elt);
        }
        return this;
    }

    /**
     * Add the product of the given element to the current elements
     * @return {QuadRingElement} the current element
     */
    addProduct() {
        const aux = new QuadRingElement(this.ring).product(...arguments);
        this.add(aux);
        return this;
    }

    /**
     * Subtract the product of the given element to the current elements
     * @return {QuadRingElement} the current element
     */
    subProduct() {
        const aux = new QuadRingElement(this.ring).product(...arguments);
        this.sub(aux);
        return this;
    }

    /**
     * Convert the element to a number
     */
    toNumber() {
        return this.a + this.b * Math.sqrt(this.ring.d);
    }

    /**
     * Check if the two element are equal
     * @param {QuadRingElement} elt
     * @return {boolean}
     */
    equals(elt) {
        return this.a === elt.a && this.b === elt.b;
    }

    /**
     * Test if the element is zero.
     * @return {boolean}
     */
    isZero() {
        return this.a === 0 && this.b === 0;
    }

    /**
     * Return a copy of the current element
     * @return {QuadRingElement}
     */
    clone() {
        const res = new QuadRingElement(this.ring);
        res.a = this.a;
        res.b = this.b;
        return res;
    }

    /**
     * Set the current element to the given one
     * @param {QuadRingElement} elt
     * @return {QuadRingElement} the current element
     */
    copy(elt) {
        this.a = elt.a;
        this.b = elt.b;
        return this;
    }

    toLog(){
        return `${this.a} + ${this.b} _rD`;
    }
}

// EXTERNAL MODULE: ./src/utils/quadRing/shader/quadRing.glsl
var quadRing = __webpack_require__(5688);
var quadRing_default = /*#__PURE__*/__webpack_require__.n(quadRing);
;// CONCATENATED MODULE: ./src/utils/quadRing/QuadRingMatrix4.js





/**
 * @class
 *
 * @classdesc
 * 4x4 matrix over a quadratic field **with determinant 1** (o make inversion easier).
 * @author Mostly borrowed from Three.js
 */
class QuadRingMatrix4 {

    constructor(ring) {
        /**
         * The underlying quadratic ring
         * @type {QuadRing}
         */
        this.ring = ring;
        /**
         * The elements of the matrix, in a  column-major order
         * @type {QuadRingElement[]}
         */
        this.elements = [
            this.ring.one.clone(), this.ring.zero.clone(), this.ring.zero.clone(), this.ring.zero.clone(),
            this.ring.zero.clone(), this.ring.one.clone(), this.ring.zero.clone(), this.ring.zero.clone(),
            this.ring.zero.clone(), this.ring.zero.clone(), this.ring.one.clone(), this.ring.zero.clone(),
            this.ring.zero.clone(), this.ring.zero.clone(), this.ring.zero.clone(), this.ring.one.clone()
        ];
    }

    /**
     * Flag to precise the type of the object
     * @type {boolean}
     */
    get isQuadRingMatrix4() {
        return true;
    }

    /**
     * The 4x4 matrix with all the a-parts.
     * This data is need for the shader
     * @type{Matrix4}
     */
    get a() {
        const entries = this.toArray().map(x => x.a);
        return new external_three_namespaceObject.Matrix4().fromArray(entries);
    }

    /**
     * The 4x4 matrix with all the b-parts.
     * This data is need for the shader
     * @type{Matrix4}
     */
    get b() {
        const entries = this.toArray().map(x => x.b);
        return new external_three_namespaceObject.Matrix4().fromArray(entries);
    }

    /**
     * Return the ij-entry
     * @param {number} i - the row index
     * @param {number} j - the column index
     * @return {QuadRingElement}
     */
    getEntry(i, j) {
        return this.elements[4 * j + i];
    }

    /**
     * Set the value of the ij-entry
     * @param {number} i - the row index
     * @param {number} j - the column index
     * @param {QuadRingElement} value
     * @return {QuadRingMatrix4}
     */
    setEntry(i, j, value) {
        this.elements[4 * j + i].copy(value);
        return this;
    }

    /**
     * Set the elements of this matrix to the supplied row-major values n11, n12, ... n44.
     * @param {QuadRingElement} n11
     * @param {QuadRingElement} n12
     * @param {QuadRingElement} n13
     * @param {QuadRingElement} n14
     * @param {QuadRingElement} n21
     * @param {QuadRingElement} n22
     * @param {QuadRingElement} n23
     * @param {QuadRingElement} n24
     * @param {QuadRingElement} n31
     * @param {QuadRingElement} n32
     * @param {QuadRingElement} n33
     * @param {QuadRingElement} n34
     * @param {QuadRingElement} n41
     * @param {QuadRingElement} n42
     * @param {QuadRingElement} n43
     * @param {QuadRingElement} n44
     * @return {QuadRingMatrix4}
     */
    set(n11, n12, n13, n14,
        n21, n22, n23, n24,
        n31, n32, n33, n34,
        n41, n42, n43, n44) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.setEntry(i, j, arguments[4 * i + j]);
            }
        }
        return this;

    }

    /**
     * Set the current matrix to the identity
     */
    identity() {
        this.elements = [
            this.ring.one.clone(), this.ring.zero.clone(), this.ring.zero.clone(), this.ring.zero.clone(),
            this.ring.zero.clone(), this.ring.one.clone(), this.ring.zero.clone(), this.ring.zero.clone(),
            this.ring.zero.clone(), this.ring.zero.clone(), this.ring.one.clone(), this.ring.zero.clone(),
            this.ring.zero.clone(), this.ring.zero.clone(), this.ring.zero.clone(), this.ring.one.clone()
        ];
        return this;
    }

    /**
     * Set the matrix to the product m1 * m2
     * @param {QuadRingMatrix4} m1
     * @param {QuadRingMatrix4} m2
     * @return {QuadRingMatrix4}
     */
    multiplyMatrices(m1, m2) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.setEntry(i, j, this.ring.zero);
                for (let k = 0; k < 4; k++) {
                    this.getEntry(i, j).addProduct(m1.getEntry(i, k), m2.getEntry(k, j));
                }
            }
        }
        return this;
    }

    /**
     * Matrix multiplication
     * @param {QuadRingMatrix4} m
     * @return {QuadRingMatrix4}
     */
    multiply(m) {
        return this.multiplyMatrices(this.clone(), m);
    }

    /**
     * Matrix pre-multiplication
     * @param {QuadRingMatrix4} m
     * @return {QuadRingMatrix4}
     */
    premultiply(m) {
        return this.multiplyMatrices(m, this.clone());
    }

    /**
     * Multiply the matrix by a scalar
     * @param {QuadRingElement} s
     * @return {QuadRingMatrix4}
     */
    multiplyScalar(s) {
        for (let i = 0; i < 16; i++) {
            this.elements[i].multiply(s);
        }
        return this;
    }

    /**
     * Set the matrix to its transpose
     * @return {QuadRingMatrix4}
     */
    transpose() {

        const te = this.elements;
        let tmp = this.ring.element();

        tmp.copy(te[1]);
        te[1].copy(te[4]);
        te[4].copy(tmp);

        tmp.copy(te[2]);
        te[2].copy(te[8]);
        te[8].copy(tmp);

        tmp.copy(te[6]);
        te[6].copy(te[9]);
        te[9].copy(tmp);

        tmp.copy(te[3]);
        te[3].copy(te[12]);
        te[12].copy(tmp);

        tmp.copy(te[7]);
        te[7].copy(te[13]);
        te[13].copy(tmp);

        tmp.copy(te[11]);
        te[11].copy(te[14]);
        te[14].copy(tmp);

        return this;
    }

    /**
     * Set the matrix to its inverse.
     * We recall that the determinant of the matrix is assumed to be one.
     * @return {QuadRingMatrix4}
     */
    invert() {

        // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        const te = this.elements,

            n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3],
            n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7],
            n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11],
            n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15];

        te[0] = this.ring.element()
            .addProduct(n23, n34, n42)
            .subProduct(n24, n33, n42)
            .addProduct(n24, n32, n43)
            .subProduct(n22, n34, n43)
            .subProduct(n23, n32, n44)
            .addProduct(n22, n33, n44);
        te[1] = this.ring.element()
            .addProduct(n24, n33, n41)
            .subProduct(n23, n34, n41)
            .subProduct(n24, n31, n43)
            .addProduct(n21, n34, n43)
            .addProduct(n23, n31, n44)
            .subProduct(n21, n33, n44);
        te[2] = this.ring.element()
            .addProduct(n22, n34, n41)
            .subProduct(n24, n32, n41)
            .addProduct(n24, n31, n42)
            .subProduct(n21, n34, n42)
            .subProduct(n22, n31, n44)
            .addProduct(n21, n32, n44);
        te[3] = this.ring.element()
            .addProduct(n23, n32, n41)
            .subProduct(n22, n33, n41)
            .subProduct(n23, n31, n42)
            .addProduct(n21, n33, n42)
            .addProduct(n22, n31, n43)
            .subProduct(n21, n32, n43);


        te[4] = this.ring.element()
            .addProduct(n14, n33, n42)
            .subProduct(n13, n34, n42)
            .subProduct(n14, n32, n43)
            .addProduct(n12, n34, n43)
            .addProduct(n13, n32, n44)
            .subProduct(n12, n33, n44);
        te[5] = this.ring.element()
            .addProduct(n13, n34, n41)
            .subProduct(n14, n33, n41)
            .addProduct(n14, n31, n43)
            .subProduct(n11, n34, n43)
            .subProduct(n13, n31, n44)
            .addProduct(n11, n33, n44);
        te[6] = this.ring.element()
            .addProduct(n14, n32, n41)
            .subProduct(n12, n34, n41)
            .subProduct(n14, n31, n42)
            .addProduct(n11, n34, n42)
            .addProduct(n12, n31, n44)
            .subProduct(n11, n32, n44);
        te[7] = this.ring.element()
            .addProduct(n12, n33, n41)
            .subProduct(n13, n32, n41)
            .addProduct(n13, n31, n42)
            .subProduct(n11, n33, n42)
            .subProduct(n12, n31, n43)
            .addProduct(n11, n32, n43);

        te[8] = this.ring.element()
            .addProduct(n13, n24, n42)
            .subProduct(n14, n23, n42)
            .addProduct(n14, n22, n43)
            .subProduct(n12, n24, n43)
            .subProduct(n13, n22, n44)
            .addProduct(n12, n23, n44);
        te[9] = this.ring.element()
            .addProduct(n14, n23, n41)
            .subProduct(n13, n24, n41)
            .subProduct(n14, n21, n43)
            .addProduct(n11, n24, n43)
            .addProduct(n13, n21, n44)
            .subProduct(n11, n23, n44);
        te[10] = this.ring.element()
            .addProduct(n12, n24, n41)
            .subProduct(n14, n22, n41)
            .addProduct(n14, n21, n42)
            .subProduct(n11, n24, n42)
            .subProduct(n12, n21, n44)
            .addProduct(n11, n22, n44);
        te[11] = this.ring.element()
            .addProduct(n13, n22, n41)
            .subProduct(n12, n23, n41)
            .subProduct(n13, n21, n42)
            .addProduct(n11, n23, n42)
            .addProduct(n12, n21, n43)
            .subProduct(n11, n22, n43);

        te[12] = this.ring.element()
            .addProduct(n14, n23, n32)
            .subProduct(n13, n24, n32)
            .subProduct(n14, n22, n33)
            .addProduct(n12, n24, n33)
            .addProduct(n13, n22, n34)
            .subProduct(n12, n23, n34);
        te[13] = this.ring.element()
            .addProduct(n13, n24, n31)
            .subProduct(n14, n23, n31)
            .addProduct(n14, n21, n33)
            .subProduct(n11, n24, n33)
            .subProduct(n13, n21, n34)
            .addProduct(n11, n23, n34);
        te[14] = this.ring.element()
            .addProduct(n14, n22, n31)
            .subProduct(n12, n24, n31)
            .subProduct(n14, n21, n32)
            .addProduct(n11, n24, n32)
            .addProduct(n12, n21, n34)
            .subProduct(n11, n22, n34);
        te[15] = this.ring.element()
            .addProduct(n12, n23, n31)
            .subProduct(n13, n22, n31)
            .addProduct(n13, n21, n32)
            .subProduct(n11, n23, n32)
            .subProduct(n12, n21, n33)
            .addProduct(n11, n22, n33);

        return this;
    }

    /**
     * Check if the two matrices are equal
     * @param {QuadRingMatrix4} matrix
     * @return {boolean}
     */
    equals(matrix) {
        for (let i = 0; i < 16; i++) {
            if (!this.elements[i].equals(matrix.elements[i])) return false;
        }

        return true;
    }

    /**
     * Set the coefficient from an array
     * @param {QuadRingElement[]} array
     * @param {number} offset
     * @return {QuadRingMatrix4}
     */
    fromArray(array, offset = 0) {
        for (let i = 0; i < 16; i++) {
            this.elements[i].copy(array[i + offset]);
        }
        return this;
    }

    /**
     * Return the elements of the matrix as an array
     * @param {QuadRingElement[]} array
     * @param {number} offset
     * @return {QuadRingElement[]}
     */
    toArray(array = [], offset = 0) {
        const te = this.elements;

        for (let i = 0; i < 16; i++) {
            array[offset + i] = te[i].clone();
        }
        return array;
    }

    /**
     * Convert the matrix to a Matrix4 (with number type entries)
     * @return {Matrix4}
     */
    toMatrix4() {
        const entries = this.toArray().map(x => x.toNumber());
        return new external_three_namespaceObject.Matrix4().fromArray(entries);
    }


    /**
     * Return a copy of the current matrix.
     * @return {QuadRingMatrix4}
     */
    clone() {
        return new QuadRingMatrix4(this.ring).fromArray(this.elements);
    }

    /**
     * Set the current matrix to m
     * @param {QuadRingMatrix4} m
     * @return {QuadRingMatrix4}
     */
    copy(m) {
        return this.fromArray(m.elements);

    }

    toLog() {
        return this.toMatrix4().toLog();
    }
}
;// CONCATENATED MODULE: ./src/utils/quadRing/QuadRing.js




/**
 * @class
 *
 * @classdesc
 * Quadratic field.
 * Mostly a structure to store the square of the adjoined root
 */
class QuadRing {

    /**
     * Constructor
     * @param {number} d - the square of the adjoined root.
     * For the moment it should be an integer
     */
    constructor(d) {
        this.d = d;
    }

    /**
     * Return the element a + b sqrt(d) in the quadratic ring.
     * `a` and `b` should be integers
     * @param {number} a
     * @param {number} b
     */
    element(a = 0, b = 0) {
        return new QuadRingElement(this, a, b);
    }

    /**
     * Return a matrix on this quadratic rign
     * @return {QuadRingMatrix4}
     */
    matrix4(){
        return new QuadRingMatrix4(this);
    }

    get one() {
        return new QuadRingElement(this, 1);
    }

    get zero() {
        return new QuadRingElement(this, 0);
    }

    /**
     * build the corresponding part of the shader
     * @param {ShaderBuilder} shaderBuilder
     */
    shader(shaderBuilder) {
        shaderBuilder.addChunk((quadRing_default()));
        shaderBuilder.addConstant('QUAD_RING_D', 'int', this.d);
    }
}
;// CONCATENATED MODULE: ./src/utils/Matrix2.js
/**
 * @class
 * @classdesc 2x2 matrices
 * Following Three.js, elements are stored in a column major system
 */

class Matrix2 {

    /**
     * Constructor
     * Return the identity matrix
     */
    constructor() {
        this.elements = [1, 0, 0, 1];
    }

    /**
     * Set the coefficients of the matrix
     * @param {number} a - (0,0)-entry
     * @param {number} b - (0,1)-entry
     * @param {number} c - (1,0)-entry
     * @param {number} d - (1,1)-entry
     * @return {Matrix2} - the current matrix
     */
    set(a, b, c, d) {
        this.elements = [a, c, b, d];
        return this
    }

    /**
     * Set the current matrix to the identity
     * @return {Matrix2} - the identity matrix
     */
    identity() {
        this.set(1, 0, 0, 1);
        return this;
    }

    /**
     * Multiply the given matrices
     * Return the product m1 * m2
     * @param {Matrix2} m1 - the first matrix
     * @param {Matrix2} m2 - the second matrix
     */
    multplyMatrices(m1, m2) {
        const [a1, c1, b1, d1] = m1.elements;
        const [a2, c2, b2, d2] = m2.elements;
        this.elements = [
            a1 * a2 + b1 * c2,
            c1 * a2 + d1 * c2,
            a1 * b2 + b1 * d2,
            c1 * b2 + d1 * d2
        ]
        return this;
    }

    /**
     * Multiply the current matrix by m on the right (i.e. return this * m)
     * @param {Matrix2} m - the other matrix
     * @return {Matrix2} - the product
     */
    multiply(m) {
        return this.multplyMatrices(this, m);
    }

    /**
     * Multiply the current matrix by m on the left (i.e. return m * this)
     * @param {Matrix2} m - the other matrix
     * @return {Matrix2} - the product
     */
    premultiply(m) {
        return this.multplyMatrices(m, this);
    }

    /**
     * Return the given power of the current matrix
     * @param {number} n - the exponent. It should be an integer (non necessarily positive)
     * @return {Matrix2} - the power of the matrix
     */
    power(n) {
        if (n < 0) {
            return this.invert().power(-n);
        }
        if (n === 0) {
            return this.identity();
        }
        if (n === 1) {
            return this;
        }
        if (n % 2 === 0) {
            this.power(n / 2);
            return this.multiply(this);
        } else {
            const aux = this.clone();
            this.power(n - 1);
            return this.multiply(aux);
        }
    }

    /**
     * Return the determinant of the current matrix
     * @return {number} - the determinant
     */
    determinant() {
        const [a, c, b, d] = this.elements;
        return a * d - b * c;
    }

    /**
     * Invert the current matrix
     * @return {Matrix2} - the inverse of the matrix
     */
    invert() {
        const [a, c, b, d] = this.elements;
        const det = this.determinant();
        this.elements = [d / det, -c / det, -b / det, a / det];
        return this;
    }

    /**
     * Return a copy of the current matrix
     * @return {Matrix2} - the duplicated matrix
     */
    clone() {
        const res = new Matrix2();
        for (let i = 0; i < 4; i++) {
            res.elements[i] = this.elements[i];
        }
        return res;
    }

    /**
     * Copy the given matrix into the current matrix
     * @param {Matrix2} m - the matrix to copy
     * @return {Matrix2} - the current matrix
     */
    copy(m) {
        for (let i = 0; i < 4; i++) {
            this.elements[i] = m.elements[i];
        }
        return this;
    }

    /**
     * Check if the matrix equals the current matrix
     * @param {Matrix2} m - the matrix to test again
     * @return {boolean} - true if the matrices are the same, false otherwise
     */
    equals(m) {
        for (let i = 0; i < 4; i++) {
            if (this.elements[i] !== m.elements[i]) {
                return false;
            }
        }
        return true;
    }
}
;// CONCATENATED MODULE: ./src/core.js
// all the exports used by the bundler expect the geometry
// export {
//     Color,
//     Clock,
//     Vector2,
//     Vector3,
//     Vector4,
//     Matrix3,
//     Matrix4,
//     Quaternion,
//     WebGLRenderer,
// } from "three";

































;// CONCATENATED MODULE: ./src/commons/groups/isometry/GroupElement.js



/**
 * @class
 *
 * @classdesc
 * Default representation of a subgroup : just directly use the isometries.
 */
class isometry_GroupElement_GroupElement extends GroupElement_GroupElement {
    
    constructor(group) {
        super(group);
        this.isom = new Isometry();
    }

    identity() {
        this.isom.identity();
        return this;
    }

    multiply(elt) {
        this.isom.multiply(elt.isom);
        return this;
    }

    premultiply(elt) {
        this.isom.premultiply(elt.isom);
        return this;
    }

    invert() {
        this.isom.invert();
        return this;
    }

    toIsometry() {
        return this.isom.clone();
    }

    equals(elt) {
        return this.isom.equals(elt.isom);
    }

    clone() {
        const res = new isometry_GroupElement_GroupElement();
        res.isom.copy(this.isom);
        return res;
    }

    copy(elt) {
        this.isom.copy(elt.isom);
        return this;
    }
}

// EXTERNAL MODULE: ./src/commons/groups/isometry/shaders/element.glsl
var isometry_shaders_element = __webpack_require__(6097);
var shaders_element_default = /*#__PURE__*/__webpack_require__.n(isometry_shaders_element);
;// CONCATENATED MODULE: ./src/commons/groups/isometry/Group.js






/**
 * @class
 *
 * @classdesc
 * Group of isometries
 */
class isometry_Group_Group extends Group_Group {
    constructor() {
        super();
    }

    element() {
        return new isometry_GroupElement_GroupElement(this);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk((shaders_element_default()));
    }
}
;// CONCATENATED MODULE: ./src/geometries/s2e/geometry/General.js










;// CONCATENATED MODULE: ./src/geometries/s2e/groups/cube/set.js







const group = new isometry_Group_Group();

const normalXp = new external_three_namespaceObject.Vector4(1, 0, -1, 0);

function testXp(p) {
    return p.coords.dot(normalXp) > 0;
}

// language=GLSL
const glslTestXp = `//
bool textXp(Point p){
    vec4 normal = vec4(1, 0, -1, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalXn = new external_three_namespaceObject.Vector4(-1, 0, -1, 0);

function testXn(p) {
    return p.coords.dot(normalXn) > 0;
}

// language=GLSL
const glslTestXn = `//
bool textXn(Point p){
    vec4 normal = vec4(-1, 0, -1, 0);
    return dot(p.coords, normal) > 0.;
}
`;


const normalYp = new external_three_namespaceObject.Vector4(0, 1, -1, 0);

function testYp(p) {
    return p.coords.dot(normalYp) > 0;
}

// language=GLSL
const glslTestYp = `//
bool textYp(Point p){
    vec4 normal = vec4(0, 1, -1, 0);
    return dot(p.coords, normal) > 0.;
}
`;

const normalYn = new external_three_namespaceObject.Vector4(0, -1, -1, 0);

function testYn(p) {
    return p.coords.dot(normalYn) > 0;
}

// language=GLSL
const glslTestYn = `//
bool textYn(Point p){
    vec4 normal = vec4(0, -1, -1, 0);
    return dot(p.coords, normal) > 0.;
}
`;


function testWp(p) {
    return p.coords.w > 0.25 * Math.PI;
}

//language=GLSL
const glslTestWp = `//

bool testWp(Point p){
    return p.coords.w > 0.25 * PI;
}
`;

function testWn(p) {
    return p.coords.w < -0.25 * Math.PI
}

//language=GLSL
const glslTestWn = `//

bool testWn(Point p){
    return p.coords.w < -0.25 * PI;
}
`;
const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();
const shiftWp = group.element();
const shiftWn = group.element();

shiftXp.isom.matrix.set(
    0, 0, -1, 0,
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, 0, 1
);

shiftXn.isom.matrix.set(
    0, 0, 1, 0,
    0, 1, 0, 0,
    -1, 0, 0, 0,
    0, 0, 0, 1
);

shiftYp.isom.matrix.set(
    1, 0, 0, 0,
    0, 0, -1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1
);

shiftYn.isom.matrix.set(
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, -1, 0, 0,
    0, 0, 0, 1
);

shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -0.5 * Math.PI));
shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 0.5 * Math.PI));


/* harmony default export */ const cube_set = (new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn)
    .add(testXn, glslTestXn, shiftXn, shiftXp)
    .add(testYp, glslTestYp, shiftYp, shiftYn)
    .add(testYn, glslTestYn, shiftYn, shiftYp)
    .add(testWp, glslTestWp, shiftWp, shiftWn)
    .add(testWn, glslTestWn, shiftWn, shiftWp));



;// CONCATENATED MODULE: ./src/geometries/s2e/groups/zLoop/set.js




const set_group = new isometry_Group_Group();

function set_testWp(p) {
    return p.coords.w > 1;
}

//language=GLSL
const set_glslTestWp = `//

bool testWp(Point p){
    return p.coords.w>1.;
}
`;

function set_testWn(p) {
    return p.coords.w < -1;
}

//language=GLSL
const set_glslTestWn = `//

bool testWn(Point p){
    return p.coords.w<-1.;
}
`;

const set_shiftWp = set_group.element();
const set_shiftWn = set_group.element();

set_shiftWp.isom.makeTranslationFromDir(new Vector(0, 0, -2));
set_shiftWn.isom.makeTranslationFromDir(new Vector(0, 0, 2));

/* harmony default export */ const zLoop_set = (new TeleportationSet()
    .add(set_testWp, set_glslTestWp, set_shiftWp, set_shiftWn)
    .add(set_testWn, set_glslTestWn, set_shiftWn, set_shiftWp));

// EXTERNAL MODULE: ./src/geometries/s2e/imports/direction.glsl
var direction = __webpack_require__(1936);
var direction_default = /*#__PURE__*/__webpack_require__.n(direction);
// EXTERNAL MODULE: ./src/geometries/s2e/imports/distance.glsl
var distance = __webpack_require__(4182);
var distance_default = /*#__PURE__*/__webpack_require__.n(distance);
// EXTERNAL MODULE: ./src/geometries/s2e/imports/lightIntensity.glsl
var lightIntensity = __webpack_require__(3626);
var lightIntensity_default = /*#__PURE__*/__webpack_require__.n(lightIntensity);
// EXTERNAL MODULE: ./src/geometries/s2e/lights/pointLight/shaders/struct.glsl
var pointLight_shaders_struct = __webpack_require__(2778);
var pointLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(pointLight_shaders_struct);
// EXTERNAL MODULE: ./src/core/lights/shaders/directions.glsl.mustache
var directions_glsl_mustache = __webpack_require__(7577);
var directions_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(directions_glsl_mustache);
;// CONCATENATED MODULE: ./src/geometries/s2e/lights/pointLight/PointLight.js












/**
 * @class
 *
 * @classdesc
 * Light at infinity in the positive E-direction
 */
class PointLight extends Light {

    /**
     * Constructor
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     * @param {Point} position - the position of the light
     *
     */
    constructor(color, intensity = 1, position) {
        super(1);
        this.color = color;
        this.intensity = intensity;
        this.position = position;
        this.addImport((distance_default()), (direction_default()), (lightIntensity_default()));
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'PointLight';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return (pointLight_shaders_struct_default());
    }

    glslDirections() {
        return directions_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/s2e/lights/esun/shaders/struct.glsl
var esun_shaders_struct = __webpack_require__(1283);
var esun_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(esun_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/s2e/lights/esun/ESun.js







const DIR_UP = 1;
const DIR_DOWN = -1;

/**
 * @class
 *
 * @classdesc
 * Light at infinity in the E-direction
 */
class ESun extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     * @param {number} direction - the direction of the light. It should be on of the following values:
     * - -1 (light coming from the negative direction)
     * - +1 (light coming from the positive direction)
     */
    constructor(color, intensity = 1, direction = DIR_UP) {
        super(1);
        this.color = color;
        this.intensity = intensity;
        this.direction = direction;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'ESun';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return (esun_shaders_struct_default());
    }

    glslDirections() {
        return  directions_glsl_mustache_default()(this);
    }


}
;// CONCATENATED MODULE: ./src/geometries/s2e/lights/all.js


// EXTERNAL MODULE: ./src/geometries/s2e/material/varyingColor/shaders/struct.glsl
var varyingColor_shaders_struct = __webpack_require__(2855);
var varyingColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(varyingColor_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/s2e/material/varyingColor/VaryingColorMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
class VaryingColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} mainColor - the color of the material
     * @param {Color} weight - amplitudes of the variations on each channel
     */
    constructor(mainColor, weight) {
        super();
        this.mainColor = mainColor;
        this.weight = weight;
    }

    get uniformType() {
        return 'VaryingColorMaterial';
    }

    get usesNormal(){
        return false;
    }

    static glslClass() {
        return (varyingColor_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
;// CONCATENATED MODULE: ./src/geometries/s2e/material/all.js

;// CONCATENATED MODULE: ./src/core/shapes/BasicShape.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of 3D basic shape.
 * A basic shape is a shape that is not built on top of other shapes.
 * The types of the properties of a basic shape should not depend on the instance of this shape.
 * Indeed these properties will be passed to the shader in the form of a struct.
 * (This gives the options to animate the shapes.)
 */
class BasicShape extends Shape {

    /**
     * Constructor.
     * @param {Isometry} isom - the position of the shape
     */
    constructor(isom = undefined) {
        super(isom);
    }

    /**
     * Says whether the shape is a basic shape,
     * that it is not build on top of other shapes.
     * @type {boolean}
     */
    get isBasicShape() {
        return true;
    }
}
// EXTERNAL MODULE: ./src/geometries/s2e/shapes/ball/shaders/struct.glsl
var ball_shaders_struct = __webpack_require__(1329);
var ball_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(ball_shaders_struct);
// EXTERNAL MODULE: ./src/core/shapes/shaders/sdf.glsl.mustache
var shapes_shaders_sdf_glsl_mustache = __webpack_require__(3707);
var shapes_shaders_sdf_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shapes_shaders_sdf_glsl_mustache);
// EXTERNAL MODULE: ./src/core/shapes/shaders/gradient.glsl.mustache
var shapes_shaders_gradient_glsl_mustache = __webpack_require__(5030);
var shapes_shaders_gradient_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shapes_shaders_gradient_glsl_mustache);
;// CONCATENATED MODULE: ./src/geometries/s2e/shapes/ball/BallShape.js











class BallShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(location, radius) {

        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else if (location.isVector) {
            isom.makeTranslationFromDir(location);
        } else {
            throw new Error("BallShape: this type of location is not implemented");
        }

        super(isom);
        this.addImport((distance_default()), (direction_default()));
        this.radius = radius;
        this._center = undefined;
    }

    updateData() {
        super.updateData();
        this._center = new Point().applyIsometry(this.absoluteIsom);
    }

    get center() {
        if (this._center === undefined) {
            this.updateData();
        }
        return this._center;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isBallShape() {
        return true;
    }


    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return false;
    }


    get uniformType() {
        return 'BallShape';
    }

    static glslClass() {
        return (ball_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/s2e/shapes/localBall/shaders/struct.glsl
var localBall_shaders_struct = __webpack_require__(8967);
var localBall_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localBall_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/s2e/shapes/localBall/LocalBallShape.js











class LocalBallShape extends BasicShape {


    /**
     * Construction
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * @param {number} radius - the radius od the ball
     */
    constructor(location, radius) {

        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isPoint) {
            isom.makeTranslation(location);
        } else if (location.isVector) {
            isom.makeTranslationFromDir(location);
        } else {
            throw new Error("BallShape: this type of location is not implemented");
        }

        super(isom);
        this.addImport((distance_default()), (direction_default()));
        this.radius = radius;
        this._center = undefined;
    }

    updateData() {
        super.updateData();
        this._center = new Point().applyIsometry(this.absoluteIsom);
    }

    get center() {
        if (this._center === undefined) {
            this.updateData();
        }
        return this._center;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
    get isLocalBallShape() {
        return true;
    }


    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return false;
    }


    get hasUVMap() {
        return false;
    }


    get uniformType() {
        return 'LocalBallShape';
    }

    static glslClass() {
        return (localBall_shaders_struct_default());
    }

    glslGradient() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslSDF() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }


}
;// CONCATENATED MODULE: ./src/geometries/s2e/shapes/all.js


// EXTERNAL MODULE: ./src/core/solids/shaders/struct.glsl
var solids_shaders_struct = __webpack_require__(7499);
var solids_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(solids_shaders_struct);
;// CONCATENATED MODULE: ./src/core/solids/Solid.js






/**
 * @class
 *
 * @classdesc
 * Abstract class for solids.
 * Unlike shapes, materials or lights, solids have no existence as a structure on the shader side.
 * This comes from the fact that the type of shape / material may vary.
 * As a consequence, solids do not have a numerical ID, just a UUID.
 */
class Solid extends Generic {

    /**
     *
     * @param {Shape} shape - the shape of the solid
     * @param {Material} material - the material of the solid
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(shape, material, ptMaterial = undefined) {
        if (!shape.hasUVMap) {
            if (material.usesUVMap) {
                throw new Error('Solid: a material using UV coordinates cannot be applied to a shape without a UV map');
            }
            if (ptMaterial !== undefined && ptMaterial.usesUVMap) {
                throw new Error('Solid: a material using UV coordinates cannot be applied to a shape without a UV map');
            }
        }
        super();
        /**
         * The shape of the solids
         * @type {Shape}
         */
        this.shape = shape;
        /**
         * The material of the solid
         * @type {Material}
         */
        this.material = material;
        /**
         * The material of the solid for path tracing
         * @type {PTMaterial}
         */
        this.ptMaterial = ptMaterial;

        /**
         * Says whether the solid should be rendered or not.
         * The property can be used to define solids that will appear later in the scene
         * (because of some animation, game event, etc) without having to rebuild the shader.
         * Default is true.
         * @type{boolean}
         */
        this.isRendered = true;
        this.addImport((solids_shaders_struct_default()));
    }

    /**
     * Say if the item is a solid
     * @type {boolean}
     */
    get isSolid() {
        return true;
    }

    get isom() {
        return this.shape.isom;
    }

    get absoluteIsom() {
        return this.shape.absoluteIsom;
    }

    get isGlobal() {
        return this.shape.isGlobal;
    }

    get isLocal() {
        return this.shape.isLocal;
    }

    get uniformType() {
        return 'Solid';
    }

    /**
     * Update the data of the underlying shape.
     * It should also update the data of all itd children.
     */
    updateData() {
        this.shape.updateData();
    }

    /**
     * Set the ID of the shape.
     * Propagate the process if needed.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.shape.setId(scene);
        this.material.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the object is added to the scene.
     * By default, propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.shape.onAdd(scene);
        this.material.onAdd(scene);
        super.onAdd(scene);
    }

    static glslClass() {
        return '';
    }

    /**
     * Return a chunk of GLSL code used to compute the color of the solid.
     * This computation may involve normal and/or UV coordinates.
     * This is automatically determined from the properties of the material.
     * @return {string}
     */
    glslInstance() {
        return '';
    }

    shader(shaderBuilder) {
        this.shape.shader(shaderBuilder);
        if (shaderBuilder.useCase === PATHTRACER_RENDERER && this.ptMaterial !== undefined) {
            this.ptMaterial.shader(shaderBuilder);
        } else {
            this.material.shader(shaderBuilder);
        }
        super.shader(shaderBuilder);
    }
}
;// CONCATENATED MODULE: ./src/geometries/s2e/solids/Ball.js



/**
 * @class
 *
 * @classdesc
 * S2xE ball
 */
class Ball extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new BallShape(location, radius);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/s2e/solids/LocalBall.js



/**
 * @class
 *
 * @classdesc
 * S2xE ball
 */
class LocalBall extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {number} radius - the radius of the ball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new LocalBallShape(location, radius);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/s2e/solids/all.js




;// CONCATENATED MODULE: ./src/thurstonS2E.js













const thurstonS2E_BasicRenderer = specifyRenderer(BasicRenderer, (part1_default()), (part2_default()));
const thurstonS2E_PathTracerRenderer = specifyRenderer(PathTracerRenderer, (part1_default()), (part2_default()));
const thurstonS2E_VRRenderer = specifyRenderer(VRRenderer, (part1_default()), (part2_default()));






const thurstonS2E_Thurston = specifyThurston(Thurston, (part1_default()), (part2_default()));
const thurstonS2E_ThurstonLite = specifyThurston(ThurstonLite, (part1_default()), (part2_default()));
const thurstonS2E_ThurstonVR = specifyThurston(ThurstonVR, (part1_default()), (part2_default()));










})();

var __webpack_exports__Ball = __webpack_exports__.ec;
var __webpack_exports__BallShape = __webpack_exports__.Yb;
var __webpack_exports__BasicCamera = __webpack_exports__.QU;
var __webpack_exports__BasicPTMaterial = __webpack_exports__.ZH;
var __webpack_exports__BasicRenderer = __webpack_exports__.K9;
var __webpack_exports__CREEPING_FULL = __webpack_exports__.cK;
var __webpack_exports__CREEPING_OFF = __webpack_exports__._x;
var __webpack_exports__CREEPING_STRICT = __webpack_exports__.kj;
var __webpack_exports__CheckerboardMaterial = __webpack_exports__.Vz;
var __webpack_exports__ComplementShape = __webpack_exports__.Iy;
var __webpack_exports__DIR_DOWN = __webpack_exports__.ik;
var __webpack_exports__DIR_UP = __webpack_exports__.fY;
var __webpack_exports__DebugMaterial = __webpack_exports__.TB;
var __webpack_exports__DragVRControls = __webpack_exports__.Al;
var __webpack_exports__ESun = __webpack_exports__.Gj;
var __webpack_exports__EarthTexture = __webpack_exports__.KO;
var __webpack_exports__ExpFog = __webpack_exports__.c$;
var __webpack_exports__FlyControls = __webpack_exports__.mD;
var __webpack_exports__Fog = __webpack_exports__.yb;
var __webpack_exports__Group = __webpack_exports__.ZA;
var __webpack_exports__GroupElement = __webpack_exports__.Jz;
var __webpack_exports__InfoControls = __webpack_exports__.HZ;
var __webpack_exports__IntersectionShape = __webpack_exports__.TN;
var __webpack_exports__Isometry = __webpack_exports__.JV;
var __webpack_exports__IsotropicChaseVRControls = __webpack_exports__.Sc;
var __webpack_exports__KeyGenericControls = __webpack_exports__.Nh;
var __webpack_exports__LEFT = __webpack_exports__.RL;
var __webpack_exports__Light = __webpack_exports__._k;
var __webpack_exports__LightVRControls = __webpack_exports__.uR;
var __webpack_exports__LocalBall = __webpack_exports__.jo;
var __webpack_exports__LocalBallShape = __webpack_exports__.Q;
var __webpack_exports__MarsTexture = __webpack_exports__.Qv;
var __webpack_exports__Material = __webpack_exports__.F5;
var __webpack_exports__Matrix2 = __webpack_exports__.Uc;
var __webpack_exports__MoonTexture = __webpack_exports__.Yu;
var __webpack_exports__MoveVRControls = __webpack_exports__.Fh;
var __webpack_exports__NormalMaterial = __webpack_exports__.oB;
var __webpack_exports__PTMaterial = __webpack_exports__.pJ;
var __webpack_exports__PathTracerCamera = __webpack_exports__.GW;
var __webpack_exports__PathTracerRenderer = __webpack_exports__.DZ;
var __webpack_exports__PathTracerWrapMaterial = __webpack_exports__._K;
var __webpack_exports__PhongMaterial = __webpack_exports__.JF;
var __webpack_exports__PhongWrapMaterial = __webpack_exports__.Lv;
var __webpack_exports__Point = __webpack_exports__.E9;
var __webpack_exports__PointLight = __webpack_exports__.ce;
var __webpack_exports__Position = __webpack_exports__.Ly;
var __webpack_exports__QuadRing = __webpack_exports__.iv;
var __webpack_exports__QuadRingElement = __webpack_exports__.mH;
var __webpack_exports__QuadRingMatrix4 = __webpack_exports__.xd;
var __webpack_exports__RIGHT = __webpack_exports__.pX;
var __webpack_exports__RelPosition = __webpack_exports__.Dz;
var __webpack_exports__ResetVRControls = __webpack_exports__.Uj;
var __webpack_exports__SMOOTH_MAX_POLY = __webpack_exports__.cV;
var __webpack_exports__SMOOTH_MIN_POLY = __webpack_exports__.lR;
var __webpack_exports__Scene = __webpack_exports__.xs;
var __webpack_exports__ShootVRControls = __webpack_exports__.oC;
var __webpack_exports__SingleColorMaterial = __webpack_exports__.h8;
var __webpack_exports__Solid = __webpack_exports__.Qf;
var __webpack_exports__SunTexture = __webpack_exports__._D;
var __webpack_exports__SwitchControls = __webpack_exports__.$p;
var __webpack_exports__TeleportationSet = __webpack_exports__.xG;
var __webpack_exports__Thurston = __webpack_exports__.qC;
var __webpack_exports__ThurstonLite = __webpack_exports__.N$;
var __webpack_exports__ThurstonVR = __webpack_exports__.TO;
var __webpack_exports__UnionShape = __webpack_exports__.yI;
var __webpack_exports__VRCamera = __webpack_exports__.E6;
var __webpack_exports__VRRenderer = __webpack_exports__.zO;
var __webpack_exports__VaryingColorMaterial = __webpack_exports__.cB;
var __webpack_exports__Vector = __webpack_exports__.OW;
var __webpack_exports__WrapShape = __webpack_exports__.$9;
var __webpack_exports__XRControllerModelFactory = __webpack_exports__.iR;
var __webpack_exports__bind = __webpack_exports__.ak;
var __webpack_exports__complement = __webpack_exports__.Cy;
var __webpack_exports__cubeSet = __webpack_exports__.Rc;
var __webpack_exports__intersection = __webpack_exports__.jV;
var __webpack_exports__pathTracerWrap = __webpack_exports__.wS;
var __webpack_exports__phongWrap = __webpack_exports__.IJ;
var __webpack_exports__safeString = __webpack_exports__.p2;
var __webpack_exports__trivialSet = __webpack_exports__.dV;
var __webpack_exports__union = __webpack_exports__.G0;
var __webpack_exports__wrap = __webpack_exports__.re;
var __webpack_exports__zLoopSet = __webpack_exports__.xS;
export { __webpack_exports__Ball as Ball, __webpack_exports__BallShape as BallShape, __webpack_exports__BasicCamera as BasicCamera, __webpack_exports__BasicPTMaterial as BasicPTMaterial, __webpack_exports__BasicRenderer as BasicRenderer, __webpack_exports__CREEPING_FULL as CREEPING_FULL, __webpack_exports__CREEPING_OFF as CREEPING_OFF, __webpack_exports__CREEPING_STRICT as CREEPING_STRICT, __webpack_exports__CheckerboardMaterial as CheckerboardMaterial, __webpack_exports__ComplementShape as ComplementShape, __webpack_exports__DIR_DOWN as DIR_DOWN, __webpack_exports__DIR_UP as DIR_UP, __webpack_exports__DebugMaterial as DebugMaterial, __webpack_exports__DragVRControls as DragVRControls, __webpack_exports__ESun as ESun, __webpack_exports__EarthTexture as EarthTexture, __webpack_exports__ExpFog as ExpFog, __webpack_exports__FlyControls as FlyControls, __webpack_exports__Fog as Fog, __webpack_exports__Group as Group, __webpack_exports__GroupElement as GroupElement, __webpack_exports__InfoControls as InfoControls, __webpack_exports__IntersectionShape as IntersectionShape, __webpack_exports__Isometry as Isometry, __webpack_exports__IsotropicChaseVRControls as IsotropicChaseVRControls, __webpack_exports__KeyGenericControls as KeyGenericControls, __webpack_exports__LEFT as LEFT, __webpack_exports__Light as Light, __webpack_exports__LightVRControls as LightVRControls, __webpack_exports__LocalBall as LocalBall, __webpack_exports__LocalBallShape as LocalBallShape, __webpack_exports__MarsTexture as MarsTexture, __webpack_exports__Material as Material, __webpack_exports__Matrix2 as Matrix2, __webpack_exports__MoonTexture as MoonTexture, __webpack_exports__MoveVRControls as MoveVRControls, __webpack_exports__NormalMaterial as NormalMaterial, __webpack_exports__PTMaterial as PTMaterial, __webpack_exports__PathTracerCamera as PathTracerCamera, __webpack_exports__PathTracerRenderer as PathTracerRenderer, __webpack_exports__PathTracerWrapMaterial as PathTracerWrapMaterial, __webpack_exports__PhongMaterial as PhongMaterial, __webpack_exports__PhongWrapMaterial as PhongWrapMaterial, __webpack_exports__Point as Point, __webpack_exports__PointLight as PointLight, __webpack_exports__Position as Position, __webpack_exports__QuadRing as QuadRing, __webpack_exports__QuadRingElement as QuadRingElement, __webpack_exports__QuadRingMatrix4 as QuadRingMatrix4, __webpack_exports__RIGHT as RIGHT, __webpack_exports__RelPosition as RelPosition, __webpack_exports__ResetVRControls as ResetVRControls, __webpack_exports__SMOOTH_MAX_POLY as SMOOTH_MAX_POLY, __webpack_exports__SMOOTH_MIN_POLY as SMOOTH_MIN_POLY, __webpack_exports__Scene as Scene, __webpack_exports__ShootVRControls as ShootVRControls, __webpack_exports__SingleColorMaterial as SingleColorMaterial, __webpack_exports__Solid as Solid, __webpack_exports__SunTexture as SunTexture, __webpack_exports__SwitchControls as SwitchControls, __webpack_exports__TeleportationSet as TeleportationSet, __webpack_exports__Thurston as Thurston, __webpack_exports__ThurstonLite as ThurstonLite, __webpack_exports__ThurstonVR as ThurstonVR, __webpack_exports__UnionShape as UnionShape, __webpack_exports__VRCamera as VRCamera, __webpack_exports__VRRenderer as VRRenderer, __webpack_exports__VaryingColorMaterial as VaryingColorMaterial, __webpack_exports__Vector as Vector, __webpack_exports__WrapShape as WrapShape, __webpack_exports__XRControllerModelFactory as XRControllerModelFactory, __webpack_exports__bind as bind, __webpack_exports__complement as complement, __webpack_exports__cubeSet as cubeSet, __webpack_exports__intersection as intersection, __webpack_exports__pathTracerWrap as pathTracerWrap, __webpack_exports__phongWrap as phongWrap, __webpack_exports__safeString as safeString, __webpack_exports__trivialSet as trivialSet, __webpack_exports__union as union, __webpack_exports__wrap as wrap, __webpack_exports__zLoopSet as zLoopSet };
