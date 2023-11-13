import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_three_addons_cab687cf__ from "three/addons";
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
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    return vec4(0, float(v.data.iMarch/camera.maxSteps), v.data.totalDist / camera.maxDist, 1);");t.b("\n" + i);t.b("    //return vec4(debugColor,1);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v) {\n    return vec4(0, float(v.data.iMarch/camera.maxSteps), v.data.totalDist / camera.maxDist, 1);\n    //return vec4(debugColor,1);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8906:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    HighlightLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v) {\n    HighlightLocalWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {\n        return {{highlightMat.name}}_render(v);\n    }\n    return {{defaultMat.name}}_render(v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 1998:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    HighlightLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {");t.b("\n" + i);if(t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,0,220,289,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("    }");t.b("\n");t.b("\n" + i);if(t.s(t.d("defaultMat.usesNormal",c,p,1),c,p,0,481,540,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("defaultMat.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    HighlightLocalWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {\n        {{#highlightMat.usesNormal}}\n            return {{highlightMat.name}}_render(v, normal);\n        {{/highlightMat.usesNormal}}\n        {{^highlightMat.usesNormal}}\n            return {{highlightMat.name}}_render(v);\n        {{/highlightMat.usesNormal}}\n    }\n\n    {{#defaultMat.usesNormal}}\n        return {{defaultMat.name}}_render(v, normal);\n    {{/defaultMat.usesNormal}}\n    {{^defaultMat.usesNormal}}\n        return {{defaultMat.name}}_render(v);\n    {{/defaultMat.usesNormal}}\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 699:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    HighlightLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {");t.b("\n" + i);if(!t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,0,405,478,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,0,580,881,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,0,764,845,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    }");t.b("\n");t.b("\n" + i);if(!t.s(t.d("defaultMat.name.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,0,1119,1182,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("    ");t.b("\n" + i);if(t.s(t.d("defaultMat.name.usesNormal",c,p,1),c,p,0,1289,1570,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,0,1464,1535,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("}");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    HighlightLocalWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {\n        {{^highlightMat.usesNormal}}\n            {{^highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v);\n            {{/highlightMat.usesUVMap}}\n            {{#highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v, uv);\n            {{/highlightMat.usesUVMap}}\n        {{/highlightMat.usesNormal}}\n\n        {{#highlightMat.usesNormal}}\n            {{^highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v, normal);\n            {{/highlightMat.usesUVMap}}\n            {{#highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v, normal, uv);\n            {{/highlightMat.usesUVMap}}\n        {{/highlightMat.usesNormal}}\n    }\n\n    {{^defaultMat.name.usesNormal}}\n        {{^defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v);\n        {{/defaultMat.name.usesUVMap}}\n        {{#defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v, uv);\n        {{/defaultMat.name.usesUVMap}}\n    {{/defaultMat.name.usesNormal}}\n    \n    {{#defaultMat.name.usesNormal}}\n        {{^defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v, normal);\n        {{/defaultMat.name.usesUVMap}}\n        {{#defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v, normal, uv);\n        {{/defaultMat.name.usesUVMap}}\n    {{/defaultMat.name.usesNormal}}\n}\n\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 4261:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, vec2 uv) {");t.b("\n" + i);t.b("    HighlightLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {");t.b("\n" + i);if(t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,0,210,275,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("    }");t.b("\n");t.b("\n" + i);if(t.s(t.d("defaultMat.usesUVMap",c,p,1),c,p,0,463,518,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("defaultMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, vec2 uv) {\n    HighlightLocalWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn && material.cellBoost == v.vector.cellBoost) {\n        {{#highlightMat.usesUVMap}}\n            return {{highlightMat.name}}_render(v, uv);\n        {{/highlightMat.usesUVMap}}\n        {{^highlightMat.usesUVMap}}\n            return {{highlightMat.name}}_render(v);\n        {{/highlightMat.usesUVMap}}\n    }\n\n    {{#defaultMat.usesUVMap}}\n        return {{defaultMat.name}}_render(v, uv);\n    {{/defaultMat.usesUVMap}}\n    {{^defaultMat.usesUVMap}}\n        return {{defaultMat.name}}_render(v);\n    {{/defaultMat.usesUVMap}}\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8474:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    HighlightWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn) {");t.b("\n" + i);t.b("        return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v) {\n    HighlightWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn) {\n        return {{highlightMat.name}}_render(v);\n    }\n    return {{defaultMat.name}}_render(v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 5506:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    HighlightWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn) {");t.b("\n" + i);if(t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,0,171,240,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("    }");t.b("\n");t.b("\n" + i);if(t.s(t.d("defaultMat.usesNormal",c,p,1),c,p,0,432,491,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("defaultMat.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    HighlightWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn) {\n        {{#highlightMat.usesNormal}}\n            return {{highlightMat.name}}_render(v, normal);\n        {{/highlightMat.usesNormal}}\n        {{^highlightMat.usesNormal}}\n            return {{highlightMat.name}}_render(v);\n        {{/highlightMat.usesNormal}}\n    }\n\n    {{#defaultMat.usesNormal}}\n        return {{defaultMat.name}}_render(v, normal);\n    {{/defaultMat.usesNormal}}\n    {{^defaultMat.usesNormal}}\n        return {{defaultMat.name}}_render(v);\n    {{/defaultMat.usesNormal}}\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7397:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    HighlightWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn) {");t.b("\n" + i);if(!t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,0,356,429,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("highlightMat.usesNormal",c,p,1),c,p,0,531,832,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,0,715,796,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    }");t.b("\n");t.b("\n" + i);if(!t.s(t.d("defaultMat.name.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,0,1070,1133,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("    ");t.b("\n" + i);if(t.s(t.d("defaultMat.name.usesNormal",c,p,1),c,p,0,1240,1521,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("defaultMat.name.usesUVMap",c,p,1),c,p,0,1415,1486,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("}");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    HighlightWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn) {\n        {{^highlightMat.usesNormal}}\n            {{^highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v);\n            {{/highlightMat.usesUVMap}}\n            {{#highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v, uv);\n            {{/highlightMat.usesUVMap}}\n        {{/highlightMat.usesNormal}}\n\n        {{#highlightMat.usesNormal}}\n            {{^highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v, normal);\n            {{/highlightMat.usesUVMap}}\n            {{#highlightMat.usesUVMap}}\n                return {{highlightMat.name}}_render(v, normal, uv);\n            {{/highlightMat.usesUVMap}}\n        {{/highlightMat.usesNormal}}\n    }\n\n    {{^defaultMat.name.usesNormal}}\n        {{^defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v);\n        {{/defaultMat.name.usesUVMap}}\n        {{#defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v, uv);\n        {{/defaultMat.name.usesUVMap}}\n    {{/defaultMat.name.usesNormal}}\n    \n    {{#defaultMat.name.usesNormal}}\n        {{^defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v, normal);\n        {{/defaultMat.name.usesUVMap}}\n        {{#defaultMat.name.usesUVMap}}\n            return {{defaultMat.name}}_render(v, normal, uv);\n        {{/defaultMat.name.usesUVMap}}\n    {{/defaultMat.name.usesNormal}}\n}\n\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3045:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, vec2 uv) {");t.b("\n" + i);t.b("    HighlightWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    if(material.isHighlightOn) {");t.b("\n" + i);if(t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,0,161,226,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("highlightMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            return ");t.b(t.v(t.d("highlightMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("    }");t.b("\n");t.b("\n" + i);if(t.s(t.d("defaultMat.usesUVMap",c,p,1),c,p,0,414,469,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("defaultMat.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("        return ");t.b(t.v(t.d("defaultMat.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, vec2 uv) {\n    HighlightWrapMaterial material = {{name}};\n\n    if(material.isHighlightOn) {\n        {{#highlightMat.usesUVMap}}\n            return {{highlightMat.name}}_render(v, uv);\n        {{/highlightMat.usesUVMap}}\n        {{^highlightMat.usesUVMap}}\n            return {{highlightMat.name}}_render(v);\n        {{/highlightMat.usesUVMap}}\n    }\n\n    {{#defaultMat.usesUVMap}}\n        return {{defaultMat.name}}_render(v, uv);\n    {{/defaultMat.usesUVMap}}\n    {{^defaultMat.usesUVMap}}\n        return {{defaultMat.name}}_render(v);\n    {{/defaultMat.usesUVMap}}\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6077:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    return normalMaterialRender(v, normal);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    return normalMaterialRender(v, normal);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 1202:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("RayType ");t.b(t.v(t.f("name",c,p,0)));t.b("_setRayType(ExtVector v, RelVector n,float r) {");t.b("\n" + i);t.b("    return setRayType(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, n,r);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "RayType {{name}}_setRayType(ExtVector v, RelVector n,float r) {\n    return setRayType({{name}}, v, n,r);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 2330:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v).rgb;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, RayType rayType) {\n    if (rayType.reflect){\n        return {{name}}.specular;\n    }\n    return {{material.name}}_render(v).rgb;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 9040:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal).rgb;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, RayType rayType) {\n    if (rayType.reflect){\n        return {{name}}.specular;\n    }\n    return {{material.name}}_render(v, normal).rgb;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 588:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("        return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;   ");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv).rgb;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {\n    if (rayType.reflect){\n        return {{name}}.specular;   \n    }\n    return {{material.name}}_render(v, normal, uv).rgb;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 1365:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec3 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {");t.b("\n" + i);t.b("    if (rayType.reflect){");t.b("\n" + i);t.b("      return ");t.b(t.v(t.f("name",c,p,0)));t.b(".specular;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv).rgb;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec3 {{name}}_render(ExtVector v, RelVector normal, vec2 uv, RayType rayType) {\n    if (rayType.reflect){\n      return {{name}}.specular;\n    }\n    return {{material.name}}_render(v, uv).rgb;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8149:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n" + i);t.b(" ");t.b("\n" + i);t.b("    PhongMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,204,519,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return vec4(color, 1);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n \n    PhongMaterial material = {{name}};\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n    \n    return vec4(color, 1);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3838:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v).rgb;");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,261,587,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return vec4(color, 1);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n\n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v).rgb;\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n    \n    return vec4(color, 1);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 472:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal).rgb;");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,269,595,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("    return vec4(color, 1);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n\n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v, normal).rgb;\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n\n    return vec4(color, 1);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7660:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv).rgb;");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,282,608,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("    return vec4(color, 1);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n\n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v, normal, uv).rgb;\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n\n    return vec4(color, 1);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8204:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    bool check;");t.b("\n" + i);t.b("    RelVector dir;");t.b("\n" + i);t.b("    float intensity;");t.b("\n" + i);t.b("    int k;");t.b("\n" + i);t.b(" ");t.b("\n" + i);t.b("    PhongWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec3 baseColor = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv).rgb;");t.b("\n" + i);t.b("    vec3 color = vec3(0);");t.b("\n");t.b("\n" + i);if(t.s(t.f("lights",c,p,1),c,p,0,275,601,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        k = ");t.b(t.v(t.f("name",c,p,0)));t.b(".maxDirs;");t.b("\n" + i);t.b("        for(int j=0; j < k; j++){");t.b("\n" + i);t.b("            check = ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(v.vector, j, dir, intensity);");t.b("\n" + i);t.b("            if(check) {");t.b("\n" + i);t.b("                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, ");t.b(t.v(t.f("name",c,p,0)));t.b(".color, intensity);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("    return vec4(color, 1);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    bool check;\n    RelVector dir;\n    float intensity;\n    int k;\n \n    PhongWrapMaterial material = {{name}};\n    vec3 baseColor = {{material.name}}_render(v, uv).rgb;\n    vec3 color = vec3(0);\n\n    {{#lights}}\n        k = {{name}}.maxDirs;\n        for(int j=0; j < k; j++){\n            check = {{name}}_directions(v.vector, j, dir, intensity);\n            if(check) {\n                color = color + lightComputation(v.vector.local, normal.local, dir.local, baseColor, material, {{name}}.color, intensity);\n            }\n        }\n    {{/lights}}\n\n    return vec4(color, 1);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 5377:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    vec4 color0, color1;");t.b("\n" + i);t.b("    TransitionLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n");t.b("\n" + i);t.b("    if(v.vector.cellBoost == material.cellBoost){");t.b("\n" + i);t.b("        color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("    } else{");t.b("\n" + i);t.b("        color1 = color0;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v) {\n    vec4 color0, color1;\n    TransitionLocalWrapMaterial material = {{name}};\n\n    color0 = {{mat0.name}}_render(v);\n\n    if(v.vector.cellBoost == material.cellBoost){\n        color1 = {{mat1.name}}_render(v);\n    } else{\n        color1 = color0;\n    }\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 9441:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    TransitionLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n" + i);t.b("    vec4 color0, color1;");t.b("\n" + i);if(t.s(t.d("mat0.usesNormal",c,p,1),c,p,0,156,212,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        color0 =  ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat0.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("        color0 =  ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("\n" + i);t.b("    if(v.vector.cellBoost == material.cellBoost){");t.b("\n" + i);if(t.s(t.d("mat1.usesNormal",c,p,1),c,p,0,405,469,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            color1 =  ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat1.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("            color1 =  ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("    } else {");t.b("\n" + i);t.b("        color1 = color0;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    TransitionLocalWrapMaterial material = {{name}};\n    vec4 color0, color1;\n    {{#mat0.usesNormal}}\n        color0 =  {{mat0.name}}_render(v, normal);\n    {{/mat0.usesNormal}}\n    {{^mat0.usesNormal}}\n        color0 =  {{mat0.name}}_render(v);\n    {{/mat0.usesNormal}}\n\n    if(v.vector.cellBoost == material.cellBoost){\n        {{#mat1.usesNormal}}\n            color1 =  {{mat1.name}}_render(v, normal);\n        {{/mat1.usesNormal}}\n        {{^mat1.usesNormal}}\n            color1 =  {{mat1.name}}_render(v);\n        {{/mat1.usesNormal}}\n    } else {\n        color1 = color0;\n    }\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 9245:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    vec4 color0, color1;");t.b("\n" + i);t.b("    TransitionLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);if(!t.s(t.d("mat0.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("mat0.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("mat0.usesUVMap",c,p,1),c,p,0,296,355,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("    ");t.b("\n" + i);if(t.s(t.d("mat0.usesNormal",c,p,1),c,p,0,429,658,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("mat0.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("mat0.usesUVMap",c,p,1),c,p,0,567,634,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(!t.s(t.d("mat1.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("mat1.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("mat1.usesUVMap",c,p,1),c,p,0,834,893,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);t.b("    if(v.vector.cellBoost == material.cellBoost){");t.b("\n" + i);if(t.s(t.d("mat1.usesNormal",c,p,1),c,p,0,1017,1274,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("mat1.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("mat1.usesUVMap",c,p,1),c,p,0,1171,1246,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    } else{");t.b("\n" + i);t.b("        color1 = color0;");t.b("\n" + i);t.b("    }");t.b("\n");t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    vec4 color0, color1;\n    TransitionLocalWrapMaterial material = {{name}};\n\n    {{^mat0.usesNormal}}\n        {{^mat0.usesUVMap}}\n            color0 = {{mat0.name}}_render(v);\n        {{/mat0.usesUVMap}}\n        {{#mat0.usesUVMap}}\n            color0 = {{mat0.name}}_render(v, uv);\n        {{/mat0.usesUVMap}}\n    {{/mat0.usesNormal}}\n    \n    {{#mat0.usesNormal}}\n        {{^mat0.usesUVMap}}\n            color0 = {{mat0.name}}_render(v, normal);\n        {{/mat0.usesUVMap}}\n        {{#mat0.usesUVMap}}\n            color0 = {{mat0.name}}_render(v, normal, uv);\n        {{/mat0.usesUVMap}}\n    {{/mat0.usesNormal}}\n\n    {{^mat1.usesNormal}}\n        {{^mat1.usesUVMap}}\n            color1 = {{mat1.name}}_render(v);\n        {{/mat1.usesUVMap}}\n        {{#mat1.usesUVMap}}\n            color1 = {{mat1.name}}_render(v, uv);\n        {{/mat1.usesUVMap}}\n    {{/mat1.usesNormal}}\n\n    if(v.vector.cellBoost == material.cellBoost){\n        {{#mat1.usesNormal}}\n            {{^mat1.usesUVMap}}\n                color1 = {{mat1.name}}_render(v, normal);\n            {{/mat1.usesUVMap}}\n            {{#mat1.usesUVMap}}\n                color1 = {{mat1.name}}_render(v, normal, uv);\n            {{/mat1.usesUVMap}}\n        {{/mat1.usesNormal}}\n    } else{\n        color1 = color0;\n    }\n\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}\n\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6766:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, vec2 uv) {");t.b("\n" + i);t.b("    vec4 color0, color1;");t.b("\n" + i);t.b("    TransitionLocalWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);if(t.s(t.d("mat0.usesUVMap",c,p,1),c,p,0,147,198,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat0.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("        color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("\n" + i);t.b("    if(v.vector.cellBoost == material.cellBoost){");t.b("\n" + i);if(t.s(t.d("mat1.usesUVMap",c,p,1),c,p,0,386,445,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat1.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("    } else{");t.b("\n" + i);t.b("        color1 = color0;");t.b("\n" + i);t.b("    }");t.b("\n");t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, vec2 uv) {\n    vec4 color0, color1;\n    TransitionLocalWrapMaterial material = {{name}};\n\n    {{#mat0.usesUVMap}}\n        color0 = {{mat0.name}}_render(v, uv);\n    {{/mat0.usesUVMap}}\n    {{^mat0.usesUVMap}}\n        color0 = {{mat0.name}}_render(v);\n    {{/mat0.usesUVMap}}\n\n    if(v.vector.cellBoost == material.cellBoost){\n        {{#mat1.usesUVMap}}\n            color1 = {{mat1.name}}_render(v, uv);\n        {{/mat1.usesUVMap}}\n        {{^mat1.usesUVMap}}\n            color1 = {{mat1.name}}_render(v);\n        {{/mat1.usesUVMap}}\n    } else{\n        color1 = color0;\n    }\n\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8402:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    TransitionWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);t.b("    vec4 color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("    vec4 color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n");t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v) {\n    TransitionWrapMaterial material = {{name}};\n\n    vec4 color0 = {{mat0.name}}_render(v);\n    vec4 color1 = {{mat1.name}}_render(v);\n\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 6158:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal) {");t.b("\n" + i);t.b("    TransitionWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);if(t.s(t.d("mat0.usesNormal",c,p,1),c,p,0,127,188,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        vec4 color0 =  ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat0.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("        vec4 color0 =  ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("\n" + i);if(t.s(t.d("mat1.usesNormal",c,p,1),c,p,0,332,393,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        vec4 color1 =  ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat1.usesNormal",c,p,1),c,p,1,0,0,"")){t.b("        vec4 color1 =  ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal) {\n    TransitionWrapMaterial material = {{name}};\n\n    {{#mat0.usesNormal}}\n        vec4 color0 =  {{mat0.name}}_render(v, normal);\n    {{/mat0.usesNormal}}\n    {{^mat0.usesNormal}}\n        vec4 color0 =  {{mat0.name}}_render(v);\n    {{/mat0.usesNormal}}\n\n    {{#mat1.usesNormal}}\n        vec4 color1 =  {{mat1.name}}_render(v, normal);\n    {{/mat1.usesNormal}}\n    {{^mat1.usesNormal}}\n        vec4 color1 =  {{mat1.name}}_render(v);\n    {{/mat1.usesNormal}}\n\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 4146:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, RelVector normal, vec2 uv) {");t.b("\n" + i);t.b("    TransitionWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);if(!t.s(t.d("mat0.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("mat0.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            vec4 color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("mat0.usesUVMap",c,p,1),c,p,0,271,335,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            vec4 color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("    ");t.b("\n" + i);if(t.s(t.d("mat0.usesNormal",c,p,1),c,p,0,409,648,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("mat0.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            vec4 color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("mat0.usesUVMap",c,p,1),c,p,0,552,624,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            vec4 color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(!t.s(t.d("mat1.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("mat1.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            vec4 color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("mat1.usesUVMap",c,p,1),c,p,0,829,893,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            vec4 color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("    ");t.b("\n" + i);if(t.s(t.d("mat1.usesNormal",c,p,1),c,p,0,967,1206,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("mat1.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("            vec4 color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("mat1.usesUVMap",c,p,1),c,p,0,1110,1182,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            vec4 color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, RelVector normal, vec2 uv) {\n    TransitionWrapMaterial material = {{name}};\n\n    {{^mat0.usesNormal}}\n        {{^mat0.usesUVMap}}\n            vec4 color0 = {{mat0.name}}_render(v);\n        {{/mat0.usesUVMap}}\n        {{#mat0.usesUVMap}}\n            vec4 color0 = {{mat0.name}}_render(v, uv);\n        {{/mat0.usesUVMap}}\n    {{/mat0.usesNormal}}\n    \n    {{#mat0.usesNormal}}\n        {{^mat0.usesUVMap}}\n            vec4 color0 = {{mat0.name}}_render(v, normal);\n        {{/mat0.usesUVMap}}\n        {{#mat0.usesUVMap}}\n            vec4 color0 = {{mat0.name}}_render(v, normal, uv);\n        {{/mat0.usesUVMap}}\n    {{/mat0.usesNormal}}\n\n    {{^mat1.usesNormal}}\n        {{^mat1.usesUVMap}}\n            vec4 color1 = {{mat1.name}}_render(v);\n        {{/mat1.usesUVMap}}\n        {{#mat1.usesUVMap}}\n            vec4 color1 = {{mat1.name}}_render(v, uv);\n        {{/mat1.usesUVMap}}\n    {{/mat1.usesNormal}}\n    \n    {{#mat1.usesNormal}}\n        {{^mat1.usesUVMap}}\n            vec4 color1 = {{mat1.name}}_render(v, normal);\n        {{/mat1.usesUVMap}}\n        {{#mat1.usesUVMap}}\n            vec4 color1 = {{mat1.name}}_render(v, normal, uv);\n        {{/mat1.usesUVMap}}\n    {{/mat1.usesNormal}}\n\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}\n\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 2332:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, vec2 uv) {");t.b("\n" + i);t.b("    TransitionWrapMaterial material = ");t.b(t.v(t.f("name",c,p,0)));t.b(";");t.b("\n");t.b("\n" + i);if(t.s(t.d("mat0.usesUVMap",c,p,1),c,p,0,117,173,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        vec4 color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat0.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("        vec4 color0 = ");t.b(t.v(t.d("mat0.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("\n" + i);if(t.s(t.d("mat1.usesUVMap",c,p,1),c,p,0,312,368,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        vec4 color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}if(!t.s(t.d("mat1.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("        vec4 color1 = ");t.b(t.v(t.d("mat1.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};t.b("\n" + i);t.b("    return (1. - material.ratio) * color0 + material.ratio * color1;");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, vec2 uv) {\n    TransitionWrapMaterial material = {{name}};\n\n    {{#mat0.usesUVMap}}\n        vec4 color0 = {{mat0.name}}_render(v, uv);\n    {{/mat0.usesUVMap}}\n    {{^mat0.usesUVMap}}\n        vec4 color0 = {{mat0.name}}_render(v);\n    {{/mat0.usesUVMap}}\n\n    {{#mat1.usesUVMap}}\n        vec4 color1 = {{mat1.name}}_render(v, uv);\n    {{/mat1.usesUVMap}}\n    {{^mat1.usesUVMap}}\n        vec4 color1 = {{mat1.name}}_render(v);\n    {{/mat1.usesUVMap}}\n\n    return (1. - material.ratio) * color0 + material.ratio * color1;\n}\n", H);return T.render.apply(T, arguments); };

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

/***/ 7577:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("bool ");t.b(t.v(t.f("name",c,p,0)));t.b("_directions(RelVector v, int i, out RelVector dir, out float intensity) {");t.b("\n" + i);t.b("    return directions(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, i, dir, intensity);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "bool {{name}}_directions(RelVector v, int i, out RelVector dir, out float intensity) {\n    return directions({{name}}, v, i, dir, intensity);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 8778:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v) {");t.b("\n" + i);t.b("    return render(");t.b(t.v(t.f("name",c,p,0)));t.b(", v);");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v) {\n    return render({{name}}, v);\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 1215:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec4 ");t.b(t.v(t.f("name",c,p,0)));t.b("_render(ExtVector v, vec2 uv) {");t.b("\n" + i);t.b("    return render(");t.b(t.v(t.f("name",c,p,0)));t.b(", v, uv);");t.b("\n" + i);t.b("}");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "vec4 {{name}}_render(ExtVector v, vec2 uv) {\n    return render({{name}}, v, uv);\n}\n", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 2044:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/***********************************************************************************************************************");t.b("\n" + i);t.b(" ***********************************************************************************************************************");t.b("\n" + i);t.b(" * ");t.b("\n" + i);t.b(" * Defines the scene SDF and scene Material computations used during the ray-marching and lightening.");t.b("\n" + i);t.b(" *");t.b("\n" + i);t.b(" ***********************************************************************************************************************");t.b("\n" + i);t.b(" **********************************************************************************************************************/");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b(" * Distance along the geodesic directed by \\`v\\` to the closest object in the local scene");t.b("\n" + i);t.b(" * @param[in] v the direction to follows");t.b("\n" + i);t.b(" * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b(" * @param[out] objId the ID of the solid we hit.");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float _localSceneSDF(RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    hit = HIT_NOTHING;");t.b("\n" + i);t.b("    float res = camera.maxDist;");t.b("\n" + i);t.b("    float dist;");t.b("\n");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,1024,1403,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isLocal",c,p,1),c,p,0,1045,1386,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("name",c,p,0)));t.b(".isRendered && ");t.b(t.v(t.f("name",c,p,0)));t.b("_isRenderedHack){");t.b("\n" + i);t.b("                dist = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("                if(dist < camera.threshold) {");t.b("\n" + i);t.b("                    hit = HIT_SOLID;");t.b("\n" + i);t.b("                    objId = ");t.b(t.v(t.f("id",c,p,0)));t.b(";");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return res;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b("* Distance along the geodesic directed by \\`v\\` to the closest object in the local scene");t.b("\n" + i);t.b("* When nearest neighbor is on, the representation of v can be updated");t.b("\n" + i);t.b("* so that the local vector is in a neighbor of the fundamental domain.");t.b("\n" + i);t.b("* This is used to compute correctly the normal / uv map of a local object.");t.b("\n" + i);t.b("* @param[in] v the direction to follows");t.b("\n" + i);t.b("* @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b("* @param[out] objId the ID of the solid we hit.");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("float localSceneSDF(inout RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    float res, dist;");t.b("\n" + i);t.b("    dist = _localSceneSDF(v, hit, objId);");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        return dist;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    res = dist;");t.b("\n" + i);t.b("    ");t.b("\n" + i);if(t.s(t.d("set.usesNearestNeighbors",c,p,1),c,p,0,2169,2585,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        RelVector aux = v;");t.b("\n" + i);t.b("        ");t.b("\n" + i);if(t.s(t.d("set.neighbors",c,p,1),c,p,0,2232,2533,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                aux = rewrite(v, ");t.b(t.v(t.d("elt.name",c,p,0)));t.b(", ");t.b(t.v(t.d("inv.name",c,p,0)));t.b(");");t.b("\n" + i);t.b("                dist = _localSceneSDF(aux, hit, objId);");t.b("\n" + i);t.b("                if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("                    v = aux;");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("                ");t.b("\n" + i);});c.pop();}t.b("        ");t.b("\n" + i);t.b("        return res;");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.d("set.usesNearestNeighbors",c,p,1),c,p,1,0,0,"")){t.b("        return res;");t.b("\n" + i);};t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b(" * Distance along the geodesic directed by \\`v\\` to the closest object in the global scene");t.b("\n" + i);t.b(" * @param[in] v the direction to follows");t.b("\n" + i);t.b(" * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)");t.b("\n" + i);t.b(" * @param[out] objID the ID of the solid we hit.");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float globalSceneSDF(RelVector v, out int hit, out int objId){");t.b("\n" + i);t.b("    hit = HIT_NOTHING;");t.b("\n" + i);t.b("    float res = camera.maxDist;");t.b("\n" + i);t.b("    float dist;");t.b("\n" + i);t.b("    ");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,3143,3524,"{{ }}")){t.rs(c,p,function(c,p,t){if(t.s(t.f("isGlobal",c,p,1),c,p,0,3165,3506,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("name",c,p,0)));t.b(".isRendered && ");t.b(t.v(t.f("name",c,p,0)));t.b("_isRenderedHack){");t.b("\n" + i);t.b("                dist = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_sdf(v);");t.b("\n" + i);t.b("                if(dist < camera.threshold) {");t.b("\n" + i);t.b("                    hit = HIT_SOLID;");t.b("\n" + i);t.b("                    objId = ");t.b(t.v(t.f("id",c,p,0)));t.b(";");t.b("\n" + i);t.b("                    return dist;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                res = min(res, dist);");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}});c.pop();}t.b("    ");t.b("\n" + i);t.b("    return res;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/***********************************************************************************************************************\n ***********************************************************************************************************************\n * \n * Defines the scene SDF and scene Material computations used during the ray-marching and lightening.\n *\n ***********************************************************************************************************************\n **********************************************************************************************************************/\n\n/**\n * Distance along the geodesic directed by \\`v\\` to the closest object in the local scene\n * @param[in] v the direction to follows\n * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n * @param[out] objId the ID of the solid we hit.\n */\nfloat _localSceneSDF(RelVector v, out int hit, out int objId){\n    hit = HIT_NOTHING;\n    float res = camera.maxDist;\n    float dist;\n\n    {{#scene.solids}}\n        {{#isLocal}}\n            if({{name}}.isRendered && {{name}}_isRenderedHack){\n                dist = {{shape.name}}_sdf(v);\n                if(dist < camera.threshold) {\n                    hit = HIT_SOLID;\n                    objId = {{id}};\n                    return dist;\n                }\n                res = min(res, dist);\n            }\n        {{/isLocal}}\n    {{/scene.solids}}\n    \n    return res;\n}\n\n/**\n* Distance along the geodesic directed by \\`v\\` to the closest object in the local scene\n* When nearest neighbor is on, the representation of v can be updated\n* so that the local vector is in a neighbor of the fundamental domain.\n* This is used to compute correctly the normal / uv map of a local object.\n* @param[in] v the direction to follows\n* @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n* @param[out] objId the ID of the solid we hit.\n*/\nfloat localSceneSDF(inout RelVector v, out int hit, out int objId){\n    float res, dist;\n    dist = _localSceneSDF(v, hit, objId);\n    if(hit == HIT_SOLID) {\n        return dist;\n    }\n    res = dist;\n    \n    {{#set.usesNearestNeighbors}}\n        RelVector aux = v;\n        \n        {{#set.neighbors}}\n                aux = rewrite(v, {{elt.name}}, {{inv.name}});\n                dist = _localSceneSDF(aux, hit, objId);\n                if(hit == HIT_SOLID) {\n                    v = aux;\n                    return dist;\n                }\n                res = min(res, dist);\n                \n        {{/set.neighbors}}\n        \n        return res;\n    {{/set.usesNearestNeighbors}}\n\n    {{^set.usesNearestNeighbors}}\n        return res;\n    {{/set.usesNearestNeighbors}}\n}\n\n\n/**\n * Distance along the geodesic directed by \\`v\\` to the closest object in the global scene\n * @param[in] v the direction to follows\n * @param[out] hit say if we hit an object (1), nothing (0) or if there is a bug (-1)\n * @param[out] objID the ID of the solid we hit.\n */\nfloat globalSceneSDF(RelVector v, out int hit, out int objId){\n    hit = HIT_NOTHING;\n    float res = camera.maxDist;\n    float dist;\n    \n    {{#scene.solids}}\n        {{#isGlobal}}\n            if({{name}}.isRendered && {{name}}_isRenderedHack){\n                dist = {{shape.name}}_sdf(v);\n                if(dist < camera.threshold) {\n                    hit = HIT_SOLID;\n                    objId = {{id}};\n                    return dist;\n                }\n                res = min(res, dist);\n            }\n        {{/isGlobal}}\n    {{/scene.solids}}\n    \n    return res;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 7781:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("VectorData initVectorData(){");t.b("\n" + i);t.b("    return VectorData(0., 0., 0., false, 0, 0, false, vec4(0), vec4(1));");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("void updateVectorDataFromSolid(inout ExtVector v, int objId){");t.b("\n" + i);t.b("    RelVector normal;");t.b("\n" + i);t.b("    vec2 uv;");t.b("\n" + i);t.b("    vec4 color;");t.b("\n" + i);t.b("    vec4 reflectivity;");t.b("\n" + i);t.b("    float opacity;");t.b("\n" + i);t.b("    float t;");t.b("\n");t.b("\n" + i);t.b("    switch(objId){");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,315,5918,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);t.b("        case ");t.b(t.v(t.f("id",c,p,0)));t.b(":");t.b("\n" + i);if(t.s(t.d("material.isTransparent",c,p,1),c,p,0,373,2190,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,589,724,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,822,1314,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,1071,1278,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);t.b("            if(v.data.iBounce == maxBounces){");t.b("\n" + i);t.b("                opacity = 1.;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            else {");t.b("\n" + i);t.b("                opacity = color.a;");t.b("\n" + i);t.b("            }");t.b("\n");t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,1525,1604,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                //color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("            if(opacity == 1.) {");t.b("\n" + i);t.b("                v.data.stop = true;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            else{");t.b("\n" + i);t.b("                v.data.stop = false;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * opacity * color;");t.b("\n" + i);t.b("            v.data.leftToComputeColor = (1. - opacity) * v.data.leftToComputeColor;");t.b("\n" + i);t.b("            ");t.b(t.v(t.f("name",c,p,0)));t.b("_isRenderedHack = false;");t.b("\n" + i);t.b("            v.data.lastBounceDist = 0.;");t.b("\n" + i);t.b("            v.data.iBounce = v.data.iBounce + 1;");t.b("\n" + i);t.b("            //t = 20. * camera.threshold / abs(geomDot(v.vector, normal));");t.b("\n" + i);t.b("            //v = flow(v, t);");t.b("\n");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.d("material.isTransparent",c,p,1),c,p,1,0,0,"")){t.b("\n" + i);if(t.s(t.d("material.isReflecting",c,p,1),c,p,0,2294,4409,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);t.b("                if(v.data.iBounce == maxBounces){");t.b("\n" + i);t.b("                    reflectivity = vec4(0);");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                else {");t.b("\n" + i);t.b("                    reflectivity = vec4(");t.b(t.v(t.d("material.name",c,p,0)));t.b(".reflectivity,1);");t.b("\n" + i);t.b("                }");t.b("\n");t.b("\n" + i);t.b("                normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                // in general the gradient is not necessarily a unit vector");t.b("\n" + i);t.b("                normal = geomNormalize(normal);");t.b("\n");t.b("\n" + i);if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,2944,3091,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,3197,3593,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,3398,3553,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,3649,3734,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("                if(length(reflectivity) == 0.) {");t.b("\n" + i);t.b("                    v.data.stop = true;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                else{");t.b("\n" + i);t.b("                    v.data.stop = false;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * (vec4(1) - reflectivity) * color;");t.b("\n" + i);t.b("                v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;");t.b("\n" + i);t.b("                v.vector = geomReflect(v.vector,normal);");t.b("\n" + i);t.b("                v.data.lastBounceDist = 0.;");t.b("\n" + i);t.b("                v.data.iBounce = v.data.iBounce + 1;");t.b("\n" + i);t.b("                t = 20. * camera.threshold / abs(geomDot(v.vector, normal));");t.b("\n" + i);t.b("                v = flow(v, t);");t.b("\n");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.d("material.isReflecting",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,4710,4857,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,4963,5495,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,5232,5455,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,5551,5636,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;");t.b("\n" + i);t.b("                v.data.leftToComputeColor = vec4(0);");t.b("\n" + i);t.b("                v.data.stop = true;");t.b("\n" + i);};t.b("\n" + i);};t.b("        break;");t.b("\n");t.b("\n" + i);});c.pop();}t.b("    }");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("void updateVectorData(inout ExtVector v, int hit, int objId){");t.b("\n" + i);t.b("    if (hit == HIT_DEBUG) {");t.b("\n" + i);t.b("        v.data.pixel = debugColor;");t.b("\n" + i);t.b("        v.data.leftToComputeColor = vec4(0);");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if (hit == HIT_NOTHING) {");t.b("\n" + i);t.b("        vec4 color = ");t.b(t.v(t.d("scene.background.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("        v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;");t.b("\n" + i);t.b("        v.data.leftToComputeColor = vec4(0);");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        updateVectorDataFromSolid(v, objId);");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "VectorData initVectorData(){\n    return VectorData(0., 0., 0., false, 0, 0, false, vec4(0), vec4(1));\n}\n\n\nvoid updateVectorDataFromSolid(inout ExtVector v, int objId){\n    RelVector normal;\n    vec2 uv;\n    vec4 color;\n    vec4 reflectivity;\n    float opacity;\n    float t;\n\n    switch(objId){\n    {{#scene.solids}}\n\n        case {{id}}:\n        {{#material.isTransparent}}\n\n            {{^material.usesNormal}}\n                {{^material.usesUVMap}}\n                    color =  {{material.name}}_render(v);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n\n            {{#material.usesNormal}}\n                {{^material.usesUVMap}}\n                    normal = {{shape.name}}_gradient(v.vector);\n                    color = {{material.name}}_render(v, normal);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    normal = {{shape.name}}_gradient(v.vector);\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, normal, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n\n            if(v.data.iBounce == maxBounces){\n                opacity = 1.;\n            }\n            else {\n                opacity = color.a;\n            }\n\n            {{#scene.fog}}\n                //color = applyFog(color, v.data.lastBounceDist);\n            {{/scene.fog}}\n\n            if(opacity == 1.) {\n                v.data.stop = true;\n            }\n            else{\n                v.data.stop = false;\n            }\n            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * opacity * color;\n            v.data.leftToComputeColor = (1. - opacity) * v.data.leftToComputeColor;\n            {{name}}_isRenderedHack = false;\n            v.data.lastBounceDist = 0.;\n            v.data.iBounce = v.data.iBounce + 1;\n            //t = 20. * camera.threshold / abs(geomDot(v.vector, normal));\n            //v = flow(v, t);\n\n        {{/material.isTransparent}}\n\n        {{^material.isTransparent}}\n\n            {{#material.isReflecting}}\n\n                if(v.data.iBounce == maxBounces){\n                    reflectivity = vec4(0);\n                }\n                else {\n                    reflectivity = vec4({{material.name}}.reflectivity,1);\n                }\n\n                normal = {{shape.name}}_gradient(v.vector);\n                // in general the gradient is not necessarily a unit vector\n                normal = geomNormalize(normal);\n\n                {{^material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        color =  {{material.name}}_render(v);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        color = {{material.name}}_render(v, normal);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, normal, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#scene.fog}}\n                    color = applyFog(color, v.data.lastBounceDist);\n                {{/scene.fog}}\n\n                if(length(reflectivity) == 0.) {\n                    v.data.stop = true;\n                }\n                else{\n                    v.data.stop = false;\n                }\n                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * (vec4(1) - reflectivity) * color;\n                v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;\n                v.vector = geomReflect(v.vector,normal);\n                v.data.lastBounceDist = 0.;\n                v.data.iBounce = v.data.iBounce + 1;\n                t = 20. * camera.threshold / abs(geomDot(v.vector, normal));\n                v = flow(v, t);\n\n            {{/material.isReflecting}}\n\n            {{^material.isReflecting}}\n                {{^material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        color =  {{material.name}}_render(v);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        normal = {{shape.name}}_gradient(v.vector);\n                        color = {{material.name}}_render(v, normal);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        normal = {{shape.name}}_gradient(v.vector);\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, normal, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#scene.fog}}\n                    color = applyFog(color, v.data.lastBounceDist);\n                {{/scene.fog}}\n\n                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;\n                v.data.leftToComputeColor = vec4(0);\n                v.data.stop = true;\n            {{/material.isReflecting}}\n\n        {{/material.isTransparent}}\n        break;\n\n    {{/scene.solids}}\n    }\n}\n\nvoid updateVectorData(inout ExtVector v, int hit, int objId){\n    if (hit == HIT_DEBUG) {\n        v.data.pixel = debugColor;\n        v.data.leftToComputeColor = vec4(0);\n        v.data.stop = true;\n        return;\n    }\n    if (hit == HIT_NOTHING) {\n        vec4 color = {{scene.background.name}}_render(v);\n        v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;\n        v.data.leftToComputeColor = vec4(0);\n        v.data.stop = true;\n        return;\n    }\n    if(hit == HIT_SOLID) {\n        updateVectorDataFromSolid(v, objId);\n        return;\n    }\n}", H);return T.render.apply(T, arguments); };

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
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("VectorData initVectorData(){");t.b("\n" + i);t.b("    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1), ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".absorb, ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".volumeEmission, ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".opticalDepth, false);");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("void roulette(inout ExtVector v){");t.b("\n" + i);t.b("    // as the light left gets smaller, the ray is more likely to get terminated early.");t.b("\n" + i);t.b("    // survivors have their value boosted to make up for fewer samples being in the average.");t.b("\n" + i);t.b("    float p = max(v.data.light.r, max(v.data.light.g, v.data.light.b));");t.b("\n" + i);t.b("    if (randomFloat() > p){");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    // add the energy we 'lose' by randomly terminating paths");t.b("\n" + i);t.b("    v.data.light = v.data.light / p;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("void updateVectorDataFromSolid(inout ExtVector v, int objId){");t.b("\n" + i);t.b("    RelVector normal;");t.b("\n" + i);t.b("    RayType rayType;");t.b("\n" + i);t.b("    vec2 uv;");t.b("\n" + i);t.b("    vec3 color;");t.b("\n" + i);t.b("    vec3 reflectivity;");t.b("\n" + i);t.b("    float hackCoeff = 1.;");t.b("\n" + i);t.b("    float r; /** ratio of IOR */");t.b("\n" + i);t.b("    float nextIOR; /** IOR of the neighbor solid */");t.b("\n" + i);t.b("    vec3 nextAbsorb; /** absorb of the neighbor solid */");t.b("\n" + i);t.b("    vec3 nextEmission;/** volumetric emission of the neighbor solid */");t.b("\n" + i);t.b("    float nextOpticalDepth;/** optical depth of the neighbor solid */");t.b("\n" + i);t.b("    bool nextIsInside = true;");t.b("\n");t.b("\n" + i);t.b("    RelVector diffuseDir;");t.b("\n" + i);t.b("    RelVector reflectDir;");t.b("\n" + i);t.b("    RelVector refractDir;");t.b("\n");t.b("\n" + i);t.b("    // get a uniformly distributed vector on the sphere");t.b("\n" + i);t.b("    RelVector random = randomVector(v.vector);");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("    //get volumetric coloring:");t.b("\n" + i);t.b("    //portion of light is absorbed.");t.b("\n" + i);t.b("    vec3 volAbsorb = exp((-v.data.currentAbsorb) * v.data.lastBounceDist);");t.b("\n" + i);t.b("    ");t.b("\n" + i);t.b("    //light is emitted along the journey (linear or expoenential pickup)");t.b("\n" + i);t.b("    vec3 volEmit = v.data.currentEmission * v.data.lastBounceDist;");t.b("\n" + i);t.b("    //vec3 volEmit = exp(v.data.currentEmission * v.data.lastBounceDist)-vec3(1);");t.b("\n");t.b("\n" + i);t.b("    //use these quantities to update pixel and light:");t.b("\n" + i);t.b("    v.data.light = v.data.light * volAbsorb;");t.b("\n" + i);t.b("    v.data.pixel = v.data.pixel + v.data.light*volEmit;");t.b("\n" + i);t.b("    v.data.light = v.data.light + volEmit;//the absorbtion doesn't distort the light output");t.b("\n" + i);t.b("    ");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("switch(objId){");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,2036,5260,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("    ");t.b("\n" + i);t.b("        case ");t.b(t.v(t.f("id",c,p,0)));t.b(":");t.b("\n" + i);t.b("            normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("            normal = geomNormalize(normal);");t.b("\n");t.b("\n" + i);t.b("            ");t.b("\n" + i);t.b("            // get info and reset normal based on which side we are on.");t.b("\n" + i);t.b("            // starting assumption: in the \"air\"");t.b("\n" + i);t.b("            r = ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".ior / ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".ior;");t.b("\n" + i);t.b("            nextAbsorb = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".absorb;");t.b("\n" + i);t.b("            nextEmission = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".volumeEmission;");t.b("\n" + i);t.b("            nextOpticalDepth = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".opticalDepth;");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(v.data.isInside){");t.b("\n" + i);t.b("                //things to change if we are inside a material instead:");t.b("\n" + i);t.b("                nextObjectProperties(normal, nextIOR, nextAbsorb,nextEmission, nextOpticalDepth,nextIsInside);");t.b("\n" + i);t.b("                r = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".ior / nextIOR;");t.b("\n" + i);t.b("                normal = negate(normal);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            rayType = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b("_setRayType(v, normal,r);");t.b("\n" + i);t.b("        ");t.b("\n" + i);if(!t.s(t.d("ptMaterial.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                color =  ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b("_render(v, normal, rayType);");t.b("\n" + i);};if(t.s(t.d("ptMaterial.usesUVMap",c,p,1),c,p,0,3160,3302,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                color = ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b("_render(v, normal, uv, rayType);");t.b("\n" + i);});c.pop();}t.b("        ");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("        // hack to make sure that lights are not too bright");t.b("\n" + i);t.b("            if(v.data.iBounce == 0){");t.b("\n" + i);t.b("                hackCoeff = 0.2;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            //apply surface effects");t.b("\n" + i);t.b("            v.data.pixel = v.data.pixel + hackCoeff * v.data.light * ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".emission;");t.b("\n" + i);t.b("            if(!rayType.refract){");t.b("\n" + i);t.b("                v.data.light = v.data.light * color / max(rayType.chance, 0.0001);");t.b("\n" + i);t.b("             }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            // update the ray direction");t.b("\n" + i);t.b("            // diffuse uses a normal oriented cosine weighted hemisphere sample.");t.b("\n" + i);t.b("            diffuseDir = geomNormalize(add(normal, random));");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(rayType.diffuse){");t.b("\n" + i);t.b("                v.vector = diffuseDir;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(rayType.reflect){");t.b("\n" + i);t.b("                // perfectly smooth specular uses the reflection ray.");t.b("\n" + i);t.b("                reflectDir = geomReflect(v.vector, normal);");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("                // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared");t.b("\n" + i);t.b("               // reflectDir = geomNormalize(geomMix(reflectDir, diffuseDir, ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness * ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness));");t.b("\n" + i);t.b("                v.vector = reflectDir;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        ");t.b("\n" + i);t.b("            if(rayType.refract){");t.b("\n" + i);t.b("                    refractDir = geomRefract(v.vector,normal, r);");t.b("\n" + i);t.b("                    // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared");t.b("\n" + i);t.b("                    refractDir = geomNormalize(geomMix(refractDir, diffuseDir, ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness * ");t.b(t.v(t.d("ptMaterial.name",c,p,0)));t.b(".roughness));");t.b("\n" + i);t.b("                    v.data.isInside = nextIsInside;");t.b("\n" + i);t.b("                    v.data.currentAbsorb = nextAbsorb;");t.b("\n" + i);t.b("                    v.data.currentEmission = nextEmission;");t.b("\n" + i);t.b("                    v.data.currentOpticalDepth = nextOpticalDepth;");t.b("\n" + i);t.b("                    v.vector = refractDir;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            break;");t.b("\n" + i);t.b("    ");t.b("\n" + i);});c.pop();}t.b("    }");t.b("\n");t.b("\n" + i);t.b("    v.data.lastBounceDist = 0.;");t.b("\n" + i);t.b("    v.data.iBounce = v.data.iBounce + 1;");t.b("\n" + i);t.b("    // be carefull, v is not normal to the surface");t.b("\n" + i);t.b("    // if the time we flow is too small, we are still below the camera threshold");t.b("\n" + i);t.b("    float t = 20. * camera.threshold / abs(geomDot(v.vector, normal));");t.b("\n" + i);t.b("    v = flow(v, t);");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("void updateVectorData(inout ExtVector v, int hit, int objId){");t.b("\n" + i);t.b("    if (hit == HIT_DEBUG) {");t.b("\n" + i);t.b("        v.data.pixel = debugColor.rgb;");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if (hit == HIT_NOTHING) {");t.b("\n" + i);t.b("        vec3 bgColor = ");t.b(t.v(t.d("scene.ptBackground.name",c,p,0)));t.b(".diffuse;");t.b("\n" + i);t.b("        v.data.pixel = v.data.pixel + v.data.light * bgColor;");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        updateVectorDataFromSolid(v, objId);");t.b("\n" + i);t.b("        roulette(v);");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "VectorData initVectorData(){\n    return VectorData(0., 0., 0., false, 0, 0, false, vec3(0), vec3(1), {{scene.ptBackground.name}}.absorb, {{scene.ptBackground.name}}.volumeEmission, {{scene.ptBackground.name}}.opticalDepth, false);\n}\n\n\n\nvoid roulette(inout ExtVector v){\n    // as the light left gets smaller, the ray is more likely to get terminated early.\n    // survivors have their value boosted to make up for fewer samples being in the average.\n    float p = max(v.data.light.r, max(v.data.light.g, v.data.light.b));\n    if (randomFloat() > p){\n        v.data.stop = true;\n    }\n    // add the energy we 'lose' by randomly terminating paths\n    v.data.light = v.data.light / p;\n}\n\n\n\nvoid updateVectorDataFromSolid(inout ExtVector v, int objId){\n    RelVector normal;\n    RayType rayType;\n    vec2 uv;\n    vec3 color;\n    vec3 reflectivity;\n    float hackCoeff = 1.;\n    float r; /** ratio of IOR */\n    float nextIOR; /** IOR of the neighbor solid */\n    vec3 nextAbsorb; /** absorb of the neighbor solid */\n    vec3 nextEmission;/** volumetric emission of the neighbor solid */\n    float nextOpticalDepth;/** optical depth of the neighbor solid */\n    bool nextIsInside = true;\n\n    RelVector diffuseDir;\n    RelVector reflectDir;\n    RelVector refractDir;\n\n    // get a uniformly distributed vector on the sphere\n    RelVector random = randomVector(v.vector);\n\n\n\n\n\n    //get volumetric coloring:\n    //portion of light is absorbed.\n    vec3 volAbsorb = exp((-v.data.currentAbsorb) * v.data.lastBounceDist);\n    \n    //light is emitted along the journey (linear or expoenential pickup)\n    vec3 volEmit = v.data.currentEmission * v.data.lastBounceDist;\n    //vec3 volEmit = exp(v.data.currentEmission * v.data.lastBounceDist)-vec3(1);\n\n    //use these quantities to update pixel and light:\n    v.data.light = v.data.light * volAbsorb;\n    v.data.pixel = v.data.pixel + v.data.light*volEmit;\n    v.data.light = v.data.light + volEmit;//the absorbtion doesn't distort the light output\n    \n\n\n\n\n\n\nswitch(objId){\n    {{#scene.solids}}\n    \n        case {{id}}:\n            normal = {{shape.name}}_gradient(v.vector);\n            normal = geomNormalize(normal);\n\n            \n            // get info and reset normal based on which side we are on.\n            // starting assumption: in the \"air\"\n            r = {{scene.ptBackground.name}}.ior / {{ptMaterial.name}}.ior;\n            nextAbsorb = {{ptMaterial.name}}.absorb;\n            nextEmission = {{ptMaterial.name}}.volumeEmission;\n            nextOpticalDepth = {{ptMaterial.name}}.opticalDepth;\n        \n            if(v.data.isInside){\n                //things to change if we are inside a material instead:\n                nextObjectProperties(normal, nextIOR, nextAbsorb,nextEmission, nextOpticalDepth,nextIsInside);\n                r = {{ptMaterial.name}}.ior / nextIOR;\n                normal = negate(normal);\n            }\n        \n            rayType = {{ptMaterial.name}}_setRayType(v, normal,r);\n        \n            {{^ptMaterial.usesUVMap}}\n                color =  {{ptMaterial.name}}_render(v, normal, rayType);\n            {{/ptMaterial.usesUVMap}}\n            {{#ptMaterial.usesUVMap}}\n                uv = {{shape.name}}_uvMap(v.vector);\n                color = {{ptMaterial.name}}_render(v, normal, uv, rayType);\n            {{/ptMaterial.usesUVMap}}\n        \n        \n        // hack to make sure that lights are not too bright\n            if(v.data.iBounce == 0){\n                hackCoeff = 0.2;\n            }\n        \n            //apply surface effects\n            v.data.pixel = v.data.pixel + hackCoeff * v.data.light * {{ptMaterial.name}}.emission;\n            if(!rayType.refract){\n                v.data.light = v.data.light * color / max(rayType.chance, 0.0001);\n             }\n        \n            // update the ray direction\n            // diffuse uses a normal oriented cosine weighted hemisphere sample.\n            diffuseDir = geomNormalize(add(normal, random));\n        \n            if(rayType.diffuse){\n                v.vector = diffuseDir;\n            }\n        \n            if(rayType.reflect){\n                // perfectly smooth specular uses the reflection ray.\n                reflectDir = geomReflect(v.vector, normal);\n        \n                // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared\n               // reflectDir = geomNormalize(geomMix(reflectDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));\n                v.vector = reflectDir;\n            }\n        \n            if(rayType.refract){\n                    refractDir = geomRefract(v.vector,normal, r);\n                    // rough (glossy) specular lerps from the smooth specular to the rough diffuse by the material roughness squared\n                    refractDir = geomNormalize(geomMix(refractDir, diffuseDir, {{ptMaterial.name}}.roughness * {{ptMaterial.name}}.roughness));\n                    v.data.isInside = nextIsInside;\n                    v.data.currentAbsorb = nextAbsorb;\n                    v.data.currentEmission = nextEmission;\n                    v.data.currentOpticalDepth = nextOpticalDepth;\n                    v.vector = refractDir;\n            }\n            break;\n    \n    {{/scene.solids}}\n    }\n\n    v.data.lastBounceDist = 0.;\n    v.data.iBounce = v.data.iBounce + 1;\n    // be carefull, v is not normal to the surface\n    // if the time we flow is too small, we are still below the camera threshold\n    float t = 20. * camera.threshold / abs(geomDot(v.vector, normal));\n    v = flow(v, t);\n}\n\nvoid updateVectorData(inout ExtVector v, int hit, int objId){\n    if (hit == HIT_DEBUG) {\n        v.data.pixel = debugColor.rgb;\n        v.data.stop = true;\n        return;\n    }\n    if (hit == HIT_NOTHING) {\n        vec3 bgColor = {{scene.ptBackground.name}}.diffuse;\n        v.data.pixel = v.data.pixel + v.data.light * bgColor;\n        v.data.stop = true;\n        return;\n    }\n    if(hit == HIT_SOLID) {\n        updateVectorDataFromSolid(v, objId);\n        roulette(v);\n        return;\n    }\n}", H);return T.render.apply(T, arguments); };

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

/***/ 4355:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("vec2 ");t.b(t.v(t.f("name",c,p,0)));t.b("_uvMap(RelVector v){");t.b("\n" + i);t.b("    return uvMap(");t.b(t.v(t.f("name",c,p,0)));t.b(", v);");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "vec2 {{name}}_uvMap(RelVector v){\n    return uvMap({{name}}, v);\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 3148:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Default creeping function (binary search)");t.b("\n" + i);t.b(" * @param start starting point of the creeping");t.b("\n" + i);t.b(" * @param outside vector out of the boundary (obtained from the previous flow, or the previous creeping)");t.b("\n" + i);t.b(" * @param offset how long we flow after passing the boundary");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(ExtVector v, ExtVector outside,  float offset){");t.b("\n" + i);t.b("    ExtVector try = outside;");t.b("\n" + i);t.b("    float sIn = 0.;");t.b("\n" + i);t.b("    float sOut = try.data.lastFlowDist;");t.b("\n" + i);t.b("    float s;");t.b("\n" + i);t.b("    for(int i=0; i < 100; i++){");t.b("\n" + i);t.b("        if(sOut - sIn < offset){");t.b("\n" + i);t.b("            break;");t.b("\n" + i);t.b("        }");t.b("\n" + i);t.b("        s = 0.5 * sIn + 0.5 * sOut;");t.b("\n" + i);t.b("        try = flow(v,s);");t.b("\n" + i);t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("            sOut = s;");t.b("\n" + i);t.b("            outside = try;");t.b("\n" + i);t.b("        } else {");t.b("\n" + i);t.b("            sIn = s;");t.b("\n" + i);t.b("        }");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return sOut;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Default creeping function (binary search)\n * @param start starting point of the creeping\n * @param outside vector out of the boundary (obtained from the previous flow, or the previous creeping)\n * @param offset how long we flow after passing the boundary\n */\nfloat {{glslCreepName}}(ExtVector v, ExtVector outside,  float offset){\n    ExtVector try = outside;\n    float sIn = 0.;\n    float sOut = try.data.lastFlowDist;\n    float s;\n    for(int i=0; i < 100; i++){\n        if(sOut - sIn < offset){\n            break;\n        }\n        s = 0.5 * sIn + 0.5 * sOut;\n        try = flow(v,s);\n        if({{glslTestName}}(try.vector.local.pos)){\n            sOut = s;\n            outside = try;\n        } else {\n            sIn = s;\n        }\n    }\n    return sOut;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 5103:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b("* Teleportation.");t.b("\n" + i);t.b("* Check if the local vector is still in the fundamental domain define by the teleportation tests.");t.b("\n" + i);t.b("* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true");t.b("\n" + i);t.b("* Otherwise, do nothing and set teleported to false");t.b("\n" + i);t.b("* @param[in] v the relative vector to teleport.");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("ExtVector teleport(ExtVector v){");t.b("\n" + i);t.b("    v.data.isTeleported = false;");t.b("\n" + i);if(t.s(t.f("teleportations",c,p,1),c,p,0,424,621,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(v.vector.local.pos)){");t.b("\n" + i);t.b("            v.vector = rewrite(v.vector, ");t.b(t.v(t.d("elt.name",c,p,0)));t.b(", ");t.b(t.v(t.d("inv.name",c,p,0)));t.b(");");t.b("\n" + i);t.b("            v.data.isTeleported = true;");t.b("\n" + i);t.b("            return v;");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    return v;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b("* Does one of the two following transformation:");t.b("\n" + i);t.b("* flow the vector by the given time, if the vector escape the fundamental domain,");t.b("\n" + i);t.b("* then try to find a smaller time so that the vector is moved closer to the boundary of the fudamental domain");t.b("\n" + i);t.b("* (and even a bit further)");t.b("\n" + i);t.b("*");t.b("\n" + i);t.b("* @param[inout] v the relative vector to flow / teleport / creep.");t.b("\n" + i);t.b("* @param[in] t the (maximal) time to flow");t.b("\n" + i);t.b("* @param[in] offset the amount we march passed the boundary");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("float creepingDist(ExtVector v, float t, float offset){");t.b("\n" + i);t.b("    float res = t;");t.b("\n" + i);t.b("    ExtVector try = flow(v, t);");t.b("\n" + i);if(t.s(t.f("teleportations",c,p,1),c,p,0,1233,1638,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);if(t.s(t.f("usesCreepingCustom",c,p,1),c,p,0,1266,1407,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("                res = min(res, ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(v, offset));");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(t.s(t.f("usesCreepingBinary",c,p,1),c,p,0,1463,1609,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("                res = min(res, ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(v, try, offset));");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}t.b("\n" + i);});c.pop();}t.b("    return res;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "/**\n* Teleportation.\n* Check if the local vector is still in the fundamental domain define by the teleportation tests.\n* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true\n* Otherwise, do nothing and set teleported to false\n* @param[in] v the relative vector to teleport.\n*/\nExtVector teleport(ExtVector v){\n    v.data.isTeleported = false;\n    {{#teleportations}}\n        if({{glslTestName}}(v.vector.local.pos)){\n            v.vector = rewrite(v.vector, {{elt.name}}, {{inv.name}});\n            v.data.isTeleported = true;\n            return v;\n        }\n    {{/teleportations}}\n    return v;\n}\n\n\n/**\n* Does one of the two following transformation:\n* flow the vector by the given time, if the vector escape the fundamental domain,\n* then try to find a smaller time so that the vector is moved closer to the boundary of the fudamental domain\n* (and even a bit further)\n*\n* @param[inout] v the relative vector to flow / teleport / creep.\n* @param[in] t the (maximal) time to flow\n* @param[in] offset the amount we march passed the boundary\n*/\nfloat creepingDist(ExtVector v, float t, float offset){\n    float res = t;\n    ExtVector try = flow(v, t);\n    {{#teleportations}}\n\n        {{#usesCreepingCustom}}\n            if({{glslTestName}}(try.vector.local.pos)){\n                res = min(res, {{glslCreepName}}(v, offset));\n            }\n        {{/usesCreepingCustom}}\n\n        {{#usesCreepingBinary}}\n            if({{glslTestName}}(try.vector.local.pos)){\n                res = min(res, {{glslCreepName}}(v, try, offset));\n            }\n        {{/usesCreepingBinary}}\n\n    {{/teleportations}}\n    return res;\n}\n\n\n", H);return T.render.apply(T, arguments); };

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

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct CheckerboardMaterial {\n    vec2 dir1;\n    vec2 dir2;\n    vec3 color1;\n    vec3 color2;\n};\n\nvec4 render(CheckerboardMaterial material, ExtVector v, vec2 uv) {\n    float x1 = mod(dot(uv, material.dir1), 2.);\n    float x2 = mod(dot(uv, material.dir2), 2.);\n    if (x1 < 1. && x2 < 1.){\n        return vec4(material.color1, 1);\n    } else if (x1 >= 1. && x2 >= 1.) {\n        return vec4(material.color1, 1);\n    } else {\n        return vec4(material.color2, 1);\n    }\n}\n\n"

/***/ }),

/***/ 7793:
/***/ ((module) => {

module.exports = "\n                                                                                                                        \n                       \n                                                                                                                        \n"

/***/ }),

/***/ 4743:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                 \n                                                                                                                        \n\nstruct EquidistantHypStripsMaterial {\n    float distance;\n    float width;\n    vec3 stripColor;\n    vec3 bgColor;\n};\n\n  \n                                                                     \n                                                                           \n   \nfloat distToYAxis(vec2 m) {\n    float aux = sqrt(1. - m.y * m.y);\n    return 0.5 * log((aux + m.x) / (aux - m.x));\n}\n\n                                                                                     \n                                                  \n   \nvec2 horizontalTranslate(vec2 m, float t) {\n    float ch = cosh(t);\n    float sh = sinh(t);\n    float x = m.x * ch + sh;\n    float den = m.x * sh + ch;\n    return vec2(x / den, m.y / den);\n}\n\nvec4 render(EquidistantHypStripsMaterial material, ExtVector v, vec2 uv) {\n    float distP = atanh(uv.x);\n    float k = round(distP / material.distance);\n    vec2 q = horizontalTranslate(uv, -k * material.distance);\n    float distQ = distToYAxis(q);\n    if (abs(distQ) < material.width) {\n        return vec4(material.stripColor, 1);\n    }\n    else {\n        return vec4(material.bgColor, 1);\n    }\n}"

/***/ }),

/***/ 1917:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                  \n                                                                                                                        \n\nstruct EquidistantSphStripsMaterial {\n    float distance;\n    float cosHalfWidthSq;\n    vec3 stripColor;\n    vec3 bgColor;\n};\n\n\nvec4 render(EquidistantSphStripsMaterial material, ExtVector v, vec2 uv) {\n    float theta = uv.x;\n    float phi = uv.y;\n    theta = theta - round(theta / material.distance) * material.distance;\n    float aux = sin(phi) * sin(theta);\n    float cosDistSq = 1. - aux * aux;\n                                                                                            \n    if (cosDistSq > material.cosHalfWidthSq) {\n        return vec4(material.stripColor, 1);\n    }\n    else {\n        return vec4(material.bgColor, 1);\n    }\n}"

/***/ }),

/***/ 3801:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct GraphPaperMaterial {\n    vec2 dir1;\n    vec2 dir2;\n    vec3 color1;\n    vec3 color2;\n};\n\n\nfloat gridLines(vec2 uv, float size){\n    float brightness = 1./(2.*sqrt(size));\n    float gridPattern = abs(sin(3.14*size*uv.x)*sin(1.*3.14*size*uv.y));\n                                   \n    gridPattern = 1.-clamp(pow(gridPattern,0.05),0.,1.);\n    return gridPattern*brightness;\n}\n\nfloat grid(vec2 uv){\n    float grid1 = gridLines(uv,1.);\n    float grid2 = gridLines(uv,5.);\n    float grid3 = gridLines(uv,10.);\n    float grid4 = gridLines(uv,50.);\n    float gridTotal = grid1+grid2+grid3+grid4;\n    gridTotal *=5.;\n   return gridTotal;\n}\n\nvec4 render(GraphPaperMaterial material, ExtVector v, vec2 uv) {\n    float x1 = mod(dot(uv, material.dir1), 2.);\n    float x2 = mod(dot(uv, material.dir2), 2.);\n    float gridPattern = grid(vec2(x1,x2));\n\n    vec3 col1 = material.color1*(1.-gridPattern);\n    vec3 col2 = material.color2*gridPattern;\n    return vec4(col1+col2,1.);\n\n}\n\n"

/***/ }),

/***/ 2278:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                     \n                                                                                                                        \n\nstruct HighlightLocalWrapMaterial {\n    GroupElement cellBoost;\n    bool isHighlightOn;\n};\n"

/***/ }),

/***/ 3048:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                     \n                                                                                                                        \n\nstruct HighlightWrapMaterial {\n    bool isHighlightOn;\n};\n"

/***/ }),

/***/ 7685:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                 \n                                                                                                                        \n\nstruct HypStripsMaterial {\n    float totalWidth;\n    vec4 lengths;\n    vec3 color0;\n    vec3 color1;\n    vec3 color2;\n    vec3 color3;\n};\n\nvec4 render(HypStripsMaterial material, ExtVector v, vec2 uv) {\n    vec3 color;\n    float aux = clamp(uv.x, -1., 1.);\n    float dist = atanh(aux);\n    float x = mod(dist / material.totalWidth, 1.);\n    if (x < material.lengths.x){\n        color = material.color0;\n    } else if (x < material.lengths.y){\n        color = material.color1;\n    } else if (x < material.lengths.z){\n        color = material.color2;\n    } else {\n        color = material.color3;\n    }\n\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 4566:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                 \n                                                                                                                        \n\nstruct ImprovedEquidistantHypStripsMaterial {\n    float distance;\n    float halfWidth;\n    vec3 stripColor;\n    vec3 bgColor;\n};\n\n  \n                                                                     \n                                                                           \n   \nfloat distToYAxis(vec2 m) {\n    float aux = sqrt(1. - m.y * m.y);\n    return 0.5 * log((aux + m.x) / (aux - m.x));\n}\n\n                                                                                     \n                                                  \n   \nvec2 horizontalTranslate(vec2 m, float t) {\n    float ch = cosh(t);\n    float sh = sinh(t);\n    float x = m.x * ch + sh;\n    float den = m.x * sh + ch;\n    return vec2(x / den, m.y / den);\n}\n\nvec4 render(ImprovedEquidistantHypStripsMaterial material, ExtVector v, vec2 uv) {\n    float t = atanh(uv.x) - material.distance;\n    vec2 m = horizontalTranslate(uv, -t);\n    float distM = abs(distToYAxis(m));\n    float n = floor(log(distM / material.distance) / log(2.));\n\n    float distP = atanh(uv.x);\n    float period = pow(2., -n) * material.distance;\n    float k = round(distP / period);\n    vec2 q = horizontalTranslate(uv, -k * period);\n    float distQ = distToYAxis(q);\n    if (abs(distQ) < material.halfWidth) {\n        return vec4(material.stripColor, 1);\n    }\n    else {\n        return vec4(material.bgColor, 1);\n    }\n}"

/***/ }),

/***/ 1650:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                 \n                                                                                                                        \n\nstruct ImprovedEquidistantSphStripsMaterial {\n    float distance;\n    float cosHalfWidthSq;\n    float fadingAmplitude;\n    vec3 stripColor;\n    vec3 bgColor;\n    mat4 rotation;\n};\n\nvec4 render(ImprovedEquidistantSphStripsMaterial material, ExtVector v, vec2 uv) {\n                         \n    vec4 origDir = vec4(vec2(cos(uv.x), sin(uv.x)) * sin(uv.y), cos(uv.y), 0.);\n    vec4 rotatedDir = material.rotation * origDir;\n    float sinPhi = length(rotatedDir.xy);\n    float cosPhi = rotatedDir.z;\n    float uCoord = atan(rotatedDir.y, rotatedDir.x);\n    float vCoord = atan(sinPhi, cosPhi);\n    vec2 rotatedUV = vec2(uCoord, vCoord);\n\n\n                                                                                              \n    float ln2 = 0.6931471;                               \n\n    float theta = rotatedUV.x;\n    float phi = rotatedUV.y;\n    float k = round(theta / material.distance);\n    theta = theta - k * material.distance;\n    float aux = sin(phi) * sin(theta);\n    float cosDistSq = 1. - aux * aux;\n\n                                                                                            \n    if (cosDistSq < material.cosHalfWidthSq) {\n                                                               \n        return vec4(material.bgColor, 1);\n    }\n    if (k == 0.) {\n        return vec4(material.stripColor, 1);\n    }\n\n                                                                        \n                                                                             \n    int kInt = int(k);\n    int nInt = kInt & (~kInt + 1);\n    float n = float(nInt);\n                                \n                                                                                        \n    float theta0 = material.distance;\n    float theta1 = n * theta0;\n\n                                                    \n                                   \n                                                  \n           \n\n    float c = 0.66;\n    float sinPh1 = sin(c * theta0) / sin(theta1);\n    float phi1 = asin(clamp(sinPh1, 0., 1.));\n\n    float coeff = ((0.5 * PI - phi1) - abs(0.5 * PI - phi)) / material.fadingAmplitude + 0.5;\n    coeff = clamp(coeff, 0., 1.);\n    vec3 base = coeff * material.stripColor + (1. - coeff) * material.bgColor;\n    return vec4(base, 1);\n\n                         \n                                                                                       \n                                                                           \n                                       \n                                                        \n      \n                                                        \n}"

/***/ }),

/***/ 3496:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                  \n                                            \n                                                     \n                                                                                                                        \n\nvec4 normalMaterialRender(ExtVector v, RelVector normal) {\n    Vector[3] f;\n    Point pos = applyGroupElement(v.vector.cellBoost, v.vector.local.pos);\n    frame(pos, f);\n\n    f[0] = applyGroupElement(v.vector.invCellBoost, f[0]);\n    f[1] = applyGroupElement(v.vector.invCellBoost, f[1]);\n    f[2] = applyGroupElement(v.vector.invCellBoost, f[2]);\n    \n                  \n                            \n    float r =  geomDot(normal.local, f[0]);\n    float g =  geomDot(normal.local, f[1]);\n    float b =  geomDot(normal.local, f[2]);\n    return abs(vec4(r, g, b, 1));\n}"

/***/ }),

/***/ 7198:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct PathTracerWrapMaterial {\n    vec3 emission;\n    vec3 volumeEmission;\n    float opticalDepth;\n    vec3 specular;\n    vec3 absorb;\n    float ior;\n    float roughness;\n    float diffuseChance;\n    float reflectionChance;\n    float refractionChance;\n};\n\n\nRayType setRayType(PathTracerWrapMaterial material, ExtVector v, RelVector n, float r) {\n    RayType res = RayType(false, false, false, 0.);\n    float random = randomFloat();\n\n    float reflectionChance = fresnelReflectAmount(v.vector, n, r, material.reflectionChance, 1.0);\n    float chanceMultiplier = (1. - reflectionChance) / (1. - material.reflectionChance);\n    float refractionChance = chanceMultiplier * material.refractionChance;\n    float diffuseChance = 1. - refractionChance - reflectionChance;\n\n    if (random < diffuseChance){\n        res.diffuse = true;\n        res.chance = diffuseChance;\n    } else if (random < diffuseChance + reflectionChance){\n        res.reflect = true;\n        res.chance = reflectionChance;\n    }\n    else {\n        res.refract = true;\n        res.chance = refractionChance;\n    }\n    return res;\n}\n\n"

/***/ }),

/***/ 6045:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                 \n                                                                                                                        \n\nstruct PhongMaterial {\n    vec3 color;\n    float ambient;\n    float diffuse;\n    float specular;\n    float shininess;\n    vec3 reflectivity;\n};\n\n\nvec3 lightComputation(Vector v, Vector n, Vector dir, PhongMaterial material, vec3 lightColor, float intensity){\n    Vector auxV = negate(v);\n    Vector auxL = dir;\n    Vector auxN = n;\n    Vector auxR = geomReflect(negate(auxL), auxN);\n    float NdotL = max(geomDot(auxN, auxL), 0.);\n    float RdotV = max(geomDot(auxR, auxV), 0.);\n\n                                                 \n    float specularCoeff = material.specular * pow(RdotV, material.shininess);\n    float diffuseCoeff = material.diffuse * NdotL;\n    float ambientCoeff = material.ambient;\n\n                                                \n                                                                                                                                                                                                                                      \n    vec3 specularLight = lightColor.rgb;\n    vec3 diffuseLight = 0.8 * lightColor.rgb + 0.2 * vec3(1.);\n    vec3 ambientLight = 0.5 * lightColor.rgb + 0.5 * vec3(1.);\n\n                                                 \n    vec3 specular = specularCoeff * specularLight;\n    vec3 diffuse = diffuseCoeff * diffuseLight * material.color;\n    vec3 ambient = ambientCoeff * ambientLight * material.color;\n\n                 \n    vec3 res = intensity * (ambient + diffuse + specular);\n\n    return res;\n}"

/***/ }),

/***/ 5836:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                      \n                                                                                                                        \n\nstruct PhongWrapMaterial {\n    float ambient;\n    float diffuse;\n    float specular;\n    float shininess;\n    vec3 reflectivity;\n};\n\nvec3 lightComputation(Vector v, Vector n, Vector dir, vec3 baseColor, PhongWrapMaterial material, vec3 lightColor, float intensity){\n    Vector auxV = negate(v);\n    Vector auxL = dir;\n    Vector auxN = n;\n    Vector auxR = geomReflect(negate(auxL), auxN);\n    float NdotL = max(geomDot(auxN, auxL), 0.);\n    float RdotV = max(geomDot(auxR, auxV), 0.);\n\n                                                 \n    float specularCoeff = material.specular * pow(RdotV, material.shininess);\n    float diffuseCoeff = material.diffuse * NdotL;\n    float ambientCoeff = material.ambient;\n\n                                                \n                                                                                                                                                                                                                                      \n    vec3 specularLight = lightColor.rgb;\n    vec3 diffuseLight = 0.8 * lightColor.rgb + 0.2 * vec3(1.);\n    vec3 ambientLight = 0.5 * lightColor.rgb + 0.5 * vec3(1.);\n\n                                                 \n    vec3 specular = specularCoeff * specularLight;\n    vec3 diffuse = diffuseCoeff * diffuseLight * baseColor;\n    vec3 ambient = ambientCoeff * ambientLight * baseColor;\n\n                 \n    vec3 res = intensity * (ambient + diffuse + specular);\n\n    return res;\n}"

/***/ }),

/***/ 1220:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \n\nstruct RotatedSphericalTextureMaterial {\n    sampler2D sampler;\n    mat4 rotation;\n    vec2 start;\n    vec2 scale;\n    bool repeatU;\n    bool repeatV;\n};\n\nvec4 render(RotatedSphericalTextureMaterial material, ExtVector v, vec2 uv) {\n    vec4 origDir = vec4(vec2(cos(uv.x), sin(uv.x)) * sin(uv.y), cos(uv.y), 0.);\n    vec4 rotatedDir = material.rotation * origDir;\n    float sinPhi = length(rotatedDir.xy);\n    float cosPhi = rotatedDir.z;\n    float uCoord = atan(rotatedDir.y, rotatedDir.x);\n    float vCoord = atan(sinPhi, cosPhi);\n    vec2 rotatedUV = vec2(uCoord, vCoord);\n    vec2 texCoords = (rotatedUV - material.start) * material.scale;\n    return texture(material.sampler, texCoords);\n}\n\n\n"

/***/ }),

/***/ 9095:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct SimpleTextureMaterial {\n    sampler2D sampler;\n    vec2 start;\n    vec2 scale;\n    bool repeatU;\n    bool repeatV;\n};\n\nvec4 render(SimpleTextureMaterial material, ExtVector v, vec2 uv) {\n    vec2 texCoords = (uv - material.start) * material.scale;\n    return texture(material.sampler, texCoords);\n}\n\n\n"

/***/ }),

/***/ 2664:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                        \n                                                                                                                        \n\nstruct SingleColorMaterial {\n    vec3 color;\n};\n\nvec4 render(SingleColorMaterial material, ExtVector v) {\n    return vec4(material.color, 1);\n}"

/***/ }),

/***/ 3081:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct SquaresMaterial {\n    vec2 dir1;\n    vec2 dir2;\n    vec4 lengths;\n    vec3 color0;\n    vec3 color1;\n    vec3 color2;\n    vec3 color3;\n\n};\n\nvec4 render(SquaresMaterial material, ExtVector v, vec2 uv) {\n    vec3 color;\n    float x1 = mod(dot(uv, material.dir1) / dot(material.dir1, material.dir1), 2.);\n    float x2 = mod(dot(uv, material.dir2) / dot(material.dir2, material.dir2), 2.);\n    float c1 = abs(x1 - 1.);\n    float c2 = abs(x2 - 1.);\n    if (c1 < material.lengths.x && c2 < material.lengths.x){\n        color = material.color0;\n    } else if (c1 < material.lengths.y && c2 < material.lengths.y){\n        color = material.color1;\n    } else if (c1 < material.lengths.z && c2 < material.lengths.z){\n        color = material.color2;\n    } else {\n        color = material.color3;\n    }\n    return vec4(color, 1);\n}\n\n"

/***/ }),

/***/ 9835:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                  \n                                                                                                                        \nstruct StripsMaterial {\n    vec2 dir;\n    vec4 lengths;\n    vec3 color0;\n    vec3 color1;\n    vec3 color2;\n    vec3 color3;\n\n};\n\nvec4 render(StripsMaterial material, ExtVector v, vec2 uv) {\n    vec3 color;\n    float x = mod(dot(uv, material.dir) / dot(material.dir, material.dir), 1.);\n    if (x < material.lengths.x){\n        color = material.color0;\n    } else if (x < material.lengths.y){\n        color = material.color1;\n    } else if (x < material.lengths.z){\n        color = material.color2;\n    } else {\n        color = material.color3;\n    }\n\n    return vec4(color, 1);\n}\n\n"

/***/ }),

/***/ 1888:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                     \n                                                                                                                        \n\nstruct TransitionLocalWrapMaterial {\n    GroupElement cellBoost;\n    float ratio;\n};\n"

/***/ }),

/***/ 5698:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                     \n                                                                                                                        \n\nstruct TransitionWrapMaterial {\n    float ratio;\n};\n"

/***/ }),

/***/ 2229:
/***/ ((module) => {

module.exports = "\n\n                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct VideoAlphaTextureMaterial {\n    sampler2D sampler;\n    vec2 start;\n    vec2 scale;\n    bool repeatU;\n    bool repeatV;\n};\n\nvec4 render(VideoAlphaTextureMaterial material, ExtVector v, vec2 uv) {\n    vec2 texCoords = (uv - material.start) * material.scale;\n    vec2 texCoordsUV = vec2(texCoords.x, 0.5 + 0.5 * texCoords.y);\n    vec2 texCoordsAlpha = vec2(texCoords.x, 0.5 * texCoords.y);\n    vec4 color =  texture(material.sampler, texCoordsUV);\n    float alpha = texture(material.sampler, texCoordsAlpha).x;\n    return vec4(color.rgb, alpha);\n}"

/***/ }),

/***/ 4680:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct VideoFrameTextureMaterial {\n    sampler2D sampler;\n    vec2 start;\n    vec2 scale;\n    bool repeatU;\n    bool repeatV;\n};\n\nvec4 render(VideoFrameTextureMaterial material, ExtVector v, vec2 uv) {\n    vec2 texCoords = (uv - material.start) * material.scale;\n    return texture(material.sampler, texCoords);\n}\n\n\n"

/***/ }),

/***/ 533:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct VideoTextureMaterial {\n    sampler2D sampler;\n    vec2 start;\n    vec2 scale;\n    bool repeatU;\n    bool repeatV;\n};\n\nvec4 render(VideoTextureMaterial material, ExtVector v, vec2 uv) {\n    vec2 texCoords = (uv - material.start) * material.scale;\n    return texture(material.sampler, texCoords);\n}\n\n\n"

/***/ }),

/***/ 6947:
/***/ ((module) => {

module.exports = "uniform sampler2D tDiffuse;\nuniform float exposure;\nvarying vec2 vUv;\n\nvec3 ACESFilm(vec3 x)\n{\n    float a = 2.51f;\n    float b = 0.03f;\n    float c = 2.43f;\n    float d = 0.59f;\n    float e = 0.14f;\n    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);\n}\n\nvoid main() {\n    vec4 color = texture2D(tDiffuse, vUv);\n    vec3 pixelColor = exposure * color.rgb;\n    pixelColor = ACESFilm(pixelColor);\n    gl_FragColor = vec4(min(vec3(1.0), pixelColor), color.a);\n}"

/***/ }),

/***/ 2690:
/***/ ((module) => {

module.exports = "uniform sampler2D tDiffuse;\nuniform float exposure;\nvarying vec2 vUv;\n\n\nvec3 LessThan(vec3 f, float value)\n{\n    return vec3(\n    (f.x < value) ? 1.0f : 0.0f,\n    (f.y < value) ? 1.0f : 0.0f,\n    (f.z < value) ? 1.0f : 0.0f);\n}\n\n                  \nvec3 LinearToSRGB(vec3 rgb)\n{\n    rgb = clamp(rgb, 0.0f, 1.0f);\n\n    return mix(\n    pow(rgb, vec3(1.0f / 2.4f)) * 1.055f - 0.055f,\n    rgb * 12.92f,\n    LessThan(rgb, 0.0031308f)\n    );\n}\n              \nvec3 ACESFilm(vec3 x)\n{\n    float a = 2.51f;\n    float b = 0.03f;\n    float c = 2.43f;\n    float d = 0.59f;\n    float e = 0.14f;\n    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);\n}\n\nvec3 postProcess(vec3 pixelColor){\n\n                      \n    pixelColor *= exposure;\n\n                   \n    pixelColor = ACESFilm(pixelColor);\n    pixelColor = LinearToSRGB(pixelColor);\n\n    return pixelColor;\n}\n\nvoid main() {\n    vec4 color = texture2D(tDiffuse, vUv);\n    vec3 aux = postProcess(color.rgb);\n    gl_FragColor = vec4(min(vec3(1.0), aux), color.a);\n}"

/***/ }),

/***/ 4024:
/***/ ((module) => {

module.exports = "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\n\nvec3 LessThan(vec3 f, float value)\n{\n    return vec3(\n    (f.x < value) ? 1.0f : 0.0f,\n    (f.y < value) ? 1.0f : 0.0f,\n    (f.z < value) ? 1.0f : 0.0f);\n}\n\n                  \nvec3 LinearToSRGB(vec3 rgb)\n{\n    rgb = clamp(rgb, 0.0f, 1.0f);\n\n    return mix(\n    pow(rgb, vec3(1.0f / 2.4f)) * 1.055f - 0.055f,\n    rgb * 12.92f,\n    LessThan(rgb, 0.0031308f)\n    );\n}\n\nvoid main() {\n    vec4 color = texture2D(tDiffuse, vUv);\n    vec3 pixelColor = color.rgb;\n    pixelColor = LinearToSRGB(pixelColor);\n    gl_FragColor = vec4(min(vec3(1.0), pixelColor), color.a);\n}"

/***/ }),

/***/ 5348:
/***/ ((module) => {

module.exports = "vec3 applyFog(vec3 color, float dist){\n    float coeff = exp(- fog.scattering * dist);\n    return coeff * color + (1. - coeff) * fog.color;\n}\n\nvec4 applyFog(vec4 color, float dist){\n    float coeff = exp(- fog.scattering * dist);\n    return coeff * color + (1. - coeff) * vec4(fog.color, 1);\n}"

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

/***/ 4750:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec3 dir = vec3(coords.xy, -1. / tan(0.5 * camera.fovRadians));\n    Vector v = createVector(ORIGIN, dir);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}"

/***/ }),

/***/ 8710:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct Camera {\n    float fovRadians;                                          \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float safetyDist;                                                                               \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n};"

/***/ }),

/***/ 6224:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                \n  \n                                                                                                                        \n                                                                                                                        \n\nvarying vec3 screenPosition;\n\n   \n                                      \n                                                                    \n                                                                               \n                                                 \n  \n                                                                \n                                                        \n                                                  \n                                                                                     \n   \nvoid main()\n{\n                                 \n                                                       \n    mat4 rot = modelViewMatrix;\n    rot[3] = vec4(0, 0, 0, 1);\n\n    vec4 aux = rot * vec4(position, 1.0);\n    screenPosition = aux.xyz;\n    gl_Position = projectionMatrix * rot * aux;\n}"

/***/ }),

/***/ 6684:
/***/ ((module) => {

module.exports = "   \n                                                                                                 \n                                                                                        \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = vec4(coords, 0);\n                                \n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}\n\n   \n                                                                                             \n                                                               \n   \nRelVector mappingFromFlatScreen(vec2 coords) {\n                                                         \n    vec2 jitter = vec2(randomFloat(), randomFloat()) - 0.5;\n\n                                                                            \n    vec2 planeCoords = (coords - 0.5 * resolution + jitter) / (0.5 * resolution.y);\n\n                              \n    float z = - 1. / tan(radians(0.5 * camera.fov));\n\n                                                      \n    vec4 dir = vec4(planeCoords, z, 0);\n\n                                \n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}"

/***/ }),

/***/ 6354:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                      \n                                                                                               \n                                                                                                                        \nstruct Camera {\n    float fov;                     \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float safetyDist;                                                                               \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n    float focalLength;                    \n    float aperture;                \n};"

/***/ }),

/***/ 9222:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = normalize(vec4(coords, 0));\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    return applyPosition(camera.position, v);\n}\n\n                     \n\n  \n                               \n                               \n                         \n                                             \n                                                      \n                              \n \n  "

/***/ }),

/***/ 5970:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct Camera {\n    float fov;                              \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float safetyDist;                                                                               \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n};"

/***/ }),

/***/ 5682:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                \n  \n                                                                                                                        \n                                                                                                                        \n\nvarying vec3 screenPosition;\n\n   \n                                      \n                                                                    \n                                                                               \n                                                 \n  \n                                                                \n                                                        \n                                                  \n                                                                                     \n   \nvoid main()\n{\n                                 \n                                                       \n    mat4 rot = modelViewMatrix;\n    rot[3] = vec4(0, 0, 0, 1);\n\n    vec4 aux = rot * vec4(position, 1.0);\n    screenPosition = aux.xyz;\n    gl_Position = projectionMatrix * rot * aux;\n}"

/***/ }),

/***/ 4770:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = normalize(vec4(coords, 0));\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    return applyPosition(camera.position, v);\n}"

/***/ }),

/***/ 8415:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct Camera {\n    float fov;                     \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float safetyDist;                                                                               \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n};"

/***/ }),

/***/ 190:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                                               \n  \n                                                                                                                        \n                                                                                                                        \n\n\nVector geomMix(Vector v1, Vector v2, float a){\n    return add(multiplyScalar(1.-a, v1), multiplyScalar(a, v2));\n}\n\n   \n                                           \n                         \n             \n   \nVector negate(Vector v) {\n    return multiplyScalar(-1., v);\n}\n\n\n   \n                                         \n                       \n   \nfloat geomLength(Vector v){\n    return sqrt(geomDot(v, v));\n}\n\n   \n                                                          \n                            \n   \nVector geomNormalize(Vector v){\n    float a = geomLength(v);\n    return multiplyScalar(1./a, v);\n}\n\n   \n                                                     \n   \nfloat cosAngle(Vector v1, Vector v2){\n    float a1 = geomLength(v1);\n    float a2 = geomLength(v2);\n    return geomDot(v1, v2)/ (a1 * a2);\n}\n\n   \n                                                           \n                                   \n                                                                                                        \n                                     \n                                                                   \n                                                                       \n   \nVector geomReflect(Vector v, Vector n){\n    return sub(v, multiplyScalar(2. * geomDot(v, n), n));\n}\n\n\n   \n                                         \n                                                                        \n                                                                                   \n                                              \n   \nVector geomRefract(Vector v, Vector n, float r){\n    float cosTheta1 = -geomDot(n, v);\n    float sinTheta2Sq = r * r * (1. - cosTheta1 * cosTheta1);\n\n    if (sinTheta2Sq > 1.){\n               \n        return zeroVector(v.pos);\n    }\n                                                                 \n    float cosTheta2 = sqrt(1. - sinTheta2Sq);\n    float aux = r * cosTheta1 - cosTheta2;\n    return add(multiplyScalar(r, v), multiplyScalar(aux, n));\n}\n\n   \n                                                                          \n                                           \n   \nIsometry makeTranslation(Vector v) {\n    return makeTranslation(v.pos);\n}\n\n   \n                                                                          \n                                              \n   \nIsometry makeInvTranslation(Vector v) {\n    return makeInvTranslation(v.pos);\n}\n"

/***/ }),

/***/ 4168:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                                               \n  \n                                                                                                                        \n                                                                                                                        \n\n   \n                                                                         \n               \n   \nVector createVector(Point p, vec3 coords, Vector[3] frame){\n    Vector c0 = multiplyScalar(coords[0], frame[0]);\n    Vector c1 = multiplyScalar(coords[1], frame[1]);\n    Vector c2 = multiplyScalar(coords[2], frame[2]);\n    return add(c0, add(c1, c2));\n}\n\n\n\n   \n                                                                                          \n               \n   \nVector createVector(Point p, vec3 coords){\n    Vector[3] f;\n    frame(p, f);\n    return createVector(p, coords, f);\n}\n\n   \n                                                                                          \n               \n   \nVector createVectorOrtho(Point p, vec3 coords){\n    Vector[3] f;\n    orthoFrame(p, f);\n    return createVector(p, coords, f);\n}\n\n\n                                                                                                                        \n  \n                   \n                                                             \n                                                                       \n  \n                                                                                                                        \n\nstruct Position {\n    Isometry boost;\n    mat4 facing;\n};\n\n\n   \n                                        \n                          \n                                           \n   \nVector applyPosition(Position p, Vector v){\n    Vector res = applyFacing(p.facing, v);\n    return applyIsometry(p.boost, res);\n}"

/***/ }),

/***/ 2311:
/***/ ((module) => {

module.exports = "   \n              \n                                \n   \nPoint applyIsometry(GroupElement elt, Point p){\n    return applyIsometry(toIsometry(elt), p);\n}\n\nPoint applyGroupElement(GroupElement elt, Point p){\n    return applyIsometry(toIsometry(elt), p);\n}\n\n   \n              \n                                \n   \nVector applyIsometry(GroupElement elt, Vector v){\n    return applyIsometry(toIsometry(elt), v);\n}\n\nVector applyGroupElement(GroupElement elt, Vector v){\n    return applyIsometry(toIsometry(elt), v);\n}\n\n\n"

/***/ }),

/***/ 5315:
/***/ ((module) => {

module.exports = "   \n                          \n   \nvarying vec3 screenPosition;\n\n   \n                                           \n                       \n                                                           \n                                 \n                                                         \n   \nvoid main() {\n    RelVector vector = mapping(screenPosition);\n    ExtVector v = ExtVector(vector, initVectorData());\n    gl_FragColor = postProcess(getColor(v));\n}"

/***/ }),

/***/ 6159:
/***/ ((module) => {

module.exports = "vec4 postProcess(vec4 color) {\n    return color;\n}"

/***/ }),

/***/ 2977:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n              \n  \n                                                                                                                        \n                                                                                                                        \n\n\n   \n                \n                                                      \n                                         \n                                                                                       \n                                                      \n                                                                    \n          \n                                \n                               \n                          \n                                                                                               \n                                                               \n                                                                                                                 \n                                                                                         \n   \nint raymarch(inout ExtVector v, out int objId){\n    initFlow(v.vector.local);                                                                 \n    ExtVector globalV0 = v;\n    ExtVector globalV = globalV0;\n    ExtVector localV0 = v;\n    ExtVector localV = localV0;\n    ExtVector res = v;\n    int auxId;\n    int auxHit;\n    float marchingStep = camera.minDist;\n    float dist;\n    int hit = HIT_NOTHING;\n\n\n                  \n    for (int i = 0; i < camera.maxSteps; i++){\n                          \n        localV.data.iMarch = v.data.iMarch + i;\n\n                                                     \n        localV = teleport(localV);\n        if (localV.data.isTeleported){\n                                                                                           \n            localV0 = localV;\n                                                                                      \n            marchingStep = camera.minDist;\n        }\n        else {\n                                                    \n            if (localV.data.totalDist > camera.maxDist) {\n                break;\n            }\n            dist = localSceneSDF(localV.vector, auxHit, auxId);\n            if (auxHit == HIT_DEBUG){\n                hit = HIT_DEBUG;\n                break;\n            }\n            if (auxHit == HIT_SOLID) {\n                                   \n                hit = HIT_SOLID;\n                objId = auxId;\n                v = localV;\n                break;\n            }\n            marchingStep = marchingStep + creepingDist(localV, dist, camera.threshold);\n            localV = flow(localV0, marchingStep);\n        }\n    }\n\n                               \n                     \n       \n\n                  \n    marchingStep = camera.minDist;\n    for (int i=0; i < camera.maxSteps; i++){\n                          \n        globalV.data.iMarch = v.data.iMarch + i;\n\n        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){\n                                              \n            break;\n        }\n        dist = globalSceneSDF(globalV.vector, auxHit, auxId);\n\n        if (auxHit == HIT_DEBUG){\n            hit = HIT_DEBUG;\n            break;\n        }\n        if (auxHit == HIT_SOLID) {\n                               \n            hit = auxHit;\n            objId = auxId;\n            v = globalV;\n            break;\n        }\n        marchingStep = marchingStep + dist;\n        globalV = flow(globalV0, marchingStep);\n    }\n\n    if (hit == HIT_NOTHING) {\n        v = globalV;\n    }\n    return hit;\n}\n\nvec4 getColor(ExtVector v){\n    int objId;\n    int hit;\n    v = flow(v, camera.safetyDist);\n    for (int i = 0; i <= maxBounces; i++){\n        if (v.data.stop){\n            break;\n        }\n        hit = raymarch(v, objId);\n        updateVectorData(v, hit, objId);\n    }\n    return v.data.pixel;\n}"

/***/ }),

/***/ 9461:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                              \n  \n                                                                                                                        \n                                                                                                                        \n\nstruct VectorData {\n    float lastFlowDist;                                                                    \n    float lastBounceDist;                                                           \n    float totalDist;                                                  \n    bool isTeleported;                                             \n    int iMarch;                                                        \n    int iBounce;                                             \n    bool stop;                              \n    vec4 pixel;                                                                   \n    vec4 leftToComputeColor;                                                                      \n};"

/***/ }),

/***/ 1767:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                             \n  \n                                                                                                                        \n                                                                                                                        \n\n   \n              \n   \nconst float PI = 3.1415926538;\n\n   \n                      \n   \nvec4 debugColor = vec4(0.5, 0, 0.8, 1);\n\n   \n                                    \n         \n   \nconst int HIT_NOTHING = 0;\n   \n                                    \n         \n   \nconst int HIT_SOLID = 1;\n   \n                                  \n         \n   \nconst int HIT_DEBUG = -1;\n"

/***/ }),

/***/ 7962:
/***/ ((module) => {

module.exports = "varying vec2 vUv;\n\nvoid main() {\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}"

/***/ }),

/***/ 8187:
/***/ ((module) => {

module.exports = "   \n                          \n   \nvarying vec3 spherePosition;\n\n\n   \n                                           \n                       \n                                                           \n                                 \n                                                         \n   \nvoid main() {\n    initSeed(gl_FragCoord.xy, frameSeed);\n    RelVector vector = mappingFromFlatScreen(gl_FragCoord.xy);\n    ExtVector v = ExtVector(vector, initVectorData());\n    gl_FragColor = getColor(v);\n}\n"

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

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n              \n  \n                                                                                                                        \n                                                                                                                        \n\n\n   \n                \n                                                      \n                                         \n                                                                                       \n                                                      \n                                                                    \n          \n                                \n                               \n                          \n                                                                                               \n                                                               \n                                                                                                                 \n                                                                                         \n   \nint raymarch(inout ExtVector v, out int objId){\n    initFlow(v.vector.local);                                                                 \n    ExtVector globalV0 = v;\n    ExtVector globalV = globalV0;\n    ExtVector localV0 = v;\n    ExtVector localV = localV0;\n    ExtVector res = v;\n    int auxId;\n    int auxHit;\n    float marchingStep = camera.minDist;\n    float dist;\n    int hit = HIT_NOTHING;\n\n\n                  \n    for (int i = 0; i < camera.maxSteps; i++){\n                          \n        localV.data.iMarch = v.data.iMarch + i;\n\n                                                     \n        localV = teleport(localV);\n        if (localV.data.isTeleported){\n                                                                                           \n            localV0 = localV;\n                                                                                      \n            marchingStep = camera.minDist;\n        }\n        else {\n                                                    \n            if (localV.data.totalDist > camera.maxDist) {\n                break;\n            }\n            dist = localSceneSDF(localV.vector, auxHit, auxId);\n            if (auxHit == HIT_DEBUG){\n                hit = HIT_DEBUG;\n                break;\n            }\n            if (auxHit == HIT_SOLID) {\n                                   \n                hit = HIT_SOLID;\n                objId = auxId;\n                v = localV;\n                break;\n            }\n            marchingStep = marchingStep + creepingDist(localV, dist, camera.threshold);\n            localV = flow(localV0, marchingStep);\n                                                                  \n                                                                                         \n        }\n    }\n    if (hit == HIT_NOTHING) {\n        v = localV;\n    }\n                  \n    marchingStep = camera.minDist;\n    for (int i=0; i < camera.maxSteps; i++){\n                          \n        globalV.data.iMarch = v.data.iMarch + i;\n\n        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){\n                                              \n            break;\n        }\n        dist = globalSceneSDF(globalV.vector, auxHit, auxId);\n\n        if (auxHit == HIT_DEBUG){\n            hit = HIT_DEBUG;\n            break;\n        }\n        if (auxHit == HIT_SOLID) {\n                               \n            hit = auxHit;\n            objId = auxId;\n            v = globalV;\n            break;\n        }\n        marchingStep = marchingStep + abs(dist);\n        globalV = flow(globalV0, marchingStep);\n    }\n\n    if (hit == HIT_NOTHING) {\n        v = globalV;\n    }\n    return hit;\n}\n\nbool doesItScatter(inout float dist, float opticalDepth){\n                          \n    if (opticalDepth>100.){\n        return false;\n    }\n    else {\n        float probScatter=1.-exp(-dist/opticalDepth);\n        float flip=randomFloat();\n        if (flip<probScatter){\n                                           \n                                                \n            dist=dist*randomFloat();\n            return true;\n        }\n                                              \n        return false;\n    }\n}\n\n\nvoid scatterRay(inout ExtVector v){\n                                         \n    RelVector w=randomVector(v.vector);\n\n                                                 \n                                                  \n    v.vector=w;\n                                             \n                                                      \n}\n\n\n\nint scatterRaymarch(inout ExtVector v, out int objId){\n    initFlow(v.vector.local);                                                                 \n    ExtVector globalV0 = v;\n    ExtVector globalV = globalV0;\n    ExtVector localV0 = v;\n    ExtVector localV = localV0;\n    ExtVector res = v;\n    int auxId;\n    int auxHit;\n    float marchingStep = camera.minDist;\n    float dist;\n    int hit = HIT_NOTHING;\n    float d;\n    bool doScatter;\n\n\n                  \n    for (int i = 0; i < camera.maxSteps; i++){\n                          \n        localV.data.iMarch = v.data.iMarch + i;\n\n                                                     \n        localV = teleport(localV);\n        if (localV.data.isTeleported){\n                                                                                           \n            localV0 = localV;\n                                                                                      \n            marchingStep = camera.minDist;\n        }\n        else {\n                                                    \n            if (localV.data.totalDist > camera.maxDist) {\n                break;\n            }\n            dist = localSceneSDF(localV.vector, auxHit, auxId);\n            if (auxHit == HIT_DEBUG){\n                hit = HIT_DEBUG;\n                break;\n            }\n            if (auxHit == HIT_SOLID) {\n                                   \n                hit = HIT_SOLID;\n                objId = auxId;\n                v = localV;\n                break;\n            }\n\n                                          \n            d=abs(dist);\n            doScatter=doesItScatter(d, v.data.currentOpticalDepth);\n\n                                                \n            marchingStep = marchingStep + creepingDist(localV, d, camera.threshold);\n            localV = flow(localV0, marchingStep);\n\n\n                                               \n                                                                              \n\n                                                       \n            if (doScatter){\n                scatterRay(localV);\n            }\n        }\n    }\n    if (hit == HIT_NOTHING) {\n        v = localV;\n    }\n                  \n    marchingStep = camera.minDist;\n    for (int i=0; i < camera.maxSteps; i++){\n                          \n        globalV.data.iMarch = v.data.iMarch + i;\n\n        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){\n                                              \n            break;\n        }\n        dist = globalSceneSDF(globalV.vector, auxHit, auxId);\n\n        if (auxHit == HIT_DEBUG){\n            hit = HIT_DEBUG;\n            break;\n        }\n        if (auxHit == HIT_SOLID) {\n                               \n            hit = auxHit;\n            objId = auxId;\n            v = globalV;\n            break;\n        }\n\n                                      \n        d=abs(dist);\n        doScatter=doesItScatter(d, v.data.currentOpticalDepth);\n\n                                            \n        marchingStep = marchingStep + d;\n        globalV = flow(globalV0, marchingStep);\n\n                                                   \n        if (doScatter){\n            scatterRay(globalV);\n        }\n    }\n\n    if (hit == HIT_NOTHING) {\n        v = globalV;\n    }\n    return hit;\n}\n\nvec4 getColor(ExtVector v){\n    int objId;\n    int hit;\n    for (int i = 0; i <= maxBounces; i++){\n        if (v.data.stop){\n            break;\n        }\n        hit = scatterRaymarch(v, objId);\n        updateVectorData(v, hit, objId);\n    }\n    return vec4(v.data.pixel,1);\n}"

/***/ }),

/***/ 3888:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n           \n  \n                                                                                                                        \n                                                                                                                        \n\nstruct RayType{\n    bool diffuse;\n    bool reflect;\n    bool refract;\n    float chance;\n};\n\n                                                                                                                        \n                                                                                                                        \n  \n                              \n  \n                                                                                                                        \n                                                                                                                        \n\nstruct VectorData {\n    float lastFlowDist;                                                                    \n    float lastBounceDist;                                                           \n    float totalDist;                                                  \n    bool isTeleported;                                             \n    int iMarch;                                                        \n    int iBounce;                                             \n    bool stop;                              \n    vec3 pixel;         \n    vec3 light;         \n    vec3 currentAbsorb;                                                    \n    vec3 currentEmission;                                                             \n    float currentOpticalDepth;                                                              \n    bool isInside;                                        \n};\n\n"

/***/ }),

/***/ 8351:
/***/ ((module) => {

module.exports = "vec3 LessThan(vec3 f, float value)\n{\n    return vec3(\n        (f.x < value) ? 1.0f : 0.0f,\n        (f.y < value) ? 1.0f : 0.0f,\n        (f.z < value) ? 1.0f : 0.0f);\n}\n\n                  \nvec3 LinearToSRGB(vec3 rgb)\n{\n    rgb = clamp(rgb, 0.0f, 1.0f);\n\n    return mix(\n        pow(rgb, vec3(1.0f / 2.4f)) * 1.055f - 0.055f,\n        rgb * 12.92f,\n        LessThan(rgb, 0.0031308f)\n    );\n}\n              \nvec3 ACESFilm(vec3 x)\n{\n    float a = 2.51f;\n    float b = 0.03f;\n    float c = 2.43f;\n    float d = 0.59f;\n    float e = 0.14f;\n    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);\n}\n\nvec4 postProcess(vec4 pixelColor) {\n\n                      \n    pixelColor.xyz *= exposure;\n\n                   \n    pixelColor.xyz = ACESFilm(pixelColor.xyz);\n    pixelColor.xyz = LinearToSRGB(pixelColor.xyz);\n\n    return pixelColor;\n}"

/***/ }),

/***/ 7499:
/***/ ((module) => {

module.exports = "                                                                                                                        \n  \n           \n                               \n  \n                                                                                                                        \n \n struct Solid {\n    bool isRendered;\n };\n"

/***/ }),

/***/ 7970:
/***/ ((module) => {

module.exports = "                                                                                                                        \n  \n                      \n                                                        \n                                                                     \n                        \n                                                                                 \n                                                                                 \n                                                                                   \n                                                                                    \n                                                                       \n                                                                                                                        \n\nstruct RelPosition {\n    Position local;\n    GroupElement cellBoost;\n    GroupElement invCellBoost;\n};\n\n\n                                                                                                                        \n  \n                    \n                                  \n                                                                       \n                      \n                                                                                 \n                                                                                 \n                                                                            \n                                                                                    \n                                                                                                                        \n\nstruct RelVector {\n    Vector local;\n    GroupElement cellBoost;\n    GroupElement invCellBoost;\n};\n\n\n   \n                                                            \n   \nRelVector reduceError(RelVector v){\n    v.local = reduceError(v.local);\n    return v;\n}\n\n   \n                         \n                            \n                                                      \n   \nRelVector add(RelVector v1, RelVector v2){\n    v1.local = add(v1.local, v2.local);\n    return v1;\n}\n\n   \n                              \n                            \n                                                      \n   \nRelVector sub(RelVector v1, RelVector v2){\n    v1.local = sub(v1.local, v2.local);\n    return v1;\n}\n\n   \n                                   \n                         \n                      \n   \nRelVector multiplyScalar(float s, RelVector v){\n    v.local = multiplyScalar(s, v.local);\n    return v;\n}\n\n   \n                                                                                 \n                     \n                                                        \n   \nfloat geomDot(RelVector v1, RelVector v2) {\n    return geomDot(v1.local, v2.local);\n}\n\n   \n                              \n   \nRelVector geomNormalize(RelVector v){\n    v.local = geomNormalize(v.local);\n    return v;\n}\n\n   \n                                   \n                                                        \n   \nRelVector geomMix(RelVector v1, RelVector v2, float a) {\n    v1.local = geomMix(v1.local, v2.local, a);\n    return v1;\n}\n\n   \n                                            \n   \nRelVector negate(RelVector v){\n    v.local = negate(v.local);\n    return v;\n}\n\n   \n                                                                     \n                                                       \n   \nRelVector geomReflect(RelVector v, RelVector normal){\n    v.local = geomReflect(v.local, normal.local);\n    return v;\n}\n\n\n   \n                                                                     \n                                                       \n   \nRelVector geomRefract(RelVector v, RelVector normal, float n){\n    v.local = geomRefract(v.local, normal.local, n);\n    return v;\n}\n\n   \n                         \n                                            \n                                                                         \n   \nRelVector flow(RelVector v, float t) {\n    v.local = flow(v.local, t);\n    return v;\n}\n\n   \n                                                                                          \n                                                                           \n                                                                          \n                               \n                                                                                              \n   \nRelVector smallShift(RelVector v, vec3 dp){\n    v.local = smallShift(v.local, dp);\n    return v;\n                                                 \n                                                               \n}\n\n\n   \n                                                                                                            \n                           \n                                                   \n                                                                                             \n                                            \n   \n                                                   \n                                                   \n               \n                                                             \n                                                                 \n   \n\n   \n                                                                                                            \n                                                   \n                                                                                             \n   \nRelVector createRelVector(RelVector v, vec3 coords){\n    v.local =  createVector(v.local.pos, coords);\n    return v;\n                                                           \n                                                               \n}\n\n   \n                                                                  \n                          \n                                           \n   \nRelVector applyPosition(RelPosition position, Vector v) {\n    Vector local = applyPosition(position.local, v);\n    return RelVector(local, position.cellBoost, position.invCellBoost);\n}\n\n   \n                                                                                                                    \n   \nRelVector rewrite(RelVector v, GroupElement elt, GroupElement inv){\n    v.local = applyGroupElement(elt, v.local);\n                                     \n                                       \n    v.cellBoost = multiply(v.cellBoost, inv);\n    v.invCellBoost = multiply(elt, v.invCellBoost);\n    return v;\n}\n\n\n                                                                                                                        \n  \n                    \n                                    \n                                                                              \n                  \n                                                      \n                                                                                         \n  \n                                                                                                                        \n\nstruct ExtVector {\n    RelVector vector;\n    VectorData data;\n};\n\n\nExtVector flow(ExtVector v, float t) {\n    v.vector = flow(v.vector, t);\n    v.data.lastFlowDist = t;\n    v.data.lastBounceDist = v.data.lastBounceDist + t;\n    v.data.totalDist  = v.data.totalDist + t;\n    return v;\n}\n\n\n\n"

/***/ }),

/***/ 3419:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    float c = cosh(camera.ipDist);\n    float s = sinh(camera.ipDist);\n    mat4 m = c * mat4(\n    c * c, 0, 0, s * c,\n    0, 1, 0, 0,\n    0, 0, 1, 0,\n    -s * c, 0, 0, -s * s\n    );\n\n    vec4 dir = vec4(coords, 0);\n    dir = normalize(dir);\n    dir = camera.matrixInverse * dir;\n    dir.w = 1.;\n    dir = m * dir;\n    dir.w = 0.;\n    dir = camera.matrix * dir;\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    return applyPosition(camera.position, v);\n}"

/***/ }),

/***/ 4375:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct NativeCamera {\n    float fov;                      \n    float minDist;                                      \n    float maxDist;                                      \n    int maxSteps;                                                        \n    float safetyDist;                                                                               \n    float threshold;                                           \n    RelPosition position;                                                                             \n    mat4 matrix;                                                  \n    mat4 matrixInverse;                                                    \n    float ipDist;                                                                                                   \n};"

/***/ }),

/***/ 7211:
/***/ ((module) => {

module.exports = "                                                                                                                        \n        \n                                                        \n                                                   \n                                                                               \n                                                                                                                        \n\n\n                                                  \n\nfloat hypDot(vec4 v1, vec4 v2){\n    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z - v1.w * v2.w;\n}\n\nfloat hypLengthSq(vec4 v) {\n    return abs(hypDot(v, v));\n}\n\nfloat hypLength(vec4 v) {\n    return sqrt(hypLengthSq(v));\n}\n\nvec4 hypNormalize(vec4 v) {\n    return v / hypLength(v);\n}\n\n                                                                                                                        \n  \n                   \n                                            \n  \n                                                                                                                        \nstruct Isometry{\n    mat4 matrix;\n};\n\n   \n                    \n   \nconst Isometry IDENTITY = Isometry(mat4(1.));                          \n\n   \n                                                              \n                                            \n                                                                                    \n                                                                   \n   \nIsometry reduceError(Isometry isom){\n                                 \n                                 \n                                 \n                                 \n  \n                                \n  \n                                              \n                                \n  \n                                              \n                                              \n                                \n  \n                                              \n                                              \n                                              \n                               \n  \n                                                    \n\n\n    return isom;\n}\n\n   \n                                     \n   \nIsometry multiply(Isometry isom1, Isometry isom2) {\n    Isometry res = Isometry(isom1.matrix * isom2.matrix);\n    return reduceError(res);\n}\n\n   \n                                            \n   \nIsometry geomInverse(Isometry isom) {\n    mat4 inv = inverse(isom.matrix);\n    Isometry res = Isometry(inv);\n    return reduceError(res);\n\n}\n\n                                                                                                                        \n  \n                \n                                        \n  \n                                                                                                                        \nstruct Point{\n                                          \n    vec4 coords;\n};\n\n\nconst Point ORIGIN = Point(vec4(0, 0, 0, 1));                               \n\n   \n                                                           \n   \nPoint reduceError(Point p){\n    vec4 coords = hypNormalize(p.coords);\n    return Point(coords);\n}\n\n   \n                                       \n   \nPoint applyIsometry(Isometry isom, Point p) {\n    vec4 coords = isom.matrix * p.coords;\n    Point res= Point(coords);\n    return reduceError(res);\n}\n\n   \n                                                                     \n                                  \n   \n\nIsometry makeTranslation(Point p) {\n\n    mat4 matrix = mat4(1.);\n    vec3 u = p.coords.xyz;\n    float c1 = length(u);\n\n    if (c1 == 0.){\n        return Isometry(matrix);\n    }\n\n    float c2 = p.coords.w-1.;\n    u = normalize(u);\n\n    mat4 m = mat4(\n    0., 0., 0., u.x,\n    0., 0., 0., u.y,\n    0., 0., 0., u.z,\n    u.x, u.y, u.z, 0.\n    );\n\n    matrix = matrix + c1 * m + c2 * m * m;\n    Isometry res = Isometry(matrix);\n    return reduceError(res);\n}\n\n   \n                                                                     \n                                     \n   \nIsometry makeInvTranslation(Point p) {\n    Isometry isom = makeTranslation(p);\n    return geomInverse(isom);\n}\n\n                                                                                                                        \n  \n                 \n                                                              \n                                                                                                  \n  \n                                                                                                                        \nstruct Vector{\n    Point pos;                         \n    vec4 dir;\n                                                \n};\n\n   \n                                \n   \nVector zeroVector(Point pos){\n    return Vector(pos, vec4(0));\n}\n\n   \n                                                            \n   \nVector reduceError(Vector v){\n    v.pos = reduceError(v.pos);\n    v.dir = v.dir + hypDot(v.pos.coords, v.dir) * v.pos.coords;\n    return v;\n}\n\n   \n                         \n                            \n   \nVector add(Vector v1, Vector v2){\n    return Vector(v1.pos, v1.dir + v2.dir);\n}\n\n   \n                              \n                            \n   \nVector sub(Vector v1, Vector v2){\n    return Vector(v1.pos, v1.dir - v2.dir);\n}\n\n   \n                                   \n                         \n                      \n   \nVector multiplyScalar(float s, Vector v){\n    return Vector(v.pos, s * v.dir);\n}\n\n   \n                                                                                 \n                     \n   \nfloat geomDot(Vector v1, Vector v2) {\n    mat4 g = mat4(\n    1, 0, 0, 0,\n    0, 1, 0, 0,\n    0, 0, 1, 0,\n    0, 0, 0, -1\n    );\n\n    return dot(v1.dir, g*v2.dir);\n}\n\n\n   \n                                        \n   \nVector applyIsometry(Isometry isom, Vector v) {\n    vec4 coords = isom.matrix * v.pos.coords;\n    Point pos = Point(coords);\n    Vector res = Vector(pos, isom.matrix * v.dir);\n    return reduceError(res);\n}\n\n\n   \n                                                                       \n                                                                                                           \n                                           \n   \nVector applyFacing(mat4 m, Vector v) {\n    return Vector(v.pos, m * v.dir);\n}\n\nvoid initFlow(Vector v){\n}"

/***/ }),

/***/ 5449:
/***/ ((module) => {

module.exports = "   \n                               \n                                                                       \n                                     \n                                                      \n                                                                                             \n                                     \n   \nvoid frame(Point p, out Vector[3] f){\n    float x = p.coords.x;\n    float y = p.coords.y;\n    float z = p.coords.z;\n    float w = p.coords.w;\n\n    vec4 dir0 = vec4(w, 0, 0, x);\n    vec4 dir1 = vec4(0, w, 0, y);\n    vec4 dir2 = vec4(0, 0, w, z);\n\n    float l0 = sqrt(abs(w * w - x * x));\n    float l1 = sqrt(abs(w * w - y * y));\n    float l2 = sqrt(abs(w * w - z * z));\n\n    f[0] = Vector(p, dir0 / l0);\n    f[1] = Vector(p, dir1 / l1);\n    f[2] = Vector(p, dir2 / l2);\n}\n\n\n   \n                                           \n                                                                       \n                                     \n                                                      \n   \nvoid orthoFrame(Point p, out Vector[3] f){\n    float x = p.coords.x;\n    float y = p.coords.y;\n    float z = p.coords.z;\n    float w = p.coords.w;\n\n    float den = 1. + w;\n    vec4 dir0 = (1. / den) * vec4(x * x + w + 1., x * y, x * z, x * den);\n    vec4 dir1 = (1. / den) * vec4(x * y, y * y + w + 1., y * z, y * den);\n    vec4 dir2 = (1. / den) * vec4(x * z, y * z, z * z + w + 1., z * den);\n\n    f[0] = Vector(p, dir0);\n    f[1] = Vector(p, dir1);\n    f[2] = Vector(p, dir2);\n}\n\n\n   \n                                                                                         \n                              \n                                                                                              \n   \nPoint smallShift(Point p, vec3 dp){\n    Vector[3] f;\n    frame(p, f);\n    vec4 coords=p.coords+dp[0]*f[0].dir+dp[1]*f[1].dir+dp[2]*f[2].dir;\n\n    Point res=Point(coords);\n    return reduceError(res);\n\n}\n\n\nVector smallShift(Vector v, vec3 dp){\n    Point pos = smallShift(v.pos, dp);\n    return Vector(pos, v.dir);\n}\n\n\n   \n                                  \n                                                 \n   \nVector flow(Vector v, float t){\n    vec4 coords = cosh(t) * v.pos.coords + sinh(t) * v.dir;\n    Point pos = Point(coords);\n    vec4 dir = sinh(t) * v.pos.coords + cosh(t) * v.dir;\n    Vector res = Vector(pos, dir);\n    res = reduceError(res);\n    return geomNormalize(res);\n}\n"

/***/ }),

/***/ 9736:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                                  \n                                                                                                                        \n\nstruct GroupElement {\n    Isometry isom;\n    ivec2 finitePart;\n};\n\nconst GroupElement GROUP_IDENTITY = GroupElement(IDENTITY, ivec2(0, 1));\n\nGroupElement multiply(GroupElement elt1, GroupElement elt2) {\n    Isometry isom = multiply(elt1.isom, elt2.isom);\n    ivec2 fp1 = elt1.finitePart;\n    ivec2 fp2 = elt2.finitePart;\n    ivec2 finitePart = ivec2(\n        int(mod(float(fp1.x + fp1.y * fp2.x), 3.)),\n        fp1.y * fp2.y\n    );\n    return GroupElement(isom, finitePart);\n}\n\n                                                                                 \nint hash(GroupElement elt){\n    ivec2 fp = elt.finitePart;\n    return fp.x + 3 * (fp.y + 1) / 2;\n}\n\nIsometry toIsometry(GroupElement elt) {\n    return elt.isom;\n}"

/***/ }),

/***/ 6467:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                     \n  \n                                                                                                                        \n                                                                                                                        \n\n                                                                                                                        \n          \n                                                                    \n                                                                                                                        \n\nstruct GroupElement {\n    QuadRingMatrix matrix;                                                \n};\n\nconst GroupElement GROUP_IDENTITY = GroupElement(QUAD_RING_IDENTITY);\n\nGroupElement multiply(GroupElement elt1, GroupElement elt2){\n    return GroupElement(multiply(elt1.matrix, elt2.matrix));\n}\n\n                                              \n                                        \n   \n\nIsometry toIsometry(GroupElement elt) {\n    return Isometry(toMat4(elt.matrix));\n}"

/***/ }),

/***/ 5129:
/***/ ((module) => {

module.exports = "Vector direction(Point p, Point q){\n    vec4 dir;\n    float c = hypDot(p.coords, q.coords);\n    dir = q.coords + c * p.coords;\n    dir = dir / sqrt(c * c  - 1.);\n    Vector res = Vector(p, dir);\n    return res;\n}\n"

/***/ }),

/***/ 9681:
/***/ ((module) => {

module.exports = "   \n                              \n   \nfloat dist(Point p1, Point p2){\n    return acosh(-hypDot(p1.coords, p2.coords));\n}"

/***/ }),

/***/ 3237:
/***/ ((module) => {

module.exports = "   \n                                                                           \n                                                  \n                                        \n                                \n  \nfloat lightIntensity(float len){\n                      \n    return 1. / (len * len);\n                           \n}"

/***/ }),

/***/ 7143:
/***/ ((module) => {

module.exports = "   \n                                                                           \n                                                  \n                                        \n                                \n  \nfloat trueLightIntensity(float len){\n    float aux = sinh(len);\n    return 1.  / (aux * aux);\n}"

/***/ }),

/***/ 4112:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct ConstDirLight {\n    int id;\n    vec3 color;\n    float intensity;\n    vec4 direction;\n    int maxDirs;\n};\n\nbool directions(ConstDirLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i != 0){\n        return false;\n    }\n    intensity = light.intensity;\n    Vector local = Vector(v.local.pos, light.direction);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}\n"

/***/ }),

/***/ 4342:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                         \n                                                                                                                        \n\nstruct LocalPointLight {\n    int id;\n    Point position;\n    vec3 color;\n    float intensity;\n    int maxDirs;\n};\n\nbool directions(LocalPointLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i!=0){\n        return false;\n    }\n                                                                         \n    float dist = dist(v.local.pos, light.position);\n    intensity = lightIntensity(dist) * light.intensity;\n    Vector local = direction(v.local.pos, light.position);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}"

/***/ }),

/***/ 155:
/***/ ((module) => {

module.exports = "struct LocalTruePointLight {\n    int id;\n    Point position;\n    vec3 color;\n    float intensity;\n    int maxDirs;\n};\n\nbool directions(LocalTruePointLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i!=0){\n        return false;\n    }\n                                                                         \n    float dist = dist(v.local.pos, light.position);\n    intensity = trueLightIntensity(dist) * light.intensity;\n    Vector local = direction(v.local.pos, light.position);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}"

/***/ }),

/***/ 9191:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                         \n                                                                                                                        \n\nstruct PointLight {\n    int id;\n    Point position;\n    vec3 color;\n    float intensity;\n    int maxDirs;\n};\n\nbool directions(PointLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i!=0){\n        return false;\n    }\n    Point position = applyGroupElement(v.invCellBoost, light.position);\n    float dist = dist(v.local.pos, position);\n    intensity = lightIntensity(dist) * light.intensity;\n    Vector local = direction(v.local.pos, position);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}"

/***/ }),

/***/ 8999:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                               \n                                                                                                                        \n\nstruct SunLight {\n    int id;\n    vec4 position;\n    vec3 color;\n    float intensity;\n    int maxDirs;\n};\n\nbool directions(SunLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i!=0){\n        return false;\n    }\n    intensity = light.intensity;\n    vec4 p = v.local.pos.coords;\n    vec4 l = toIsometry(v.invCellBoost).matrix * light.position;\n    vec4 u = hypDot(p, p) / hypDot(l, p) * l - p;\n    Vector local = Vector(v.local.pos, u);\n    local = geomNormalize(local);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}"

/***/ }),

/***/ 1634:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                         \n                                                                                                                        \n\nstruct TruePointLight {\n    int id;\n    Point position;\n    vec3 color;\n    float intensity;\n    int maxDirs;\n};\n\nbool directions(TruePointLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i!=0){\n        return false;\n    }\n    Point position = applyGroupElement(v.invCellBoost, light.position);\n    float dist = dist(v.local.pos, position);\n    intensity = trueLightIntensity(dist) * light.intensity;\n    Vector local = direction(v.local.pos, position);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}"

/***/ }),

/***/ 2600:
/***/ ((module) => {

module.exports = "struct AugmentedCubeMaterial {\n    vec3 mainColor0;\n    vec3 mainColor2;\n    vec3 mainColor1;\n    vec3 mainColor3;\n    vec3 mainColor4;\n    vec3 mainColor5;\n    vec3 weight;\n};\n\nvec4 render(AugmentedCubeMaterial material, ExtVector v) {\n    vec3 mainColor;\n    int hash = hash(v.vector.cellBoost);\n    switch (hash) {\n        case 0:\n            mainColor = material.mainColor0;\n            break;\n        case 1:\n            mainColor = material.mainColor1;\n            break;\n        case 2:\n            mainColor = material.mainColor2;\n            break;\n        case 3:\n            mainColor = material.mainColor3;\n            break;\n        case 4:\n            mainColor = material.mainColor4;\n            break;\n        case 5:\n            mainColor = material.mainColor5;\n            break;\n    }\n    vec3 color = mainColor + material.weight * v.vector.local.pos.coords.xyw;\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 7184:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                          \n                                                                                                                        \n\nstruct GradientColorMaterial {\n    vec3 color1;\n    vec3 color2;\n    float start1;\n    float start2;\n};\n\nvec4 render(GradientColorMaterial material, ExtVector v) {\n    float aux = clamp(v.vector.local.pos.coords.z, material.start1, material.start2);\n    float coeff = (aux - material.start1) / (material.start2 - material.start1);\n    vec3 color =  (1. - coeff) * material.color1 + coeff * material.color2;\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 7261:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                       \n                                                                                                                        \n\nstruct MultiColorMaterial {\n    vec3 mainColor;\n    vec3 accent1;\n    vec3 accent2;\n    vec3 accent3;\n    bool grid;\n};\n\nvec4 render(MultiColorMaterial material, ExtVector v) {\n\n    vec3 dir = normalize(v.vector.local.pos.coords.xyz);\n    float height = acosh(v.vector.local.pos.coords.w);\n\n    float cosphi = dir.z;\n    float sinphi = length(dir.xy);\n    float phi = atan(sinphi,cosphi);\n    float theta = atan(dir.y,dir.x);\n\n    vec3 color = material.mainColor;\n    color += material.accent1 * dir.x;\n    color += material.accent2 * dir.y;\n    color += material.accent3 * dir.z;\n\n    if(material.grid){\n        float test = sin(70.*phi)*sin(70.*theta)*sin(70.*height);\n        float sgn = sign(test);\n        if (sgn<0.){\n            color *=0.9;\n        }\n    }\n\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 7002:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                       \n                                                                                                                        \n\nstruct MultiColor2Material {\n    vec3 mainColor;\n    vec3 accent1;\n    vec3 accent2;\n    vec3 accent3;\n};\n\nvec4 render(MultiColor2Material material, ExtVector v) {\n\n    float x = v.vector.local.pos.coords.x;\n    float y = v.vector.local.pos.coords.y;\n    float z = v.vector.local.pos.coords.z;\n\n    vec3 color = material.mainColor;\n    color += material.accent1 * abs(x);\n    color += material.accent2 * abs(y);\n    color += material.accent3 * abs(z);\n\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 1046:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                         \n                                                                                                                        \n\nstruct NoiseColorMaterial {\n    vec3 mainColor;\n    vec3 weight;\n    float intensity;\n};\n\n\nvec2 hash(vec2 p)                                   \n{\n    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\n    return -1.0 + 2.0*fract(sin(p)*43758.5453123);\n}\n\nfloat noise(vec2 p)\n{\n    const float K1 = 0.366025404;                 \n    const float K2 = 0.211324865;                 \n\n    vec2  i = floor(p + (p.x+p.y)*K1);\n    vec2  a = p - i + (i.x+i.y)*K2;\n    float m = step(a.y, a.x);\n    vec2  o = vec2(m, 1.0-m);\n    vec2  b = a - o + K2;\n    vec2  c = a - 1.0 + 2.0*K2;\n    vec3  h = max(0.5-vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);\n    vec3  n = h*h*h*h*vec3(dot(a, hash(i+0.0)), dot(b, hash(i+o)), dot(c, hash(i+1.0)));\n    return dot(n, vec3(70.0));\n}\n\nfloat fracNoise(vec2 p){\n    float f = 0.;\n    vec2 uv = 5.0 * p;\n    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);\n    f  = 0.5000 * noise(uv); uv = m*uv;\n    f += 0.2500 * noise(uv); uv = m*uv;\n    f += 0.1250 * noise(uv); uv = m*uv;\n    f += 0.0625 * noise(uv); uv = m*uv;\n    f = 0.5 + 0.5 * f;\n    f *= smoothstep(0.0, 0.005, abs(p.x - 0.6));\n    return f;\n}\n\nvec4 render(NoiseColorMaterial material, ExtVector v) {\n    float f1 = fracNoise(v.vector.local.pos.coords.xy);\n    float f2 = fracNoise(v.vector.local.pos.coords.yz);\n    vec3 color =  material.mainColor + material.intensity * (f1*f2) * material.weight;\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 3236:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                         \n                                                                                                                        \n\nstruct VaryingColorMaterial {\n    vec3 mainColor;\n    vec3 weight;\n};\n\nvec4 render(VaryingColorMaterial material, ExtVector v) {\n    vec3 color = material.mainColor + material.weight * v.vector.local.pos.coords.xyz;\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 6666:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                             \n                                                                                                                        \n\nstruct BallShape {\n    int id;\n    Point center;\n    float radius;\n    Isometry absoluteIsomInv;\n};\n\n   \n                                                 \n   \nfloat sdf(BallShape ball, RelVector v) {\n    Point center = applyIsometry(v.invCellBoost, ball.center);\n    return dist(v.local.pos, center) - ball.radius;\n}\n\n   \n                                              \n   \nRelVector gradient(BallShape ball, RelVector v) {\n    Point center = applyIsometry(v.invCellBoost, ball.center);\n    Vector local = direction(v.local.pos, center);\n    return RelVector(negate(local), v.cellBoost, v.invCellBoost);\n}\n\n   \n         \n                                                                                                              \n                                                                                \n                                 \n   \nvec2 uvMap(BallShape ball, RelVector v) {\n    Point pos = applyGroupElement(v.cellBoost, v.local.pos);\n    Vector direction = direction(ball.center, pos);\n    direction = applyIsometry(ball.absoluteIsomInv, direction);\n    vec4 dir = normalize(direction.dir);\n    float sinPhi = length(dir.xy);\n    float cosPhi = dir.z;\n    float uCoord = atan(dir.y, dir.x);\n    float vCoord = atan(sinPhi, cosPhi);\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 1468:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                             \n                                                                                                                        \n\nstruct CylinderShape {\n    int id;\n    Vector vector;\n    float radius;\n    Isometry absoluteIsomInv;\n};\n\n   \n                                                 \n   \nfloat sdf(CylinderShape cylinder, RelVector v) {\n    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);\n    vec4 dir = toIsometry(v.invCellBoost).matrix * cylinder.vector.dir;\n    float aux0 = hypDot(v.local.pos.coords, point.coords);\n    float aux1 = hypDot(v.local.pos.coords, dir);\n    return acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cylinder.radius;\n}\n\n   \n                                              \n   \nRelVector gradient(CylinderShape cylinder, RelVector v){\n    Point point = applyIsometry(v.invCellBoost, cylinder.vector.pos);\n    vec4 dir = toIsometry(v.invCellBoost).matrix * cylinder.vector.dir;\n    float aux0 = hypDot(v.local.pos.coords, point.coords);\n    float aux1 = hypDot(v.local.pos.coords, dir);\n    float den = sqrt(aux0 * aux0 - aux1 * aux1);\n    vec4 coords = - (aux0 / den) * point.coords + (aux1 / den) * dir;\n    Point proj = Point(coords);\n    Vector local = direction(v.local.pos, proj);\n    local = negate(local);\n    local = geomNormalize(local);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\n   \n         \n                                                                                                              \n                                                                                \n                                 \n   \n                                                  \n   \n"

/***/ }),

/***/ 2581:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                       \n                                                                                                                        \n\nstruct HalfSpaceShape {\n    int id;                           \n    Vector normal;                                                                          \n    Isometry absoluteIsomInv;\n};\n\n   \n                                                      \n   \nfloat sdf(HalfSpaceShape halfspace, RelVector v) {\n    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);\n    float aux = hypDot(v.local.pos.coords, normal.dir);\n    return asinh(aux);\n}\n\n   \n                                                   \n   \nRelVector gradient(HalfSpaceShape halfspace, RelVector v){\n    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);\n    Vector local = Vector(v.local.pos, normal.dir);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\n                                                                                                  \nvec2 uvMap(HalfSpaceShape halfspace, RelVector v){\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(halfspace.absoluteIsomInv, point);\n\n    return point.coords.xy / point.coords.w;\n}\n"

/***/ }),

/***/ 7936:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                                 \n                                                                                                                        \n\nstruct HoroballShape {\n    int id;                           \n    vec4 center;                              \n    float offset;                            \n};\n\n   \n                                                     \n   \nfloat sdf(HoroballShape horoball, RelVector v) {\n    Isometry isom = toIsometry(v.invCellBoost);\n    vec4 center = isom.matrix * horoball.center;\n    vec4 coords = v.local.pos.coords;\n    return log(-hypDot(coords, center)) + horoball.offset;\n}\n\n   \n                                                  \n   \nRelVector gradient(HoroballShape horoball, RelVector v){\n    Isometry isom = toIsometry(v.invCellBoost);\n    vec4 center = isom.matrix * horoball.center;\n    vec4 coords = v.local.pos.coords;\n    vec4 dir = center + hypDot(coords, center) * coords;\n    Vector local = Vector(v.local.pos, dir);\n    local = geomNormalize(local);\n    return RelVector(negate(local), v.cellBoost, v.invCellBoost);\n}\n"

/***/ }),

/***/ 3338:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                             \n                                                                                                                        \n\nstruct LocalBallShape {\n    int id;\n    Point center;\n    float radius;\n};\n\n   \n                                                 \n   \nfloat sdf(LocalBallShape ball, RelVector v) {\n    return dist(v.local.pos, ball.center) - ball.radius;\n}\n\n   \n                                              \n   \nRelVector gradient(LocalBallShape ball, RelVector v){\n    Vector local = direction(v.local.pos, ball.center);\n    return RelVector(negate(local), v.cellBoost, v.invCellBoost);\n}\n\nvec2 uvMap(LocalBallShape ball, RelVector v){\n    Vector radius = direction(ball.center, v.local.pos);\n    Vector[3] f;\n    orthoFrame(v.local.pos,f);\n    float x = geomDot(radius, f[0]);\n    float y = geomDot(radius, f[1]);\n    float cosPhi = geomDot(radius, f[2]);\n    float sinPhi = sqrt(x * x + y * y);\n    float uCoord = atan(y, x);\n    float vCoord = atan(sinPhi, cosPhi);\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 6854:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                             \n                                                                                                                        \n\nstruct LocalCappedConeShape {\n    int id;\n    Vector direction;\n    vec2 radius;\n    float height;\n    vec4 testCapTop;\n    vec4 testCapBtm;\n    float smoothness;\n};\n\n   \n                                                 \n   \nfloat sdf(LocalCappedConeShape cone, RelVector v) {\n    vec4 m = v.local.pos.coords;\n    float aux0 = hypDot(m, cone.direction.pos.coords);\n    float aux1 = hypDot(m, cone.direction.dir);\n    vec4 coords = - aux0 * cone.direction.pos.coords + aux1 * cone.direction.dir;\n    Point proj = Point(hypNormalize(coords));\n    float algDistToCenter = asinh(hypDot(proj.coords, cone.direction.dir));\n    float r = (cone.radius.x - cone.radius.y) * algDistToCenter / cone.height + 0.5 * (cone.radius.x + cone.radius.y);\n    float distCyl = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - r;\n\n    float distCapTop = asinh(hypDot(m, cone.testCapTop));\n    float distCapBtm = asinh(hypDot(m, cone.testCapBtm));\n    float distCap = max(distCapTop, distCapBtm);\n    return smoothMaxPoly(distCyl, distCap, cone.smoothness);\n\n}\n\n     \n                                                \n     \n                                                             \n                   \n                                  \n  \n                                                        \n                                                 \n                                                                           \n                                                                                   \n                                               \n                                           \n                            \n                                                                        \n  \n                                                           \n                                                           \n                                                  \n                                    \n                                                       \n       \n            \n                                                       \n       \n                                                                        \n  \n                                                                                  \n   \n\n   \n         \n                                                                                                              \n                                                                                \n                                 \n   \n                                                  \n   \n"

/***/ }),

/***/ 3273:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                             \n                                                                                                                        \n\nstruct LocalCappedCylinderShape {\n    int id;\n    Vector direction;\n    float radius;\n    vec4 testCapTop;\n    vec4 testCapBtm;\n    float smoothness;\n};\n\n   \n                                                 \n   \nfloat sdf(LocalCappedCylinderShape cyl, RelVector v) {\n    vec4 m = v.local.pos.coords;\n    float aux0 = hypDot(m, cyl.direction.pos.coords);\n    float aux1 = hypDot(m, cyl.direction.dir);\n    vec4 coords = - aux0 * cyl.direction.pos.coords + aux1 * cyl.direction.dir;\n    float distCyl = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cyl.radius;\n\n    float distCapTop = asinh(hypDot(m, cyl.testCapTop));\n    float distCapBtm = asinh(hypDot(m, cyl.testCapBtm));\n    float distCap = max(distCapTop, distCapBtm);\n    return smoothMaxPoly(distCyl, distCap, cyl.smoothness);\n\n}\n\n   \n                                              \n   \nRelVector gradient(LocalCappedCylinderShape cyl, RelVector v){\n    Vector local;\n    vec4 m = v.local.pos.coords;\n\n    float aux0 = hypDot(m, cyl.direction.pos.coords);\n    float aux1 = hypDot(m, cyl.direction.dir);\n    float distCyl = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cyl.radius;\n    vec4 coords = - aux0 * cyl.direction.pos.coords + aux1 * cyl.direction.dir;\n    Point proj = Point(hypNormalize(coords));\n    local = direction(v.local.pos, proj);\n    local = negate(local);\n    RelVector gradCyl = RelVector(local, v.cellBoost, v.invCellBoost);\n\n    float distCapTop = asinh(hypDot(m, cyl.testCapTop));\n    float distCapBtm = asinh(hypDot(m, cyl.testCapBtm));\n    float distCap = max(distCapTop, distCapBtm);\n    if (distCapTop > distCapBtm) {\n        local = Vector(v.local.pos, cyl.testCapTop);\n    }\n    else {\n        local = Vector(v.local.pos, cyl.testCapBtm);\n    }\n    RelVector gradCap = RelVector(local, v.cellBoost, v.invCellBoost);\n\n    return gradientMaxPoly(distCyl, distCap, gradCyl, gradCap, cyl.smoothness);\n}\n\n   \n         \n                                                                                                              \n                                                                                \n                                 \n   \n                                                  \n   \n"

/***/ }),

/***/ 1352:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                             \n                                                                                                                        \n\nstruct LocalCylinderShape {\n    int id;\n    Vector direction;\n    float radius;\n    Isometry absoluteIsomInv;\n};\n\n   \n                                                    \n   \nfloat sdf(LocalCylinderShape cyl, RelVector v) {\n    float aux0 = hypDot(v.local.pos.coords, cyl.direction.pos.coords);\n    float aux1 = hypDot(v.local.pos.coords, cyl.direction.dir);\n    return acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - cyl.radius;\n}\n\n   \n                                                 \n   \nRelVector gradient(LocalCylinderShape cyl, RelVector v){\n    float aux0 = hypDot(v.local.pos.coords, cyl.direction.pos.coords);\n    float aux1 = hypDot(v.local.pos.coords, cyl.direction.dir);\n    vec4 coords = - aux0 * cyl.direction.pos.coords + aux1 * cyl.direction.dir;\n    Point proj = Point(hypNormalize(coords));\n    Vector local = direction(v.local.pos, proj);\n    local = negate(local);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\n   \n         \n                                                                                                              \n                                                                                \n                                 \n   \n                                                       \n   \n"

/***/ }),

/***/ 1509:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                                 \n                                                                                                                        \n\nstruct LocalHoroballShape {\n    int id;                           \n    vec3 center;                              \n    float offset;                            \n};\n\n   \n                                                     \n   \nfloat sdf(LocalHoroballShape horoball, RelVector v) {\n    vec4 center = vec4(horoball.center, 1);\n    vec4 coords = v.local.pos.coords;\n    return log(-hypDot(coords, center)) + horoball.offset;\n}\n\n   \n                                                  \n   \nRelVector gradient(LocalHoroballShape horoball, RelVector v){\n    vec4 center = vec4(horoball.center, 1);\n    vec4 coords = v.local.pos.coords;\n    vec4 dir = center + hypDot(coords, center) * coords;\n    Vector local = Vector(v.local.pos, dir);\n    local = geomNormalize(local);\n    return RelVector(negate(local), v.cellBoost, v.invCellBoost);\n}\n"

/***/ }),

/***/ 2399:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                             \n                                                                                                                        \n\nstruct LocalRoundConeShape {\n    int id;\n    Vector direction;\n    float radius;\n    float height;\n    vec4 testApex;\n};\n\n   \n                                                 \n   \nfloat sdf(LocalRoundConeShape cone, RelVector v) {\n    float distCone, distSphere;\n    float distAux;\n\n    vec4 m = v.local.pos.coords;\n    float aux0 = hypDot(m, cone.direction.pos.coords);\n    float aux1 = hypDot(m, cone.direction.dir);\n    vec4 coords = - aux0 * cone.direction.pos.coords + aux1 * cone.direction.dir;\n    Point proj = Point(hypNormalize(coords));\n    float algDistToCenter = asinh(hypDot(proj.coords, cone.direction.dir));\n    float r = cone.radius * (1. - algDistToCenter / cone.height);\n    distCone = acosh(sqrt(aux0 * aux0 - aux1 * aux1)) - r;\n\n    distAux = asinh(hypDot(m, cone.testApex));\n    distCone = max(distCone, distAux);\n    distAux = asinh(hypDot(m, -cone.direction.dir));\n    distCone = max(distCone, distAux);\n\n    distSphere = dist(v.local.pos, cone.direction.pos) - cone.radius;\n    distAux = asinh(hypDot(m, cone.direction.dir));\n    distSphere = max(distSphere, distAux);\n\n    return min(distCone, distSphere);\n\n}\n\n     \n                                                \n     \n                                                             \n                   \n                                  \n  \n                                                        \n                                                 \n                                                                           \n                                                                                   \n                                               \n                                           \n                            \n                                                                        \n  \n                                                           \n                                                           \n                                                  \n                                    \n                                                       \n       \n            \n                                                       \n       \n                                                                        \n  \n                                                                                  \n   \n\n   \n         \n                                                                                                              \n                                                                                \n                                 \n   \n                                                  \n   \n"

/***/ }),

/***/ 5470:
/***/ ((module) => {

module.exports = "struct SemiLocalSlabShape {\n    int id;\n    Vector normal;\n    float thickness;\n    Isometry absoluteIsomInv;\n\n    GroupElement elt0;\n    GroupElement elt1;\n    GroupElement elt2;\n    GroupElement elt3;\n    GroupElement elt4;\n    GroupElement elt5;\n};\n\nfloat sdf(SemiLocalSlabShape slab, RelVector v) {\n    GroupElement shift;\n    int hashInvCellBoost = hash(v.invCellBoost);\n    switch (hashInvCellBoost) {\n        case 0:\n            shift = slab.elt0;\n            break;\n        case 1:\n            shift = slab.elt1;\n            break;\n        case 2:\n            shift = slab.elt2;\n            break;\n        case 3:\n            shift = slab.elt3;\n            break;\n        case 4:\n            shift = slab.elt4;\n            break;\n        case 5:\n            shift = slab.elt5;;\n            break;\n    }\n    Vector normal = applyGroupElement(shift, slab.normal);\n    float aux = hypDot(v.local.pos.coords, normal.dir);\n    return abs(asinh(aux)) - slab.thickness;\n}\n\nRelVector gradient(SemiLocalSlabShape slab, RelVector v) {\n    GroupElement shift;\n    int hashInvCellBoost = hash(v.invCellBoost);\n    switch (hashInvCellBoost) {\n        case 0:\n            shift = slab.elt0;\n            break;\n        case 1:\n            shift = slab.elt1;\n            break;\n        case 2:\n            shift = slab.elt2;\n            break;\n        case 3:\n            shift = slab.elt3;\n            break;\n        case 4:\n            shift = slab.elt4;\n            break;\n        case 5:\n            shift = slab.elt5;;\n            break;\n    }\n    Vector normal = applyGroupElement(shift, slab.normal);\n    float aux = hypDot(v.local.pos.coords, normal.dir);\n    Vector local = Vector(v.local.pos, sign(aux) * normal.dir);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\n                                                                                                  \n                                                                          \nvec2 uvMap(SemiLocalSlabShape slab, RelVector v) {\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(slab.absoluteIsomInv, v.local.pos);\n    return point.coords.xy / point.coords.w;\n}\n"

/***/ }),

/***/ 6031:
/***/ ((module) => {

module.exports = "struct SlabShape {\n    int id;\n    Vector normal;\n    float thickness;\n    Isometry absoluteIsomInv;\n};\n\nfloat sdf(SlabShape slab, RelVector v) {\n    Vector normal = applyGroupElement(v.invCellBoost, slab.normal);\n    float aux = hypDot(v.local.pos.coords, normal.dir);\n    return abs(asinh(aux)) - slab.thickness;\n}\n\nRelVector gradient(SlabShape slab, RelVector v){\n    Vector normal = applyGroupElement(v.invCellBoost, slab.normal);\n    float aux = hypDot(v.local.pos.coords, normal.dir);\n    Vector local = Vector(v.local.pos, sign(aux) * normal.dir);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\n                                                                                                  \n                                                                          \nvec2 uvMap(SlabShape slab, RelVector v){\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(slab.absoluteIsomInv, v.local.pos);\n    return point.coords.xy / point.coords.w;\n}\n"

/***/ }),

/***/ 5688:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                                            \n  \n                                                                                                                        \n                                                                                                                        \n\n\n"

/***/ }),

/***/ 1371:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                                    \n                                                                        \n                                   \n                                                                    \n                                                                                                                        \n\nstruct QuadRingMatrix {\n    mat4 a;\n    mat4 b;\n};\n\nconst QuadRingMatrix QUAD_RING_IDENTITY = QuadRingMatrix(mat4(1), mat4(0));\n\nQuadRingMatrix reduce(QuadRingMatrix m){\n    m.a[0] = round(m.a[0]);\n    m.b[0] = round(m.b[0]);\n\n    m.a[1] = round(m.a[1]);\n    m.b[1] = round(m.b[1]);\n\n    m.a[2] = round(m.a[2]);\n    m.b[2] = round(m.b[2]);\n\n    m.a[3] = round(m.a[3]);\n    m.b[3] = round(m.b[3]);\n    \n    return m;\n}\n\nQuadRingMatrix multiply(QuadRingMatrix m1, QuadRingMatrix m2){\n    mat4 a = m1.a * m2.a + float(QUAD_RING_D) * m1.b * m2.b;\n    mat4 b = m1.a * m2.b + m1.b * m2.a;\n    QuadRingMatrix res = QuadRingMatrix(a, b);\n    return reduce(res);\n}\n\nmat4 toMat4(QuadRingMatrix m){\n    return m.a + sqrt(float(QUAD_RING_D)) * m.b;\n}"

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
  T0: () => (/* reexport */ AcesFilmPostProcess),
  FJ: () => (/* reexport */ AdvancedResetVRControls),
  GU: () => (/* reexport */ AdvancedShape),
  uv: () => (/* reexport */ AugmentedCubeMaterial),
  XH: () => (/* reexport */ BOTH),
  ec: () => (/* reexport */ Ball),
  Yb: () => (/* reexport */ BallShape),
  ZH: () => (/* reexport */ BasicPTMaterial),
  K9: () => (/* reexport */ BasicRenderer),
  FT: () => (/* reexport */ BasicShape),
  cK: () => (/* reexport */ CREEPING_FULL),
  _x: () => (/* reexport */ CREEPING_OFF),
  kj: () => (/* reexport */ CREEPING_STRICT),
  V1: () => (/* reexport */ Camera),
  Vz: () => (/* reexport */ CheckerboardMaterial),
  ck: () => (/* reexport */ CombinedPostProcess),
  Iy: () => (/* reexport */ ComplementShape),
  Vf: () => (/* reexport */ ConstDirLight),
  Ab: () => (/* reexport */ Cylinder),
  g6: () => (/* reexport */ CylinderShape),
  TB: () => (/* reexport */ DebugMaterial),
  Al: () => (/* reexport */ DragVRControls),
  ix: () => (/* reexport */ EquidistantHypStripsMaterial),
  jZ: () => (/* reexport */ EquidistantSphStripsMaterial),
  c$: () => (/* reexport */ ExpFog),
  Qj: () => (/* reexport */ FlatCamera),
  mD: () => (/* reexport */ FlyControls),
  yb: () => (/* reexport */ Fog),
  d1: () => (/* reexport */ GradientColorMaterial),
  iJ: () => (/* reexport */ GraphPaperMaterial),
  ZA: () => (/* reexport */ Group_Group),
  Jz: () => (/* reexport */ GroupElement_GroupElement),
  Fr: () => (/* reexport */ HalfSpace),
  RM: () => (/* reexport */ HalfSpaceShape),
  fR: () => (/* reexport */ HighlightLocalWrapMaterial),
  kK: () => (/* reexport */ HighlightWrapMaterial),
  KV: () => (/* reexport */ Horoball),
  sm: () => (/* reexport */ HoroballShape),
  ZX: () => (/* reexport */ HypStripsMaterial),
  _f: () => (/* reexport */ ImprovedEquidistantHypStripsMaterial),
  Ht: () => (/* reexport */ ImprovedEquidistantSphStripsMaterial),
  HZ: () => (/* reexport */ InfoControls),
  TN: () => (/* reexport */ IntersectionShape),
  JV: () => (/* reexport */ Isometry),
  Sc: () => (/* reexport */ IsotropicChaseVRControls),
  Nh: () => (/* reexport */ KeyGenericControls),
  RL: () => (/* reexport */ LEFT),
  _k: () => (/* reexport */ Light),
  uR: () => (/* reexport */ LightVRControls),
  gU: () => (/* reexport */ LinearToSRGBPostProcess),
  jo: () => (/* reexport */ LocalBall),
  Q: () => (/* reexport */ LocalBallShape),
  l8: () => (/* reexport */ LocalCappedCone),
  dd: () => (/* reexport */ LocalCappedConeShape),
  Sx: () => (/* reexport */ LocalCappedCylinder),
  ML: () => (/* reexport */ LocalCappedCylinderShape),
  gq: () => (/* reexport */ LocalCylinder),
  Gj: () => (/* reexport */ LocalCylinderShape),
  NW: () => (/* reexport */ LocalHoroball),
  pt: () => (/* reexport */ LocalHoroballShape),
  L8: () => (/* reexport */ LocalPointLight),
  Wu: () => (/* reexport */ LocalRoundCone),
  iq: () => (/* reexport */ LocalRoundConeShape),
  hk: () => (/* reexport */ LocalSlab),
  NZ: () => (/* reexport */ LocalTruePointLight),
  F5: () => (/* reexport */ Material),
  Uc: () => (/* reexport */ Matrix2),
  Fh: () => (/* reexport */ MoveVRControls),
  di: () => (/* reexport */ MultiColor2Material),
  O5: () => (/* reexport */ MultiColorMaterial),
  jy: () => (/* reexport */ NativeCamera),
  MV: () => (/* reexport */ NoiseColorMaterial),
  oB: () => (/* reexport */ NormalMaterial),
  pJ: () => (/* reexport */ PTMaterial),
  GW: () => (/* reexport */ PathTracerCamera),
  DZ: () => (/* reexport */ PathTracerRenderer),
  _K: () => (/* reexport */ PathTracerWrapMaterial),
  JF: () => (/* reexport */ PhongMaterial),
  Lv: () => (/* reexport */ PhongWrapMaterial),
  E9: () => (/* reexport */ Point),
  ce: () => (/* reexport */ PointLight),
  Ly: () => (/* reexport */ Position),
  iv: () => (/* reexport */ QuadRing),
  mH: () => (/* reexport */ QuadRingElement),
  xd: () => (/* reexport */ QuadRingMatrix4),
  pX: () => (/* reexport */ RIGHT),
  tX: () => (/* reexport */ RegularHypPolygon),
  Dz: () => (/* reexport */ RelPosition),
  Th: () => (/* reexport */ Renderer),
  Uj: () => (/* reexport */ ResetVRControls),
  bY: () => (/* reexport */ RotatedSphericalTextureMaterial),
  cV: () => (/* reexport */ SMOOTH_MAX_POLY),
  lR: () => (/* reexport */ SMOOTH_MIN_POLY),
  eZ: () => (/* reexport */ seifert_weber_set),
  xs: () => (/* reexport */ Scene),
  zK: () => (/* reexport */ SemiLocalSlabShape),
  bn: () => (/* reexport */ Shape),
  oC: () => (/* reexport */ ShootVRControls),
  Z1: () => (/* reexport */ SimpleTextureMaterial),
  h8: () => (/* reexport */ SingleColorMaterial),
  sQ: () => (/* reexport */ SlabShape),
  Qf: () => (/* reexport */ Solid),
  jE: () => (/* reexport */ SphereCamera),
  k1: () => (/* reexport */ SquaresMaterial),
  ew: () => (/* reexport */ StripsMaterial),
  Ck: () => (/* reexport */ SunLight),
  $p: () => (/* reexport */ SwitchControls),
  xG: () => (/* reexport */ TeleportationSet),
  l_: () => (/* reexport */ TransitionLocalWrapMaterial),
  pk: () => (/* reexport */ TransitionWrapMaterial),
  lS: () => (/* reexport */ TruePointLight),
  yI: () => (/* reexport */ UnionShape),
  E6: () => (/* reexport */ VRCamera),
  zO: () => (/* reexport */ VRRenderer),
  cB: () => (/* reexport */ VaryingColorMaterial),
  OW: () => (/* reexport */ Vector),
  n3: () => (/* reexport */ VideoAlphaTextureMaterial),
  Se: () => (/* reexport */ VideoFrameTextureMaterial),
  PQ: () => (/* reexport */ VideoTextureMaterial),
  $9: () => (/* reexport */ WrapShape),
  zy: () => (/* reexport */ augmentedCube_set),
  ak: () => (/* reexport */ bind),
  uZ: () => (/* reexport */ clamp),
  Cy: () => (/* reexport */ complement),
  Rc: () => (/* reexport */ cube_set),
  qM: () => (/* reexport */ earthTexture),
  MO: () => (/* reexport */ h435),
  mV: () => (/* reexport */ highlightLocalWrap),
  Gi: () => (/* reexport */ highlightWrap),
  jV: () => (/* reexport */ intersection),
  LK: () => (/* reexport */ m125_set),
  j9: () => (/* reexport */ marsTexture),
  oc: () => (/* reexport */ moonTexture),
  wS: () => (/* reexport */ pathTracerWrap),
  IJ: () => (/* reexport */ phongWrap),
  p2: () => (/* reexport */ safeString),
  w0: () => (/* reexport */ sunTexture),
  aZ: () => (/* reexport */ symbSet),
  VL: () => (/* reexport */ transitionLocalWrap),
  UR: () => (/* reexport */ transitionWrap),
  dV: () => (/* reexport */ set),
  G0: () => (/* reexport */ union),
  HP: () => (/* reexport */ whitehead_set),
  YL: () => (/* reexport */ woodBallMaterial),
  re: () => (/* reexport */ wrap)
});

;// CONCATENATED MODULE: external "three"
var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
const external_three_namespaceObject = x({ ["BufferGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry, ["Clock"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Clock, ["Color"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Color, ["EventDispatcher"]: () => __WEBPACK_EXTERNAL_MODULE_three__.EventDispatcher, ["Float32BufferAttribute"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute, ["HalfFloatType"]: () => __WEBPACK_EXTERNAL_MODULE_three__.HalfFloatType, ["ImageLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ImageLoader, ["LinearFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter, ["MathUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MathUtils, ["Matrix3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Matrix3, ["Matrix4"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Matrix4, ["Mesh"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Mesh, ["NearestFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter, ["NoBlending"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NoBlending, ["OrthographicCamera"]: () => __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera, ["PerspectiveCamera"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera, ["PlaneGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PlaneGeometry, ["Quaternion"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Quaternion, ["RGBAFormat"]: () => __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, ["RepeatWrapping"]: () => __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping, ["Scene"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Scene, ["ShaderMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial, ["SphereGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry, ["Texture"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Texture, ["TextureLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TextureLoader, ["Uniform"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Uniform, ["UniformsUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.UniformsUtils, ["Vector2"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector2, ["Vector3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector3, ["Vector4"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector4, ["VideoTexture"]: () => __WEBPACK_EXTERNAL_MODULE_three__.VideoTexture, ["WebGLRenderTarget"]: () => __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget, ["WebGLRenderer"]: () => __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderer });
;// CONCATENATED MODULE: ./src/geometries/hyp/geometry/Utils.js


/**
 * Lorentzian inner product in R^4
 * @param {Vector4} v
 * @return {number}
 */
external_three_namespaceObject.Vector4.prototype.hypDot = function (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z - this.w * v.w;
}

/**
 * Lorentzian length squared in R^4
 * @return {number}
 */
external_three_namespaceObject.Vector4.prototype.hypLengthSq = function () {
    return Math.abs(this.hypDot(this));
}

/**
 * Lorentzian length in R^4
 * @return {number}
 */
external_three_namespaceObject.Vector4.prototype.hypLength = function () {
    return Math.sqrt(this.hypLengthSq());
}

/**
 * Normalize the vector for the Lorentzian length
 * @return {Vector4}
 */
external_three_namespaceObject.Vector4.prototype.hypNormalize = function () {
    this.divideScalar(this.hypLength());
    return this;
}

;// CONCATENATED MODULE: ./src/core/geometry/Isometry.js
/**
 * @classdesc
 * Isometry of the geometry.
 */
class Isometry {

    /**
     *
     *
     */
    constructor() {
        this.build(...arguments);
    }

    /**
     * Fake constructor
     * If no argument is passed, should return the identity.
     * @abstract
     */
    build() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * True if the object implements the class `Isometry`
     * @return {boolean}
     */
    get isIsometry() {
        return true;
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
     * Reduce the eventual numerical errors of the current isometry
     * (e.g. Gram-Schmidt for orthogonal matrices).
     * @abstract
     * @return {Isometry} The current isometry
     */
    reduceError() {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by `isom` on the left, i.e. replace `this` by `this` * `isom`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    multiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Multiply the current isometry by `isom` on the right, i.e. replace `this` by `isom` * `this`.
     * @abstract
     * @param {Isometry} isom
     * @return {Isometry} The current isometry
     */
    premultiply(isom) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to its inverse
     * @return {Isometry} The current isometry
     */
    invert() {
        this.matrix.invert();
        return this;
    }

    /**
     * Set the current isometry to a preferred one sending the origin to the given point
     * (typically in Nil, Sol, SL2, etc).
     * @abstract
     * @param {Point} point - the target point
     * @return {Isometry} The current isometry
     */
    makeTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to a preferred one sending the given point to the origin
     * (typically in Nil, Sol, SL2, etc).
     * The returned isometry should be the inverse of the one generated by `makeTranslation`.
     * @abstract
     * @param {Point} point - the point that is moved back to the origin
     * @return {Isometry} The current isometry
     */
    makeInvTranslation(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Set the current isometry to a preferred one sending the origin to the image of v by the exponential map.
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
     * @param {Isometry} isom
     * @return {boolean} true if the isometries are equal, false otherwise
     */
    equals(isom) {
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

    /**
     * Return a new copy of the current isometry.
     * @return {Isometry} The clone of the current isometry
     */
    clone() {
        const res = new Isometry();
        res.copy(this);
        return res;
    }

}

;// CONCATENATED MODULE: ./src/core/geometry/Vector.js


/**
 * @extends Vector3
 *
 * @classdesc
 * Tangent vector at the origin written in the reference frame.
 * Are available form three.js:
 * - all the linear algebra
 * - the length of a vector
 */
class Vector extends external_three_namespaceObject.Vector3 {

    /**
     * True if the object implements the class `Vector`
     * @return {boolean}
     */
    get isVector() {
        return true;
    }

    /**
     * Overload Three.js `applyMatrix4`.
     * Indeed, Three.js considers the `Vector3` as a 3D **point**.
     * It multiplies the vector (with an implicit 1 in the 4th dimension) by the matrix, and divides by perspective.
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

;// CONCATENATED MODULE: ./src/geometries/hyp/geometry/Isometry.js







Isometry.prototype.build = function () {
    this.matrix = new external_three_namespaceObject.Matrix4();
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
}

Isometry.prototype.reduceError = function () {
    // Hyperbolic Gram-Schmidt
    const col0 = new external_three_namespaceObject.Vector4(1, 0, 0, 0).applyMatrix4(this.matrix);
    const col1 = new external_three_namespaceObject.Vector4(0, 1, 0, 0).applyMatrix4(this.matrix);
    const col2 = new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.matrix);
    const col3 = new external_three_namespaceObject.Vector4(0, 0, 0, 1).applyMatrix4(this.matrix);

    col0.hypNormalize();

    const aux10 = col0.clone().multiplyScalar(col0.hypDot(col1));
    col1.sub(aux10).hypNormalize();

    const aux20 = col0.clone().multiplyScalar(col0.hypDot(col2));
    const aux21 = col1.clone().multiplyScalar(col1.hypDot(col2));
    col2.sub(aux20).sub(aux21).hypNormalize();

    const aux30 = col0.clone().multiplyScalar(col0.hypDot(col3));
    const aux31 = col1.clone().multiplyScalar(col1.hypDot(col3));
    const aux32 = col2.clone().multiplyScalar(col2.hypDot(col3));
    col3.sub(aux30).sub(aux31).sub(aux32).hypNormalize();

    this.matrix.set(
        col0.x, col1.x, col2.x, col3.x,
        col0.y, col1.y, col2.y, col3.y,
        col0.z, col1.z, col2.z, col3.z,
        col0.w, col1.w, col2.w, col3.w
    );
    return this;
};

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    this.reduceError();
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    this.reduceError();
    return this;
};

Isometry.prototype.invert = function () {
    this.matrix.invert();
    this.reduceError();
    return this;
};

Isometry.prototype.makeTranslation = function (point) {

    this.matrix.identity();

    const [x, y, z, w] = point.coords.toArray();
    const u = new external_three_namespaceObject.Vector3(x, y, z);
    const c1 = u.length(); //sinh


    if (c1 === 0) {
        return this;
    }

    const c2 = w - 1 //cosh
    u.normalize();

    const m = new external_three_namespaceObject.Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        u.x, u.y, u.z, 0);

    const m2 = m.clone().multiply(m);

    m.multiplyScalar(c1);
    this.matrix.add(m);

    m2.multiplyScalar(c2);
    this.matrix.add(m2);

    return this;


};

Isometry.prototype.makeInvTranslation = function (point) {
    this.makeTranslation(point);
    this.invert();
    return this;

};


Isometry.prototype.makeTranslationFromDir = function (vec) {

    this.matrix.identity();
    const t = vec.length();

    if (t === 0) {
        return this;
    }
    const u = vec.clone().normalize();

    const c1 = Math.sinh(t);
    const c2 = Math.cosh(t) - 1.;

    const m = new external_three_namespaceObject.Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        u.x, u.y, u.z, 0);

    const m2 = m.clone().multiply(m);

    m.multiplyScalar(c1);
    this.matrix.add(m);

    m2.multiplyScalar(c2);
    this.matrix.add(m2);

    return this;
};

/***
 * Return the isometry translating the origin by a distance t along the geodesic directed by e_z = (0, 0, 1)
 * @param {number} t - the translation distance
 * @return {Isometry}
 */
Isometry.prototype.makeTranslationZ = function (t) {
    const c = Math.cosh(t);
    const s = Math.sinh(t);
    this.matrix.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, c, s,
        0, 0, s, c
    );
    return this;
}

Isometry.prototype.makeRotationX = function (angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.matrix.set(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
    return this;
}

Isometry.prototype.makeRotationY = function (angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.matrix.set(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
    return this;
}

Isometry.prototype.makeRotationZ = function (angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.matrix.set(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    return this;
}

Isometry.prototype.diffExpMap = function (m) {
    const tangentPosition = new Vector().setFromMatrixPosition(m);
    const aux = m.clone().setPosition(0, 0, 0);
    this.makeTranslationFromDir(tangentPosition);
    this.matrix.multiply(aux);
    return this;
}


Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix);
};


Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
    return this;
};



;// CONCATENATED MODULE: ./src/core/geometry/Point.js
/**
 * @classdesc
 * Point in the geometry.
 */
class Point {

    /**
     * Constructor.
     * Same remark as for `Isometry`.
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
     * True if the object implements the class `Point`
     * @return {boolean}
     */
    get isPoint(){
        return true;
    }

    /**
     * Set the coordinates of the point
     */
    set() {
        throw new Error("This method need be overloaded.");
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
     * Set the current point with the given point
     * @abstract
     * @param {Point} point - the point to copy
     * @return {Point} The current point
     */
    copy(point) {
        throw new Error("This method need be overloaded.");
    }

    /**
     * Return a new copy of the current point.
     * @return {Point} the clone of the current point
     */
    clone() {
        const res = new Point()
        res.copy(this);
        return res;
    }
}

;// CONCATENATED MODULE: ./src/geometries/hyp/geometry/Point.js






Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new external_three_namespaceObject.Vector4(0, 0, 0, 1);
    } else {
        this.coords = new external_three_namespaceObject.Vector4(...arguments);
    }
};

Point.prototype.reduceError = function () {
    // let v = this.coords;
    // let norm = Math.sqrt(-v.x * v.x - v.y * v.y - v.z * v.z + v.w * v.w);
    // this.coords.multiplyScalar(1 / norm);
    this.coords.hypNormalize();
    return this;
}

Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix)
    this.reduceError();
    return this;
};

Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};


Point.prototype.copy = function (point) {
    this.coords.copy(point.coords);
    return this;
};



;// CONCATENATED MODULE: ./src/core/geometry/Position.js





/**
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
         * @type {Quaternion}
         */
        this.quaternion = new external_three_namespaceObject.Quaternion();
    }

    /**
     * True if the object implements the class `Position`
     * @return {boolean}
     */
    get isPosition(){
        return true;
    }

    /**
     * The `facing` as a Matrix4, representing an element of O(3).
     * These are the data that actually passed to the shader
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
        this.boost.copy(isom);
        return this;
    }

    /**
     * Set the facing part of the position.
     * @param {Quaternion} quaternion
     * @return {Position} The current position
     */
    setQuaternion(quaternion) {
        this.quaternion.copy(quaternion);
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
     * Make the quaternion has length one.
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
     * Replace the current position, by the one obtained by flowing the initial position `(id, id)`
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
     * `v` is the pullback at the origin by the position of the direction in which we flow
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
     * Set the current position with the given one.
     * @param {Position} position - the position to copy
     * @return {Position} the current position
     */
    copy(position) {
        this.boost.copy(position.boost);
        this.quaternion.copy(position.quaternion);
        return this;
    }

    /**
     * Return a new copy of the current position.
     * @return {Position} The clone of the current position
     */
    clone() {
        const res = new Position();
        res.copy(this);
        return res;
    }
}


;// CONCATENATED MODULE: ./src/geometries/hyp/geometry/Position.js


Position.prototype.flowFromOrigin = function (v) {
    this.boost.makeTranslationFromDir(v);
    this.quaternion.identity();
    return this;
}



// EXTERNAL MODULE: ./src/geometries/hyp/geometry/shaders/part1.glsl
var part1 = __webpack_require__(7211);
var part1_default = /*#__PURE__*/__webpack_require__.n(part1);
// EXTERNAL MODULE: ./src/geometries/hyp/geometry/shaders/part2.glsl
var part2 = __webpack_require__(5449);
var part2_default = /*#__PURE__*/__webpack_require__.n(part2);
;// CONCATENATED MODULE: ./src/core/renderers/Renderer.js



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
class Renderer {


    /**
     * The first part of the geometry dependent shader.
     * @type{string}
     */
    static shader1 = undefined;
    /**
     * The second part of the geometry dependent shader.
     * @type{string}
     */
    static shader2 = undefined;

    /**
     * Constructor.
     * @param {Camera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the render. For the moment includes
     * @param {WebGLRenderer|Object} threeRenderer - either a Three.js renderer or the parameters to build it
     * - {boolean} postprocess - Gamma and Tone correction
     */
    constructor(camera, scene, params = {}, threeRenderer = {}) {
        /**
         * Non-euclidean camera
         * @type {Camera}
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
         * "Global" uniforms (i.e. values that will not depend on the objects in the scene)
         * A uniform is encoded by an object with two properties
         * `type` - a glsl type
         * `value` - the JS value.
         * @type {Object}
         */
        this.globalUniforms = params.globalUniforms !== undefined ? params.globalUniforms : {};

        if (this.globalUniforms.maxBounces === undefined) {
            this.globalUniforms.maxBounces = {type: 'int', value: 0}
        }
        this.globalUniforms.windowSize = {
            type: 'vec2',
            value: new external_three_namespaceObject.Vector2(window.innerWidth, window.innerHeight)
        };
    }

    /**
     * Shortcut for the underlying teleportation set.
     * @return {TeleportationSet}
     */
    get set() {
        return this.camera.position.set;
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
        throw new Error('Renderer: this method is not implemented');
    }

    /**
     * Render the non-euclidean scene.
     * The method `build` should be called before.
     * @abstract
     */
    render() {
        throw new Error('Renderer: this method is not implemented');
        // this.threeRenderer.render(this.threeScene, this.camera.threeCamera);
    }
}
;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/Pass.js


class Pass {

	constructor() {

		this.isPass = true;

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

	dispose() {}

}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new external_three_namespaceObject.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

class FullscreenTriangleGeometry extends external_three_namespaceObject.BufferGeometry {

	constructor() {

		super();

		this.setAttribute( 'position', new external_three_namespaceObject.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
		this.setAttribute( 'uv', new external_three_namespaceObject.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

	}

}

const _geometry = new FullscreenTriangleGeometry();

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



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/postprocessing/RenderPass.js



class RenderPass extends Pass {

	constructor( scene, camera, overrideMaterial = null, clearColor = null, clearAlpha = null ) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.overrideMaterial = overrideMaterial;

		this.clearColor = clearColor;
		this.clearAlpha = clearAlpha;

		this.clear = true;
		this.clearDepth = false;
		this.needsSwap = false;
		this._oldClearColor = new external_three_namespaceObject.Color();

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		let oldClearAlpha, oldOverrideMaterial;

		if ( this.overrideMaterial !== null ) {

			oldOverrideMaterial = this.scene.overrideMaterial;

			this.scene.overrideMaterial = this.overrideMaterial;

		}

		if ( this.clearColor !== null ) {

			renderer.getClearColor( this._oldClearColor );
			renderer.setClearColor( this.clearColor );

		}

		if ( this.clearAlpha !== null ) {

			oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearAlpha( this.clearAlpha );

		}

		if ( this.clearDepth == true ) {

			renderer.clearDepth();

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

		if ( this.clear === true ) {

			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
			renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );

		}

		renderer.render( this.scene, this.camera );

		// restore

		if ( this.clearColor !== null ) {

			renderer.setClearColor( this._oldClearColor );

		}

		if ( this.clearAlpha !== null ) {

			renderer.setClearAlpha( oldClearAlpha );

		}

		if ( this.overrideMaterial !== null ) {

			this.scene.overrideMaterial = oldOverrideMaterial;

		}

		renderer.autoClear = oldAutoClear;

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

				name: ( shader.name !== undefined ) ? shader.name : 'unspecified',
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

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

}



;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/shaders/CopyShader.js
/**
 * Full-screen textured quad shader
 */

const CopyShader = {

	name: 'CopyShader',

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

		// unlock color and depth buffer and make them writable for subsequent rendering/clearing

		state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		state.buffers.color.setMask( true );
		state.buffers.depth.setMask( true );

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

		this._pixelRatio = renderer.getPixelRatio();

		if ( renderTarget === undefined ) {

			const size = renderer.getSize( new external_three_namespaceObject.Vector2() );
			this._width = size.width;
			this._height = size.height;

			renderTarget = new external_three_namespaceObject.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: external_three_namespaceObject.HalfFloatType } );
			renderTarget.texture.name = 'EffectComposer.rt1';

		} else {

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

		this.copyPass = new ShaderPass( CopyShader );
		this.copyPass.material.blending = external_three_namespaceObject.NoBlending;

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

	dispose() {

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();

		this.copyPass.dispose();

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
     * Alias for the code
     * @return {string}
     */
    get fragmentShader() {
        return this.code;
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
     * Incorporate the given import (if it does not already exist)
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
     * Incorporate the given dependency (if it does not already exist)
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
// EXTERNAL MODULE: ./src/core/renderers/shaders/common/constants.glsl
var constants = __webpack_require__(1767);
var constants_default = /*#__PURE__*/__webpack_require__.n(constants);
// EXTERNAL MODULE: ./src/core/geometry/shaders/commons1.glsl
var commons1 = __webpack_require__(190);
var commons1_default = /*#__PURE__*/__webpack_require__.n(commons1);
// EXTERNAL MODULE: ./src/core/geometry/shaders/commons2.glsl
var commons2 = __webpack_require__(4168);
var commons2_default = /*#__PURE__*/__webpack_require__.n(commons2);
// EXTERNAL MODULE: ./src/core/renderers/shaders/basic/raymarch.glsl
var raymarch = __webpack_require__(2977);
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
// EXTERNAL MODULE: ./src/core/renderers/shaders/basic/postProcessVoid.glsl
var postProcessVoid = __webpack_require__(6159);
var postProcessVoid_default = /*#__PURE__*/__webpack_require__.n(postProcessVoid);
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
 *
 * This one is built with a spherical Three.js screen.
 * It is more convenient for virtual reality (see VRRenderer)
 * It should be used with a perspective Three.js camera
 */
class BasicRenderer extends Renderer {

    /**
     * Constructor.
     * @param {Camera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(camera, scene, params = {}, threeRenderer = {}) {
        super(camera, scene, params, threeRenderer);
        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder();

        /**
         * Add post-processing to the final output
         * @type {PostProcess[]}
         */
        this.postProcess = params.postProcess !== undefined ? params.postProcess : [];
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
        this.composer.setPixelRatio(value);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.composer.setSize(width, height);
    }

    /**
     * Build the fragment shader
     */
    buildFragmentShader() {

        // constants
        this._fragmentBuilder.addChunk((constants_default()));
        Object.keys(this.globalUniforms).forEach(name => {
            const type = this.globalUniforms[name].type;
            const value = this.globalUniforms[name].value;
            this._fragmentBuilder.addUniform(name, type, value);
        });
        // geometry
        this._fragmentBuilder.addChunk(this.constructor.shader1);
        this._fragmentBuilder.addChunk((commons1_default()));
        this._fragmentBuilder.addChunk(this.constructor.shader2);
        this._fragmentBuilder.addChunk((commons2_default()));

        // data carried by ExtVector
        this._fragmentBuilder.addChunk((vectorDataStruct_default()));
        // subgroup/quotient orbifold
        this.set.shader(this._fragmentBuilder);

        // camera
        this.camera.shader(this._fragmentBuilder);

        // scene
        this.scene.shader(this._fragmentBuilder);
        this._fragmentBuilder.addChunk(scenes_glsl_mustache_default()(this));
        this._fragmentBuilder.addChunk(vectorDataUpdate_glsl_mustache_default()(this));

        // ray-march and main
        this._fragmentBuilder.addChunk((raymarch_default()));
        this._fragmentBuilder.addChunk((postProcessVoid_default()));
        this._fragmentBuilder.addChunk((main_default()));
    }

    build() {
        this.buildFragmentShader();
        this.camera.setThreeScene(this._fragmentBuilder);
        const renderPass = new RenderPass(this.camera.threeScene, this.camera.threeCamera);
        renderPass.clear = false;
        this.composer.addPass(renderPass);

        for (let i = 0; i < this.postProcess.length; i++) {
            const effectPass = new ShaderPass(this.postProcess[i].fullShader());
            effectPass.clear = false;
            this.composer.addPass(effectPass);
        }
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

		const shader = CopyShader;

		this.map = map;
		this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

		this.uniforms = external_three_namespaceObject.UniformsUtils.clone( shader.uniforms );

		this.material = new external_three_namespaceObject.ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			depthTest: false,
			depthWrite: false,
			premultipliedAlpha: true

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

	dispose() {

		this.material.dispose();

		this.fsQuad.dispose();

	}

}



// EXTERNAL MODULE: ./src/core/renderers/shaders/common/vertexPostProcess.glsl
var vertexPostProcess = __webpack_require__(7962);
var vertexPostProcess_default = /*#__PURE__*/__webpack_require__.n(vertexPostProcess);
;// CONCATENATED MODULE: ./src/core/renderers/PostProcess.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * A post process is a treatment apply to the picture obtained after rendering the geometry.
 * A post process defines 3 elements :
 * - its uniforms
 * - a vertex shader
 * - a fragment shader
 * Most of the time the vertex shader will be the same.
 * These data are packaged by the method `fullShader`
 */
class PostProcess {

    constructor() {
    }

    /**
     * Return the uniforms needed in the fragment shader.
     * It is a good practice to extend the object return by the method of this abstract class.
     * tDiffuse is the texture containing the rendered geometry.
     * @return {Object} - an object with all the uniforms of the post process
     */
    uniforms() {
        return {'tDiffuse': {value: null}};
    }

    /**
     * @return {string} - the vertex shader
     */
    vertexShader() {
        return (vertexPostProcess_default());
    }

    /**
     * @return {string} - the fragment shader
     */
    fragmentShader() {
        throw new Error('Shape: this method should be implemented');
    }

    /**
     *
     * @return {Object} - all the data needed by the Three.js `addPass` method.
     */
    fullShader() {
        return {
            uniforms: this.uniforms(),
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader()
        }
    }
}
// EXTERNAL MODULE: ./src/commons/postProcess/combined/shaders/fragment.glsl
var fragment = __webpack_require__(2690);
var fragment_default = /*#__PURE__*/__webpack_require__.n(fragment);
;// CONCATENATED MODULE: ./src/commons/postProcess/combined/CombinedPostProcess.js




class CombinedPostProcess extends PostProcess {

    /**
     * Constructor
     * @param {number} exposure - the exposure
     */
    constructor(exposure) {
        super();
        this.exposure = exposure !== undefined ? exposure : 0.8;
    }

    uniforms() {
        const res = super.uniforms();
        res.exposure = {value: this.exposure}
        return res;
    }

    fragmentShader() {
        return (fragment_default());
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
const accumulateQuad = new FullScreenQuad(accumulateMat);

const RT_PARAMETERS = {
    minFilter: external_three_namespaceObject.NearestFilter,
    magFilter: external_three_namespaceObject.NearestFilter,
    format: external_three_namespaceObject.RGBAFormat,
    type: external_three_namespaceObject.HalfFloatType,
};

class PathTracerRenderer extends Renderer {

    /**
     * Constructor.
     * @param {PathTracerCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(camera, scene, params = {}, threeRenderer = {}) {
        super(camera, scene, params, threeRenderer);
        // different default value for the number of time we bounce
        this.globalUniforms.maxBounces.value = params.maxBounces !== undefined ? params.maxBounces : 50;

        /**
         * Add post-processing to the final output
         * @type {PostProcess[]}
         */
        this.postProcess = params.postProcess !== undefined ? params.postProcess : [];
        if (this.postProcess.length === 0) {
            this.postProcess.push(new CombinedPostProcess())
        }

        /**
         * Builder for the fragment shader.
         * @type {ShaderBuilder}
         * @private
         */
        this._fragmentBuilder = new ShaderBuilder(PATHTRACER_RENDERER);

        this.sceneTarget = new external_three_namespaceObject.WebGLRenderTarget(window.innerWidth, window.innerHeight, RT_PARAMETERS);
        this.accReadTarget = new external_three_namespaceObject.WebGLRenderTarget(window.innerWidth, window.innerHeight, RT_PARAMETERS);
        this.accWriteTarget = new external_three_namespaceObject.WebGLRenderTarget(window.innerWidth, window.innerHeight, RT_PARAMETERS);
        /**
         * Index of the frame (used to average the picture in the accumulation)
         * @type {number}
         */
        this.iFrame = 0;
        this.composer = new EffectComposer(this.threeRenderer);
    }

    get isPathTracerRenderer() {
        return true;
    }

    setPixelRatio(value) {
        super.setPixelRatio(value);
        this.composer.setPixelRatio(value);
    }

    setSize(width, height, updateStyle = true) {
        super.setSize(width, height, updateStyle);
        this.sceneTarget.setSize(width, height);
        this.accReadTarget.setSize(width, height);
        this.accWriteTarget.setSize(width, height);
        this.composer.setSize(width, height);
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
        Object.keys(this.globalUniforms).forEach(name => {
            const type = this.globalUniforms[name].type;
            const value = this.globalUniforms[name].value;
            this._fragmentBuilder.addUniform(name, type, value);
        });

        const res = new external_three_namespaceObject.Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.addUniform('resolution', 'vec2', res);

        // geometry
        this._fragmentBuilder.addChunk(this.constructor.shader1);
        this._fragmentBuilder.addChunk((commons1_default()));
        this._fragmentBuilder.addChunk(this.constructor.shader2);
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

    build() {
        this.buildFragmentShader();
        this.camera.setThreeScene(this._fragmentBuilder);
        this.composer.addPass(new TexturePass(this.accReadTarget.texture));

        for (let i = 0; i < this.postProcess.length; i++) {
            const effectPass = new ShaderPass(this.postProcess[i].fullShader());
            effectPass.clear = false;
            this.composer.addPass(effectPass);
        }
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
        this.composer.render();
    }

    render() {
        let accTmpTarget;
        this.updateFrameSeed();
        const res = new external_three_namespaceObject.Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.updateUniform('resolution', res);

        this.threeRenderer.setRenderTarget(this.sceneTarget);
        this.threeRenderer.render(this.camera.threeScene, this.camera.threeCamera);
        //
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
;// CONCATENATED MODULE: external "three/addons"
var addons_x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var addons_y = x => () => x
const addons_namespaceObject = addons_x({ ["VRButton"]: () => __WEBPACK_EXTERNAL_MODULE_three_addons_cab687cf__.VRButton });
;// CONCATENATED MODULE: ./src/core/utils.js



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
 * Sets this matrix as a 2D rotational transformation (i.e. around the Z-axis) by theta radians.
 * This if a fix while before updating to the next version of Three.js (which implements this method).
 * @param {number} theta
 * @return {Matrix3}
 */
external_three_namespaceObject.Matrix3.prototype.makeRotation = function (theta) {

    // counterclockwise

    const c = Math.cos(theta);
    const s = Math.sin(theta);

    this.set(
        c, -s, 0,
        s, c, 0,
        0, 0, 1
    );

    return this;

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

/**
 * Standard clamp function
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
;// CONCATENATED MODULE: ./src/core/constants.js
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

/**
 * ID for the both sides (in VR / Stereo)
 * @type {number}
 */
const BOTH = 2;
;// CONCATENATED MODULE: ./src/core/geometry/GroupElement.js


/**
 * @class
 *
 * @classdesc
 * Group element.
 * This class allows to define a "symbolic" representation for element of a discrete subgroup of isometries.
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
        /**
         * The name of the item.
         * This name is computed (from the uuid) the first time the getter is called.
         * @type {string}
         */
        this.name = `groupElement_${this.uuid}`;
    }


    /**
     * Set the current element to the identity.
     * @return {GroupElement} the current element
     */
    identity() {
        throw new Error("GroupElement: This method need be overloaded.");
    }


    /**
     * Multiply the current element by elt on the left, i.e. replace `this` by `this` * `elt`.
     * @abstract
     * @param {GroupElement} elt
     * @return {GroupElement} The current element
     */
    multiply(elt) {
        throw new Error("GroupElement: This method need be overloaded.");
    }

    /**
     * Multiply the current element by elt on the right, i.e. replace `this` by `elt` * `this`.
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
;// CONCATENATED MODULE: ./src/core/teleportations/RelPosition.js








/**
 *
 * @classdesc
 * Relative position.
 * A general position is represented as a pair $(h,p)$ where
 *
 * - $h$ (`cellBoost`) is a GroupElement representing an element of a discrete subgroups
 * - $p$ (`local`) is a Position
 *
 * The frame represented by the relative position is the image by $h$ of the frame represented by the position $p$
 *
 * We split the isometry part $hg$ in two pieces.
 * The idea is that $g$ should give a position in the fundamental domain of the (implicit) underlying lattice.
 * This will keep the coordinates of $g$ in a bounded range.
 *
 * For simplicity, we also keep track of the inverse of the cellBoost.
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
     * `v` is the pullback at the origin by the position of the direction in which we flow
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
     * Set the current position with the given position.
     * @param {RelPosition} position - the relative position to copy
     * @return {RelPosition} the current relative position
     */
    copy(position) {
        this.cellBoost.copy(position.cellBoost);
        this.invCellBoost.copy(position.invCellBoost);
        this.local.copy(position.local);
        return this;
    }

    /**
     * Return a new copy of the current position.
     * @return {RelPosition} the clone of the current relative position
     */
    clone() {
        const res = new RelPosition(this.set);
        res.copy(this);
        return res;
    }
}


;// CONCATENATED MODULE: ./src/core/geometry/General.js







// EXTERNAL MODULE: ./src/core/cameras/vrCamera/shaders/struct.glsl
var struct = __webpack_require__(8415);
// EXTERNAL MODULE: ./src/core/cameras/vrCamera/shaders/mapping.glsl
var mapping = __webpack_require__(4770);
;// CONCATENATED MODULE: ./src/core/cameras/camera/Camera.js






/**
 * @abstract
 *
 * @classdesc
 * Camera in the non-euclidean scene.
 * It should not be confused with the Three.js camera in the virtual euclidean scene.
 * The minimal GLSL struct should contain
 * - minDist
 * - maxDist
 * - maxSteps
 * - threshold
 * - position
 * - matrix
 * The GLSL code needs to contain (after the declaration) a function `mapping`.
 * The role of this function is to map a point on the horizon sphere
 * to the initial direction to follow during the ray-marching.
 *
 * @todo Refactor the code to handle VR Camera properly.
 * All the properties should have a setter and a getter, update a JS Object passed as uniform to the shader
 * The VR Camera will duplicate the object for the other eye
 * The Object should be called in the shader builder via a method take the side as an optional argument.
 */
class Camera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * These parameters are
     * - {number} minDist - the minimal distance we ray-march
     * - {number} maxDist - the maximal distance we ray-march
     * - {number} maxSteps - the maximal number of steps during the ray-marching
     * - {number} safetyDist - in case an object is at the same place as the camera,
     *      we always initially march a distance safetyDist,
     *      no matter what the SDFs return
     * - {number} threshold - the threshold to stop the ray-marching
     * - {TeleportationSet} set - the underlying subgroup of the geometry (to create the position)
     */
    constructor(parameters) {
        /**
         * The underlying Three.js camera.
         * It has to be implemented (through setThreeCamera) by classes extending Camera
         * @type {Camera}
         */
        this.threeCamera = undefined;
        /**
         * The underlying Three.js scene
         * It has to be implemented (through setThreeScene) by classes extending Camera
         * @type {Scene}
         */
        this.threeScene = new external_three_namespaceObject.Scene();

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
         * Safety distance, to avoid collision with objects attached to the camera
         * @type {number}
         */
        this.safetyDist = parameters.safetyDist !== undefined ? parameters.safetyDist : 0;
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

        /**
         * Two fake copies of the cameras meant to be passed to the shader as uniforms.
         * Mostly for VR
         * @type {Object[]}
         */
        this.fakeCameras = [];

        this.setThreeCamera(parameters);
    }

    /**
     * @abstract
     * Set up the Three.js camera compatible with the Three.js scene
     */
    setThreeCamera(parameters) {
        throw new Error("This method need be implemented.");
    }

    /**
     * @abstract
     * Set up the Three.js scene compatible with the Three.js camera
     */
    setThreeScene() {
        throw new Error("This method need be implemented.");
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
     * Return the chunk of GLSL code defining the camera structure
     * The structure name should always be `Camera`
     * @abstract
     * @return {string}
     */
    static glslClass() {
        throw new Error('Generic: this function should be implemented');
    }

    /**
     * Return the chunk of GLSL code defining the mapping
     *
     *  - from the screen space in Three.js
     *  - to the tangent space to the camera in the geometry
     *
     * The structure name should always be `Camera`
     * @abstract
     * @return {string}
     */
    static glslMapping() {
        throw new Error('Generic: this function should be implemented');
    }


    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     * @param {number} side - the side (left of right) (used for stereographic camera)
     */
    shader(shaderBuilder, side = undefined) {
        shaderBuilder.addClass('Camera', this.constructor.glslClass());
        if(side === undefined){
            shaderBuilder.addUniform('camera', 'Camera', this);

        } else {
            shaderBuilder.addUniform('camera', 'Camera', this.fakeCameras[side]);
        }
        shaderBuilder.addChunk(this.constructor.glslMapping());

    }
}
// EXTERNAL MODULE: ./src/core/cameras/sphereCamera/shaders/vertex.glsl
var vertex = __webpack_require__(5682);
var vertex_default = /*#__PURE__*/__webpack_require__.n(vertex);
// EXTERNAL MODULE: ./src/core/cameras/sphereCamera/shaders/struct.glsl
var shaders_struct = __webpack_require__(5970);
var shaders_struct_default = /*#__PURE__*/__webpack_require__.n(shaders_struct);
// EXTERNAL MODULE: ./src/core/cameras/sphereCamera/shaders/mapping.glsl
var shaders_mapping = __webpack_require__(9222);
var shaders_mapping_default = /*#__PURE__*/__webpack_require__.n(shaders_mapping);
;// CONCATENATED MODULE: ./src/core/cameras/sphereCamera/SphereCamera.js








/**
 *
 * @classdesc
 * Camera with a sphere as a Three.js screen
 */
class SphereCamera extends Camera {


    constructor(parameters) {
        super(parameters);
    }

    /**
     * Set up a Perspective Three.js Camera
     */
    setThreeCamera(parameters) {
        this.threeCamera = new external_three_namespaceObject.PerspectiveCamera(
            parameters.fov !== undefined ? parameters.fov : 70,
            window.innerWidth / window.innerHeight,
            0.01,
            2000
        );
        this.threeCamera.position.set(0, 0, 0);
        this.threeCamera.lookAt(0, 0, -1);
    }

    /**
     * Shortcut to reset the aspect of the underlying Three.js camera
     * @param {number} value
     */
    set aspect(value) {
        this.threeCamera.aspect = value;
    }

    /**
     * Vertical field of view (in degree) from bottom to top.
     * @return {number}
     */
    get fov() {
        return this.threeCamera.fov
    }

    set fov(value) {
        this.threeCamera.fov = value;
    }

    /**
     * Vertical field of view in radians
     * @return {number}
     */
    get fovRadians() {
        return Math.PI * this.fov / 180;
    }

    /**
     *
     * Set up the Three.js scene compatible with the Three.js camera
     *
     * The lag that may occur when we move the sphere to chase the camera can be the source of noisy movement.
     * We put a very large sphere around the user, to minimize this effect.
     */
    setThreeScene(shaderBuilder) {
        const geometry = new external_three_namespaceObject.SphereGeometry(1000, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        const material = new external_three_namespaceObject.ShaderMaterial({
            uniforms: shaderBuilder.uniforms,
            vertexShader: (vertex_default()),
            fragmentShader: shaderBuilder.fragmentShader,
        });
        const horizonSphere = new external_three_namespaceObject.Mesh(geometry, material);
        this.threeScene.add(horizonSphere);
    }

    static glslClass() {
        return (shaders_struct_default());
    }

    static glslMapping() {
        return (shaders_mapping_default());
    }

}
;// CONCATENATED MODULE: ./src/core/cameras/vrCamera/VRCamera.js








/**
 * @class
 *
 * @classdesc
 * Stereographic camera.
 * Used for VR.
 * The position of the camera corresponds to the midpoint between the two eyes.
 */
class VRCamera extends SphereCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * Additional parameters are
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

        for (const side in [LEFT, RIGHT]) {
            this.fakeCameras[side] = {
                fov: this.fov,
                minDist: this.minDist,
                maxDist: this.maxDist,
                maxSteps: this.maxSteps,
                safetyDist: this.safetyDist,
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

    setThreeScene(shaderBuilders) {
        const geometry = new external_three_namespaceObject.SphereGeometry(50, 60, 40);
        // sphere eversion !
        geometry.scale(1, 1, -1);

        const leftMaterial = new external_three_namespaceObject.ShaderMaterial({
            uniforms: shaderBuilders[LEFT].uniforms,
            vertexShader: (vertex_default()),
            fragmentShader: shaderBuilders[LEFT].fragmentShader
        });
        const rightMaterial = new external_three_namespaceObject.ShaderMaterial({
            uniforms: shaderBuilders[RIGHT].uniforms,
            vertexShader: (vertex_default()),
            fragmentShader: shaderBuilders[LEFT].fragmentShader
        });
        const leftHorizonSphere = new external_three_namespaceObject.Mesh(geometry, leftMaterial);
        const rightHorizonSphere = new external_three_namespaceObject.Mesh(geometry, rightMaterial);
        leftHorizonSphere.layers.set(1);
        rightHorizonSphere.layers.set(2);
        this.threeScene.add(leftHorizonSphere, rightHorizonSphere);
    }

    /**
     * Update the fake camera position.
     * Shift the left and right camera from the current position using parallel transport.
     */
    updateFakeCamerasPosition() {
        this.fakeCameras[LEFT].position.copy(this.position);
        this.fakeCameras[RIGHT].position.copy(this.position);

        if (this.isStereoOn) {
            // if we are in VR mode, the position corresponds to the right eye
            // we offset the left eye, by flowing in the left direction
            // we have to be careful that left and right are meant in the point of view of the camera.
            const dir = new Vector(1, 0, 0)
                .multiplyScalar(2 * this.ipDist)
                .applyMatrix4(this.matrix)
                .negate();
            this.fakeCameras[LEFT].position.flow(dir);


            // // if we are in VR mode we offset the position of the left and right eyes
            // // to that end, we flow the position along the left / right direction
            // // we have to be careful that left and right are meant in the point of view of the camera.
            // const rightDir = new Vector(1, 0, 0)
            //     .multiplyScalar(this.ipDist)
            //     .applyMatrix4(this.matrix);
            // const leftDir = rightDir.clone().negate();
            // this.fakeCameras[RIGHT].position.flow(rightDir);
            // this.fakeCameras[LEFT].position.flow(leftDir);
        }
    }

    /**
     * In VR mode the position of the Three.js camera (in the Euclidean Three.js scene)
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
             * @private
             */
            this._chaseThreeCamera = function () {
                // if we are in VR mode, the position corresponds to the right eye
                // this should not  be an issue though.
                // indeed we only care of the relative displacement.
                const newThreePosition = new Vector().setFromMatrixPosition(this.matrix);
                const deltaPosition = new Vector().subVectors(newThreePosition, oldThreePosition);
                this.position.flow(deltaPosition);
                this.updateFakeCamerasPosition();
                oldThreePosition.copy(newThreePosition);
            };
        }
        return this._chaseThreeCamera;
    }
}
// EXTERNAL MODULE: ./src/core/renderers/shaders/vr/postProcessGammaCorrection.glsl
var postProcessGammaCorrection = __webpack_require__(8351);
var postProcessGammaCorrection_default = /*#__PURE__*/__webpack_require__.n(postProcessGammaCorrection);
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
class VRRenderer extends Renderer {

    /**
     * Constructor.
     * @param {VRCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the underlying Three.js renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(camera, scene, params = {}, threeRenderer = {}) {
        super(camera, scene, params, threeRenderer);

        this.threeRenderer.xr.enabled = true;
        this.threeRenderer.xr.setReferenceSpaceType('local');
        this.camera.threeCamera.layers.enable(1);

        const VRButton = addons_namespaceObject.VRButton.createButton(this.threeRenderer);
        const _onClickVRButton = bind(this.camera, this.camera.switchStereo);
        VRButton.addEventListener('click', _onClickVRButton, false);
        document.body.appendChild(VRButton);

        /**
         * Builder for the fragment shader.
         * The first one correspond to the left eye, the second one to the right eye
         * @type {ShaderBuilder[]}
         * @private
         */
        this._fragmentBuilders = [new ShaderBuilder(), new ShaderBuilder()];

        this.postProcess = params.postProcess !== undefined ? params.postProcess : false;
        this.exposure = params.exposure !== undefined ? params.exposure : 1;
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
            this._fragmentBuilders[side].addChunk((constants_default()));
            Object.keys(this.globalUniforms).forEach(name => {
                const type = this.globalUniforms[name].type;
                const value = this.globalUniforms[name].value;
                this._fragmentBuilders[side].addUniform(name, type, value);
            });

            // geometry
            this._fragmentBuilders[side].addChunk(this.constructor.shader1);
            this._fragmentBuilders[side].addChunk((commons1_default()));
            this._fragmentBuilders[side].addChunk(this.constructor.shader2);
            this._fragmentBuilders[side].addChunk((commons2_default()));

            // data carried with RelVector
            this._fragmentBuilders[side].addChunk((vectorDataStruct_default()));
            // subgroup/quotient orbifold
            this.set.shader(this._fragmentBuilders[side]);

            // camera
            this.camera.shader(this._fragmentBuilders[side], side);

            // scene
            this.scene.shader(this._fragmentBuilders[side]);
            this._fragmentBuilders[side].addChunk(scenes_glsl_mustache_default()(this));
            this._fragmentBuilders[side].addChunk(vectorDataUpdate_glsl_mustache_default()(this));


            // ray-march and main
            this._fragmentBuilders[side].addChunk((raymarch_default()));
            if(this.postProcess){
                this._fragmentBuilders[side].addUniform("exposure", "float", this.exposure);
                this._fragmentBuilders[side].addChunk((postProcessGammaCorrection_default()));
            }
            else{
                this._fragmentBuilders[side].addChunk((postProcessVoid_default()));
            }
            this._fragmentBuilders[side].addChunk((main_default()));
        }
    }

    build() {
        this.buildFragmentShader();
        this.camera.setThreeScene(this._fragmentBuilders);
    }

    checkShader(side = LEFT) {
        console.log(this._fragmentBuilders[side].code);
    }

    render() {
        this.camera.chaseThreeCamera();
        this.threeRenderer.render(this.camera.threeScene, this.camera.threeCamera);
    }
}
// EXTERNAL MODULE: ./src/core/cameras/flatCamera/shaders/vertex.glsl
var shaders_vertex = __webpack_require__(6224);
var shaders_vertex_default = /*#__PURE__*/__webpack_require__.n(shaders_vertex);
// EXTERNAL MODULE: ./src/core/cameras/flatCamera/shaders/struct.glsl
var flatCamera_shaders_struct = __webpack_require__(8710);
var flatCamera_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(flatCamera_shaders_struct);
// EXTERNAL MODULE: ./src/core/cameras/flatCamera/shaders/mapping.glsl
var flatCamera_shaders_mapping = __webpack_require__(4750);
var flatCamera_shaders_mapping_default = /*#__PURE__*/__webpack_require__.n(flatCamera_shaders_mapping);
;// CONCATENATED MODULE: ./src/core/cameras/flatCamera/FlatCamera.js








/**
 *
 * @classdesc
 * Camera with a rectangle as a Three.js screen
 */
class FlatCamera extends Camera {


    constructor(parameters) {
        super(parameters);

        /**
         * Vertical field of view (in degrees)
         * Default value is the same as in three.js
         * @type {number}
         */
        this.fov = parameters.fov !== undefined ? parameters.fov : 50;
    }

    /**
     * Set up an Orthographic Three.js camera.
     */
    setThreeCamera() {
        this.threeCamera = new external_three_namespaceObject.OrthographicCamera(
            -1,
            1,
            1,
            -1,
            0,
            1
        );
        this.threeCamera.position.set(0, 0, 0);
        this.threeCamera.lookAt(0, 0, -1);
    }

    /**
     * Vertical field of view in radians
     * @return {number}
     */
    get fovRadians() {
        return Math.PI * this.fov / 180;
    }


    /**
     * Set up the Three.js scene compatible with the Three.js camera
     */
    setThreeScene(shaderBuilder) {
        const geometry = new external_three_namespaceObject.PlaneGeometry(2, 2);
        const material = new external_three_namespaceObject.ShaderMaterial({
            uniforms: shaderBuilder.uniforms,
            vertexShader: (shaders_vertex_default()),
            fragmentShader: shaderBuilder.fragmentShader,
        });

        const threeScreen = new external_three_namespaceObject.Mesh(geometry, material);
        this.threeScene.add(threeScreen);
    }

    static glslClass() {
        return (flatCamera_shaders_struct_default());
    }

    static glslMapping() {
        return (flatCamera_shaders_mapping_default());
    }

}
// EXTERNAL MODULE: ./src/core/cameras/pathTracerCamera/shaders/struct.glsl
var pathTracerCamera_shaders_struct = __webpack_require__(6354);
var pathTracerCamera_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(pathTracerCamera_shaders_struct);
// EXTERNAL MODULE: ./src/core/cameras/pathTracerCamera/shaders/mapping.glsl
var pathTracerCamera_shaders_mapping = __webpack_require__(6684);
var pathTracerCamera_shaders_mapping_default = /*#__PURE__*/__webpack_require__.n(pathTracerCamera_shaders_mapping);
;// CONCATENATED MODULE: ./src/core/cameras/pathTracerCamera/PathTracerCamera.js




class PathTracerCamera extends SphereCamera {

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

    static glslClass() {
        return (pathTracerCamera_shaders_struct_default());
    }

    static glslMapping() {
        return (pathTracerCamera_shaders_mapping_default());
    }
}
;// CONCATENATED MODULE: ./src/core/geometry/Group.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * Group (in the mathematical sense).
 * This class is mainly a container to receive the data common to all elements of the group.
 */
class Group_Group {
    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Create an element in the group.
     * If no data is passed, it should be the identity.
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
// EXTERNAL MODULE: ./src/core/teleportations/shaders/creeping.glsl.mustache
var creeping_glsl_mustache = __webpack_require__(3148);
var creeping_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(creeping_glsl_mustache);
;// CONCATENATED MODULE: ./src/core/teleportations/Teleportation.js





const regexpTest = /bool\s*(\w+)\(Point.*\)/m;
const regexpCreep = /float\s*(\w+)\(ExtVector.*\)/m;

/**
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
     * @param {string} glslCreep -  a chunk of GLSL to move to the boundary defined by the test.
     * The test should be encapsulated in a function with signature ExtVector, float, float -> float
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
     * - a custom creeping function exists
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
// EXTERNAL MODULE: ./src/core/geometry/shaders/groups.glsl
var groups = __webpack_require__(2311);
var groups_default = /*#__PURE__*/__webpack_require__.n(groups);
// EXTERNAL MODULE: ./src/core/teleportations/shaders/relative.glsl
var relative = __webpack_require__(7970);
var relative_default = /*#__PURE__*/__webpack_require__.n(relative);
// EXTERNAL MODULE: ./src/core/teleportations/shaders/teleport.glsl.mustache
var teleport_glsl_mustache = __webpack_require__(5103);
var teleport_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(teleport_glsl_mustache);
;// CONCATENATED MODULE: ./src/core/teleportations/TeleportationSet.js








/**
 * Possible value for `usesCreeping`
 * No creeping is used
 * @type {number}
 */
const CREEPING_OFF = 0;
/**
 * Possible value for `usesCreeping`
 * Only the creeping defined by the user are used
 * @type {number}
 */
const CREEPING_STRICT = 1;
/**
 * Possible value for `usesCreeping`
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
 * It is implicitly a set of generators of a discrete subgroup and a fundamental domain for this subgroup
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
        this.teleportations.push(new Teleportation(this, jsTest, glslTest, elt, inv, glslCreep));
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
        shaderBuilder.addChunk((groups_default()));
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
;// CONCATENATED MODULE: ./src/core/Generic.js
                                                                                                                                          


/**
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

        // if needed, declare the uniform for this instance
        if (this.uniformType !== '') {
            shaderBuilder.addUniform(this.name, this.uniformType, this);
        }

        // add the logic specific to this instance
        shaderBuilder.addInstance(this.name, this.glslInstance());
    }
}
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
     * The shape may contain data which depends on the isometry (like the center of a ball)
     * This method can be overloaded to update all these data when needed
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


;// CONCATENATED MODULE: ./src/core/shapes/BasicShape.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of 3D basic shape.
 * A basic shape is a shape that is not built on top of other shapes.
 * The type of the properties of a basic shape should not depend on the instance of this shape.
 * Indeed, these properties will be passed to the shader in the form of a struct.
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
;// CONCATENATED MODULE: ./src/core/shapes/AdvancedShape.js


/**
 * @class
 * @abstract
 *
 * @classdesc
 * A representation of 3D advanced shapes.
 * An advanced shape is a shape that is built on top of other shapes.
 * The type of the properties of an advanced shape may depend on the instance of this shape.
 * These properties will not be passed to the shader.
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
;// CONCATENATED MODULE: ./src/core/lights/Light.js


/**
 * @abstract
 * @augments Generic
 *
 * @classdesc
 * Abstract class for lights
 */
class Light extends Generic {

    /**
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

    /**
     * Says whether the material is transparent
     * Default is false.
     * @return {boolean}
     */
    get isTransparent() {
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
     * - `vec4 {{name}}_render(ExtVector v)`
     * - `vec4 {{name}}_render(ExtVector v, RelVector normal)`
     * - `vec4 {{name}}_render(ExtVector v, vec2 uv)`
     * - `vec4 {{name}}_render(ExtVector v, RelVector normal, vec2 uv)`
     * The exact signature depends on whether the material requires a normal or UV coordinates.
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
     * The exact signature depends on whether the material requires a normal or UV coordinates.
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
         * @type{Material}
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
        // set up the id for the object
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
         * Is the material reflecting (false by default)
         * The changes will no be passed to the shader (hard coded shader)
         * @type {boolean}
         */
        this._isReflecting = params.isReflecting !== undefined ? params.isReflecting : false;
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
        return this._isReflecting;
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
 * A material that display a checkerboard
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
// EXTERNAL MODULE: ./src/commons/materials/graphPaper/shaders/struct.glsl
var graphPaper_shaders_struct = __webpack_require__(3801);
var graphPaper_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(graphPaper_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/graphPaper/GraphPaperMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a checkerboard
 */
class GraphPaperMaterial extends Material {

    /**
     * Constructor
     * @param {Vector2} dir1 - first direction of the checkerboard
     * @param {Vector2} dir2 - second direction of the checkerboard
     * @param {Color} color1 - first color
     * @param {Color} color2 - second color
     */
    constructor(dir1, dir2, color1, color2,color3) {
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
        return 'GraphPaperMaterial';
    }

    get usesNormal(){
        return false;
    }

    get usesUVMap(){
        return true;
    }

    static glslClass() {
        return (graphPaper_shaders_struct_default());
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
 * A material given by an image file
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
         * Point in the UV coordinates that will be mapped to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new external_three_namespaceObject.Vector2(0, 0);

        /**
         * Scaling factor applied to the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new external_three_namespaceObject.Vector2(1, 1);

        /**
         * Says if the texture has an alpha channel that need be taken into account
         * @type {boolean}
         */
        this._isTransparent = params.isTransparent !== undefined ? params.isTransparent : false;
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

    get isTransparent() {
        return this._isTransparent;
    }

    static glslClass() {
        return (simpleTexture_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/rotatedSphericalTexture/shaders/struct.glsl
var rotatedSphericalTexture_shaders_struct = __webpack_require__(1220);
var rotatedSphericalTexture_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(rotatedSphericalTexture_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/rotatedSphericalTexture/RotatedSphericalTextureMaterial.js








/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by an image file
 * The uv coordinates should correspond to spherical coordinates
 * Apply a rotation given y a quaternion before mapping the texture
 *
 */
class RotatedSphericalTextureMaterial extends Material {

    /**
     * Constructor
     * @param {string} file - path to the image file
     * @param {Quaternion} quaternion - rotation to apply
     * @param {Object} params - options for the material
     */
    constructor(file, quaternion = undefined, params = {}) {
        super();
        /**
         * Quaternion representing the rotation to apply
         * @type {Quaternion}
         */
        this.quaternion = quaternion !== undefined ? quaternion : new external_three_namespaceObject.Quaternion();
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
         * Point in the UV coordinates that will be mapped to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new external_three_namespaceObject.Vector2(0, 0);

        /**
         * Scaling factor applied to the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new external_three_namespaceObject.Vector2(1, 1);

        /**
         * Says if the texture has an alpha channel that need be taken into account
         * @type {boolean}
         */
        this._isTransparent = params.isTransparent !== undefined ? params.isTransparent : false;
    }

    /**
     * Return the rotation to apply represented as a Matrix4
     * (or more precisely its inverse)
     * @type {Matrix4}
     */
    get rotation() {
        return new external_three_namespaceObject.Matrix4()
            .makeRotationFromQuaternion(this.quaternion)
            .invert();
    }

    get uniformType() {
        return 'RotatedSphericalTextureMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    get isTransparent() {
        return this._isTransparent;
    }

    static glslClass() {
        return (rotatedSphericalTexture_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/img/earth/earthmap2k.png
const earthmap2k_namespaceObject = __webpack_require__.p + "img/426f7657671a2811d4aa.png";
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/img/earth/Earth_NoClouds.jpg
const Earth_NoClouds_namespaceObject = __webpack_require__.p + "img/953837709706027f7dc2.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/img/moon/lroc_color_poles_2k.png
const lroc_color_poles_2k_namespaceObject = __webpack_require__.p + "img/eba62d0cff4836a949b8.png";
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/img/moon/2k_moon.jpg
const _2k_moon_namespaceObject = __webpack_require__.p + "img/26419cb1ce4138a11aa9.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/img/mars/2k_mars.jpg
const _2k_mars_namespaceObject = __webpack_require__.p + "img/33960f5af615e67309e5.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/img/sun/2k_sun.jpg
const _2k_sun_namespaceObject = __webpack_require__.p + "img/4b569137334e61081651.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/astronomy/astromonyTextures.js














/**
 * Return a SimpleTextureMaterial corresponding to the earth
 * @param {number} textureID - The id of a texture (among the ones available)
 */
function earthTexture(textureID) {
    let texture;
    switch (textureID) {
        case 0:
            texture = earthmap2k_namespaceObject;
            break;
        case 1:
            texture = Earth_NoClouds_namespaceObject;
            break;
        default:
            texture = earthmap2k_namespaceObject;
    }

    return new SimpleTextureMaterial(texture, {
        start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
        // note the sign on the scaling factor
        // the reason comes from the fact that in our convention for spherical coordinates (theta, phi)
        // phi = 0 is mapped to the point (0,0,1) in cartesian coordinates
        // hence phi is a *decreasing* function of z,
        // which has the effect of reversing the orientation of the image file
        scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}


/**
 * Return a SimpleTextureMaterial corresponding to the moon
 * @param {number} textureID - The id of a texture (among the ones available)
 */
function moonTexture(textureID) {
    let texture;
    switch (textureID) {
        case 0:
            texture = lroc_color_poles_2k_namespaceObject;
            break;
        case 1:
            texture = _2k_moon_namespaceObject;
            break;
        default:
            texture = lroc_color_poles_2k_namespaceObject;
    }

    return new SimpleTextureMaterial(texture, {
        start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
        scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}

/**
 * Return a SimpleTextureMaterial corresponding to Mars
 */
function marsTexture() {
    return new SimpleTextureMaterial(_2k_mars_namespaceObject, {
        start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
        scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}

/**
 * Return a SimpleTextureMaterial corresponding to the sun
 */
function sunTexture(textureID) {
    return new SimpleTextureMaterial(_2k_sun_namespaceObject, {
        start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
        scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}

;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/eye/eye_logo4.jpg
const eye_logo4_namespaceObject = __webpack_require__.p + "img/eb3dc827520201070f7e.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/eye/eye_logo4_cedar.jpg
const eye_logo4_cedar_namespaceObject = __webpack_require__.p + "img/ce3e4a6e1affece0e902.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/eye/eye_logo4_oak.jpg
const eye_logo4_oak_namespaceObject = __webpack_require__.p + "img/370531b8ba6e5bd6a61e.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/eye/eye_logo5.jpg
const eye_logo5_namespaceObject = __webpack_require__.p + "img/29989970ee70af555fd4.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/eye/eye_logo6.jpg
const eye_logo6_namespaceObject = __webpack_require__.p + "img/1a661a5afc65c969818f.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/hand/hand_logo2.jpg
const hand_logo2_namespaceObject = __webpack_require__.p + "img/bb733e02d9f86b8b7433.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/hand/hand_logo3.jpg
const hand_logo3_namespaceObject = __webpack_require__.p + "img/f5196bbc22091948755e.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/hand/hand_logo3_darker.jpg
const hand_logo3_darker_namespaceObject = __webpack_require__.p + "img/9e3233c13cddac942dc4.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/img/hand/hand_logo4.jpg
const hand_logo4_namespaceObject = __webpack_require__.p + "img/2528cfc76a03ca71fb7f.jpg";
;// CONCATENATED MODULE: ./src/commons/materials/woodBall/woodballsMaterials.js















/**
 * Return a SimpleTextureMaterial corresponding to the wood ball with an eye or hands on it.
 * @param {string} type - the type of the texture ("eye" or "hand")
 * @param {number} textureID - The id of a texture (among the ones available)
 * @param {Quaternion} quaternion - The rotation to apply before mapping the structure
 */
function woodBallMaterial(type, textureID, quaternion = undefined) {
    let texture;
    switch (type) {
        case "eye":
            switch (textureID) {
                case 0:
                    texture = eye_logo4_namespaceObject;
                    break;
                case 1:
                    texture = eye_logo4_cedar_namespaceObject;
                    break;
                case 2:
                    texture = eye_logo4_oak_namespaceObject;
                    break;
                case 3:
                    texture = eye_logo5_namespaceObject;
                    break;
                case 4:
                    texture = eye_logo6_namespaceObject;
                    break;
                default:
                    throw new Error("WoodBallMaterial: this texture ID does not exists.");
            }
            break;
        case "hand":
            switch (textureID) {
                case 0:
                    texture = hand_logo2_namespaceObject;
                    break;
                case 1:
                    texture = hand_logo3_namespaceObject;
                    break;
                case 2:
                    texture = hand_logo3_darker_namespaceObject;
                    break;
                case 3:
                    texture = hand_logo4_namespaceObject;
                    break;
                default:
                    throw new Error("WoodBallMaterial: this texture ID does not exists.");
            }
            break;
        default:
            throw new Error("WoodBallMaterial: this type of texture is not implemented.");
    }

    return new RotatedSphericalTextureMaterial(texture, quaternion, {
        start: new external_three_namespaceObject.Vector2(-Math.PI, 0),
        scale: new external_three_namespaceObject.Vector2(1 / (2 * Math.PI), -1 / Math.PI),
    });
}



// EXTERNAL MODULE: ./src/commons/materials/videoTexture/shaders/struct.glsl
var videoTexture_shaders_struct = __webpack_require__(533);
var videoTexture_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(videoTexture_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/videoTexture/VideoTextureMaterial.js








/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by a video file
 *
 */
class VideoTextureMaterial extends Material {

    /**
     * Constructor
     * @param {HTMLVideoElement} videoElement - the element in the HTML file containing the video
     * @param {Object} params - options for the material
     */
    constructor(videoElement, params = {}) {
        super();
        /**
         * Texture built from the given image
         * @type {Texture}
         */
        this.sampler = new external_three_namespaceObject.VideoTexture(videoElement);
        this.sampler.wrapS = params.wrapS !== undefined ? params.wrapS : external_three_namespaceObject.RepeatWrapping;
        this.sampler.wrapT = params.wrapT !== undefined ? params.wrapT : external_three_namespaceObject.RepeatWrapping;
        this.sampler.magFilter = external_three_namespaceObject.LinearFilter;
        this.sampler.minFilter = external_three_namespaceObject.LinearFilter;

        /**
         * Point in the UV coordinates that will be mapped to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new external_three_namespaceObject.Vector2(0, 0);

        /**
         * Scaling factor applied to the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new external_three_namespaceObject.Vector2(1, 1);

        /**
         * Says if the texture has an alpha channel that need be taken into account
         * @type {boolean}
         */
        this.transparent = params.transparent !== undefined ? params.transparent : false;
    }

    get uniformType() {
        return 'VideoTextureMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    get isTransparent() {
        return this.transparent;
    }

    static glslClass() {
        return (videoTexture_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/videoAlphaTexture/shaders/struct.glsl
var videoAlphaTexture_shaders_struct = __webpack_require__(2229);
var videoAlphaTexture_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(videoAlphaTexture_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/videoAlphaTexture/VideoAlphaTextureMaterial.js








/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by a "double" video file
 * The file should consist of two videos stacked on top of one another
 * The video in the upper half part corresponds to the RGB channels
 * The video in the lower half part is a gray scale video encoding the alpha channel.
 */
class VideoAlphaTextureMaterial extends Material {

    /**
     * Constructor
     * @param {HTMLVideoElement} videoElement - the element in the HTML file containing the video
     * @param {Object} params - options for the material
     */
    constructor(videoElement, params = {}) {
        super();
        /**
         * Texture built from the given image
         * @type {Texture}
         */
        this.sampler = new external_three_namespaceObject.VideoTexture(videoElement);
        this.sampler.wrapS = params.wrapS !== undefined ? params.wrapS : external_three_namespaceObject.RepeatWrapping;
        this.sampler.wrapT = params.wrapT !== undefined ? params.wrapT : external_three_namespaceObject.RepeatWrapping;
        this.sampler.magFilter = external_three_namespaceObject.LinearFilter;
        this.sampler.minFilter = external_three_namespaceObject.LinearFilter;

        /**
         * Point in the UV coordinates that will be mapped to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new external_three_namespaceObject.Vector2(0, 0);

        /**
         * Scaling factor applied to the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new external_three_namespaceObject.Vector2(1, 1);

        /**
         * Says if the texture has an alpha channel that need be taken into account
         * @type {boolean}
         */
        this.transparent = params.transparent !== undefined ? params.transparent : true;
    }

    get uniformType() {
        return 'VideoAlphaTextureMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    get isTransparent() {
        return this.transparent;
    }

    static glslClass() {
        return (videoAlphaTexture_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/videoFrameTexture/shaders/struct.glsl
var videoFrameTexture_shaders_struct = __webpack_require__(4680);
var videoFrameTexture_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(videoFrameTexture_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/videoFrameTexture/VideoFrameTextureMaterial.js










/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material given by a series of image files (handled as a "video").
 * The files are prescribed by a JSON object whose property "files" is the list of the image files
 * The prefix, is the eventual prefix for the path of the files
 *
 */
class VideoFrameTextureMaterial extends Material {

    static REFRESH_READY = 0;
    static REFRESH_IN_PROGRESS = 1;
    static REFRESH_COMPLETE = 2;

    /**
     * Constructor
     * @param {Array<string>} files - a list of all the frame files
     * @param {string} prefix - the prefix for the path to the files
     * @param {Object} params - options for the material
     */
    constructor(files, prefix, params = {}) {
        super();

        /**
         * List of files, each file correspond to a frame
         * @type {Array<string>}
         */
        this.files = files;

        /**
         * Number of frames
         * @type {number}
         */
        this.frameNumber = files.length;

        /**
         * Texture built from the given image
         * @type {Texture}
         */
        this.sampler = new external_three_namespaceObject.Texture();
        this.sampler.wrapS = params.wrapS !== undefined ? params.wrapS : external_three_namespaceObject.RepeatWrapping;
        this.sampler.wrapT = params.wrapT !== undefined ? params.wrapT : external_three_namespaceObject.RepeatWrapping;
        this.sampler.magFilter = external_three_namespaceObject.LinearFilter;
        this.sampler.minFilter = external_three_namespaceObject.LinearFilter;

        /**
         * Point in the UV coordinates that will be mapped to the origin of the Texture Coordinates
         * @type {Vector2}
         */
        this.start = params.start !== undefined ? params.start.clone() : new external_three_namespaceObject.Vector2(0, 0);

        /**
         * Scaling factor applied to the UV Coordinates before using them as Texture Coordinates
         * @type {Vector2}
         */
        this.scale = params.scale !== undefined ? params.scale.clone() : new external_three_namespaceObject.Vector2(1, 1);

        /**
         * Says if the texture has an alpha channel that need be taken into account
         * @type {boolean}
         */
        this._isTransparent = params.isTransparent !== undefined ? params.isTransparent : false;

        /**
         * Says if the video should be looped
         * @type {boolean}
         */
        this.loop = params.loop !== undefined ? params.loop : false;


        /**
         * A callback called at each time a frame is loaded
         * @type {Function}
         */
        this.callback = params.callback !== undefined ? params.callback : function () {
        };

        /**
         * Number of frame per second
         * @type {number}
         */
        this.fps = params.fps !== undefined ? params.fps : false;

        /**
         * Status of the image
         * 0 - refresh ready. The texture is ready to load the next frame
         * 1 - refresh in progress. The call for the next frame has been sent, waiting for the file to be loaded
         * @type {number}
         */
        this.imageStatus = VideoFrameTextureMaterial.REFRESH_READY;

        /**
         * Image Loader
         */
        this.imageLoader = new external_three_namespaceObject.ImageLoader();
        this.imageLoader.setPath(prefix);

        /**
         * Current frame used for the texture
         * @type {number}
         */
        this.currentFrame = 0;

    }


    nextFrameIndex(index) {
        if (this.loop) {
            return (index + 1) % this.frameNumber;
        } else {
            return Math.min(index + 1, this.frameNumber - 1)
        }
    }

    /**
     * Load the next file as the image texture,
     * and update the current frame index
     */
    nextFrame() {
        if (this.imageStatus === VideoFrameTextureMaterial.REFRESH_READY) {

            this.imageStatus = VideoFrameTextureMaterial.REFRESH_IN_PROGRESS;
            const url = this.files[this.currentFrame];
            this.currentFrame = this.nextFrameIndex(this.currentFrame);

            const texture = this;
            this.imageLoader.load(
                url,
                function (image) {
                    texture.sampler.image = image;
                    texture.sampler.needsUpdate = true;
                    texture.imageStatus = VideoFrameTextureMaterial.REFRESH_COMPLETE;
                },
                undefined,
                function () {
                    console.log(`Cannot load the file ${url}`);
                }
            );
        }
    }

    get uniformType() {
        return 'VideoFrameTextureMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    get isTransparent() {
        return this._isTransparent;
    }

    static glslClass() {
        return (videoFrameTexture_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/squares/shaders/struct.glsl
var squares_shaders_struct = __webpack_require__(3081);
var squares_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(squares_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/squares/SquaresMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display tilling of nested squares (or more generally parallelograms)
 * It works with at most four colors.
 * The given width correspond to the relative with of each squares.
 * The constructor will renormalize these numbers so that their sum is one.
 */
class SquaresMaterial extends Material {

    /**
     * Constructor
     * @param {Vector2} dir1 - first direction of the lattice
     * @param {Vector2} dir2 - second direction of the lattice
     * @param {number[]} widths - a list of four numbers
     * @param {Color[]} colors - a list of four colors
     */
    constructor(dir1, dir2, colors, widths = undefined) {
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

        const aux0 = widths !== undefined ? widths : [0.5, 1, 1, 0.5];
        let sum = 0;
        const aux1 = [];
        for (let i = 0; i < 4; i++) {
            if (aux0[i] !== undefined) {
                sum = sum + aux0[i];
            }
            aux1[i] = sum;
        }
        for (let i = 0; i < 4; i++) {
            aux1[i] = aux1[i] / sum;
        }
        this.lengths = new external_three_namespaceObject.Vector4(...aux1);


        let lastColor = new external_three_namespaceObject.Color(1, 1, 1);
        /**
         * first color
         * @type {Color}
         */
        this.color0 = colors[0] !== undefined ? colors[0] : lastColor.clone();
        lastColor = this.color0;
        /**
         * second color
         * @type {Color}
         */
        this.color1 = colors[1] !== undefined ? colors[1] : lastColor.clone();
        lastColor = this.color1;
        /**
         * third color
         * @type {Color}
         */
        this.color2 = colors[2] !== undefined ? colors[2] : lastColor.clone();
        lastColor = this.color2;
        /**
         * fourth color
         * @type {Color}
         */
        this.color3 = colors[3] !== undefined ? colors[3] : lastColor.clone();
    }

    get uniformType() {
        return 'SquaresMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (squares_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/strips/shaders/struct.glsl
var strips_shaders_struct = __webpack_require__(9835);
var strips_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(strips_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/strips/StripsMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display alternating strips
 * It works with at most four colors.
 * The given width correspond to the relative with of each strip.
 * The constructor will renormalize these numbers so that their sum is one.
 */
class StripsMaterial extends Material {

    /**
     * Constructor
     * @param {Vector2} dir - the direction orthogonal to the strips
     * @param {Color[]} colors - a list of four colors
     * @param {number[]} widths - a list of four numbers
     */
    constructor(dir, colors, widths = undefined) {
        super();
        /**
         * the direction orthogonal to the strips
         * @type {Vector2}
         */
        this.dir = dir;

        const aux0 = widths !== undefined ? widths : [0.5, 1, 1, 0.5];
        let sum = 0;
        const aux1 = [];
        for (let i = 0; i < 4; i++) {
            if (aux0[i] !== undefined) {
                sum = sum + aux0[i];
            }
            aux1[i] = sum;
        }
        for (let i = 0; i < 4; i++) {
            aux1[i] = aux1[i] / sum;
        }
        this.lengths = new external_three_namespaceObject.Vector4(...aux1);


        let lastColor = new external_three_namespaceObject.Color(1, 1, 1);
        /**
         * first color
         * @type {Color}
         */
        this.color0 = colors[0] !== undefined ? colors[0] : lastColor.clone();
        lastColor = this.color0;
        /**
         * second color
         * @type {Color}
         */
        this.color1 = colors[1] !== undefined ? colors[1] : lastColor.clone();
        lastColor = this.color1;
        /**
         * third color
         * @type {Color}
         */
        this.color2 = colors[2] !== undefined ? colors[2] : lastColor.clone();
        lastColor = this.color2;
        /**
         * fourth color
         * @type {Color}
         */
        this.color3 = colors[3] !== undefined ? colors[3] : lastColor.clone();
    }

    get uniformType() {
        return 'StripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (strips_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/commons/materials/hypStrips/shaders/struct.glsl
var hypStrips_shaders_struct = __webpack_require__(7685);
var hypStrips_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(hypStrips_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/hypStrips/HypStripsMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a surface representing the hyperbolic plane.
 * Coordinates correspond to the Klein model
 * The strips are delimited by geodesic orthogonal to a fixed line
 *
 * It works with at most four colors.
 * The given width correspond to the relative with of each strip.
 * The constructor will renormalize these numbers so that their sum is one.
 */
class HypStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {number} totalWidth - total length of the four widths
     * @param {Color[]} colors - a list of four colors
     * @param {number[]} widths - a list of four numbers
     */
    constructor(totalWidth, colors, widths = undefined) {
        super();

        this.totalWidth = totalWidth;

        const aux0 = widths !== undefined ? widths : [0.5, 1, 1, 0.5];
        let sum = 0;
        const aux1 = [];
        for (let i = 0; i < 4; i++) {
            if (aux0[i] !== undefined) {
                sum = sum + aux0[i];
            }
            aux1[i] = sum;
        }
        for (let i = 0; i < 4; i++) {
            aux1[i] = aux1[i] / sum;
        }
        this.lengths = new external_three_namespaceObject.Vector4(...aux1);


        let lastColor = new external_three_namespaceObject.Color(1, 1, 1);
        /**
         * first color
         * @type {Color}
         */
        this.color0 = colors[0] !== undefined ? colors[0] : lastColor.clone();
        lastColor = this.color0;
        /**
         * second color
         * @type {Color}
         */
        this.color1 = colors[1] !== undefined ? colors[1] : lastColor.clone();
        lastColor = this.color1;
        /**
         * third color
         * @type {Color}
         */
        this.color2 = colors[2] !== undefined ? colors[2] : lastColor.clone();
        lastColor = this.color2;
        /**
         * fourth color
         * @type {Color}
         */
        this.color3 = colors[3] !== undefined ? colors[3] : lastColor.clone();
    }

    get uniformType() {
        return 'HypStripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (hypStrips_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/commons/materials/equidistantSphStrips/shaders/struct.glsl
var equidistantSphStrips_shaders_struct = __webpack_require__(1917);
var equidistantSphStrips_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(equidistantSphStrips_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/equidistantSphStrips/EquidistantSphStripsMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a surface representing a sphere.
 * Coordinates correspond to spherical coordinates (theta, phi) where phi = 0 is the North Pole.
 * The strips are delimited by equidistant lines to geodesics orthogonal to the equator {phi=pi/2}.
 *
 */
class EquidistantSphStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {number} distance - distance between two strips
     * @param {number} halfWidth - with of the strip
     * @param {Color} stripColor - color of the strip
     * @param {Color} bgColor - color in between the group
     */
    constructor(distance, halfWidth, stripColor, bgColor) {
        super();

        this.distance = distance;
        this.halfWidth = halfWidth;
        this.stripColor = stripColor;
        this.bgColor = bgColor;
    }

    get cosHalfWidthSq() {
        const cosHalfWidth = Math.cos(this.halfWidth);
        return cosHalfWidth * cosHalfWidth;
    }

    get uniformType() {
        return 'EquidistantSphStripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (equidistantSphStrips_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/commons/materials/equidistantHypStrips/shaders/struct.glsl
var equidistantHypStrips_shaders_struct = __webpack_require__(4743);
var equidistantHypStrips_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(equidistantHypStrips_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/equidistantHypStrips/EquidistantHypStripsMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a surface representing the hyperbolic plane.
 * Coordinates correspond to the Klein model
 * The strips are delimited by equidistant lines to geodesics orthogoal to the x-axis.
 *
 */
class EquidistantHypStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {number} distance - distance between two strips
     * @param {number} width - with of the strip
     * @param {Color} stripColor - color of the strip
     * @param {Color} bgColor - color in between the group
     */
    constructor(distance, width, stripColor, bgColor) {
        super();

        this.distance = distance;
        this.width = width;
        this.stripColor = stripColor;
        this.bgColor = bgColor;
    }

    get uniformType() {
        return 'EquidistantHypStripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (equidistantHypStrips_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/commons/materials/improvedEquidistantHypStrips/shaders/struct.glsl
var improvedEquidistantHypStrips_shaders_struct = __webpack_require__(4566);
var improvedEquidistantHypStrips_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(improvedEquidistantHypStrips_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/improvedEquidistantHypStrips/ImprovedEquidistantHypStripsMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a surface representing the hyperbolic plane.
 * Coordinates correspond to the Klein model
 * The strips are delimited by equidistant lines to geodesics orthogonal to the x-axis.
 * New strips are added as the geodesics diverge
 *
 * @todo Factor the shader functions also appearing in `EquidistantHypStripsMaterial`
 *
 */
class ImprovedEquidistantHypStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {number} distance - distance between two strips
     * @param {number} halfWidth - with of the strip
     * @param {Color} stripColor - color of the strip
     * @param {Color} bgColor - color in between the group
     */
    constructor(distance, halfWidth, stripColor, bgColor) {
        super();

        this.distance = distance;
        this.halfWidth = halfWidth;
        this.stripColor = stripColor;
        this.bgColor = bgColor;
    }

    get uniformType() {
        return 'ImprovedEquidistantHypStripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (improvedEquidistantHypStrips_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/commons/materials/improvedEquidistantSphStrips/shaders/struct.glsl
var improvedEquidistantSphStrips_shaders_struct = __webpack_require__(1650);
var improvedEquidistantSphStrips_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(improvedEquidistantSphStrips_shaders_struct);
;// CONCATENATED MODULE: ./src/commons/materials/improvedEquidistantSphStrips/ImprovedEquidistantSphStripsMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Strips on a sphere.
 * Coordinates correspond to spherical coordinates (theta, phi) with phi = 0 representing the North Pole
 * The strips are delimited by equidistant lines to geodesics orthogonal to the equator {phi = pi/2}
 * Strips are removed as the geodesics converges
 *
 * @todo Factor the shader functions also appearing in `EquidistantHypStripsMaterial`
 *
 */
class ImprovedEquidistantSphStripsMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {number} distance - distance between two strips
     * @param {number} halfWidth - with of the strip
     * @param {number} fadingAmplitude - amplitude of the fading
     * @param {Color} stripColor - color of the strip
     * @param {Color} bgColor - color in between the group
     * @param {Quaternion} quaternion - quaternion to eventually rotate the texture
     * (when this cannot be done by an isometry of the space)
     * by default the identity
     */
    constructor(distance, halfWidth, fadingAmplitude, stripColor, bgColor, quaternion = undefined) {
        super();

        this.distance = distance;
        this.halfWidth = halfWidth;
        this.fadingAmplitude = fadingAmplitude;
        this.stripColor = stripColor;
        this.bgColor = bgColor;

        /**
         * Quaternion representing the rotation to apply
         * @type {Quaternion}
         */
        this.quaternion = quaternion !== undefined ? quaternion : new external_three_namespaceObject.Quaternion();
    }

    /**
     * Return the rotation to apply represented as a Matrix4
     * (or more precisely its inverse)
     * @type {Matrix4}
     */
    get rotation() {
        return new external_three_namespaceObject.Matrix4()
            .makeRotationFromQuaternion(this.quaternion)
            .invert();
    }

    get cosHalfWidthSq() {
        const cosHalfWidth = Math.cos(this.halfWidth);
        return cosHalfWidth * cosHalfWidth;
    }

    get uniformType() {
        return 'ImprovedEquidistantSphStripsMaterial';
    }

    get usesNormal() {
        return false;
    }

    get usesUVMap() {
        return true;
    }

    static glslClass() {
        return (improvedEquidistantSphStrips_shaders_struct_default());
    }

    glslRender() {
        return renderUV_glsl_mustache_default()(this);
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
         * Is the material reflecting (false by default)
         * The changes will no be passed to the shader (hard coded shader)
         * @type {boolean}
         */
        this._isReflecting = params.isReflecting !== undefined ? params.isReflecting : false;
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
        return this._isReflecting;
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
// EXTERNAL MODULE: ./src/commons/materials/highlightWrap/shaders/struct.glsl
var highlightWrap_shaders_struct = __webpack_require__(3048);
var highlightWrap_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(highlightWrap_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/highlightWrap/shaders/render.glsl.mustache
var highlightWrap_shaders_render_glsl_mustache = __webpack_require__(8474);
var highlightWrap_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(highlightWrap_shaders_render_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/highlightWrap/shaders/renderNormal.glsl.mustache
var shaders_renderNormal_glsl_mustache = __webpack_require__(5506);
var shaders_renderNormal_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_renderNormal_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/highlightWrap/shaders/renderUV.glsl.mustache
var highlightWrap_shaders_renderUV_glsl_mustache = __webpack_require__(3045);
var highlightWrap_shaders_renderUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(highlightWrap_shaders_renderUV_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/highlightWrap/shaders/renderNormalUV.glsl.mustache
var shaders_renderNormalUV_glsl_mustache = __webpack_require__(7397);
var shaders_renderNormalUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shaders_renderNormalUV_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/highlightWrap/HighlightWrapMaterial.js









/**
 * @class
 *
 * @classdesc
 * Combination of two materials, to highlight an object in a simulation
 * The highlighted solid is either a global object or all the "copies" of a local object
 */
class HighlightWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} defaultMat - the default material
     * @param {Material} highlightMat - the highlight material
     */
    constructor(defaultMat, highlightMat) {
        super();
        this.defaultMat = defaultMat;
        this.highlightMat = highlightMat;

        this.isHighlightOn = false;
    }

    get uniformType() {
        return 'HighlightWrapMaterial';
    }

    static glslClass() {
        return (highlightWrap_shaders_struct_default());
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return (this.defaultMat.usesUVMap || this.highlightMat.usesUVMap);
    }

    get usesLight() {
        return (this.defaultMat.usesLight || this.highlightMat.usesLight);
    }

    get isReflecting() {
        return (this.defaultMat.isReflecting || this.highlightMat.isReflecting);
    }

    glslRender() {
        if (this.usesNormal) {
            if (this.usesUVMap) {
                return shaders_renderNormalUV_glsl_mustache_default()(this);
            } else {
                return shaders_renderNormal_glsl_mustache_default()(this);
            }
        } else {
            if (this.usesUVMap) {
                return highlightWrap_shaders_renderUV_glsl_mustache_default()(this);
            } else {
                return highlightWrap_shaders_render_glsl_mustache_default()(this);
            }
        }
    }

    /**
     * Set the ID of the material.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.defaultMat.setId(scene);
        this.highlightMat.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the material is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.defaultMat.onAdd(scene);
        this.highlightMat.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.defaultMat.shader(shaderBuilder);
        this.highlightMat.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} defaultMat - the default material
 * @param {Material} highlightMat - the highlight material
 */
function highlightWrap(defaultMat, highlightMat) {
    return new HighlightWrapMaterial(defaultMat, highlightMat);
}
// EXTERNAL MODULE: ./src/commons/materials/highlightLocalWrap/shaders/struct.glsl
var highlightLocalWrap_shaders_struct = __webpack_require__(2278);
var highlightLocalWrap_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(highlightLocalWrap_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/highlightLocalWrap/shaders/render.glsl.mustache
var highlightLocalWrap_shaders_render_glsl_mustache = __webpack_require__(8906);
var highlightLocalWrap_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(highlightLocalWrap_shaders_render_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/highlightLocalWrap/shaders/renderNormal.glsl.mustache
var highlightLocalWrap_shaders_renderNormal_glsl_mustache = __webpack_require__(1998);
var highlightLocalWrap_shaders_renderNormal_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(highlightLocalWrap_shaders_renderNormal_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/highlightLocalWrap/shaders/renderUV.glsl.mustache
var highlightLocalWrap_shaders_renderUV_glsl_mustache = __webpack_require__(4261);
var highlightLocalWrap_shaders_renderUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(highlightLocalWrap_shaders_renderUV_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/highlightLocalWrap/shaders/renderNormalUV.glsl.mustache
var highlightLocalWrap_shaders_renderNormalUV_glsl_mustache = __webpack_require__(699);
var highlightLocalWrap_shaders_renderNormalUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(highlightLocalWrap_shaders_renderNormalUV_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/highlightLocalWrap/HighlightLocalWrapMaterial.js









/**
 * @class
 *
 * @classdesc
 * Combination of two materials, to highlight an object in a simulation
 * The highlighted object is a single "copy" of a local object (characterized by its cellBoost)
 */
class HighlightLocalWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} defaultMat - the default material
     * @param {Material} highlightMat - the highlight material
     * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
     */
    constructor(defaultMat, highlightMat, cellBoost) {
        super();
        this.defaultMat = defaultMat;
        this.highlightMat = highlightMat;
        this.cellBoost = cellBoost;
    }

    get uniformType() {
        return 'HighlightLocalWrapMaterial';
    }

    static glslClass() {
        return (highlightLocalWrap_shaders_struct_default());
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return (this.defaultMat.usesUVMap || this.highlightMat.usesUVMap);
    }

    get usesLight() {
        return (this.defaultMat.usesLight || this.highlightMat.usesLight);
    }

    get isReflecting() {
        return (this.defaultMat.isReflecting || this.highlightMat.isReflecting);
    }

    glslRender() {
        if (this.usesNormal) {
            if (this.usesUVMap) {
                return highlightLocalWrap_shaders_renderNormalUV_glsl_mustache_default()(this);
            } else {
                return highlightLocalWrap_shaders_renderNormal_glsl_mustache_default()(this);
            }
        } else {
            if (this.usesUVMap) {
                return highlightLocalWrap_shaders_renderUV_glsl_mustache_default()(this);
            } else {
                return highlightLocalWrap_shaders_render_glsl_mustache_default()(this);
            }
        }
    }

    /**
     * Set the ID of the material.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.defaultMat.setId(scene);
        this.highlightMat.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the material is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.defaultMat.onAdd(scene);
        this.highlightMat.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.defaultMat.shader(shaderBuilder);
        this.highlightMat.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} defaultMat - the default material
 * @param {Material} highlightMat - the highlight material
 * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
 */
function highlightLocalWrap(defaultMat, highlightMat, cellBoost) {
    return new HighlightLocalWrapMaterial(defaultMat, highlightMat, cellBoost);
}
// EXTERNAL MODULE: ./src/commons/materials/transitionWrap/shaders/struct.glsl
var transitionWrap_shaders_struct = __webpack_require__(5698);
var transitionWrap_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(transitionWrap_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/transitionWrap/shaders/render.glsl.mustache
var transitionWrap_shaders_render_glsl_mustache = __webpack_require__(8402);
var transitionWrap_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionWrap_shaders_render_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/transitionWrap/shaders/renderNormal.glsl.mustache
var transitionWrap_shaders_renderNormal_glsl_mustache = __webpack_require__(6158);
var transitionWrap_shaders_renderNormal_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionWrap_shaders_renderNormal_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/transitionWrap/shaders/renderUV.glsl.mustache
var transitionWrap_shaders_renderUV_glsl_mustache = __webpack_require__(2332);
var transitionWrap_shaders_renderUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionWrap_shaders_renderUV_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/transitionWrap/shaders/renderNormalUV.glsl.mustache
var transitionWrap_shaders_renderNormalUV_glsl_mustache = __webpack_require__(4146);
var transitionWrap_shaders_renderNormalUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionWrap_shaders_renderNormalUV_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/transitionWrap/TransitionWrapMaterial.js












/**
 * @class
 *
 * @classdesc
 * Combination of two materials.
 * Can smoothly interpolate between two materials
 */
class TransitionWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} mat0 - the first material (ratio 0)
     * @param {Material} mat1 - the second material (ratio 1)
     * @param {number} duration - duration of the transition (in s)
     */
    constructor(mat0, mat1, duration = undefined) {
        super();
        this.mat0 = mat0;
        this.mat1 = mat1;
        this.duration = duration !== undefined ? duration : 5;

        this._clock = new external_three_namespaceObject.Clock();
        this._ratio = 0;
        this._ratioOrigin = 0;
        this._direction = -1;
    }

    toggle() {
        this._direction = -this._direction;
        this._ratioOrigin = this._ratio;
        this._clock.start();
    }

    get ratio() {
        this._ratio = clamp(
            this._ratioOrigin + this._direction * (this._clock.getElapsedTime() / this.duration),
            0,
            1
        );
        return this._ratio;
    }

    get uniformType() {
        return 'TransitionWrapMaterial';
    }

    static glslClass() {
        return (transitionWrap_shaders_struct_default());
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return (this.mat0.usesUVMap || this.mat1.usesUVMap);
    }

    get usesLight() {
        return (this.mat0.usesLight || this.mat1.usesLight);
    }

    get isReflecting() {
        return (this.mat0.isReflecting || this.mat1.isReflecting);
    }

    glslRender() {
        if (this.usesNormal) {
            if (this.usesUVMap) {
                return transitionWrap_shaders_renderNormalUV_glsl_mustache_default()(this);
            } else {
                return transitionWrap_shaders_renderNormal_glsl_mustache_default()(this);
            }
        } else {
            if (this.usesUVMap) {
                return transitionWrap_shaders_renderUV_glsl_mustache_default()(this);
            } else {
                return transitionWrap_shaders_render_glsl_mustache_default()(this);
            }
        }
    }

    /**
     * Set the ID of the material.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.mat0.setId(scene);
        this.mat1.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the material is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.mat0.onAdd(scene);
        this.mat1.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.mat0.shader(shaderBuilder);
        this.mat1.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} defaultMat - the default material
 * @param {Material} highlightMat - the highlight material
 * @param {number} duration - duration of the transition (in ms)
 */
function transitionWrap(defaultMat, highlightMat, duration) {
    return new TransitionWrapMaterial(defaultMat, highlightMat, duration);
}
// EXTERNAL MODULE: ./src/commons/materials/transitionLocalWrap/shaders/struct.glsl
var transitionLocalWrap_shaders_struct = __webpack_require__(1888);
var transitionLocalWrap_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(transitionLocalWrap_shaders_struct);
// EXTERNAL MODULE: ./src/commons/materials/transitionLocalWrap/shaders/render.glsl.mustache
var transitionLocalWrap_shaders_render_glsl_mustache = __webpack_require__(5377);
var transitionLocalWrap_shaders_render_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionLocalWrap_shaders_render_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/transitionLocalWrap/shaders/renderNormal.glsl.mustache
var transitionLocalWrap_shaders_renderNormal_glsl_mustache = __webpack_require__(9441);
var transitionLocalWrap_shaders_renderNormal_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionLocalWrap_shaders_renderNormal_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/transitionLocalWrap/shaders/renderUV.glsl.mustache
var transitionLocalWrap_shaders_renderUV_glsl_mustache = __webpack_require__(6766);
var transitionLocalWrap_shaders_renderUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionLocalWrap_shaders_renderUV_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/transitionLocalWrap/shaders/renderNormalUV.glsl.mustache
var transitionLocalWrap_shaders_renderNormalUV_glsl_mustache = __webpack_require__(9245);
var transitionLocalWrap_shaders_renderNormalUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(transitionLocalWrap_shaders_renderNormalUV_glsl_mustache);
;// CONCATENATED MODULE: ./src/commons/materials/transitionLocalWrap/TransitionLocalWrapMaterial.js












/**
 * @class
 *
 * @classdesc
 * Combination of two materials.
 * Can smoothly interpolate between two materials
 * Only a single "copy" of a local object is affected (characterized by its cellBoost)
 */
class TransitionLocalWrapMaterial extends Material {

    /**
     * Constructor.
     * @param {Material} mat0 - the first material (ratio 0)
     * @param {Material} mat1 - the second material (ratio 1)
     * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
     * @param {number} duration - duration of the transition (in s)
     */
    constructor(mat0, mat1, cellBoost, duration = undefined) {
        super();
        this.mat0 = mat0;
        this.mat1 = mat1;
        this.duration = duration !== undefined ? duration : 5;
        this.cellBoost = cellBoost;

        this._clock = new external_three_namespaceObject.Clock();
        this._ratio = 0;
        this._ratioOrigin = 0;
        this._direction = -1;
    }

    toggle() {
        this._direction = -this._direction;
        this._ratioOrigin = this._ratio;
        this._clock.start();
    }

    get ratio() {
        this._ratio = clamp(
            this._ratioOrigin + this._direction * (this._clock.getElapsedTime() / this.duration),
            0,
            1
        );
        return this._ratio;
    }

    get uniformType() {
        return 'TransitionLocalWrapMaterial';
    }

    static glslClass() {
        return (transitionLocalWrap_shaders_struct_default());
    }

    get usesNormal() {
        return true;
    }

    get usesUVMap() {
        return (this.mat0.usesUVMap || this.mat1.usesUVMap);
    }

    get usesLight() {
        return (this.mat0.usesLight || this.mat1.usesLight);
    }

    get isReflecting() {
        return (this.mat0.isReflecting || this.mat1.isReflecting);
    }

    glslRender() {
        if (this.usesNormal) {
            if (this.usesUVMap) {
                return transitionLocalWrap_shaders_renderNormalUV_glsl_mustache_default()(this);
            } else {
                return transitionLocalWrap_shaders_renderNormal_glsl_mustache_default()(this);
            }
        } else {
            if (this.usesUVMap) {
                return transitionLocalWrap_shaders_renderUV_glsl_mustache_default()(this);
            } else {
                return transitionLocalWrap_shaders_render_glsl_mustache_default()(this);
            }
        }
    }

    /**
     * Set the ID of the material.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    setId(scene) {
        this.mat0.setId(scene);
        this.mat1.setId(scene);
        super.setId(scene);
    }

    /**
     * Additional actions to perform when the material is added to the scene.
     * Propagate the call.
     * @param {Scene} scene - the scene to which the object is added.
     */
    onAdd(scene) {
        this.mat0.onAdd(scene);
        this.mat1.onAdd(scene);
        super.onAdd(scene);
    }

    shader(shaderBuilder) {
        this.mat0.shader(shaderBuilder);
        this.mat1.shader(shaderBuilder);
        super.shader(shaderBuilder);
    }
}

/**
 * Wrap the material into another material handling the Phong model
 * @param {Material} defaultMat - the default material
 * @param {Material} highlightMat - the highlight material
 * @param {GroupElement} cellBoost - isometry, in case we only highlight a single copy of a local object
 * @param {number} duration - duration of the transition (in ms)
 */
function transitionLocalWrap(defaultMat, highlightMat, cellBoost, duration) {
    return new TransitionLocalWrapMaterial(defaultMat, highlightMat, cellBoost, duration);
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
var pathTracerWrap_shaders_renderNormalUV_glsl_mustache = __webpack_require__(588);
var pathTracerWrap_shaders_renderNormalUV_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(pathTracerWrap_shaders_renderNormalUV_glsl_mustache);
// EXTERNAL MODULE: ./src/commons/materials/pathTracerWrap/shaders/renderNormal.glsl.mustache
var pathTracerWrap_shaders_renderNormal_glsl_mustache = __webpack_require__(9040);
var pathTracerWrap_shaders_renderNormal_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(pathTracerWrap_shaders_renderNormal_glsl_mustache);
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
                res = res + pathTracerWrap_shaders_renderNormalUV_glsl_mustache_default()(this);
            } else {
                res = res + pathTracerWrap_shaders_renderNormal_glsl_mustache_default()(this);
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




;// CONCATENATED MODULE: ./src/controls/keyboard/FlyControls.js






/**
 * @desc
 * Keyboard bindings.
 * To each key is associated an action
 * @const
 */
const KEYBOARD_BINDING = {
    "KeyA": "yawLeft",
    "KeyD": "yawRight",
    "KeyW": "pitchUp",
    "KeyS": "pitchDown",
    "KeyQ": "rollLeft",
    "KeyE": "rollRight",
    "ArrowUp": "forward",
    "ArrowDown": "back",
    "ArrowLeft": "left",
    "ArrowRight": "right",
    "Quote": "up",
    "Slash": "down"
}

/*const KEYBOARD_BINDINGS_OD = {
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
};*/


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
     * @param {DollyCamera} camera - the non-euclidean camera
     * (needed to get the orientation of the observer when using both VR and keyboard).
     */
    constructor(camera) {
        super();
        this.camera = camera;
        // this.keyboard = keyboard;

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
     * Restore the event listener
     */
    restore() {
        window.addEventListener('keydown', this._onKeyDown, false);
        window.addEventListener('keyup', this._onKeyUp, false);
    }

    /**
     * Event handler when a key is pressed
     * @param {KeyboardEvent} event - the caught event
     */
    onKeyDown(event) {
        if (event.code in KEYBOARD_BINDING) {
            const action = KEYBOARD_BINDING[event.code]
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
        if (event.code in KEYBOARD_BINDING) {
            const action = KEYBOARD_BINDING[event.code]
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
    };

    /**
     * Update the rotation vector
     */
    updateRotationVector() {
        this._rotationVector.x = (-this._moveState.pitchDown + this._moveState.pitchUp);
        this._rotationVector.y = (-this._moveState.yawRight + this._moveState.yawLeft);
        this._rotationVector.z = (-this._moveState.rollRight + this._moveState.rollLeft);
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
        // Thus, we use the cameras' matrixWorld for our computations.
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
     * @param {boolean} snap - if alignFacing and snap are true,
     * align the orientation to the "closest" relation around the y-axis
     * @param {VRCamera} camera - the camera (giving the position of the observer)
     *
     */
    constructor(position, controller, alignFacing = false, snap = false, camera = undefined) {
        this.position = position;
        this.controller = controller;

        this._reset = RESET_WAIT;
        this._alignFacing = alignFacing;
        this._snap = snap;
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
                if (this._snap){
                    this.position.local.quaternion.x = 0;
                    this.position.local.quaternion.z = 0;
                    this.position.local.quaternion.normalize();
                }
                this.position.local.quaternion.invert();
            }
            this._reset = RESET_WAIT;
        }
    }
}
;// CONCATENATED MODULE: ./src/controls/vr/AdvancedResetVRControls.js



/**
 * @class
 *
 * @classdesc
 * When pressing the button, reset the position of the user (in the scene) to the given position.
 * Does not change the cellBoost
 * It can be used, when a VR experiment need be started at a very precise position (cf hexagon.html in H3)
 */

const AdvancedResetVRControls_RESET_CALLED = 1;
const AdvancedResetVRControls_RESET_WAIT = 0;

class AdvancedResetVRControls {

    /**
     * Constructor
     * @param {RelPosition} position - the position in the geometry of the observer
     * @param {Position} targetPosition - the position in the geometry of the observer
     * @param {Group} controller - the group representing the controller
     * @param {boolean} alignFacing - option for updating the facing
     *  - if False, the facing of the position is reset to its default value (quaternion = 1).
     *  - if True, the facing is set up to that the camera is directed toward the negative z axis.
     *    in this case the camera should be passed to the constructor as an argument
     * @param {boolean} snap - if alignFacing and snap are true,
     * align the orientation to the "closest" relation around the y-axis
     * @param {VRCamera} camera - the camera (giving the position of the observer)
     *
     */
    constructor(position, targetPosition, controller, alignFacing = false, snap = false, camera = undefined) {
        this.position = position;
        this.targetPosition = targetPosition;
        this.controller = controller;

        this._reset = AdvancedResetVRControls_RESET_WAIT;
        this._alignFacing = alignFacing;
        this._snap = snap;
        this._camera = camera;
        if (this._alignFacing && camera === undefined) {
            throw new Error("AdvancedResetVRControls.constructor, the camera is needed when the alignFacing option is on");
        }

        const _onSqueezeStart = bind(this, this.onSqueezeStart);
        const _onSqueeezeEnd = bind(this, this.onSqueezeEnd);

        this.controller.addEventListener('squeezestart', _onSqueezeStart);
        this.controller.addEventListener('squeezeend', _onSqueeezeEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSqueezeStart() {
        this._reset = AdvancedResetVRControls_RESET_CALLED;
    }

    /**
     * Event handler when the user stops selecting
     */
    onSqueezeEnd() {
    }

    /**
     * Function to update the position
     */
    update() {
        if (this._reset === AdvancedResetVRControls_RESET_CALLED) {
            this.position.reset();
            if (this._alignFacing) {
                const matrix = this._camera.threeCamera.matrixWorld;
                this.position.local.quaternion.setFromRotationMatrix(matrix);
                if (this._snap) {
                    this.position.local.quaternion.x = 0;
                    this.position.local.quaternion.z = 0;
                    this.position.local.quaternion.normalize();
                }
                this.position.local.quaternion.invert();
            }
            this._reset = AdvancedResetVRControls_RESET_WAIT;
            this.position.local.boost.copy(this.targetPosition.boost);
            this.position.local.quaternion.premultiply(this.targetPosition.quaternion);
        }
    }
}
;// CONCATENATED MODULE: ./src/controls/all.js











// EXTERNAL MODULE: ./src/commons/postProcess/acesFilm/shaders/fragment.glsl
var shaders_fragment = __webpack_require__(6947);
var shaders_fragment_default = /*#__PURE__*/__webpack_require__.n(shaders_fragment);
;// CONCATENATED MODULE: ./src/commons/postProcess/acesFilm/AcesFilmPostProcess.js




class AcesFilmPostProcess extends PostProcess {

    /**
     * Constructor
     * @param {number} exposure - the exposure
     */
    constructor(exposure) {
        super();
        this.exposure = exposure !== undefined ? exposure : 0.8;
    }

    uniforms() {
        const res = super.uniforms();
        res.exposure = {value: this.exposure}
        return res;
    }

    fragmentShader() {
        return (shaders_fragment_default());
    }
}
// EXTERNAL MODULE: ./src/commons/postProcess/linearToSRBG/shaders/fragment.glsl
var linearToSRBG_shaders_fragment = __webpack_require__(4024);
var linearToSRBG_shaders_fragment_default = /*#__PURE__*/__webpack_require__.n(linearToSRBG_shaders_fragment);
;// CONCATENATED MODULE: ./src/commons/postProcess/linearToSRBG/LinearToSRGBPostProcess.js




class LinearToSRGBPostProcess extends PostProcess {

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    fragmentShader() {
        return (linearToSRBG_shaders_fragment_default());
    }
}
;// CONCATENATED MODULE: ./src/commons/postProcess/all.js



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
     * Return a matrix on this quadratic ring
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







































// EXTERNAL MODULE: ./src/geometries/hyp/cameras/native/shaders/struct.glsl
var native_shaders_struct = __webpack_require__(4375);
var native_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(native_shaders_struct);
// EXTERNAL MODULE: ./src/geometries/hyp/cameras/native/shaders/mapping.glsl
var native_shaders_mapping = __webpack_require__(3419);
var native_shaders_mapping_default = /*#__PURE__*/__webpack_require__.n(native_shaders_mapping);
;// CONCATENATED MODULE: ./src/geometries/hyp/cameras/native/NativeCamera.js






/**
 * @class
 *
 * @classdesc
 * Native VR view in hyperbolic space.
 * The mapping of the horizon is made in such a way that
 * two rays which are parallel for a euclidean observer, converges to the same point at infinity in H3.
 */
class NativeCamera extends VRCamera {

    constructor(parameters) {
        super(parameters);
        this.fakeCameras[LEFT].ipDist = -this.ipDist;
        this.fakeCameras[RIGHT].ipDist = this.ipDist;
        for (const side in [LEFT, RIGHT]) {
            this.fakeCameras[side].matrixInverse = this.threeCamera.matrixWorldInverse;
        }
    }

    /**
     * build the GLSL code needed to declare the camera
     * @param {ShaderBuilder} shaderBuilder - the shader builder
     * @param {number} side - the side (left of right) (used for stereographic camera)
     */
    sidedShader(shaderBuilder, side) {
        shaderBuilder.addClass('NativeCamera', (native_shaders_struct_default()));
        shaderBuilder.addUniform('camera', 'NativeCamera', this.fakeCameras[side]);
        shaderBuilder.addChunk((native_shaders_mapping_default()));
    }

}
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
;// CONCATENATED MODULE: ./src/geometries/hyp/groups/cube/set.js






const sqrt3 = Math.sqrt(3);
const modelHalfCube = 1 / sqrt3;

const group = new isometry_Group_Group();

const normalXp = new external_three_namespaceObject.Vector4(1, 0, 0, -modelHalfCube);

function testXp(p) {
    return p.coords.dot(normalXp) > 0;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 normal = vec4(1, 0, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepXp = `//
float creepXp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(1, 0, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalXn = new external_three_namespaceObject.Vector4(-1, 0, 0, -modelHalfCube);

function testXn(p) {
    return p.coords.dot(normalXn) > 0;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 normal = vec4(-1, 0, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepXn = `//
float creepXn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(-1, 0, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalYp = new external_three_namespaceObject.Vector4(0, 1, 0, -modelHalfCube);

function testYp(p) {
    return p.coords.dot(normalYp) > 0;
}

// language=GLSL
const glslTestYp = `//
bool testYp(Point p){
    vec4 normal = vec4(0, 1, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepYp = `//
float creepYp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 1, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalYn = new external_three_namespaceObject.Vector4(0, -1, 0, -modelHalfCube);

function testYn(p) {
    return p.coords.dot(normalYn) > 0;
}

// language=GLSL
const glslTestYn = `//
bool testYn(Point p){
    vec4 normal = vec4(0, -1, 0, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepYn = `//
float creepYn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, -1, 0, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalZp = new external_three_namespaceObject.Vector4(0, 0, 1, -modelHalfCube);

function testZp(p) {
    return p.coords.dot(normalZp) > 0;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    vec4 normal = vec4(0, 0, 1, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepZp = `//
float creepZp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 0, 1, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const normalZn = new external_three_namespaceObject.Vector4(0, 0, -1, -modelHalfCube);

function testZn(p) {
    return p.coords.dot(normalZn) > 0;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    vec4 normal = vec4(0, 0, -1, -${modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const glslCreepZn = `//
float creepZn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 0, -1, -${modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;


const shiftXp = group.element();
const shiftXn = group.element();
const shiftYp = group.element();
const shiftYn = group.element();
const shiftZp = group.element();
const shiftZn = group.element();

shiftXp.isom.matrix.set(
    2, 0, 0, -sqrt3,
    0, 0, 1, 0,
    0, -1, 0, 0,
    -sqrt3, 0, 0, 2
);
shiftXn.isom.matrix.set(
    2, 0, 0, sqrt3,
    0, 0, -1, 0,
    0, 1, 0, 0,
    sqrt3, 0, 0, 2
)

shiftYp.isom.matrix.set(
    0, 0, -1, 0,
    0, 2, 0, -sqrt3,
    1, 0, 0, 0,
    0, -sqrt3, 0, 2
);

shiftYn.isom.matrix.set(
    0, 0, 1, 0,
    0, 2, 0, sqrt3,
    -1, 0, 0, 0,
    0, sqrt3, 0, 2
);

shiftZp.isom.matrix.set(
    0, 1, 0, 0,
    -1, 0, 0, 0,
    0, 0, 2, -sqrt3,
    0, 0, -sqrt3, 2
)

shiftZn.isom.matrix.set(
    0, -1, 0, 0,
    1, 0, 0, 0,
    0, 0, 2, sqrt3,
    0, 0, sqrt3, 2
)

const neighbors = [
    {elt: shiftXp, inv: shiftXn},
    {elt: shiftXn, inv: shiftXp},
    {elt: shiftYp, inv: shiftYn},
    {elt: shiftYn, inv: shiftYp},
    {elt: shiftZp, inv: shiftZn},
    {elt: shiftZn, inv: shiftZp}
];

/* harmony default export */ const cube_set = (new TeleportationSet(neighbors)
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn)
    .add(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp)
    .add(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn));






;// CONCATENATED MODULE: ./src/geometries/hyp/groups/cube/GroupElement.js







/**
 * @class
 *
 * @classdesc
 * Translation group whose fundamental domain is an ideal cube in H3
 */
class cube_GroupElement_GroupElement extends GroupElement_GroupElement {

    constructor(group) {
        super(group);
        this.matrix = new QuadRingMatrix4(QUAD_RING);
    }

    identity() {
        this.matrix.identity();
        return this;
    }

    multiply(elt) {
        this.matrix.multiply(elt.matrix);
        return this;
    }

    premultiply(elt) {
        this.matrix.premultiply(elt.matrix);
        return this;
    }

    invert() {
        this.matrix.invert();
        return this;
    }

    toIsometry() {
        const res = new Isometry();
        res.matrix.copy(this.matrix.toMatrix4());
        return res;
    }

    equals(elt) {
        return this.matrix.equals(elt.matrix);
    }

    clone() {
        const res = new cube_GroupElement_GroupElement(this.group);
        res.matrix.copy(this.matrix);
        return res;
    }

    copy(elt) {
        this.matrix.copy(elt.matrix);
        return this;
    }

}


// EXTERNAL MODULE: ./src/geometries/hyp/groups/cube/shaders/element.glsl
var cube_shaders_element = __webpack_require__(6467);
var cube_shaders_element_default = /*#__PURE__*/__webpack_require__.n(cube_shaders_element);
// EXTERNAL MODULE: ./src/utils/quadRing/shader/quadRingMatrix.glsl
var quadRingMatrix = __webpack_require__(1371);
var quadRingMatrix_default = /*#__PURE__*/__webpack_require__.n(quadRingMatrix);
;// CONCATENATED MODULE: ./src/geometries/hyp/groups/cube/Group.js







const QUAD_RING = new QuadRing(3);

class cube_Group_Group extends Group_Group {

    constructor() {
        super();
    }

    element() {
        return new cube_GroupElement_GroupElement(this);
    }

    shader(shaderBuilder) {
        QUAD_RING.shader(shaderBuilder);
        shaderBuilder.addChunk((quadRingMatrix_default()));
        shaderBuilder.addChunk((cube_shaders_element_default()));
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/groups/cube/symbSet.js




const symbSet_group = new cube_Group_Group();

const zero = QUAD_RING.zero;
const one = QUAD_RING.one;
const mOne = QUAD_RING.element(-1);
const two = QUAD_RING.element(2);
const symbSet_sqrt3 = QUAD_RING.element(0, 1);
const mSqrt3 = QUAD_RING.element(0, -1);

const symbSet_modelHalfCube = 1 / Math.sqrt(3);

function symbSet_testXp(p) {
    return p.coords.x > symbSet_modelHalfCube * p.coords.w;
}

// language=GLSL
const symbSet_glslTestXp = `//
bool testXp(Point p){
    return p.coords.x > ${symbSet_modelHalfCube} * p.coords.w;
}
`;

function symbSet_testXn(p) {
    return p.coords.x < -symbSet_modelHalfCube * p.coords.w;
}

// language=GLSL
const symbSet_glslTestXn = `//
bool testXn(Point p){
    return p.coords.x < -${symbSet_modelHalfCube} * p.coords.w;
}
`;

function symbSet_testYp(p) {
    return p.coords.y > symbSet_modelHalfCube * p.coords.w;
}

// language=GLSL
const symbSet_glslTestYp = `//
bool testYp(Point p){
    return p.coords.y > ${symbSet_modelHalfCube} * p.coords.w;
}
`;

function symbSet_testYn(p) {
    return p.coords.y < -symbSet_modelHalfCube * p.coords.w;
}

// language=GLSL
const symbSet_glslTestYn = `//
bool testYn(Point p){
    return p.coords.y < -${symbSet_modelHalfCube} * p.coords.w;
}
`;

function symbSet_testZp(p) {
    return p.coords.z > symbSet_modelHalfCube * p.coords.w;
}

// language=GLSL
const symbSet_glslTestZp = `//
bool testZp(Point p){
    return p.coords.z > ${symbSet_modelHalfCube} * p.coords.w;
}
`;

function symbSet_testZn(p) {
    return p.coords.z < -symbSet_modelHalfCube * p.coords.w;
}

// language=GLSL
const symbSet_glslTestZn = `//
bool testZn(Point p){
    return p.coords.z < -${symbSet_modelHalfCube} * p.coords.w;
}
`;

const symbSet_shiftXp = symbSet_group.element();
const symbSet_shiftXn = symbSet_group.element();
const symbSet_shiftYp = symbSet_group.element();
const symbSet_shiftYn = symbSet_group.element();
const symbSet_shiftZp = symbSet_group.element();
const symbSet_shiftZn = symbSet_group.element();

symbSet_shiftXp.matrix.set(
    two, zero, zero, mSqrt3,
    zero, zero, one, zero,
    zero, mOne, zero, zero,
    mSqrt3, zero, zero, two
);
symbSet_shiftXn.matrix.set(
    two, zero, zero, symbSet_sqrt3,
    zero, zero, mOne, zero,
    zero, one, zero, zero,
    symbSet_sqrt3, zero, zero, two
);
symbSet_shiftYp.matrix.set(
    zero, zero, mOne, zero,
    zero, two, zero, mSqrt3,
    one, zero, zero, zero,
    zero, mSqrt3, zero, two
);
symbSet_shiftYn.matrix.set(
    zero, zero, one, zero,
    zero, two, zero, symbSet_sqrt3,
    mOne, zero, zero, zero,
    zero, symbSet_sqrt3, zero, two
);
symbSet_shiftZp.matrix.set(
    zero, one, zero, zero,
    mOne, zero, zero, zero,
    zero, zero, two, mSqrt3,
    zero, zero, mSqrt3, two
);
symbSet_shiftZn.matrix.set(
    zero, mOne, zero, zero,
    one, zero, zero, zero,
    zero, zero, two, symbSet_sqrt3,
    zero, zero, symbSet_sqrt3, two
);


/* harmony default export */ const symbSet = (new TeleportationSet()
    .add(symbSet_testXp, symbSet_glslTestXp, symbSet_shiftXp, symbSet_shiftXn)
    .add(symbSet_testXn, symbSet_glslTestXn, symbSet_shiftXn, symbSet_shiftXp)
    .add(symbSet_testYp, symbSet_glslTestYp, symbSet_shiftYp, symbSet_shiftYn)
    .add(symbSet_testYn, symbSet_glslTestYn, symbSet_shiftYn, symbSet_shiftYp)
    .add(symbSet_testZp, symbSet_glslTestZp, symbSet_shiftZp, symbSet_shiftZn)
    .add(symbSet_testZn, symbSet_glslTestZn, symbSet_shiftZn, symbSet_shiftZp));

;// CONCATENATED MODULE: ./src/geometries/hyp/groups/seifert-weber/set.js








/**
 *
 * @param {Point} point
 */
function proj2klein(point) {
    const coords = point.coords;
    return new external_three_namespaceObject.Vector3(coords.x / coords.w, coords.y / coords.w, coords.z / coords.w);
}

// There is a lot of annoying trig that goes into getting this half width value:
// the main points are that
// - the dihedral angle alpha is 2pi/5,
// - the angle beta from the dodecahedron's center between a face and edge center is arctan(1/golden ratio).
// All computation done we get
// sinh(halfWidth) = sqrt(1 - sin^2(alpha) - sin^2(beta)) / sin(beta)

const halfWidth = 0.996384497847316;
const rotAngle = 3 * Math.PI / 5.;
const Phi = 0.5 + 0.5 * Math.sqrt(5); // golden ratio



// direction (in the tangent space at the origin) pointing to the center on a face
const dirs = [
    new Vector(0., 1, Phi),
    new Vector(0., 1, -Phi),
    new Vector(1, Phi, 0),
    new Vector(1, -Phi, 0),
    new Vector(Phi, 0, 1),
    new Vector(-Phi, 0, 1)
]

const set_group = new isometry_Group_Group();
const teleportations = new TeleportationSet();

for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i].normalize();
    const halfV = dir.clone().normalize().multiplyScalar(halfWidth);
    const point = new Point().applyIsometry(new Isometry().makeTranslationFromDir(halfV));
    const klein = proj2klein(point);
    const dot = klein.dot(klein);

    const normalP = new external_three_namespaceObject.Vector4(klein.x, klein.y, klein.z, -dot);
    const testP = function (p) {
        return p.coords.dot(normalP) > 0;
    }

    const normalN = new external_three_namespaceObject.Vector4(klein.x, klein.y, klein.z, dot);
    const testN = function (p) {
        return p.coords.dot(normalN) < 0;
    }

    // language=GLSL
    const glslTestP = `//
    bool test${i}P(Point p){
        vec4 normal = vec4(${klein.x}, ${klein.y}, ${klein.z}, -${dot});
        return dot(p.coords, normal) > 0.;
    }
    `;

    // language=GLSL
    const glslTestN = `//
    bool test${i}N(Point p){
        vec4 normal = vec4(${klein.x}, ${klein.y}, ${klein.z}, ${dot});
        return dot(p.coords, normal) < 0.;
    }
    `;

    const negV = dir.clone().normalize().multiplyScalar(-2 * halfWidth);

    const shift = set_group.element();
    shift.isom.makeTranslationFromDir(negV);
    shift.isom.matrix.multiply(new external_three_namespaceObject.Matrix4().makeRotationAxis(dir, rotAngle));

    const inv = set_group.element();
    inv.isom.copy(shift.isom).invert();
    // The version below does not seem to work. Ask Steve about it !
    // inv.isom.makeTranslationFromDir(fullV);
    // inv.isom.matrix.multiply(new Matrix4().makeRotationAxis(fullV.normalize(), rotAngle).transpose());

    teleportations.add(testP, glslTestP, shift, inv);
    teleportations.add(testN, glslTestN, inv, shift);
}

/* harmony default export */ const seifert_weber_set = (teleportations);




;// CONCATENATED MODULE: ./src/geometries/hyp/groups/whitehead/set.js






const whitehead_set_group = new isometry_Group_Group();


const normalU1 = new external_three_namespaceObject.Vector4(1, 1, 1, -1);

function testU1(p) {
    return p.coords.dot(normalU1) > 0;
}

// language=GLSL
const glslTestU1 = `//
bool testU1(Point p){
    vec4 normal = vec4(1, 1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;

const normalU2 = new external_three_namespaceObject.Vector4(-1, 1, 1, -1);

function testU2(p) {
    return p.coords.dot(normalU2) > 0;
}

// language=GLSL
const glslTestU2 = `//
bool testU2(Point p){
    vec4 normal = vec4(-1, 1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalU3 = new external_three_namespaceObject.Vector4(-1, -1, 1, -1);

function testU3(p) {
    return p.coords.dot(normalU3) > 0;
}

// language=GLSL
const glslTestU3 = `//
bool testU3(Point p){
    vec4 normal = vec4(-1, -1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalU4 = new external_three_namespaceObject.Vector4(1, -1, 1, -1);

function testU4(p) {
    return p.coords.dot(normalU4) > 0;
}

// language=GLSL
const glslTestU4 = `//
bool testU4(Point p){
    vec4 normal = vec4(1, -1, 1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalL1 = new external_three_namespaceObject.Vector4(1, 1, -1, -1);

function testL1(p) {
    return p.coords.dot(normalL1) > 0;
}

// language=GLSL
const glslTestL1 = `//
bool testL1(Point p){
    vec4 normal = vec4(1, 1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;

const normalL2 = new external_three_namespaceObject.Vector4(-1, 1, -1, -1);

function testL2(p) {
    return p.coords.dot(normalL2) > 0;
}

// language=GLSL
const glslTestL2 = `//
bool testL2(Point p){
    vec4 normal = vec4(-1, 1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const normalL3 = new external_three_namespaceObject.Vector4(-1, -1, -1, -1);

function testL3(p) {
    return p.coords.dot(normalL3) > 0;
}

// language=GLSL
const glslTestL3 = `//
bool testL3(Point p){
    vec4 normal = vec4(-1, -1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;

const normalL4 = new external_three_namespaceObject.Vector4(1, -1, -1, -1);

function testL4(p) {
    return p.coords.dot(normalL4) > 0;
}

// language=GLSL
const glslTestL4 = `//
bool testL4(Point p){
    vec4 normal = vec4(1, -1, -1, -1);
    return dot(p.coords, normal) > 0.;
}
`;


const L1ToU4 = whitehead_set_group.element();
const L2ToU1 = whitehead_set_group.element();
const L3ToU2 = whitehead_set_group.element();
const L4ToU3 = whitehead_set_group.element();


L1ToU4.isom.matrix.set(
    0, -1, 1, 1,
    1, 1, 0, -1,
    -1, 0, 1, 1,
    -1, -1, 1, 2
);

L2ToU1.isom.matrix.set(
    0, -1, 1, 1,
    1, -1, 0, 1,
    1, 0, 1, 1,
    1, -1, 1, 2
);

L3ToU2.isom.matrix.set(
    0, -1, -1, -1,
    1, 1, 0, 1,
    1, 0, 1, 1,
    1, 1, 1, 2
);

L4ToU3.isom.matrix.set(
    0, -1, -1, -1,
    1, -1, 0, -1,
    -1, 0, 1, 1,
    -1, 1, 1, 2
);


const U1ToL2 = whitehead_set_group.element();
const U2ToL3 = whitehead_set_group.element();
const U3ToL4 = whitehead_set_group.element();
const U4ToL1 = whitehead_set_group.element();

U1ToL2.isom.copy(L2ToU1.isom).invert();
U2ToL3.isom.copy(L3ToU2.isom).invert();
U3ToL4.isom.copy(L4ToU3.isom).invert();
U4ToL1.isom.copy(L1ToU4.isom).invert();


/* harmony default export */ const whitehead_set = (new TeleportationSet()
    .add(testU1, glslTestU1, U1ToL2, L2ToU1)
    .add(testU2, glslTestU2, U2ToL3, L3ToU2)
    .add(testU3, glslTestU3, U3ToL4, L4ToU3)
    .add(testU4, glslTestU4, U4ToL1, L1ToU4)
    .add(testL1, glslTestL1, L1ToU4, U4ToL1)
    .add(testL2, glslTestL2, L2ToU1, U1ToL2)
    .add(testL3, glslTestL3, L3ToU2, U2ToL3)
    .add(testL4, glslTestL4, L4ToU3, U3ToL4));





;// CONCATENATED MODULE: ./src/geometries/hyp/groups/m125/set.js






/*
Isometry group corresponding to the manifold m125 (from Snapy census?)
The fundamental domain is an octahedron.
 */

const m125_set_group = new isometry_Group_Group();

// "normals" to the faces
const normal0 = new external_three_namespaceObject.Vector4(-1, -1, -1, -1);
const normal1 = new external_three_namespaceObject.Vector4(1, 1, -1, -1);
const normal2 = new external_three_namespaceObject.Vector4(1, -1, -1, -1);
const normal3 = new external_three_namespaceObject.Vector4(-1, 1, -1, -1);
const normal4 = new external_three_namespaceObject.Vector4(-1, -1, 1, -1);
const normal5 = new external_three_namespaceObject.Vector4(1, 1, 1, -1);
const normal6 = new external_three_namespaceObject.Vector4(1, -1, 1, -1);
const normal7 = new external_three_namespaceObject.Vector4(-1, 1, 1, -1);

const normals = [normal0, normal1, normal2, normal3, normal4, normal5, normal6, normal7];


// building a list of pairs of test.
// one pair for each face
// the elements of the pairs are the JS and the GLSL tests respectively
const testPairs = [];

for (let i = 0; i < 8; i++) {
    testPairs.push([
        function (p) {
            return p.coords.dot(normals[i]) > 0;
        },
        // language=GLSL
        `bool test${i}(Point p){
            vec4 normal = vec4(${normals[i].x}, ${normals[i].y}, ${normals[i].z}, ${normals[i].w});
            return dot(p.coords, normal) > 0.;
        }`
    ])
}

const shift01 = m125_set_group.element();
const shift23 = m125_set_group.element();
const shift45 = m125_set_group.element();
const shift67 = m125_set_group.element();

shift01.isom.matrix.set(
    1, 0, 1, 1,
    0, 1, 1, 1,
    -1, -1, 0, -1,
    1, 1, 1, 2
);

shift23.isom.matrix.set(
    1, 0, -1, -1,
    0, 1, 1, 1,
    1, -1, 0, -1,
    -1, 1, 1, 2
);

shift45.isom.matrix.set(
    0, 1, -1, 1,
    1, 1, 0, 1,
    1, 0, -1, 1,
    1, 1, -1, 2
);

shift67.isom.matrix.set(
    1, -1, 0, -1,
    -1, 0, -1, 1,
    0, 1, -1, 1,
    -1, 1, -1, 2
);

const shift10 = m125_set_group.element();
const shift32 = m125_set_group.element();
const shift54 = m125_set_group.element();
const shift76 = m125_set_group.element();

shift10.isom.copy(shift01.isom).invert();
shift32.isom.copy(shift23.isom).invert();
shift54.isom.copy(shift45.isom).invert();
shift76.isom.copy(shift67.isom).invert();

/* harmony default export */ const m125_set = (new TeleportationSet()
    .add(testPairs[0][0], testPairs[0][1], shift01, shift10)
    .add(testPairs[1][0], testPairs[1][1], shift10, shift01)
    .add(testPairs[2][0], testPairs[2][1], shift23, shift32)
    .add(testPairs[3][0], testPairs[3][1], shift32, shift23)
    .add(testPairs[4][0], testPairs[4][1], shift45, shift54)
    .add(testPairs[5][0], testPairs[5][1], shift54, shift45)
    .add(testPairs[6][0], testPairs[6][1], shift67, shift76)
    .add(testPairs[7][0], testPairs[7][1], shift76, shift67));






;// CONCATENATED MODULE: ./src/geometries/hyp/groups/augmentedCube/GroupElement.js






/**
 * @class
 *
 * @classdesc
 * In this group an element is both an isometry of H3
 * and its image in a suitable finite group
 *
 * (Dihedral group of order 6(?) represented as the semi-direct product (Z/3) \rtimes (Z/2))
 */

class augmentedCube_GroupElement_GroupElement extends GroupElement_GroupElement {

    constructor(group) {
        super(group);
        this.isom = new Isometry();
        this.finitePart = new external_three_namespaceObject.Vector2(0, 1);
    }

    identity() {
        this.isom.identity();
        this.finitePart.set(0, 1);
        return this;
    }

    multiply(elt) {
        this.isom.multiply(elt.isom);
        const aux = this.finitePart.x + this.finitePart.y* elt.finitePart.x;
        this.finitePart.set(
            // Note that we are not using the % operator
            // Indeed this operator return a negative if the operand in negative
            // This is not the behavior that we want.
            aux - 3 * Math.floor(aux / 3),
            this.finitePart.y * elt.finitePart.y
        )
        return this;
    }

    premultiply(elt) {
        this.isom.premultiply(elt.isom);
        const aux = elt.finitePart.x + elt.finitePart.y * this.finitePart.x;
        this.finitePart.set(
            // Same remark as above for the % operator.
            aux - 3 * Math.floor(aux / 3),
            elt.finitePart.y * this.finitePart.y
        )
        return this;
    }

    invert() {
        this.isom.invert();
        this.finitePart.set(
            (-this.finitePart.y * this.finitePart.x) % 3,
            this.finitePart.y
        );
        return this;
    }

    toIsometry() {
        return this.isom;
    }

    // Produce a number between 0 and 5 characterizing the finite part of the element
    hash() {
        const fp = this.finitePart;
        return fp.x + 3 * (fp.y + 1) / 2;
    }

    equals(elt) {
        return this.isom.equals(elt.isom);
    }

    clone() {
        const res = new augmentedCube_GroupElement_GroupElement(this.group);
        res.isom.copy(this.isom);
        res.finitePart.copy(this.finitePart);
        return res;
    }

    copy(elt) {
        this.isom.copy(elt.isom);
        this.finitePart.copy(elt.finitePart);
        return this;
    }
}

// EXTERNAL MODULE: ./src/geometries/hyp/groups/augmentedCube/shaders/element.glsl
var augmentedCube_shaders_element = __webpack_require__(9736);
var augmentedCube_shaders_element_default = /*#__PURE__*/__webpack_require__.n(augmentedCube_shaders_element);
;// CONCATENATED MODULE: ./src/geometries/hyp/groups/augmentedCube/Group.js





class augmentedCube_Group_Group extends Group_Group {

    /**
     * Constructor
     * Same group as the cube, but with image in a finite quotient
     */
    constructor() {
        super();
    }

    element() {
        return new augmentedCube_GroupElement_GroupElement(this);
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk((augmentedCube_shaders_element_default()));
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/groups/augmentedCube/set.js





const set_sqrt3 = Math.sqrt(3);
const set_modelHalfCube = 1 / set_sqrt3;

const augmentedCube_set_group = new augmentedCube_Group_Group();

const set_normalXp = new external_three_namespaceObject.Vector4(1, 0, 0, -set_modelHalfCube);

function set_testXp(p) {
    return p.coords.dot(set_normalXp) > 0;
}

// language=GLSL
const set_glslTestXp = `//
bool testXp(Point p){
    vec4 normal = vec4(1, 0, 0, -${set_modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const set_glslCreepXp = `//
float creepXp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(1, 0, 0, -${set_modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const set_normalXn = new external_three_namespaceObject.Vector4(-1, 0, 0, -set_modelHalfCube);

function set_testXn(p) {
    return p.coords.dot(set_normalXn) > 0;
}

// language=GLSL
const set_glslTestXn = `//
bool testXn(Point p){
    vec4 normal = vec4(-1, 0, 0, -${set_modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const set_glslCreepXn = `//
float creepXn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(-1, 0, 0, -${set_modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const set_normalYp = new external_three_namespaceObject.Vector4(0, 1, 0, -set_modelHalfCube);

function set_testYp(p) {
    return p.coords.dot(set_normalYp) > 0;
}

// language=GLSL
const set_glslTestYp = `//
bool testYp(Point p){
    vec4 normal = vec4(0, 1, 0, -${set_modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const set_glslCreepYp = `//
float creepYp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 1, 0, -${set_modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const set_normalYn = new external_three_namespaceObject.Vector4(0, -1, 0, -set_modelHalfCube);

function set_testYn(p) {
    return p.coords.dot(set_normalYn) > 0;
}

// language=GLSL
const set_glslTestYn = `//
bool testYn(Point p){
    vec4 normal = vec4(0, -1, 0, -${set_modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const set_glslCreepYn = `//
float creepYn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, -1, 0, -${set_modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;


const set_normalZp = new external_three_namespaceObject.Vector4(0, 0, 1, -set_modelHalfCube);

function set_testZp(p) {
    return p.coords.dot(set_normalZp) > 0;
}

// language=GLSL
const set_glslTestZp = `//
bool testZp(Point p){
    vec4 normal = vec4(0, 0, 1, -${set_modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const set_glslCreepZp = `//
float creepZp(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 0, 1, -${set_modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;

const set_normalZn = new external_three_namespaceObject.Vector4(0, 0, -1, -set_modelHalfCube);

function set_testZn(p) {
    return p.coords.dot(set_normalZn) > 0;
}

// language=GLSL
const set_glslTestZn = `//
bool testZn(Point p){
    vec4 normal = vec4(0, 0, -1, -${set_modelHalfCube});
    return dot(p.coords, normal) > 0.;
}
`;

// language=GLSL
const set_glslCreepZn = `//
float creepZn(ExtVector v, float offset){
    Vector local = v.vector.local;
    vec4 normal = vec4(0, 0, -1, -${set_modelHalfCube});
    float aux = - dot(local.pos.coords, normal) / dot(local.dir, normal);
    return atanh(aux) + offset;
}
`;


const set_shiftXp = augmentedCube_set_group.element();
const set_shiftXn = augmentedCube_set_group.element();
const set_shiftYp = augmentedCube_set_group.element();
const set_shiftYn = augmentedCube_set_group.element();
const set_shiftZp = augmentedCube_set_group.element();
const set_shiftZn = augmentedCube_set_group.element();

set_shiftXp.isom.matrix.set(
    2, 0, 0, -set_sqrt3,
    0, 0, 1, 0,
    0, -1, 0, 0,
    -set_sqrt3, 0, 0, 2
);
set_shiftXp.finitePart.set(0,-1);

set_shiftXn.isom.matrix.set(
    2, 0, 0, set_sqrt3,
    0, 0, -1, 0,
    0, 1, 0, 0,
    set_sqrt3, 0, 0, 2
);
set_shiftXn.finitePart.set(0,-1);

set_shiftYp.isom.matrix.set(
    0, 0, -1, 0,
    0, 2, 0, -set_sqrt3,
    1, 0, 0, 0,
    0, -set_sqrt3, 0, 2
);
set_shiftYp.finitePart.set(1,-1);

set_shiftYn.isom.matrix.set(
    0, 0, 1, 0,
    0, 2, 0, set_sqrt3,
    -1, 0, 0, 0,
    0, set_sqrt3, 0, 2
);
set_shiftYn.finitePart.set(1,-1);

set_shiftZp.isom.matrix.set(
    0, 1, 0, 0,
    -1, 0, 0, 0,
    0, 0, 2, -set_sqrt3,
    0, 0, -set_sqrt3, 2
);
set_shiftZp.finitePart.set(2,-1);

set_shiftZn.isom.matrix.set(
    0, -1, 0, 0,
    1, 0, 0, 0,
    0, 0, 2, set_sqrt3,
    0, 0, set_sqrt3, 2
);
set_shiftZn.finitePart.set(2,-1);


const set_neighbors = [
    {elt: set_shiftXp, inv: set_shiftXn},
    {elt: set_shiftXn, inv: set_shiftXp},
    {elt: set_shiftYp, inv: set_shiftYn},
    {elt: set_shiftYn, inv: set_shiftYp},
    {elt: set_shiftZp, inv: set_shiftZn},
    {elt: set_shiftZn, inv: set_shiftZp}
];

/* harmony default export */ const augmentedCube_set = (new TeleportationSet(set_neighbors)
    .add(set_testXp, set_glslTestXp, set_shiftXp, set_shiftXn, set_glslCreepXp)
    .add(set_testXn, set_glslTestXn, set_shiftXn, set_shiftXp, set_glslCreepXn)
    .add(set_testYp, set_glslTestYp, set_shiftYp, set_shiftYn, set_glslCreepYp)
    .add(set_testYn, set_glslTestYn, set_shiftYn, set_shiftYp, set_glslCreepYn)
    .add(set_testZp, set_glslTestZp, set_shiftZp, set_shiftZn, set_glslCreepZp)
    .add(set_testZn, set_glslTestZn, set_shiftZn, set_shiftZp, set_glslCreepZn));






;// CONCATENATED MODULE: ./src/utils/regularHypPolygon/RegularHypPolygon.js


/**
 * @class
 *
 * @classdesc
 * Auxiliary computation related to a regular polygon in the hyperbolic plane.
 * The polygon is characterized by its number of sides and the angle at its vertices
 * All the computation below are done in the hyperboloid model
 * We assume that the center of the polygon is the origin, i.e. (0,0,1)
 * The 0-th side is given by the equation  x/z = cst > 0
 * The other sides are number counter clock wise.
 */
class RegularHypPolygon {

    /**
     * Constructor
     * @param {number} n - number of sides of the polygon
     * @param {number} theta - angle at the vertex
     */
    constructor(n, theta) {
        /**
         * Number of sides of the polygon
         * @type {number}
         */
        this.n = n;
        /**
         * Angle at the apex
         * @type {number}
         */
        this.theta = theta;

        /**
         * Coordinates of the orthogonal projection of the origin onto the 0-th side
         * @type {number[]}
         * @private
         */
        this._sideCoords = undefined;
        /**
         * Translation along the x-axis sending one side to the opposite side
         * (`n` should be even here)
         * @type {Matrix3}
         * @private
         */
        this._translation = undefined;

    }

    /**
     * Return the coordinates of the intersection of the Oxz-plane (with x > 0) with polygon.
     * These coordinates are completely determined by n and theta.
     * @returns {number[]}
     */
    get sideCoords() {
        if (this._sideCoords === undefined) {
            const alpha = Math.PI / this.n;
            const halfTheta = 0.5 * this.theta;

            const sinAlpha = Math.sin(alpha);
            const cosAlpha = Math.cos(alpha);
            const sinHalfTheta = Math.sin(halfTheta);
            const cosHalfTheta = Math.cos(halfTheta);

            const sh = Math.sqrt(cosAlpha ** 2 - sinHalfTheta ** 2) / sinAlpha;
            const ch = cosHalfTheta / sinAlpha;
            this._sideCoords = [sh, 0, ch];
        }
        return this._sideCoords;
    }

    /**
     * Return the coordinates of the i-th vertex
     * @param {number} i
     * @return {Vector3}
     */
    vertexCoords(i) {
        const alpha = Math.PI / this.n;
        const halfTheta = 0.5 * this.theta;

        const sinAlpha = Math.sin(alpha);
        const cosAlpha = Math.cos(alpha);
        const sinHalfTheta = Math.sin(halfTheta);
        const cosHalfTheta = Math.cos(halfTheta);

        const sh = Math.sqrt(cosAlpha ** 2 - sinHalfTheta ** 2) / (sinAlpha * sinHalfTheta);
        const ch = (cosAlpha * cosHalfTheta) / (sinAlpha * sinHalfTheta);
        return new external_three_namespaceObject.Vector3()
            .set(sh, 0, ch)
            .applyMatrix3(new external_three_namespaceObject.Matrix3().makeRotation((2 * i + 1) * Math.PI / this.n));
    }

    /**
     * Return a 3x3 matrix, which belongs to S0(2,1) and represents a translation along the x-axis,
     * sending one side to the opposite one
     * (`n` should be even)
     * @returns {Matrix3}
     */
    get translation() {
        if (this._translation === undefined) {
            const [sh, _, ch] = this.sideCoords;
            const ch2 = ch * ch + sh * sh;
            const sh2 = 2 * sh * ch;
            this._translation = new external_three_namespaceObject.Matrix3().set(
                ch2, 0, sh2,
                0, 1, 0,
                sh2, 0, ch2,
            )
        }
        return this._translation;
    }

    /**
     * The function returns a vector n in R^3 with the following meaning.
     * Assume that p = [x,y,z] is a point on H^2.
     * If dot(n,p) > 0 then the polygon and p are on the opposite side of the i-th segment.
     * If dot(n,p) < 0 then the polygon and p are on the same side of the i-th segment.
     *
     * @param {number} i - the side number
     * @return {Vector3}
     */
    normalTest(i) {
        const [x0, _, z0] = this.sideCoords;
        const n = new external_three_namespaceObject.Vector3().set(z0, 0, -x0);
        return n.applyMatrix3(new external_three_namespaceObject.Matrix3().makeRotation(2 * i * Math.PI / this.n));
    }

    /**
     * Return a 3x3 Matrix in S0(2,1) sending the i-th side of the polygon to the j-th side.
     * For this to work properly `n` should be even.
     *
     * @param {number} i - the side number
     * @param {number} j - the side number
     * @return {Matrix3}
     */
    sideIdentification(i, j) {
        return new external_three_namespaceObject.Matrix3()
            .premultiply(new external_three_namespaceObject.Matrix3().makeRotation(2 * (0.5 * this.n - i) * Math.PI / this.n))
            .premultiply(this.translation)
            .premultiply(new external_three_namespaceObject.Matrix3().makeRotation(2 * j * Math.PI / this.n));

    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/groups/honeycombs/h435.js







/*
 Auxilary computations
 */

const polygon = new RegularHypPolygon(4, 2 * Math.PI / 5);
const [shL, _, chL] = polygon.sideCoords;
const sh2L = 2 * shL * chL;
const ch2L = chL * chL + shL * shL;

/*
Isometry group corresponding to the manifold m125 (from Snapy census?)
The fundamental domain is an octahedron.
 */

const h435_group = new isometry_Group_Group();

// "normals" to the faces
// normal at the origin to the "plane" {z = 0}
const h435_normal0 = new external_three_namespaceObject.Vector4(0, 0, 1, 0);
// normal at the origin to the "plane" {y = -z}
const h435_normal1 = new external_three_namespaceObject.Vector4(0, -1, -1, 0).normalize();
// normal at the origin to the "plane" {y = x}
const h435_normal2 = new external_three_namespaceObject.Vector4(-1, 1, 0, 0).normalize();
// normal at the point [shL, O, O, chl]
const h435_normal3 = new external_three_namespaceObject.Vector4(chL, 0, 0, -shL);

const h435_normals = [h435_normal0, h435_normal1, h435_normal2, h435_normal3];

// reflection at the origin across the "plane" {z = 0}
const elt0 = h435_group.element();
elt0.isom.matrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, -1, 0,
    0, 0, 0, 1
);
// reflection at the origin across the "plane" {y = -z}
const elt1 = h435_group.element();
elt1.isom.matrix.set(
    1, 0, 0, 0,
    0, 0, -1, 0,
    0, -1, 0, 0,
    0, 0, 0, 1
);
// reflection at the origin across the "plane" {y = x}
const elt2 = h435_group.element();
elt2.isom.matrix.set(
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
);
// reflection at the point [shL, O, O, chl]
const elt3 = h435_group.element();
elt3.isom.matrix.set(
    -ch2L, 0, 0, sh2L,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -sh2L, 0, 0, ch2L
);

const isoms = [elt0, elt1, elt2, elt3];

const h435_set = new TeleportationSet();


// building a list of pairs of test.
// one pair for each face
// the elements of the pairs are the JS and the GLSL tests respectively
const h435_testPairs = (/* unused pure expression or super */ null && ([]));

for (let i = 0; i < 4; i++) {
    const test = function (p) {
        return p.coords.dot(h435_normals[i]) > 0;
    };
    // language=GLSL
    const glslTest = `//
    bool test${i}(Point p){
        vec4 normal = vec4(${h435_normals[i].x}, ${h435_normals[i].y}, ${h435_normals[i].z}, ${h435_normals[i].w});
        return dot(p.coords, normal) > 0.;
    }`;
    h435_set.add(test, glslTest, isoms[i], isoms[i]);
}


/* harmony default export */ const h435 = (h435_set);




;// CONCATENATED MODULE: ./src/geometries/hyp/groups/all.js








// EXTERNAL MODULE: ./src/geometries/hyp/lights/pointLight/shaders/struct.glsl
var pointLight_shaders_struct = __webpack_require__(9191);
var pointLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(pointLight_shaders_struct);
// EXTERNAL MODULE: ./src/geometries/hyp/imports/direction.glsl
var direction = __webpack_require__(5129);
var direction_default = /*#__PURE__*/__webpack_require__.n(direction);
// EXTERNAL MODULE: ./src/core/lights/shaders/directions.glsl.mustache
var directions_glsl_mustache = __webpack_require__(7577);
var directions_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(directions_glsl_mustache);
// EXTERNAL MODULE: ./src/geometries/hyp/imports/distance.glsl
var distance = __webpack_require__(9681);
var distance_default = /*#__PURE__*/__webpack_require__.n(distance);
// EXTERNAL MODULE: ./src/geometries/hyp/imports/lightIntensity.glsl
var lightIntensity = __webpack_require__(3237);
var lightIntensity_default = /*#__PURE__*/__webpack_require__.n(lightIntensity);
;// CONCATENATED MODULE: ./src/geometries/hyp/lights/pointLight/PointLight.js












/**
 * @class
 *
 * @classdesc
 * Point light
 */
class PointLight extends Light {

    /**
     * Constructor
     * @param {Point|Vector} position - data for the position of the light
     * - If the input in a Point, then the position is that point.
     * - If the input is a Vector, then the position is the image of this vector by the exponential map at the origin.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        this.position = undefined;
        if (position.isPoint) {
            this.position = position;
        } else if (position.isVector) {
            const isom = new Isometry().makeTranslationFromDir(position);
            this.position = new Point().applyIsometry(isom);
        } else {
            throw new Error('BallShape: this type is not allowed');
        }


        /**
         * The color of the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity of the light.
         * @type {number}
         */
        this.intensity = intensity;
        this.addImport((distance_default()), (direction_default()), (lightIntensity_default()));
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
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
// EXTERNAL MODULE: ./src/geometries/hyp/lights/truePointLight/shaders/struct.glsl
var truePointLight_shaders_struct = __webpack_require__(1634);
var truePointLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(truePointLight_shaders_struct);
// EXTERNAL MODULE: ./src/geometries/hyp/imports/trueLightIntensity.glsl
var trueLightIntensity = __webpack_require__(7143);
var trueLightIntensity_default = /*#__PURE__*/__webpack_require__.n(trueLightIntensity);
;// CONCATENATED MODULE: ./src/geometries/hyp/lights/truePointLight/TruePointLight.js












/**
 * @class
 *
 * @classdesc
 * Point light
 */
class TruePointLight extends Light {

    /**
     * Constructor
     * @param {Point|Vector} position - data for the position of the light
     * - If the input in a Point, then the position is that point.
     * - If the input is a Vector, then the position is the image of this vector by the exponential map at the origin.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        this.position = undefined;
        if (position.isPoint) {
            this.position = position;
        } else if (position.isVector) {
            const isom = new Isometry().makeTranslationFromDir(position);
            this.position = new Point().applyIsometry(isom);
        } else {
            throw new Error('BallShape: this type is not allowed');
        }


        /**
         * The color of the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity of the light.
         * @type {number}
         */
        this.intensity = intensity;
        this.addImport((distance_default()), (direction_default()), (trueLightIntensity_default()));
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    get uniformType() {
        return 'TruePointLight';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return (truePointLight_shaders_struct_default());
    }

    glslDirections() {
        return directions_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/lights/sunLight/shaders/struct.glsl
var sunLight_shaders_struct = __webpack_require__(8999);
var sunLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(sunLight_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/lights/sunLight/SunLight.js








/**
 * @class
 *
 * @classdesc
 * Point light
 */
class SunLight extends Light {

    /**
     * Constructor
     * @param {Vector3} position - position of the light.
     * The light is a point at infinity with coordinates [u_x, u_y,u_z, 1], where u = (u_x,u_y_u_z) is unit vector in the same direction.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        const aux = position.clone().normalize();
        this.position = new external_three_namespaceObject.Vector4(aux.x, aux.y, aux.z, 1);
        /**
         * The color of the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity of the light.
         * @type {number}
         */
        this.intensity = intensity;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    get uniformType() {
        return 'SunLight';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return (sunLight_shaders_struct_default());
    }

    glslDirections() {
        return directions_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/lights/constDirLight/shaders/struct.glsl
var constDirLight_shaders_struct = __webpack_require__(4112);
var constDirLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(constDirLight_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/lights/constDirLight/ConstDirLight.js








/**
 * @class
 *
 * @classdesc
 * Light at infinity in the E-direction
 */
class ConstDirLight extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     * @param {Vector4} direction - the direction of the light. It should be on of the following values:
     */
    constructor(color, intensity = 1, direction = undefined) {
        super(1);
        this.color = color;
        this.intensity = intensity;
        this.direction = direction !== undefined ? direction.clone().normalize() : new external_three_namespaceObject.Vector4(0,0,0,1);
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'ConstDirLight';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return (constDirLight_shaders_struct_default());
    }

    glslDirections() {
        return directions_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/lights/localPointLight/shaders/struct.glsl
var localPointLight_shaders_struct = __webpack_require__(4342);
var localPointLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localPointLight_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/lights/localPointLight/LocalPointLight.js












/**
 * @class
 *
 * @classdesc
 * Point light
 */
class LocalPointLight extends Light {

    /**
     * Constructor
     * @param {Point|Vector} position - data for the position of the light
     * - If the input in a Point, then the position is that point.
     * - If the input is a Vector, then the position is the image of this vector by the exponential map at the origin.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        this.position = undefined;
        if (position.isPoint) {
            this.position = position;
        } else if (position.isVector) {
            const isom = new Isometry().makeTranslationFromDir(position);
            this.position = new Point().applyIsometry(isom);
        } else {
            throw new Error('BallShape: this type is not allowed');
        }


        /**
         * The color of the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity of the light.
         * @type {number}
         */
        this.intensity = intensity;
        this.addImport((distance_default()), (direction_default()), (lightIntensity_default()));
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    get uniformType() {
        return 'LocalPointLight';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return (localPointLight_shaders_struct_default());
    }

    glslDirections() {
        return directions_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/lights/localTruePointLight/shaders/struct.glsl
var localTruePointLight_shaders_struct = __webpack_require__(155);
var localTruePointLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localTruePointLight_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/lights/localTruePointLight/LocalTruePointLight.js












/**
 * @class
 *
 * @classdesc
 * Point light
 */
class LocalTruePointLight extends Light {

    /**
     * Constructor
     * @param {Point|Vector} position - data for the position of the light
     * - If the input in a Point, then the position is that point.
     * - If the input is a Vector, then the position is the image of this vector by the exponential map at the origin.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     */
    constructor(position, color, intensity = 1) {
        super(1);
        /**
         * The position of the light.
         * @type {Point}
         */
        this.position = undefined;
        if (position.isPoint) {
            this.position = position;
        } else if (position.isVector) {
            const isom = new Isometry().makeTranslationFromDir(position);
            this.position = new Point().applyIsometry(isom);
        } else {
            throw new Error('BallShape: this type is not allowed');
        }


        /**
         * The color of the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity of the light.
         * @type {number}
         */
        this.intensity = intensity;
        this.addImport((distance_default()), (direction_default()), (trueLightIntensity_default()));
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    /**
     * Says whether the shape is local. True if local, false otherwise
     * @type {boolean}
     */
    get isLocal() {
        return !this.isGlobal;
    }

    get uniformType() {
        return 'LocalTruePointLight';
    }

    /**
     * Return the chunk of GLSL code defining the corresponding structure.
     * @abstract
     * @return {string}
     */
    static glslClass() {
        return (localTruePointLight_shaders_struct_default());
    }

    glslDirections() {
        return directions_glsl_mustache_default()(this);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/lights/all.js






// EXTERNAL MODULE: ./src/geometries/hyp/material/varyingColor/shaders/struct.glsl
var varyingColor_shaders_struct = __webpack_require__(3236);
var varyingColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(varyingColor_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/material/varyingColor/VaryingColorMaterial.js







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

    get usesNormal() {
        return false;
    }

    static glslClass() {
        return (varyingColor_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/geometries/hyp/material/gradientColor/shaders/struct.glsl
var gradientColor_shaders_struct = __webpack_require__(7184);
var gradientColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(gradientColor_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/material/gradientColor/GradientColorMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Gradient along the z-direction
 */
class GradientColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} color1 - first color
     * @param {Color} color2 - second color
     * @param {number} start1 - z-coordinate for color 1
     * @param {number} start2 - z-coordinate for color 2
     */
    constructor(color1, color2, start1, start2) {
        super();
        this.color1 = color1;
        this.color2 = color2;
        this.start1 = start1;
        this.start2 = start2;
    }

    get uniformType() {
        return 'GradientColorMaterial';
    }

    get usesNormal() {
        return false;
    }

    static glslClass() {
        return (gradientColor_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/geometries/hyp/material/noiseColor/shaders/struct.glsl
var noiseColor_shaders_struct = __webpack_require__(1046);
var noiseColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(noiseColor_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/material/noiseColor/NoiseColorMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
class NoiseColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} mainColor - the color of the material
     * @param {Color} weight - amplitudes of the variations on each channel
     * @param {number} intensity - amplitude of the variation
     */
    constructor(mainColor, weight, intensity) {
        super();
        this.mainColor = mainColor;
        this.weight = weight;
        this.intensity = intensity;
    }

    get uniformType() {
        return 'NoiseColorMaterial';
    }

    get usesNormal() {
        return false;
    }

    static glslClass() {
        return (noiseColor_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/geometries/hyp/material/multiColor/shaders/struct.glsl
var multiColor_shaders_struct = __webpack_require__(7261);
var multiColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(multiColor_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/material/multiColor/MultiColorMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
class MultiColorMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} mainColor - the color of the material
     * @param {Color} accent1 - amplitudes of the variations on each channel
     * @param {Color} accent2 - amplitudes of the variations on each channel
     * @param {Color} accent3 - amplitudes of the variations on each channel
     * @param {Bool} grid - do we draw a grid or not
     */
    constructor(mainColor, accent1,accent2,accent3,grid) {
        super();
        this.mainColor = mainColor;
        this.accent1 = accent1;
        this.accent2 = accent2;
        this.accent3 = accent3;
        this.grid = grid != undefined ? grid : false;
    }

    get uniformType() {
        return 'MultiColorMaterial';
    }

    get usesNormal(){
        return false;
    }

    static glslClass() {
        return (multiColor_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/geometries/hyp/material/multiColor2/shaders/struct.glsl
var multiColor2_shaders_struct = __webpack_require__(7002);
var multiColor2_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(multiColor2_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/material/multiColor2/MultiColor2Material.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * A material that display a single plain color
 */
class MultiColor2Material extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color} mainColor - the color of the material
     * @param {Color} accent1 - amplitudes of the variations on each channel
     * @param {Color} accent2 - amplitudes of the variations on each channel
     * @param {Color} accent3 - amplitudes of the variations on each channel
     */
    constructor(mainColor, accent1,accent2,accent3) {
        super();
        this.mainColor = mainColor;
        this.accent1 = accent1;
        this.accent2 = accent2;
        this.accent3 = accent3;
    }

    get uniformType() {
        return 'MultiColor2Material';
    }

    get usesNormal(){
        return false;
    }

    static glslClass() {
        return (multiColor2_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/geometries/hyp/material/augmentedCube/shaders/struct.glsl
var augmentedCube_shaders_struct = __webpack_require__(2600);
var augmentedCube_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(augmentedCube_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/material/augmentedCube/AugmentedCubeMaterial.js







/**
 * @class
 * @extends Material
 *
 * @classdesc
 * Warning: this material only works with the set of teleportations `quotientGenus2`
 * (indeed it uses the finite part of the group element to decide the color) of the cell
 */
class AugmentedCubeMaterial extends Material {

    /**
     * Constructor.
     * The constructor takes no argument.
     * @param {Color[]} mainColors - an array of 6 colors
     * @param {Color} weight - amplitudes of the variations on each channel
     */
    constructor(mainColors,weight) {
        super();
        this.mainColors = mainColors;
        this.weight = weight;
    }

    get mainColor0() {
        return this.mainColors[0];
    }

    get mainColor1() {
        return this.mainColors[1];
    }

    get mainColor2() {
        return this.mainColors[2];
    }

    get mainColor3() {
        return this.mainColors[3];
    }

    get mainColor4() {
        return this.mainColors[4];
    }

    get mainColor5() {
        return this.mainColors[5];
    }

    get uniformType() {
        return 'AugmentedCubeMaterial';
    }

    get usesNormal() {
        return false;
    }

    static glslClass() {
        return (augmentedCube_shaders_struct_default());
    }

    glslRender() {
        return render_glsl_mustache_default()(this);
    }

}
;// CONCATENATED MODULE: ./src/geometries/hyp/material/all.js






;// CONCATENATED MODULE: ./src/geometries/hyp/geometry/General.js









// EXTERNAL MODULE: ./src/geometries/hyp/shapes/ball/shaders/struct.glsl
var ball_shaders_struct = __webpack_require__(6666);
var ball_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(ball_shaders_struct);
// EXTERNAL MODULE: ./src/core/shapes/shaders/sdf.glsl.mustache
var shapes_shaders_sdf_glsl_mustache = __webpack_require__(3707);
var shapes_shaders_sdf_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shapes_shaders_sdf_glsl_mustache);
// EXTERNAL MODULE: ./src/core/shapes/shaders/gradient.glsl.mustache
var shapes_shaders_gradient_glsl_mustache = __webpack_require__(5030);
var shapes_shaders_gradient_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shapes_shaders_gradient_glsl_mustache);
// EXTERNAL MODULE: ./src/core/shapes/shaders/uv.glsl.mustache
var shapes_shaders_uv_glsl_mustache = __webpack_require__(4355);
var shapes_shaders_uv_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(shapes_shaders_uv_glsl_mustache);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/ball/BallShape.js












/**
 * @class
 *
 * @classdesc
 * Shape of a hyperbolic ball
 */
class BallShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * - If the input in an Isometry, then the center is the image of the origin by this isometry.
     * - If the input in a Point, then the center is that point.
     * - If the input is a Vector, then the center is the image of this vector by the exponential map at the origin.
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
            throw new Error('BallShape: this type of location is not allowed');
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

    /**
     * Center of the ball
     * @type {Point}
     */
    get center() {
        if(this._center === undefined){
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
        return true;
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

    glslUVMap() {
        return shapes_shaders_uv_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/horoball/shaders/struct.glsl
var horoball_shaders_struct = __webpack_require__(7936);
var horoball_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(horoball_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/horoball/HoroballShape.js










/**
 * @class
 *
 * @classdesc
 * Shape of a hyperbolic horoball
 */
class HoroballShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Vector3} location - the location of the horoball.
     * - if location is an Isometry, then the horoball is the image by this isometry of the horoball centered at the point [0,0,1,1]
     * - if location is a Vector3, then the horoball is centered at [u_x, u_y,u_z, 1], where u = (u_x,u_y_u_z) is unit vector in the same direction.
     * (seen as a point in the boundary at infinity of H3 in the hyperboloid model)
     * @param {number} offset - the radius od the ball
     */
    constructor(location, offset) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isVector3) {
            const u = location.clone().normalize();
            const q = new external_three_namespaceObject.Quaternion().setFromUnitVectors(new external_three_namespaceObject.Vector3(0, 0, 1), u);
            isom.matrix.makeRotationFromQuaternion(q);
        } else {
            throw new Error("HoroballShape: this type of location is not implemented");
        }
        super(isom);
        this.addImport();
        /**
         * Offset.
         * The offset correspond to the image of the origin, by the SDF of the horoball.
         * If the offset is positive, the origin is outside of the horoball
         * @type {number}
         */
        this.offset = offset;
        this._center = undefined;
    }

    updateData() {
        super.updateData();
        this._center = new external_three_namespaceObject.Vector4(0, 0, 1, 1).applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * Center of the ball (at infinity)
     * @type{Vector4}
     */
    get center() {
        if (this._center === undefined) {
            this.updateData();
        }
        return this._center;
    }

    /**
     * Says that the object inherits from `HoroballShape`
     * @type {boolean}
     */
    get isHoroballShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return true;
    }

    get uniformType() {
        return 'HoroballShape';
    }

    static glslClass() {
        return (horoball_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/halfSpace/shaders/struct.glsl
var halfSpace_shaders_struct = __webpack_require__(2581);
var halfSpace_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(halfSpace_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/halfSpace/HalfSpaceShape.js











/**
 * @class
 *
 * @classdesc
 * Half space in hyperbolic space
 */
class HalfSpaceShape extends BasicShape {

    /**
     * Constructor.
     * The half space is the image by `isom` of the half space
     * - going through the origin
     * - whose normal vector is ez = [0,0,1,0]
     * @param {Isometry} isom - the isometry defining the position and orientation of the half space
     */
    constructor(isom = undefined) {
        super(isom);
        this._normal = undefined;
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._normal = {pos: pos, dir: dir};
    }

    /**
     * Compute the normal vector to the half space,
     * so that it can be passed to the shader.
     * The normal vector consists of the underlying point and the direction.
     * @type{{pos:Point, dir:Vector4}}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    get isHalfSpaceShape() {
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
        return true;
    }

    get uniformType() {
        return 'HalfSpaceShape';
    }

    static glslClass() {
        return (halfSpace_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }

    glslUVMap() {
        return shapes_shaders_uv_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/cylinder/shaders/struct.glsl
var cylinder_shaders_struct = __webpack_require__(1468);
var cylinder_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(cylinder_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/cylinder/CylinderShape.js











class CylinderShape extends BasicShape {

    /**
     * Constructor
     * @param {number} radius - the radius of the cylinder
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     */
    constructor(isom, radius) {
        super(isom);
        this.addImport((direction_default()));
        this.radius = radius;
        this._vector = undefined;
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._vector = {pos: pos, dir: dir};
    }

    /**
     * Return the vector (point + direction) orienting the geodesic
     * Mainly used to pass data to the shader
     */
    get vector() {
        if (this._vector === undefined) {
            this.updateData();
        }
        return this._vector;
    }

    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'CylinderShape';
    }

    static glslClass() {
        return (cylinder_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/localBall/shaders/struct.glsl
var localBall_shaders_struct = __webpack_require__(3338);
var localBall_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localBall_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/localBall/LocalBallShape.js












/**
 * @class
 *
 * @classdesc
 * Shape of a hyperbolic local ball
 */
class LocalBallShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Point|Vector} location - data for the center of the ball
     * - If the input in an Isometry, then the center is the image of the origin by this isometry.
     * - If the input in a Point, then the center is that point.
     * - If the input is a Vector, then the center is the image of this vector by the exponential map at the origin.
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
            throw new Error('BallShape: this type of location is not allowed');
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

    /**
     * Center of the ball
     * @type {Point}
     */
    get center() {
        if(this._center === undefined){
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
        return true;
    }

    get uniformType() {
        return 'LocalBallShape';
    }

    static glslClass() {
        return (localBall_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }

    glslUVMap() {
        return shapes_shaders_uv_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/localHoroball/shaders/struct.glsl
var localHoroball_shaders_struct = __webpack_require__(1509);
var localHoroball_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localHoroball_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/localHoroball/LocalHoroballShape.js










/**
 * @class
 *
 * @classdesc
 * Shape of a hyperbolic local horoball
 */
class LocalHoroballShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry|Vector3} location - the location of the horoball.
     * - if location is an Isometry, then the horoball is the image by this isometry of the horoball centered at the point [0,0,1,1]
     * - if location is a Vector3, then the horoball is centered at [u_x, u_y,u_z, 1], where u = (u_x,u_y_u_z) is unit vector in the same direction.
     * (seen as a point in the boundary at infinity of H3 in the hyperboloid model)
     * @param {number} offset - the radius od the ball
     */
    constructor(location, offset) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else if (location.isVector3) {
            const u = location.clone().normalize();
            const q = new external_three_namespaceObject.Quaternion().setFromUnitVectors(new external_three_namespaceObject.Vector3(0, 0, 1), u);
            isom.matrix.makeRotationFromQuaternion(q);
        } else{
            throw new Error("LocalHoroballShape: this type of location is not implemented");
        }
        super(isom);
        this.addImport();
        /**
         * Offset.
         * The offset correspond to the image of the origin, by the SDF of the horoball.
         * If the offset is positive, the origin is outside of the horoball
         * @type {number}
         */
        this.offset = offset;
        this._center = undefined;
    }

    updateData() {
        super.updateData();
        this._center = new external_three_namespaceObject.Vector4(0, 0, 1, 1).applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * Center of the ball (at infinity)
     * @type{Vector4}
     */
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
    get isLocalHoroballShape() {
        return true;
    }

    /**
     * Says whether the shape is global. True if global, false otherwise.
     * @type {boolean}
     */
    get isGlobal() {
        return false;
    }

    get uniformType() {
        return 'LocalHoroballShape';
    }

    static glslClass() {
        return (localHoroball_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }

}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/localCylinder/shaders/struct.glsl
var localCylinder_shaders_struct = __webpack_require__(1352);
var localCylinder_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localCylinder_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/localCylinder/LocalCylinderShape.js











/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Local cylinder in hyperbolic geometry
 */
class LocalCylinderShape extends BasicShape {

    /**
     * Constructor
     * @param {number} radius - the radius of the cylinder
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     */
    constructor(isom, radius) {
        super(isom);
        this.addImport((direction_default()));
        this.radius = radius;
        this._direction = undefined;
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
    }

    /**
     * Return the vector (point + direction) orienting the geodesic
     * Mainly used to pass data to the shader
     */
    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'LocalCylinderShape';
    }

    static glslClass() {
        return (localCylinder_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }

    // glslUVMap() {
    //     return uv(this);
    // }

}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/localCappedCylinder/shaders/struct.glsl
var localCappedCylinder_shaders_struct = __webpack_require__(3273);
var localCappedCylinder_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localCappedCylinder_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/localCappedCylinder/LocalCappedCylinderShape.js












/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Local capped cylinder in hyperbolic geometry
 */
class LocalCappedCylinderShape extends BasicShape {

    /**
     * Constructor
     * @param {number} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * @param {number} height - height of the cylinder
     * @param {number} smoothness - smoothness of the edge (polynomial smooth max)
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     *
     */
    constructor(isom, radius, height, smoothness) {
        super(isom);
        this.addImport((distance_default()), (direction_default()), (smoothMaxPoly_default()));
        this.radius = radius
        /**
         * Coordinates of the normal vector at the top cap of the cylinder (before applying isom)
         * @type {Vector4}
         */
        this.capTop = new external_three_namespaceObject.Vector4(0, 0, Math.cosh(0.5 * height), Math.sinh(0.5 * height));
        /**
         * Coordinates of the normal vector at the bottom cap of the cylinder (before applying isom)
         * @type {Vector4}
         */
        this.capBtm = new external_three_namespaceObject.Vector4(0, 0, -Math.cosh(0.5 * height), Math.sinh(0.5 * height));
        this.smoothness = smoothness;
        this._direction = undefined;
        this._testCapTop = undefined
        this._testCapBtm = undefined
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._testCapTop = this.capTop.clone().applyMatrix4(this.absoluteIsom.matrix);
        this._testCapBtm = this.capBtm.clone().applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * Return the vector (point + direction) orienting the geodesic
     * Mainly used to pass data to the shader
     */
    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    /**
     * Coordinated of the normal vector on the top cap of the cylinder
     * Used to compute the SDF
     */
    get testCapTop() {
        if (this._testCapTop === undefined) {
            this.updateData();
        }
        return this._testCapTop;
    }

    /**
     * Coordinated of the normal vector on the bottom cap of the cylinder
     * Used to compute the SDF
     */
    get testCapBtm() {
        if (this._testCapBtm === undefined) {
            this.updateData();
        }
        return this._testCapBtm;
    }

    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'LocalCappedCylinderShape';
    }

    static glslClass() {
        return (localCappedCylinder_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/localCappedCone/shaders/struct.glsl
var localCappedCone_shaders_struct = __webpack_require__(6854);
var localCappedCone_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localCappedCone_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/localCappedCone/LocalCappedConeShape.js












/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Local cylinder in hyperbolic geometry
 */
class LocalCappedConeShape extends BasicShape {

    /**
     * Constructor
     * @param {number|Vector2} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * @param {number} height - height of the cylinder
     * @param {number} smoothness - smoothness of the edge (polynomial smooth max)
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     *
     */
    constructor(isom, radius, height, smoothness) {
        super(isom);
        this.addImport((distance_default()), (direction_default()), (smoothMaxPoly_default()));
        if (radius.isVector2) {
            this.radius = radius.clone();
        } else {
            this.radius = new Vector2(radius, radius);
        }
        this.height = height;
        /**
         * Coordinates of the normal vector at the top cap of the cylinder (before applying isom)
         * @type {Vector4}
         */
        this.capTop = new external_three_namespaceObject.Vector4(0, 0, Math.cosh(0.5 * height), Math.sinh(0.5 * height));
        /**
         * Coordinates of the normal vector at the bottom cap of the cylinder (before applying isom)
         * @type {Vector4}
         */
        this.capBtm = new external_three_namespaceObject.Vector4(0, 0, -Math.cosh(0.5 * height), Math.sinh(0.5 * height));
        this.smoothness = smoothness;
        this._direction = undefined;
        this._testCapTop = undefined
        this._testCapBtm = undefined
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._testCapTop = this.capTop.clone().applyMatrix4(this.absoluteIsom.matrix);
        this._testCapBtm = this.capBtm.clone().applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * Return the vector (point + direction) orienting the geodesic
     * Mainly used to pass data to the shader
     */
    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    /**
     * Coordinated of the normal vector on the top cap of the cylinder
     * Used to compute the SDF
     */
    get testCapTop() {
        if (this._testCapTop === undefined) {
            this.updateData();
        }
        return this._testCapTop;
    }

    /**
     * Coordinated of the normal vector on the bottom cap of the cylinder
     * Used to compute the SDF
     */
    get testCapBtm() {
        if (this._testCapBtm === undefined) {
            this.updateData();
        }
        return this._testCapBtm;
    }

    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'LocalCappedConeShape';
    }

    static glslClass() {
        return (localCappedCone_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    // glslGradient() {
    //     return gradient(this);
    // }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/localRoundCone/shaders/struct.glsl
var localRoundCone_shaders_struct = __webpack_require__(2399);
var localRoundCone_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localRoundCone_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/localRoundCone/LocalRoundConeShape.js












/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Local cone with a half ball at the bottom
 */
class LocalRoundConeShape extends BasicShape {

    /**
     * Constructor
     * The origin is at the center of the half ball (i.e. at the base of the cone)
     * @param {number} radius - the radius of the base of the cone
     * @param {Isometry} isom - the isometry defining the position of the cylinder.
     * @param {number} height - height of the cylinder
     * The cylinder is the image by isom of the cylinder going through the origin and directed by the vector (0,0,1)
     *
     */
    constructor(isom, radius, height) {
        super(isom);
        this.addImport((distance_default()), (direction_default()), (smoothMaxPoly_default()));
        this.radius = radius;
        this.height = height;
        /**
         * Coordinates of the "normal" vector at the apex of the cone (before applying isom)
         * @type {Vector4}
         */
        this.nApex = new external_three_namespaceObject.Vector4(0, 0, Math.cosh(height), Math.sinh(height));
        this._direction = undefined;
        this._testApex = undefined;
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._testApex = this.nApex.clone().applyMatrix4(this.absoluteIsom.matrix);
    }

    /**
     * Return the vector (point + direction) orienting the geodesic
     * Mainly used to pass data to the shader
     */
    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    /**
     * Coordinated of the normal vector on the top cap of the cylinder
     * Used to compute the SDF
     */
    get testApex() {
        if (this._testApex === undefined) {
            this.updateData();
        }
        return this._testApex;
    }

    /**
     * Coordinated of the normal vector on the bottom cap of the cylinder
     * Used to compute the SDF
     */
    get testCapBtm() {
        if (this._testCapBtm === undefined) {
            this.updateData();
        }
        return this._testCapBtm;
    }

    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return false;
    }

    get uniformType() {
        return 'LocalRoundConeShape';
    }

    static glslClass() {
        return (localRoundCone_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    // glslGradient() {
    //     return gradient(this);
    // }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/slab/shaders/struct.glsl
var slab_shaders_struct = __webpack_require__(6031);
var slab_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(slab_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/slab/SlabShape.js











/**
 * @class
 *
 * @classdesc
 * Slab around the horizontal hyperbolic plane {z = 0}
 *
 * Frankenstein Shape :
 * - the SDF is the one of a global object,
 * - but it is declared as a local object,
 *   so that the ray-marching keep track of the cell boost
 */
class SlabShape extends BasicShape {

    /**
     * Constructor.
     * The slab is the image by `isom` of the slab
     * - going through the origin
     * - whose normal vector is ez = [0,0,1,0]
     * - with the given thickness
     * @param {Isometry} isom - the isometry defining the position and orientation of the half space
     * @param {number} thickness - the thickness of the slab
     */
    constructor(isom = undefined, thickness) {
        super(isom);
        this._normal = undefined;
        this.thickness = thickness;
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._normal = {pos: pos, dir: dir};
    }

    /**
     * Compute the normal vector to the half space,
     * so that it can be passed to the shader.
     * The normal vector consists of the underlying point and the direction.
     * @type{{pos:Point, dir:Vector4}}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    get isSlabShape() {
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
        return true;
    }

    get uniformType() {
        return 'SlabShape';
    }

    static glslClass() {
        return (slab_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }

    glslUVMap() {
        return shapes_shaders_uv_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/hyp/shapes/semiLocalSlab/shaders/struct.glsl
var semiLocalSlab_shaders_struct = __webpack_require__(5470);
var semiLocalSlab_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(semiLocalSlab_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/semiLocalSlab/SemiLocalSlabShape.js












/**
 * @class
 *
 * @classdesc
 * Slab around the horizontal hyperbolic plane {z = 0}
 *
 * Only works with the `augmentedCube` teleportations set
 * The object is a "local" object associated to a finite index subgroup of the `cube` group, say G,
 * namely the kernel, say K, of the projection onto the dihedral group D6 implemented in `augmentedCube`
 */
class SemiLocalSlabShape extends BasicShape {

    /**
     * Constructor.
     * The slab is the image by `isom` of the slab
     * - going through the origin
     * - whose normal vector is ez = [0,0,1,0]
     * - with the given thickness
     * @param {Isometry} isom - the isometry defining the position and orientation of the half space
     * @param {number} thickness - the thickness of the slab
     */
    constructor(isom = undefined, thickness) {
        super(isom);
        this._normal = undefined;
        this.thickness = thickness;

        const shiftXp = augmentedCube_set.teleportations[0].elt; // translation in the negative x direction (test if x > half width)
        const shiftXn = augmentedCube_set.teleportations[1].elt; // translation in the positive x direction (test if x < -half width)
        const shiftYp = augmentedCube_set.teleportations[2].elt; // translation in the negative y direction (test if y > half width)
        const shiftYn = augmentedCube_set.teleportations[3].elt; // translation in the positive y direction (test if y < -half width)
        const shiftZp = augmentedCube_set.teleportations[4].elt; // translation in the negative z direction (test if z > half width)
        const shiftZn = augmentedCube_set.teleportations[5].elt; // translation in the positive z direction (test if z < -half width)

        // relation to turn around a vertical pillar :
        // (shiftYn * shiftZn * shiftXp) ^ 2
        // Its inverse is
        // (shiftXn * shiftZp * shiftYp) ^ 2

        const aux0 = augmentedCube_set.group.element();
        const aux1 = aux0.clone().premultiply(shiftYp);
        const aux2 = aux1.clone().premultiply(shiftZp);
        const aux3 = aux2.clone().premultiply(shiftXn);
        const aux4 = aux3.clone().premultiply(shiftYp);
        const aux5 = aux4.clone().premultiply(shiftZp);

        const elts = [undefined, undefined, undefined, undefined, undefined, undefined];
        elts[aux0.hash()] = aux0;
        elts[aux1.hash()] = aux1;
        elts[aux2.hash()] = aux2;
        elts[aux3.hash()] = aux3;
        elts[aux4.hash()] = aux4;
        elts[aux5.hash()] = aux5;

        this.elt0 = elts[0];
        this.elt1 = elts[1];
        this.elt2 = elts[2];
        this.elt3 = elts[3];
        this.elt4 = elts[4];
        this.elt5 = elts[5];
    }

    updateData() {
        super.updateData();
        const pos = new Point().applyIsometry(this.absoluteIsom);
        const dir = new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._normal = {pos: pos, dir: dir};
    }

    /**
     * Compute the normal vector to the half space,
     * so that it can be passed to the shader.
     * The normal vector consists of the underlying point and the direction.
     * @type{{pos:Point, dir:Vector4}}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    get isSemiLocalSlabShape() {
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
        return true;
    }

    get uniformType() {
        return 'SemiLocalSlabShape';
    }

    static glslClass() {
        return (semiLocalSlab_shaders_struct_default());
    }

    glslSDF() {
        return shapes_shaders_sdf_glsl_mustache_default()(this);
    }

    glslGradient() {
        return shapes_shaders_gradient_glsl_mustache_default()(this);
    }

    glslUVMap() {
        return shapes_shaders_uv_glsl_mustache_default()(this);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/shapes/all.js


















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
     * Return a chunk of GLSL code specific to the instance of the solid
     * We use a hack here.
     * It is indeed impossible in GLSL to update the fields of a uniform variable
     * However for the (crude) handling of transparency we need to modify the isRendered variable.
     * Therefore, after the object is defined, we directly add a variable _isRenderedHack set to true.
     * In the scene SDF the test to check is an object should be rendered is :
     * .isRendered & _isRenderedHack
     * (with the right prefixes)
     * @return {string}
     */
    glslInstance() {
        // language=GLSL
        return `
            bool ${this.name}_isRenderedHack = true;
        `;
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
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/Ball.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic ball
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
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/Horoball.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic horoball
 */
class Horoball extends Solid {

    /**
     * Constructor
     * @param {Isometry|Vector3} location - the location of the horoball.
     * @param {number} offset - the offset of the horoball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, offset, material, ptMaterial = undefined) {
        const shape = new HoroballShape(location, offset);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/Cylinder.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
class Cylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, material, ptMaterial = undefined) {
        const shape = new CylinderShape(isom, radius);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/HalfSpace.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic half space
 */
class HalfSpace extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the isometry defining location of the half space
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, material, ptMaterial = undefined) {
        const shape = new HalfSpaceShape(isom);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/LocalBall.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic ball
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
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/LocalHoroball.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic local horoball
 */
class LocalHoroball extends Solid {

    /**
     * Constructor
     * @param {Isometry|Vector3} location - the location of the horoball
     * @param {number} offset - the offset of the horoball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, offset, material, ptMaterial = undefined) {
        const shape = new LocalHoroballShape(location, offset);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/LocalCylinder.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
class LocalCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, material, ptMaterial = undefined) {
        const shape = new LocalCylinderShape(isom, radius);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/LocalCappedCone.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
class LocalCappedCone extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cone
     * @param {number|Vector2} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {number} height - height of the cylinder
     * @param {number} smoothness - smoothness of the edge (polynomial smooth max)
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, height, smoothness, material, ptMaterial = undefined) {
        const shape = new LocalCappedConeShape(isom, radius, height, smoothness);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/LocalCappedCylinder.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
class LocalCappedCylinder extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cone
     * @param {number} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {number} height - height of the cylinder
     * @param {number} smoothness - smoothness of the edge (polynomial smooth max)
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, height, smoothness, material, ptMaterial = undefined) {
        const shape = new LocalCappedCylinderShape(isom, radius, height, smoothness);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/LocalRoundCone.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic cylinder
 */
class LocalRoundCone extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the location of the cone
     * @param {number} radius - the radii of the cone (if a single value is passed, the top and bottom radii are the same)
     * @param {number} height - height of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, radius, height,  material, ptMaterial = undefined) {
        const shape = new LocalRoundConeShape(isom, radius, height);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/LocalSlab.js



/**
 * @class
 *
 * @classdesc
 * Hyperbolic slab around a hyperbolic plane
 */
class LocalSlab extends Solid {

    /**
     * Constructor
     * @param {Isometry} isom - the isometry defining location of the slab
     * @param {number} thickness - the thickness of the slab
     * @param {Material} material - the material of the solid
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, thickness, material, ptMaterial = undefined) {
        const shape = new SlabShape(isom, thickness);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/hyp/solids/all.js














;// CONCATENATED MODULE: ./src/3dsHyp.js









Renderer.prototype.constructor.shader1 = (part1_default());
Renderer.prototype.constructor.shader2 = (part2_default());


















})();

var __webpack_exports__AcesFilmPostProcess = __webpack_exports__.T0;
var __webpack_exports__AdvancedResetVRControls = __webpack_exports__.FJ;
var __webpack_exports__AdvancedShape = __webpack_exports__.GU;
var __webpack_exports__AugmentedCubeMaterial = __webpack_exports__.uv;
var __webpack_exports__BOTH = __webpack_exports__.XH;
var __webpack_exports__Ball = __webpack_exports__.ec;
var __webpack_exports__BallShape = __webpack_exports__.Yb;
var __webpack_exports__BasicPTMaterial = __webpack_exports__.ZH;
var __webpack_exports__BasicRenderer = __webpack_exports__.K9;
var __webpack_exports__BasicShape = __webpack_exports__.FT;
var __webpack_exports__CREEPING_FULL = __webpack_exports__.cK;
var __webpack_exports__CREEPING_OFF = __webpack_exports__._x;
var __webpack_exports__CREEPING_STRICT = __webpack_exports__.kj;
var __webpack_exports__Camera = __webpack_exports__.V1;
var __webpack_exports__CheckerboardMaterial = __webpack_exports__.Vz;
var __webpack_exports__CombinedPostProcess = __webpack_exports__.ck;
var __webpack_exports__ComplementShape = __webpack_exports__.Iy;
var __webpack_exports__ConstDirLight = __webpack_exports__.Vf;
var __webpack_exports__Cylinder = __webpack_exports__.Ab;
var __webpack_exports__CylinderShape = __webpack_exports__.g6;
var __webpack_exports__DebugMaterial = __webpack_exports__.TB;
var __webpack_exports__DragVRControls = __webpack_exports__.Al;
var __webpack_exports__EquidistantHypStripsMaterial = __webpack_exports__.ix;
var __webpack_exports__EquidistantSphStripsMaterial = __webpack_exports__.jZ;
var __webpack_exports__ExpFog = __webpack_exports__.c$;
var __webpack_exports__FlatCamera = __webpack_exports__.Qj;
var __webpack_exports__FlyControls = __webpack_exports__.mD;
var __webpack_exports__Fog = __webpack_exports__.yb;
var __webpack_exports__GradientColorMaterial = __webpack_exports__.d1;
var __webpack_exports__GraphPaperMaterial = __webpack_exports__.iJ;
var __webpack_exports__Group = __webpack_exports__.ZA;
var __webpack_exports__GroupElement = __webpack_exports__.Jz;
var __webpack_exports__HalfSpace = __webpack_exports__.Fr;
var __webpack_exports__HalfSpaceShape = __webpack_exports__.RM;
var __webpack_exports__HighlightLocalWrapMaterial = __webpack_exports__.fR;
var __webpack_exports__HighlightWrapMaterial = __webpack_exports__.kK;
var __webpack_exports__Horoball = __webpack_exports__.KV;
var __webpack_exports__HoroballShape = __webpack_exports__.sm;
var __webpack_exports__HypStripsMaterial = __webpack_exports__.ZX;
var __webpack_exports__ImprovedEquidistantHypStripsMaterial = __webpack_exports__._f;
var __webpack_exports__ImprovedEquidistantSphStripsMaterial = __webpack_exports__.Ht;
var __webpack_exports__InfoControls = __webpack_exports__.HZ;
var __webpack_exports__IntersectionShape = __webpack_exports__.TN;
var __webpack_exports__Isometry = __webpack_exports__.JV;
var __webpack_exports__IsotropicChaseVRControls = __webpack_exports__.Sc;
var __webpack_exports__KeyGenericControls = __webpack_exports__.Nh;
var __webpack_exports__LEFT = __webpack_exports__.RL;
var __webpack_exports__Light = __webpack_exports__._k;
var __webpack_exports__LightVRControls = __webpack_exports__.uR;
var __webpack_exports__LinearToSRGBPostProcess = __webpack_exports__.gU;
var __webpack_exports__LocalBall = __webpack_exports__.jo;
var __webpack_exports__LocalBallShape = __webpack_exports__.Q;
var __webpack_exports__LocalCappedCone = __webpack_exports__.l8;
var __webpack_exports__LocalCappedConeShape = __webpack_exports__.dd;
var __webpack_exports__LocalCappedCylinder = __webpack_exports__.Sx;
var __webpack_exports__LocalCappedCylinderShape = __webpack_exports__.ML;
var __webpack_exports__LocalCylinder = __webpack_exports__.gq;
var __webpack_exports__LocalCylinderShape = __webpack_exports__.Gj;
var __webpack_exports__LocalHoroball = __webpack_exports__.NW;
var __webpack_exports__LocalHoroballShape = __webpack_exports__.pt;
var __webpack_exports__LocalPointLight = __webpack_exports__.L8;
var __webpack_exports__LocalRoundCone = __webpack_exports__.Wu;
var __webpack_exports__LocalRoundConeShape = __webpack_exports__.iq;
var __webpack_exports__LocalSlab = __webpack_exports__.hk;
var __webpack_exports__LocalTruePointLight = __webpack_exports__.NZ;
var __webpack_exports__Material = __webpack_exports__.F5;
var __webpack_exports__Matrix2 = __webpack_exports__.Uc;
var __webpack_exports__MoveVRControls = __webpack_exports__.Fh;
var __webpack_exports__MultiColor2Material = __webpack_exports__.di;
var __webpack_exports__MultiColorMaterial = __webpack_exports__.O5;
var __webpack_exports__NativeCamera = __webpack_exports__.jy;
var __webpack_exports__NoiseColorMaterial = __webpack_exports__.MV;
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
var __webpack_exports__RegularHypPolygon = __webpack_exports__.tX;
var __webpack_exports__RelPosition = __webpack_exports__.Dz;
var __webpack_exports__Renderer = __webpack_exports__.Th;
var __webpack_exports__ResetVRControls = __webpack_exports__.Uj;
var __webpack_exports__RotatedSphericalTextureMaterial = __webpack_exports__.bY;
var __webpack_exports__SMOOTH_MAX_POLY = __webpack_exports__.cV;
var __webpack_exports__SMOOTH_MIN_POLY = __webpack_exports__.lR;
var __webpack_exports__SWSet = __webpack_exports__.eZ;
var __webpack_exports__Scene = __webpack_exports__.xs;
var __webpack_exports__SemiLocalSlabShape = __webpack_exports__.zK;
var __webpack_exports__Shape = __webpack_exports__.bn;
var __webpack_exports__ShootVRControls = __webpack_exports__.oC;
var __webpack_exports__SimpleTextureMaterial = __webpack_exports__.Z1;
var __webpack_exports__SingleColorMaterial = __webpack_exports__.h8;
var __webpack_exports__SlabShape = __webpack_exports__.sQ;
var __webpack_exports__Solid = __webpack_exports__.Qf;
var __webpack_exports__SphereCamera = __webpack_exports__.jE;
var __webpack_exports__SquaresMaterial = __webpack_exports__.k1;
var __webpack_exports__StripsMaterial = __webpack_exports__.ew;
var __webpack_exports__SunLight = __webpack_exports__.Ck;
var __webpack_exports__SwitchControls = __webpack_exports__.$p;
var __webpack_exports__TeleportationSet = __webpack_exports__.xG;
var __webpack_exports__TransitionLocalWrapMaterial = __webpack_exports__.l_;
var __webpack_exports__TransitionWrapMaterial = __webpack_exports__.pk;
var __webpack_exports__TruePointLight = __webpack_exports__.lS;
var __webpack_exports__UnionShape = __webpack_exports__.yI;
var __webpack_exports__VRCamera = __webpack_exports__.E6;
var __webpack_exports__VRRenderer = __webpack_exports__.zO;
var __webpack_exports__VaryingColorMaterial = __webpack_exports__.cB;
var __webpack_exports__Vector = __webpack_exports__.OW;
var __webpack_exports__VideoAlphaTextureMaterial = __webpack_exports__.n3;
var __webpack_exports__VideoFrameTextureMaterial = __webpack_exports__.Se;
var __webpack_exports__VideoTextureMaterial = __webpack_exports__.PQ;
var __webpack_exports__WrapShape = __webpack_exports__.$9;
var __webpack_exports__augmentedCubeSet = __webpack_exports__.zy;
var __webpack_exports__bind = __webpack_exports__.ak;
var __webpack_exports__clamp = __webpack_exports__.uZ;
var __webpack_exports__complement = __webpack_exports__.Cy;
var __webpack_exports__cubeSet = __webpack_exports__.Rc;
var __webpack_exports__earthTexture = __webpack_exports__.qM;
var __webpack_exports__h435Set = __webpack_exports__.MO;
var __webpack_exports__highlightLocalWrap = __webpack_exports__.mV;
var __webpack_exports__highlightWrap = __webpack_exports__.Gi;
var __webpack_exports__intersection = __webpack_exports__.jV;
var __webpack_exports__m125Set = __webpack_exports__.LK;
var __webpack_exports__marsTexture = __webpack_exports__.j9;
var __webpack_exports__moonTexture = __webpack_exports__.oc;
var __webpack_exports__pathTracerWrap = __webpack_exports__.wS;
var __webpack_exports__phongWrap = __webpack_exports__.IJ;
var __webpack_exports__safeString = __webpack_exports__.p2;
var __webpack_exports__sunTexture = __webpack_exports__.w0;
var __webpack_exports__symCubeSet = __webpack_exports__.aZ;
var __webpack_exports__transitionLocalWrap = __webpack_exports__.VL;
var __webpack_exports__transitionWrap = __webpack_exports__.UR;
var __webpack_exports__trivialSet = __webpack_exports__.dV;
var __webpack_exports__union = __webpack_exports__.G0;
var __webpack_exports__whiteheadSet = __webpack_exports__.HP;
var __webpack_exports__woodBallMaterial = __webpack_exports__.YL;
var __webpack_exports__wrap = __webpack_exports__.re;
export { __webpack_exports__AcesFilmPostProcess as AcesFilmPostProcess, __webpack_exports__AdvancedResetVRControls as AdvancedResetVRControls, __webpack_exports__AdvancedShape as AdvancedShape, __webpack_exports__AugmentedCubeMaterial as AugmentedCubeMaterial, __webpack_exports__BOTH as BOTH, __webpack_exports__Ball as Ball, __webpack_exports__BallShape as BallShape, __webpack_exports__BasicPTMaterial as BasicPTMaterial, __webpack_exports__BasicRenderer as BasicRenderer, __webpack_exports__BasicShape as BasicShape, __webpack_exports__CREEPING_FULL as CREEPING_FULL, __webpack_exports__CREEPING_OFF as CREEPING_OFF, __webpack_exports__CREEPING_STRICT as CREEPING_STRICT, __webpack_exports__Camera as Camera, __webpack_exports__CheckerboardMaterial as CheckerboardMaterial, __webpack_exports__CombinedPostProcess as CombinedPostProcess, __webpack_exports__ComplementShape as ComplementShape, __webpack_exports__ConstDirLight as ConstDirLight, __webpack_exports__Cylinder as Cylinder, __webpack_exports__CylinderShape as CylinderShape, __webpack_exports__DebugMaterial as DebugMaterial, __webpack_exports__DragVRControls as DragVRControls, __webpack_exports__EquidistantHypStripsMaterial as EquidistantHypStripsMaterial, __webpack_exports__EquidistantSphStripsMaterial as EquidistantSphStripsMaterial, __webpack_exports__ExpFog as ExpFog, __webpack_exports__FlatCamera as FlatCamera, __webpack_exports__FlyControls as FlyControls, __webpack_exports__Fog as Fog, __webpack_exports__GradientColorMaterial as GradientColorMaterial, __webpack_exports__GraphPaperMaterial as GraphPaperMaterial, __webpack_exports__Group as Group, __webpack_exports__GroupElement as GroupElement, __webpack_exports__HalfSpace as HalfSpace, __webpack_exports__HalfSpaceShape as HalfSpaceShape, __webpack_exports__HighlightLocalWrapMaterial as HighlightLocalWrapMaterial, __webpack_exports__HighlightWrapMaterial as HighlightWrapMaterial, __webpack_exports__Horoball as Horoball, __webpack_exports__HoroballShape as HoroballShape, __webpack_exports__HypStripsMaterial as HypStripsMaterial, __webpack_exports__ImprovedEquidistantHypStripsMaterial as ImprovedEquidistantHypStripsMaterial, __webpack_exports__ImprovedEquidistantSphStripsMaterial as ImprovedEquidistantSphStripsMaterial, __webpack_exports__InfoControls as InfoControls, __webpack_exports__IntersectionShape as IntersectionShape, __webpack_exports__Isometry as Isometry, __webpack_exports__IsotropicChaseVRControls as IsotropicChaseVRControls, __webpack_exports__KeyGenericControls as KeyGenericControls, __webpack_exports__LEFT as LEFT, __webpack_exports__Light as Light, __webpack_exports__LightVRControls as LightVRControls, __webpack_exports__LinearToSRGBPostProcess as LinearToSRGBPostProcess, __webpack_exports__LocalBall as LocalBall, __webpack_exports__LocalBallShape as LocalBallShape, __webpack_exports__LocalCappedCone as LocalCappedCone, __webpack_exports__LocalCappedConeShape as LocalCappedConeShape, __webpack_exports__LocalCappedCylinder as LocalCappedCylinder, __webpack_exports__LocalCappedCylinderShape as LocalCappedCylinderShape, __webpack_exports__LocalCylinder as LocalCylinder, __webpack_exports__LocalCylinderShape as LocalCylinderShape, __webpack_exports__LocalHoroball as LocalHoroball, __webpack_exports__LocalHoroballShape as LocalHoroballShape, __webpack_exports__LocalPointLight as LocalPointLight, __webpack_exports__LocalRoundCone as LocalRoundCone, __webpack_exports__LocalRoundConeShape as LocalRoundConeShape, __webpack_exports__LocalSlab as LocalSlab, __webpack_exports__LocalTruePointLight as LocalTruePointLight, __webpack_exports__Material as Material, __webpack_exports__Matrix2 as Matrix2, __webpack_exports__MoveVRControls as MoveVRControls, __webpack_exports__MultiColor2Material as MultiColor2Material, __webpack_exports__MultiColorMaterial as MultiColorMaterial, __webpack_exports__NativeCamera as NativeCamera, __webpack_exports__NoiseColorMaterial as NoiseColorMaterial, __webpack_exports__NormalMaterial as NormalMaterial, __webpack_exports__PTMaterial as PTMaterial, __webpack_exports__PathTracerCamera as PathTracerCamera, __webpack_exports__PathTracerRenderer as PathTracerRenderer, __webpack_exports__PathTracerWrapMaterial as PathTracerWrapMaterial, __webpack_exports__PhongMaterial as PhongMaterial, __webpack_exports__PhongWrapMaterial as PhongWrapMaterial, __webpack_exports__Point as Point, __webpack_exports__PointLight as PointLight, __webpack_exports__Position as Position, __webpack_exports__QuadRing as QuadRing, __webpack_exports__QuadRingElement as QuadRingElement, __webpack_exports__QuadRingMatrix4 as QuadRingMatrix4, __webpack_exports__RIGHT as RIGHT, __webpack_exports__RegularHypPolygon as RegularHypPolygon, __webpack_exports__RelPosition as RelPosition, __webpack_exports__Renderer as Renderer, __webpack_exports__ResetVRControls as ResetVRControls, __webpack_exports__RotatedSphericalTextureMaterial as RotatedSphericalTextureMaterial, __webpack_exports__SMOOTH_MAX_POLY as SMOOTH_MAX_POLY, __webpack_exports__SMOOTH_MIN_POLY as SMOOTH_MIN_POLY, __webpack_exports__SWSet as SWSet, __webpack_exports__Scene as Scene, __webpack_exports__SemiLocalSlabShape as SemiLocalSlabShape, __webpack_exports__Shape as Shape, __webpack_exports__ShootVRControls as ShootVRControls, __webpack_exports__SimpleTextureMaterial as SimpleTextureMaterial, __webpack_exports__SingleColorMaterial as SingleColorMaterial, __webpack_exports__SlabShape as SlabShape, __webpack_exports__Solid as Solid, __webpack_exports__SphereCamera as SphereCamera, __webpack_exports__SquaresMaterial as SquaresMaterial, __webpack_exports__StripsMaterial as StripsMaterial, __webpack_exports__SunLight as SunLight, __webpack_exports__SwitchControls as SwitchControls, __webpack_exports__TeleportationSet as TeleportationSet, __webpack_exports__TransitionLocalWrapMaterial as TransitionLocalWrapMaterial, __webpack_exports__TransitionWrapMaterial as TransitionWrapMaterial, __webpack_exports__TruePointLight as TruePointLight, __webpack_exports__UnionShape as UnionShape, __webpack_exports__VRCamera as VRCamera, __webpack_exports__VRRenderer as VRRenderer, __webpack_exports__VaryingColorMaterial as VaryingColorMaterial, __webpack_exports__Vector as Vector, __webpack_exports__VideoAlphaTextureMaterial as VideoAlphaTextureMaterial, __webpack_exports__VideoFrameTextureMaterial as VideoFrameTextureMaterial, __webpack_exports__VideoTextureMaterial as VideoTextureMaterial, __webpack_exports__WrapShape as WrapShape, __webpack_exports__augmentedCubeSet as augmentedCubeSet, __webpack_exports__bind as bind, __webpack_exports__clamp as clamp, __webpack_exports__complement as complement, __webpack_exports__cubeSet as cubeSet, __webpack_exports__earthTexture as earthTexture, __webpack_exports__h435Set as h435Set, __webpack_exports__highlightLocalWrap as highlightLocalWrap, __webpack_exports__highlightWrap as highlightWrap, __webpack_exports__intersection as intersection, __webpack_exports__m125Set as m125Set, __webpack_exports__marsTexture as marsTexture, __webpack_exports__moonTexture as moonTexture, __webpack_exports__pathTracerWrap as pathTracerWrap, __webpack_exports__phongWrap as phongWrap, __webpack_exports__safeString as safeString, __webpack_exports__sunTexture as sunTexture, __webpack_exports__symCubeSet as symCubeSet, __webpack_exports__transitionLocalWrap as transitionLocalWrap, __webpack_exports__transitionWrap as transitionWrap, __webpack_exports__trivialSet as trivialSet, __webpack_exports__union as union, __webpack_exports__whiteheadSet as whiteheadSet, __webpack_exports__woodBallMaterial as woodBallMaterial, __webpack_exports__wrap as wrap };
