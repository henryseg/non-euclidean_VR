import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
import * as __WEBPACK_EXTERNAL_MODULE_webxr_polyfill_b35c672b__ from "webxr-polyfill";
import * as __WEBPACK_EXTERNAL_MODULE_dat_gui_4e1bbbdc__ from "dat.gui";
import * as __WEBPACK_EXTERNAL_MODULE_stats__ from "stats";
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

/***/ 8008:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b(" * Default creeping function (binary search)");t.b("\n" + i);t.b(" * @param start starting point of the creeping");t.b("\n" + i);t.b(" * @param outside vector out of the boundary (obtained from the previous flow, or the previous creeping)");t.b("\n" + i);t.b(" * @param offset how long we flow after passing the boundary");t.b("\n" + i);t.b(" */");t.b("\n" + i);t.b("float ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(ExtVector v, ExtVector outside,  float offset){");t.b("\n" + i);t.b("    ExtVector try = outside;");t.b("\n" + i);t.b("    float sIn = 0.;");t.b("\n" + i);t.b("    float sOut = try.data.lastFlowDist;");t.b("\n" + i);t.b("    float s;");t.b("\n" + i);t.b("    for(int i=0; i < 100; i++){");t.b("\n" + i);t.b("        if(sOut - sIn < offset){");t.b("\n" + i);t.b("            break;");t.b("\n" + i);t.b("        }");t.b("\n" + i);t.b("        s = 0.5 * sIn + 0.5 * sOut;");t.b("\n" + i);t.b("        try = flow(v,s);");t.b("\n" + i);t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("            sOut = s;");t.b("\n" + i);t.b("            outside = try;");t.b("\n" + i);t.b("        } else {");t.b("\n" + i);t.b("            sIn = s;");t.b("\n" + i);t.b("        }");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    return sOut;");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "/**\n * Default creeping function (binary search)\n * @param start starting point of the creeping\n * @param outside vector out of the boundary (obtained from the previous flow, or the previous creeping)\n * @param offset how long we flow after passing the boundary\n */\nfloat {{glslCreepName}}(ExtVector v, ExtVector outside,  float offset){\n    ExtVector try = outside;\n    float sIn = 0.;\n    float sOut = try.data.lastFlowDist;\n    float s;\n    for(int i=0; i < 100; i++){\n        if(sOut - sIn < offset){\n            break;\n        }\n        s = 0.5 * sIn + 0.5 * sOut;\n        try = flow(v,s);\n        if({{glslTestName}}(try.vector.local.pos)){\n            sOut = s;\n            outside = try;\n        } else {\n            sIn = s;\n        }\n    }\n    return sOut;\n}", H);return T.render.apply(T, arguments); };

/***/ }),

/***/ 968:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var H = __webpack_require__(5485);
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("/**");t.b("\n" + i);t.b("* Teleportation.");t.b("\n" + i);t.b("* Check if the local vector is still in the fundamental domain define by the teleportation tests.");t.b("\n" + i);t.b("* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true");t.b("\n" + i);t.b("* Otherwise, do nothing and set teleported to false");t.b("\n" + i);t.b("* @param[in] v the relative vector to teleport.");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("ExtVector teleport(ExtVector v){");t.b("\n" + i);t.b("    v.data.isTeleported = false;");t.b("\n" + i);if(t.s(t.f("teleportations",c,p,1),c,p,0,424,621,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(v.vector.local.pos)){");t.b("\n" + i);t.b("            v.vector = rewrite(v.vector, ");t.b(t.v(t.d("elt.name",c,p,0)));t.b(", ");t.b(t.v(t.d("inv.name",c,p,0)));t.b(");");t.b("\n" + i);t.b("            v.data.isTeleported = true;");t.b("\n" + i);t.b("            return v;");t.b("\n" + i);t.b("        }");t.b("\n" + i);});c.pop();}t.b("    return v;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("/**");t.b("\n" + i);t.b("* Does one of the two following transformation:");t.b("\n" + i);t.b("* flow the vector by the given time, if the vector escape the fundamental domain,");t.b("\n" + i);t.b("* then try to find a smaller time so that the vector is moved closer to the boundary of the fudamental domain");t.b("\n" + i);t.b("* (and even a bit further)");t.b("\n" + i);t.b("*");t.b("\n" + i);t.b("* @param[inout] v the relative vector to flow / teleport / creep.");t.b("\n" + i);t.b("* @param[in] t the (maximal) time to flow");t.b("\n" + i);t.b("* @param[in] offset the amount we march passed the boundary");t.b("\n" + i);t.b("*/");t.b("\n" + i);t.b("float creepingDist(ExtVector v, float t, float offset){");t.b("\n" + i);t.b("    float res = t;");t.b("\n" + i);t.b("    ExtVector try = flow(v, t);");t.b("\n" + i);if(t.s(t.f("teleportations",c,p,1),c,p,0,1233,1638,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);if(t.s(t.f("usesCreepingCustom",c,p,1),c,p,0,1266,1407,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("                res = min(res, ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(v, offset));");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(t.s(t.f("usesCreepingBinary",c,p,1),c,p,0,1463,1609,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            if(");t.b(t.v(t.f("glslTestName",c,p,0)));t.b("(try.vector.local.pos)){");t.b("\n" + i);t.b("                res = min(res, ");t.b(t.v(t.f("glslCreepName",c,p,0)));t.b("(v, try, offset));");t.b("\n" + i);t.b("            }");t.b("\n" + i);});c.pop();}t.b("\n" + i);});c.pop();}t.b("    return res;");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "/**\n* Teleportation.\n* Check if the local vector is still in the fundamental domain define by the teleportation tests.\n* If not, teleport the local vector, update the cellBoost and its inverse accordingly and set teleported to true\n* Otherwise, do nothing and set teleported to false\n* @param[in] v the relative vector to teleport.\n*/\nExtVector teleport(ExtVector v){\n    v.data.isTeleported = false;\n    {{#teleportations}}\n        if({{glslTestName}}(v.vector.local.pos)){\n            v.vector = rewrite(v.vector, {{elt.name}}, {{inv.name}});\n            v.data.isTeleported = true;\n            return v;\n        }\n    {{/teleportations}}\n    return v;\n}\n\n\n/**\n* Does one of the two following transformation:\n* flow the vector by the given time, if the vector escape the fundamental domain,\n* then try to find a smaller time so that the vector is moved closer to the boundary of the fudamental domain\n* (and even a bit further)\n*\n* @param[inout] v the relative vector to flow / teleport / creep.\n* @param[in] t the (maximal) time to flow\n* @param[in] offset the amount we march passed the boundary\n*/\nfloat creepingDist(ExtVector v, float t, float offset){\n    float res = t;\n    ExtVector try = flow(v, t);\n    {{#teleportations}}\n\n        {{#usesCreepingCustom}}\n            if({{glslTestName}}(try.vector.local.pos)){\n                res = min(res, {{glslCreepName}}(v, offset));\n            }\n        {{/usesCreepingCustom}}\n\n        {{#usesCreepingBinary}}\n            if({{glslTestName}}(try.vector.local.pos)){\n                res = min(res, {{glslCreepName}}(v, try, offset));\n            }\n        {{/usesCreepingBinary}}\n\n    {{/teleportations}}\n    return res;\n}\n\n\n", H);return T.render.apply(T, arguments); };

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
module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("VectorData initVectorData(){");t.b("\n" + i);t.b("    return VectorData(0., 0., 0., false, 0, 0, false, vec4(0), vec4(1));");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n");t.b("\n" + i);t.b("void updateVectorDataFromSolid(inout ExtVector v, int objId){");t.b("\n" + i);t.b("    RelVector normal;");t.b("\n" + i);t.b("    vec2 uv;");t.b("\n" + i);t.b("    vec4 color;");t.b("\n" + i);t.b("    vec4 reflectivity;");t.b("\n" + i);t.b("    float opacity;");t.b("\n" + i);t.b("    float t;");t.b("\n" + i);t.b("    ");t.b("\n" + i);t.b("    switch(objId){");t.b("\n" + i);if(t.s(t.d("scene.solids",c,p,1),c,p,0,319,5930,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("    ");t.b("\n" + i);t.b("        case ");t.b(t.v(t.f("id",c,p,0)));t.b(":");t.b("\n" + i);if(t.s(t.d("material.isTransparent",c,p,1),c,p,0,381,2198,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,597,732,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,830,1322,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                    normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,1079,1286,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                    uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                    color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);t.b("            if(v.data.iBounce == maxBounces){");t.b("\n" + i);t.b("                opacity = 1.;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            else {");t.b("\n" + i);t.b("                opacity = color.a;");t.b("\n" + i);t.b("            }");t.b("\n");t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,1533,1612,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                //color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("            if(opacity == 1.) {");t.b("\n" + i);t.b("                v.data.stop = true;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            else{");t.b("\n" + i);t.b("                v.data.stop = false;");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * opacity * color;");t.b("\n" + i);t.b("            v.data.leftToComputeColor = (1. - opacity) * v.data.leftToComputeColor;");t.b("\n" + i);t.b("            ");t.b(t.v(t.f("name",c,p,0)));t.b("_isRenderedHack = false;");t.b("\n" + i);t.b("            v.data.lastBounceDist = 0.;");t.b("\n" + i);t.b("            v.data.iBounce = v.data.iBounce + 1;");t.b("\n" + i);t.b("            //t = 20. * camera.threshold / abs(geomDot(v.vector, normal));");t.b("\n" + i);t.b("            //v = flow(v, t);");t.b("\n");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.d("material.isTransparent",c,p,1),c,p,1,0,0,"")){t.b("\n" + i);if(t.s(t.d("material.isReflecting",c,p,1),c,p,0,2302,4417,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);t.b("                if(v.data.iBounce == maxBounces){");t.b("\n" + i);t.b("                    reflectivity = vec4(0);");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                else {");t.b("\n" + i);t.b("                    reflectivity = vec4(");t.b(t.v(t.d("material.name",c,p,0)));t.b(".reflectivity,1);");t.b("\n" + i);t.b("                }");t.b("\n");t.b("\n" + i);t.b("                normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                // in general the gradient is not necessarily a unit vector");t.b("\n" + i);t.b("                normal = geomNormalize(normal);");t.b("\n");t.b("\n" + i);if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,2952,3099,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,3205,3601,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,3406,3561,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,3657,3742,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("                if(length(reflectivity) == 0.) {");t.b("\n" + i);t.b("                    v.data.stop = true;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                else{");t.b("\n" + i);t.b("                    v.data.stop = false;");t.b("\n" + i);t.b("                }");t.b("\n" + i);t.b("                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * (vec4(1) - reflectivity) * color;");t.b("\n" + i);t.b("                v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;");t.b("\n" + i);t.b("                v.vector = geomReflect(v.vector,normal);");t.b("\n" + i);t.b("                v.data.lastBounceDist = 0.;");t.b("\n" + i);t.b("                v.data.iBounce = v.data.iBounce + 1;");t.b("\n" + i);t.b("                t = 20. * camera.threshold / abs(geomDot(v.vector, normal));");t.b("\n" + i);t.b("                v = flow(v, t);");t.b("\n");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(!t.s(t.d("material.isReflecting",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesNormal",c,p,1),c,p,1,0,0,"")){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        color =  ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,4718,4865,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, uv);");t.b("\n" + i);});c.pop();}};t.b("\n" + i);if(t.s(t.d("material.usesNormal",c,p,1),c,p,0,4971,5503,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.d("material.usesUVMap",c,p,1),c,p,1,0,0,"")){t.b("                        normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal);");t.b("\n" + i);};if(t.s(t.d("material.usesUVMap",c,p,1),c,p,0,5240,5463,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        normal = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_gradient(v.vector);");t.b("\n" + i);t.b("                        uv = ");t.b(t.v(t.d("shape.name",c,p,0)));t.b("_uvMap(v.vector);");t.b("\n" + i);t.b("                        color = ");t.b(t.v(t.d("material.name",c,p,0)));t.b("_render(v, normal, uv);");t.b("\n" + i);});c.pop();}});c.pop();}t.b("\n" + i);if(t.s(t.d("scene.fog",c,p,1),c,p,0,5559,5644,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                    color = applyFog(color, v.data.lastBounceDist);");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;");t.b("\n" + i);t.b("                v.data.leftToComputeColor = vec4(0);");t.b("\n" + i);t.b("                v.data.stop = true;");t.b("\n" + i);};t.b("\n" + i);};t.b("        break;");t.b("\n" + i);t.b("    ");t.b("\n" + i);});c.pop();}t.b("    }");t.b("\n" + i);t.b("}");t.b("\n");t.b("\n" + i);t.b("void updateVectorData(inout ExtVector v, int hit, int objId){");t.b("\n" + i);t.b("    if (hit == HIT_DEBUG) {");t.b("\n" + i);t.b("        v.data.pixel = debugColor;");t.b("\n" + i);t.b("        v.data.leftToComputeColor = vec4(0);");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if (hit == HIT_NOTHING) {");t.b("\n" + i);t.b("        vec4 color = ");t.b(t.v(t.d("scene.background.name",c,p,0)));t.b("_render(v);");t.b("\n" + i);t.b("        v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;");t.b("\n" + i);t.b("        v.data.leftToComputeColor = vec4(0);");t.b("\n" + i);t.b("        v.data.stop = true;");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    if(hit == HIT_SOLID) {");t.b("\n" + i);t.b("        updateVectorDataFromSolid(v, objId);");t.b("\n" + i);t.b("        return;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("}");return t.fl(); },partials: {}, subs: {  }}, "VectorData initVectorData(){\n    return VectorData(0., 0., 0., false, 0, 0, false, vec4(0), vec4(1));\n}\n\n\nvoid updateVectorDataFromSolid(inout ExtVector v, int objId){\n    RelVector normal;\n    vec2 uv;\n    vec4 color;\n    vec4 reflectivity;\n    float opacity;\n    float t;\n    \n    switch(objId){\n    {{#scene.solids}}\n    \n        case {{id}}:\n        {{#material.isTransparent}}\n\n            {{^material.usesNormal}}\n                {{^material.usesUVMap}}\n                    color =  {{material.name}}_render(v);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n\n            {{#material.usesNormal}}\n                {{^material.usesUVMap}}\n                    normal = {{shape.name}}_gradient(v.vector);\n                    color = {{material.name}}_render(v, normal);\n                {{/material.usesUVMap}}\n                {{#material.usesUVMap}}\n                    normal = {{shape.name}}_gradient(v.vector);\n                    uv = {{shape.name}}_uvMap(v.vector);\n                    color = {{material.name}}_render(v, normal, uv);\n                {{/material.usesUVMap}}\n            {{/material.usesNormal}}\n\n            if(v.data.iBounce == maxBounces){\n                opacity = 1.;\n            }\n            else {\n                opacity = color.a;\n            }\n\n            {{#scene.fog}}\n                //color = applyFog(color, v.data.lastBounceDist);\n            {{/scene.fog}}\n\n            if(opacity == 1.) {\n                v.data.stop = true;\n            }\n            else{\n                v.data.stop = false;\n            }\n            v.data.pixel = v.data.pixel + v.data.leftToComputeColor * opacity * color;\n            v.data.leftToComputeColor = (1. - opacity) * v.data.leftToComputeColor;\n            {{name}}_isRenderedHack = false;\n            v.data.lastBounceDist = 0.;\n            v.data.iBounce = v.data.iBounce + 1;\n            //t = 20. * camera.threshold / abs(geomDot(v.vector, normal));\n            //v = flow(v, t);\n\n        {{/material.isTransparent}}\n\n        {{^material.isTransparent}}\n\n            {{#material.isReflecting}}\n\n                if(v.data.iBounce == maxBounces){\n                    reflectivity = vec4(0);\n                }\n                else {\n                    reflectivity = vec4({{material.name}}.reflectivity,1);\n                }\n\n                normal = {{shape.name}}_gradient(v.vector);\n                // in general the gradient is not necessarily a unit vector\n                normal = geomNormalize(normal);\n\n                {{^material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        color =  {{material.name}}_render(v);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        color = {{material.name}}_render(v, normal);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, normal, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#scene.fog}}\n                    color = applyFog(color, v.data.lastBounceDist);\n                {{/scene.fog}}\n\n                if(length(reflectivity) == 0.) {\n                    v.data.stop = true;\n                }\n                else{\n                    v.data.stop = false;\n                }\n                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * (vec4(1) - reflectivity) * color;\n                v.data.leftToComputeColor = v.data.leftToComputeColor *  reflectivity;\n                v.vector = geomReflect(v.vector,normal);\n                v.data.lastBounceDist = 0.;\n                v.data.iBounce = v.data.iBounce + 1;\n                t = 20. * camera.threshold / abs(geomDot(v.vector, normal));\n                v = flow(v, t);\n\n            {{/material.isReflecting}}\n\n            {{^material.isReflecting}}\n                {{^material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        color =  {{material.name}}_render(v);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#material.usesNormal}}\n                    {{^material.usesUVMap}}\n                        normal = {{shape.name}}_gradient(v.vector);\n                        color = {{material.name}}_render(v, normal);\n                    {{/material.usesUVMap}}\n                    {{#material.usesUVMap}}\n                        normal = {{shape.name}}_gradient(v.vector);\n                        uv = {{shape.name}}_uvMap(v.vector);\n                        color = {{material.name}}_render(v, normal, uv);\n                    {{/material.usesUVMap}}\n                {{/material.usesNormal}}\n\n                {{#scene.fog}}\n                    color = applyFog(color, v.data.lastBounceDist);\n                {{/scene.fog}}\n\n                v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;\n                v.data.leftToComputeColor = vec4(0);\n                v.data.stop = true;\n            {{/material.isReflecting}}\n\n        {{/material.isTransparent}}\n        break;\n    \n    {{/scene.solids}}\n    }\n}\n\nvoid updateVectorData(inout ExtVector v, int hit, int objId){\n    if (hit == HIT_DEBUG) {\n        v.data.pixel = debugColor;\n        v.data.leftToComputeColor = vec4(0);\n        v.data.stop = true;\n        return;\n    }\n    if (hit == HIT_NOTHING) {\n        vec4 color = {{scene.background.name}}_render(v);\n        v.data.pixel = v.data.pixel + v.data.leftToComputeColor * color;\n        v.data.leftToComputeColor = vec4(0);\n        v.data.stop = true;\n        return;\n    }\n    if(hit == HIT_SOLID) {\n        updateVectorDataFromSolid(v, objId);\n        return;\n    }\n}", H);return T.render.apply(T, arguments); };

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

module.exports = "                                                                                                                        \n                                                                 \n                                                                                                                        \n\nstruct ImprovedEquidistantHypStripsMaterial {\n    float distance;\n    float halfWidth;\n    vec3 stripColor;\n    vec3 bgColor;\n};\n\n  \n                                                                     \n                                                                           \n   \nfloat distToYAxis(vec2 m) {\n    float aux = sqrt(1. - m.y * m.y);\n    return 0.5 * log((aux + m.x) / (aux - m.x));\n}\n\n                                                                                     \n                                                  \n   \nvec2 horizontalTranslate(vec2 m, float t) {\n    float ch = cosh(t);\n    float sh = sinh(t);\n    float x = m.x * ch + sh;\n    float den = m.x * sh + ch;\n    return vec2(x / den, m.y / den);\n}\n\nvec4 render(ImprovedEquidistantHypStripsMaterial material, ExtVector v, vec2 uv) {\n    float t = atanh(uv.x) - material.distance;\n    vec2 m = horizontalTranslate(uv, -t);\n    float distM = abs(distToYAxis(m));\n    float n = floor(log(distM / material.distance) / log(2.));\n\n    float distP = atanh(uv.x);\n    float period = pow(2., -n) * material.distance;\n    float k = round(distP / period);\n    vec2 q = horizontalTranslate(uv, -k * period);\n    float distQ = distToYAxis(q);\n    if (abs(distQ) < material.width) {\n        return vec4(material.stripColor, 1);\n    }\n    else {\n        return vec4(material.bgColor, 1);\n    }\n}"

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

/***/ 1685:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = vec4(coords, 0);\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}"

/***/ }),

/***/ 7591:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct Camera {\n    float fov;                              \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float safetyDist;                                                                               \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n};"

/***/ }),

/***/ 4651:
/***/ ((module) => {

module.exports = "   \n                                                                                                 \n                                                                                        \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = vec4(coords, 0);\n                                \n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}\n\n   \n                                                                                             \n                                                               \n   \nRelVector mappingFromFlatScreen(vec2 coords) {\n                                                         \n    vec2 jitter = vec2(randomFloat(), randomFloat()) - 0.5;\n\n                                                                            \n    vec2 planeCoords = (coords - 0.5 * resolution + jitter) / (0.5 * resolution.y);\n\n                              \n    float z = - 1. / tan(radians(0.5 * camera.fov));\n\n                                                      \n    vec4 dir = vec4(planeCoords, z, 0);\n\n                                \n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    RelVector res = applyPosition(camera.position, v);\n    return geomNormalize(res);\n}"

/***/ }),

/***/ 766:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                      \n                                                                                               \n                                                                                                                        \nstruct PathTracerCamera {\n    float fov;                     \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float safetyDist;                                                                               \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n    float focalLength;                    \n    float aperture;                \n};"

/***/ }),

/***/ 5074:
/***/ ((module) => {

module.exports = "   \n                                                     \n                                                               \n   \nRelVector mapping(vec3 coords){\n    vec4 dir = normalize(vec4(coords, 0));\n    dir = normalize(dir);\n    Vector v = createVector(ORIGIN, dir.xyz);\n    return applyPosition(camera.position, v);\n}"

/***/ }),

/***/ 6539:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n          \n                                                                                               \n                                                                                                                        \nstruct VRCamera {\n    float fov;                     \n    float minDist;                                     \n    float maxDist;                                     \n    int maxSteps;                                                       \n    float safetyDist;                                                                               \n    float threshold;                                          \n    RelPosition position;                                                                            \n    mat4 matrix;                                                 \n};"

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

module.exports = "   \n                          \n   \nvarying vec3 spherePosition;\n\n   \n                                           \n                       \n                                                           \n                                 \n                                                         \n   \nvoid main() {\n    RelVector vector = mapping(spherePosition);\n    ExtVector v = ExtVector(vector, initVectorData());\n    gl_FragColor = postProcess(getColor(v));\n}"

/***/ }),

/***/ 6983:
/***/ ((module) => {

module.exports = "vec3 LessThan(vec3 f, float value)\n{\n    return vec3(\n        (f.x < value) ? 1.0f : 0.0f,\n        (f.y < value) ? 1.0f : 0.0f,\n        (f.z < value) ? 1.0f : 0.0f);\n}\n\n                  \nvec3 LinearToSRGB(vec3 rgb)\n{\n    rgb = clamp(rgb, 0.0f, 1.0f);\n\n    return mix(\n        pow(rgb, vec3(1.0f / 2.4f)) * 1.055f - 0.055f,\n        rgb * 12.92f,\n        LessThan(rgb, 0.0031308f)\n    );\n}\n              \nvec3 ACESFilm(vec3 x)\n{\n    float a = 2.51f;\n    float b = 0.03f;\n    float c = 2.43f;\n    float d = 0.59f;\n    float e = 0.14f;\n    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);\n}\n\nvec4 postProcess(vec4 pixelColor) {\n\n                      \n    pixelColor.xyz *= exposure;\n\n                   \n    pixelColor.xyz = ACESFilm(pixelColor.xyz);\n    pixelColor.xyz = LinearToSRGB(pixelColor.xyz);\n\n    return pixelColor;\n}"

/***/ }),

/***/ 6159:
/***/ ((module) => {

module.exports = "vec4 postProcess(vec4 color) {\n    return color;\n}"

/***/ }),

/***/ 2977:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n              \n  \n                                                                                                                        \n                                                                                                                        \n\n\n   \n                \n                                                      \n                                         \n                                                                                       \n                                                      \n                                                                    \n          \n                                \n                               \n                          \n                                                                                               \n                                                               \n                                                                                                                 \n                                                                                         \n   \nint raymarch(inout ExtVector v, out int objId){\n    initFlow(v.vector.local);                                                                 \n    ExtVector globalV0 = v;\n    ExtVector globalV = globalV0;\n    ExtVector localV0 = v;\n    ExtVector localV = localV0;\n    ExtVector res = v;\n    int auxId;\n    int auxHit;\n    float marchingStep = camera.minDist;\n    float dist;\n    int hit = HIT_NOTHING;\n\n\n                  \n    for (int i = 0; i < camera.maxSteps; i++){\n                          \n        localV.data.iMarch = v.data.iMarch + i;\n\n                                                     \n        localV = teleport(localV);\n        if (localV.data.isTeleported){\n                                                                                           \n            localV0 = localV;\n                                                                                      \n            marchingStep = camera.minDist;\n        }\n        else {\n                                                    \n            if (localV.data.totalDist > camera.maxDist) {\n                break;\n            }\n            dist = localSceneSDF(localV.vector, auxHit, auxId);\n            if (auxHit == HIT_DEBUG){\n                hit = HIT_DEBUG;\n                break;\n            }\n            if (auxHit == HIT_SOLID) {\n                                   \n                hit = HIT_SOLID;\n                objId = auxId;\n                v = localV;\n                break;\n            }\n            marchingStep = marchingStep + creepingDist(localV, dist, camera.threshold);\n            localV = flow(localV0, marchingStep);\n        }\n    }\n    if (hit == HIT_NOTHING) {\n        v = localV;\n    }\n\n                  \n    marchingStep = camera.minDist;\n    for (int i=0; i < camera.maxSteps; i++){\n                          \n        globalV.data.iMarch = v.data.iMarch + i;\n\n        if (globalV.data.totalDist > localV.data.totalDist || globalV.data.totalDist > camera.maxDist){\n                                              \n            break;\n        }\n        dist = globalSceneSDF(globalV.vector, auxHit, auxId);\n\n        if (auxHit == HIT_DEBUG){\n            hit = HIT_DEBUG;\n            break;\n        }\n        if (auxHit == HIT_SOLID) {\n                               \n            hit = auxHit;\n            objId = auxId;\n            v = globalV;\n            break;\n        }\n        marchingStep = marchingStep + dist;\n        globalV = flow(globalV0, marchingStep);\n    }\n\n    if (hit == HIT_NOTHING) {\n        v = globalV;\n    }\n    return hit;\n}\n\nvec4 getColor(ExtVector v){\n    int objId;\n    int hit;\n    v = flow(v, camera.safetyDist);\n    for (int i = 0; i <= maxBounces; i++){\n        if (v.data.stop){\n            break;\n        }\n        hit = raymarch(v, objId);\n        updateVectorData(v, hit, objId);\n    }\n    return v.data.pixel;\n}"

/***/ }),

/***/ 9461:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                              \n  \n                                                                                                                        \n                                                                                                                        \n\nstruct VectorData {\n    float lastFlowDist;                                                                    \n    float lastBounceDist;                                                           \n    float totalDist;                                                  \n    bool isTeleported;                                             \n    int iMarch;                                                        \n    int iBounce;                                             \n    bool stop;                              \n    vec4 pixel;                                                                   \n    vec4 leftToComputeColor;                                                                      \n};"

/***/ }),

/***/ 1767:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                             \n  \n                                                                                                                        \n                                                                                                                        \n\n   \n              \n   \nconst float PI = 3.1415926538;\n\n   \n                      \n   \nvec4 debugColor = vec4(0.5, 0, 0.8, 1);\n\n   \n                                    \n         \n   \nconst int HIT_NOTHING = 0;\n   \n                                    \n         \n   \nconst int HIT_SOLID = 1;\n   \n                                  \n         \n   \nconst int HIT_DEBUG = -1;\n"

/***/ }),

/***/ 2639:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                \n  \n                                                                                                                        \n                                                                                                                        \n\nvarying vec3 spherePosition;\n\n   \n                                      \n                                                                    \n                                                                               \n                                                 \n  \n                                                                \n                                                        \n                                                  \n                                                                                     \n   \nvoid main()\n{\n    spherePosition = position;\n                                                       \n    mat4 rot = modelViewMatrix;\n    rot[3] = vec4(0, 0, 0, 1);\n\n    vec4 aux = rot * vec4(position, 1.0);\n    spherePosition = aux.xyz;\n    gl_Position = projectionMatrix * rot * aux;\n}"

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

/***/ 7499:
/***/ ((module) => {

module.exports = "                                                                                                                        \n  \n           \n                               \n  \n                                                                                                                        \n \n struct Solid {\n    bool isRendered;\n };\n"

/***/ }),

/***/ 5350:
/***/ ((module) => {

module.exports = "                                                                                                                        \n        \n                                                        \n                                                   \n                                                                               \n                                                                                                                        \n\n\n\n                                                                                                                        \n  \n                   \n                                            \n  \n                                                                                                                        \nstruct Isometry{\n    mat4 matrix;\n};\n\n   \n                    \n   \nconst Isometry IDENTITY = Isometry(mat4(1.));                          \n\n   \n                                                              \n   \nIsometry reduceError(Isometry isom){\n    return isom;\n}\n\n   \n                                     \n   \nIsometry multiply(Isometry isom1, Isometry isom2) {\n    return Isometry(isom1.matrix * isom2.matrix);\n}\n\n   \n                                            \n   \nIsometry geomInverse(Isometry isom) {\n    return Isometry(inverse(isom.matrix));\n}\n\n                                                                                                                        \n  \n                \n                                        \n  \n                                                                                                                        \nstruct Point{\n    vec4 coords;\n};\n\n\nconst Point ORIGIN = Point(vec4(0, 0, 0, 1));                               \n\n   \n                                                           \n   \nPoint reduceError(Point p){\n    return Point(normalize(p.coords));\n}\n\n   \n                                       \n   \nPoint applyIsometry(Isometry isom, Point p) {\n    vec4 coords = isom.matrix * p.coords;\n    Point res = Point(coords);\n    return reduceError(res);\n}\n\n   \n                                                                     \n                                  \n   \n\nIsometry makeTranslation(Point p) {\n    mat4 matrix = mat4(1.);\n    vec3 u = p.coords.xyz;\n    float c1 = length(u);\n    if (c1 == 0.) {\n        return Isometry(matrix);\n    }\n\n    float c2 = 1. - p.coords.w;\n    u = normalize(u);\n    mat4 m = mat4(\n    0, 0, 0, -u.x,\n    0, 0, 0, -u.y,\n    0, 0, 0, -u.z,\n    u.x, u.y, u.z, 0\n    );\n    matrix = matrix + c1 * m + c2 * m * m;\n    return Isometry(matrix);\n}\n\n   \n                                                                     \n                                     \n   \nIsometry makeInvTranslation(Point p) {\n    Isometry isom = makeTranslation(p);\n    return geomInverse(isom);\n}\n\n                                                                                                                        \n  \n                 \n                                                              \n                                                                                                  \n  \n                                                                                                                        \nstruct Vector{\n    Point pos;                         \n    vec4 dir;                                \n};\n\n   \n                                \n   \nVector zeroVector(Point pos){\n    return Vector(pos, vec4(0));\n}\n\n   \n                                                            \n   \nVector reduceError(Vector v){\n    return Vector(reduceError(v.pos), v.dir);\n}\n\n   \n                         \n                            \n   \nVector add(Vector v1, Vector v2){\n    return Vector(v1.pos, v1.dir + v2.dir);\n}\n\n   \n                              \n                            \n   \nVector sub(Vector v1, Vector v2){\n    return Vector(v1.pos, v1.dir - v2.dir);\n}\n\n   \n                                   \n                         \n                      \n   \nVector multiplyScalar(float s, Vector v){\n    return Vector(v.pos, s * v.dir);\n}\n\n   \n                                                                                 \n                     \n   \nfloat geomDot(Vector v1, Vector v2) {\n    return dot(v1.dir, v2.dir);\n}\n\n   \n                                        \n   \nVector applyIsometry(Isometry isom, Vector v) {\n    Point p = applyIsometry(isom, v.pos);\n    return Vector(p, isom.matrix * v.dir);\n}\n\n\n   \n                                                                       \n                                                                                                           \n                                           \n   \nVector applyFacing(mat4 m, Vector v) {\n    return Vector(v.pos, m * v.dir);\n}\n\nvoid initFlow(Vector v){\n}"

/***/ }),

/***/ 7772:
/***/ ((module) => {

module.exports = "   \n                               \n                                                                       \n                                     \n                                                      \n   \nvoid frame(Point p, out Vector[3] f){\n    vec4 dir0 = vec4(p.coords.w, 0, 0, -p.coords.x);\n    vec4 dir1 = vec4(0, p.coords.w, 0, -p.coords.y);\n    vec4 dir2 = vec4(0, 0, p.coords.w, -p.coords.z);\n    dir0 = normalize(dir0);\n    dir1 = normalize(dir1);\n    dir2 = normalize(dir2);\n    f[0] = Vector(p, dir0);\n    f[1] = Vector(p, dir1);\n    f[2] = Vector(p, dir2);\n}\n\n   \n                                           \n                                                                       \n                                                                      \n                                     \n                                                      \n   \nvoid orthoFrame(Point p, out Vector[3] f){\n    float x = p.coords.x;\n    float y = p.coords.y;\n    float z = p.coords.z;\n    float w = p.coords.w;\n\n    float den = 1. + w;\n    vec4 dir0 = (1. / den) * vec4(-x * x + w + 1., -x * y, -x * z, -x * den);\n    vec4 dir1 = (1. / den) * vec4(-x * y, -y * y + w + 1., -y * z, -y * den);\n    vec4 dir2 = (1. / den) * vec4(-x * z, -y * z, -z * z + w + 1., -z * den);\n\n    f[0] = Vector(p, dir0);\n    f[1] = Vector(p, dir1);\n    f[2] = Vector(p, dir2);\n}\n\n\n   \n                                                                                         \n                              \n                                                                                              \n   \nPoint smallShift(Point p, vec3 dp){\n    Vector[3] f;\n    frame(p, f);\n    vec4 coords = p.coords + dp[0] * f[0].dir + dp[1] * f[1].dir + dp[2] * f[2].dir;\n    Point res = Point(coords);\n    return reduceError(res);\n}\n\n\nVector smallShift(Vector v, vec3 dp){\n    Point pos = smallShift(v.pos, dp);\n    return Vector(pos, v.dir);\n}\n\n\n   \n                                  \n                                                 \n   \nVector flow(Vector v, float t){\n    vec4 coords = cos(t) * v.pos.coords + sin(t) * v.dir;\n    Point pos = Point(coords);\n    vec4 dir = -sin(t) * v.pos.coords + cos(t) * v.dir;\n    Vector res = Vector(pos, dir);\n    return reduceError(res);\n}\n"

/***/ }),

/***/ 4905:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                     \n  \n                                                                                                                        \n                                                                                                                        \n\n                                                                                                                        \n          \n                           \n                                                                                                                        \n\nstruct GroupElement {\n    ivec4 icoords;                                           \n};\n\nconst GroupElement GROUP_IDENTITY = GroupElement(ivec4(0, 0, 0, 1));\n\nGroupElement multiply(GroupElement elt1, GroupElement elt2){\n    ivec4 c1 = elt1.icoords;\n    ivec4 c2 = elt2.icoords;\n    ivec4 c = ivec4(\n    c1.x * c2.w + c1.w * c2.x + c1.y * c2.z - c1.z * c2.y,\n    c1.y * c2.w + c1.w * c2.y + c1.z * c2.x - c1.x * c2.z,\n    c1.z * c2.w + c1.w * c2.z + c1.x * c2.y - c1.y * c2.x,\n    c1.w * c2.w - c1.x * c2.x - c1.y * c2.y - c1.z * c2.z\n    );\n    return GroupElement(c);\n}\n\n                                              \n                                                                                                \n   \n\nIsometry toIsometry(GroupElement elt) {\n    vec4 c = vec4(elt.icoords);\n    mat4 matrix =  mat4(\n    c.w, c.z, c.y, c.x,\n    -c.z, c.w, -c.x, c.y,\n    -c.y, c.x, c.w, -c.z,\n    -c.x, -c.y, c.z, c.w\n    );\n    return Isometry(matrix);\n}"

/***/ }),

/***/ 217:
/***/ ((module) => {

module.exports = "   \n                        \n   \nVector direction(Point p, Point q) {\n    float c = dot(p.coords, q.coords);\n    vec4 dir = q.coords - c * p.coords;\n    return geomNormalize(Vector(p, dir));\n}"

/***/ }),

/***/ 3830:
/***/ ((module) => {

module.exports = "   \n                              \n   \nfloat dist(Point p1, Point p2){\n    return abs(acos(dot(p1.coords, p2.coords)));\n}"

/***/ }),

/***/ 1156:
/***/ ((module) => {

module.exports = "   \n                                                                                    \n                                                   \n                                         \n                                 \n   \nfloat lightIntensity(float len){\n    return 1./(len);\n}"

/***/ }),

/***/ 7520:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \nstruct ConstDirLight {\n    int id;\n    vec3 color;\n    float intensity;\n    vec4 direction;\n    int maxDirs;\n};\n\nbool directions(ConstDirLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i != 0){\n        return false;\n    }\n    intensity = light.intensity;\n    Vector local = Vector(v.local.pos, light.direction);\n    dir = RelVector(local, v.cellBoost, v.invCellBoost);\n    return true;\n}\n"

/***/ }),

/***/ 9182:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \n\nstruct LocalPointLight {\n    int id;\n    Point position;\n    vec3 color;\n    float intensity;\n    int maxDirs;\n};\n\n                                                                                                                        \n          \n                                                  \n                                              \n                                                                                                                \n                                                                                                                        \n\nstruct PointLightComputations{\n    RelVector dir;\n    float dist;\n};\n\nPointLightComputations pointLightComputations;\n\nbool directions(LocalPointLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i>1){\n        return false;\n    }\n    if (i==0){\n                                                                         \n        float dist = dist(v.local.pos, light.position);\n        intensity = lightIntensity(dist) * light.intensity;\n        Vector local = direction(v.local.pos, light.position);\n        dir = RelVector(local, v.cellBoost, v.invCellBoost);\n        pointLightComputations = PointLightComputations(dir, dist);\n    }\n    if (i==1){\n        intensity = lightIntensity(2. * PI - pointLightComputations.dist);\n        dir = negate(pointLightComputations.dir);\n    }\n    return true;\n}"

/***/ }),

/***/ 3483:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                        \n                                                                                                                        \n\nstruct PointLight {\n    int id;\n    Point position;\n    vec3 color;\n    float intensity;\n    int maxDirs;\n};\n\n                                                                                                                        \n          \n                                                  \n                                              \n                                                                                                                \n                                                                                                                        \n\nstruct PointLightComputations{\n    RelVector dir;\n    float dist;\n};\n\nPointLightComputations pointLightComputations;\n\nbool directions(PointLight light, RelVector v, int i, out RelVector dir, out float intensity) {\n    if (i>1){\n        return false;\n    }\n    if (i==0){\n        Point position = applyIsometry(v.invCellBoost, light.position);\n        float dist = dist(v.local.pos, position);\n        intensity = lightIntensity(dist) * light.intensity;\n        Vector local = direction(v.local.pos, position);\n        dir = RelVector(local, v.cellBoost, v.invCellBoost);\n        pointLightComputations = PointLightComputations(dir, dist);\n    }\n    if (i==1){\n        intensity = lightIntensity(2. * PI - pointLightComputations.dist);\n        dir = negate(pointLightComputations.dir);\n    }\n    return true;\n}"

/***/ }),

/***/ 3889:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                       \n                                                                                                                        \n\nstruct MultiColorMaterial {\n    vec3 mainColor;\n    vec3 accent1;\n    vec3 accent2;\n    vec3 accent3;\n    bool grid;\n};\n\nvec4 render(MultiColorMaterial material, ExtVector v) {\n\n    vec3 dir = normalize(v.vector.local.pos.coords.xyz);\n    float height = acos(v.vector.local.pos.coords.w);\n\n    float cosphi = dir.z;\n    float sinphi = length(dir.xy);\n    float phi = atan(sinphi,cosphi);\n    float theta = atan(dir.y,dir.x);\n\n    vec3 color = material.mainColor;\n    color += material.accent1 * dir.x;\n    color += material.accent2 * dir.y;\n    color += material.accent3 * dir.z;\n\n    if(material.grid){\n        float test = sin(70.*phi)*sin(70.*theta)*sin(70.*height);\n        float sgn = sign(test);\n        if (sgn<0.){\n            color *=0.9;\n        }\n    }\n\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 4193:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                         \n                                                                                                                        \n\nstruct VaryingColorMaterial {\n    vec3 mainColor;\n    vec3 weight;\n};\n\nvec4 render(VaryingColorMaterial material, ExtVector v) {\n    vec3 color = material.mainColor + material.weight * v.vector.local.pos.coords.xyz;\n    return vec4(color, 1);\n}"

/***/ }),

/***/ 2473:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                            \n                                                                                                                        \n\nstruct BallShape {\n    int id;\n    Point center;\n    float radius;\n    Isometry absoluteIsomInv;\n};\n\nfloat sdf(BallShape ball, RelVector v) {\n    Point center = applyGroupElement(v.invCellBoost, ball.center);\n    center = reduceError(center);\n    return dist(v.local.pos, center) - ball.radius;\n}\n\nRelVector gradient(BallShape ball, RelVector v){\n    Point center = applyGroupElement(v.invCellBoost, ball.center);\n    Vector local = direction(v.local.pos, center);\n    return RelVector(negate(local), v.cellBoost, v.invCellBoost);\n}\n\nvec2 uvMap(BallShape ball, RelVector v){\n    Point pos = applyGroupElement(v.cellBoost, v.local.pos);\n    Vector direction = direction(ball.center, pos);\n    direction = applyIsometry(ball.absoluteIsomInv, direction);\n    vec4 dir = normalize(direction.dir);\n    float sinPhi = length(dir.xy);\n    float cosPhi = dir.z;\n    float uCoord = atan(dir.y, dir.x);\n    float vCoord = atan(sinPhi, cosPhi);\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 9527:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                                            \n                                                                                                                        \n\nstruct CircleShape {\n    int id;\n    float radius;\n    vec4 c;\n    Isometry absoluteIsomInv;\n    Isometry absoluteIsom;\n};\n\n   \n                           \n   \nfloat sdf(CircleShape circle, RelVector v) {\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(circle.absoluteIsomInv, point);\n    vec4 p = point.coords;\n    float aux = circle.c.x * length(p.xy) + dot(circle.c.zw, p.zw);\n    return acos(aux) - circle.radius;\n}\n\n   \n                 \n   \nRelVector gradient(CircleShape circle, RelVector v){\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(circle.absoluteIsomInv, point);\n    vec4 p = point.coords;\n    float lenXY = length(p.xy);\n    vec4 aux = vec4(circle.c.x * p. x / lenXY, circle.c.y * p.y / lenXY, circle.c.z, circle.c.w);\n    vec4 dir = aux - dot(aux, p) * p;\n    Vector local = Vector(point, dir);\n    local = applyIsometry(circle.absoluteIsom, local);\n    local = applyGroupElement(v.invCellBoost, local);\n    local = geomNormalize(local);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\n   \n                 \n                                                                        \n   \nvec2 uvMap(CircleShape circle, RelVector v){\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(circle.absoluteIsomInv, point);\n    vec4 p = point.coords;\n    float lenXY = length(p.xy);\n    vec4 proj = vec4(circle.c.x * p.x / lenXY, circle.c.y * p.y / lenXY, circle.c.z, circle.c.w);\n    float uCoord = atan(proj.y, proj.x);\n    vec4 dir2p = p - proj - dot(p-proj, proj) * proj;\n    dir2p = normalize(dir2p);\n    float vCoord = atan(dir2p.w, dir2p.z);\n\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 8166:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                            \n                                                                                                                        \n\nstruct CliffordTorusShape {\n    int id;\n    Isometry absoluteIsomInv;\n    Isometry absoluteIsom;\n};\n\n   \n                    \n   \nfloat sdf(CliffordTorusShape torus, RelVector v) {\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(torus.absoluteIsomInv, point);\n    vec4 p = point.coords;\n    float aux = length(p.xy) + length(p.zw);\n    float sign = sign(p.z * p.z + p.w * p.w - 0.5);\n    return sign * acos(aux / sqrt(2.));\n}\n\n   \n                 \n   \nRelVector gradient(CliffordTorusShape torus, RelVector v){\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(torus.absoluteIsomInv, point);\n    vec4 p = point.coords;\n    float lenXY = length(p.xy);\n    float lenZW = length(p.zw);\n    vec4 aux = vec4(p.xy / lenXY, p.zw / lenZW) / sqrt(2.);\n    vec4 dir = aux - dot(aux, p) * p;\n    Vector local = Vector(point, dir);\n    local = applyIsometry(torus.absoluteIsom, local);\n    local = applyGroupElement(v.invCellBoost, local);\n    local = geomNormalize(local);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\n   \n                 \n   \nvec2 uvMap(CliffordTorusShape torus, RelVector v){\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(torus.absoluteIsomInv, point);\n    vec4 p = point.coords;\n    float uCoord = atan(p.y, p.x);\n    float vCoord = atan(p.w, p.z);\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 9474:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                                            \n                                                                                                                        \n\nstruct CylinderShape {\n    int id;\n    Vector direction;\n    float radius;\n    vec4 uvTestX;\n    vec4 uvTestY;\n};\n\n   \n                           \n   \nfloat sdf(CylinderShape cyl, RelVector v) {\n    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);\n    float aux1 = dot(v.local.pos.coords, dir.pos.coords);\n    float aux2 = dot(v.local.pos.coords, dir.dir);\n    return abs(acos(sqrt(aux1 * aux1 + aux2 * aux2))) - cyl.radius;\n}\n\n   \n                                              \n   \nRelVector gradient(CylinderShape cyl, RelVector v){\n    vec4 m = v.local.pos.coords;\n    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);\n    float aux1 = dot(m, dir.pos.coords);\n    float aux2 = dot(m, dir.dir);\n    float den = sqrt(aux1 * aux1 + aux2 * aux2);\n    vec4 coords = (aux1/den) * dir.pos.coords + (aux2/den) * dir.dir;\n    Point proj = Point(coords);\n    Vector local = direction(v.local.pos, proj);\n    local = negate(local);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\nvec2 uvMap(CylinderShape cyl, RelVector v){\n    vec4 m = v.local.pos.coords;\n    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);\n    float aux1 = dot(m, dir.pos.coords);\n    float aux2 = dot(m, dir.dir);\n    vec4 proj = aux1 * dir.pos.coords + aux2 * dir.dir;\n    float uCoord = acos(dot(normalize(proj), dir.pos.coords));\n\n                                                                                                                       \n    vec4 aux = m - proj + length(proj) * dir.pos.coords;\n    float vCoord = atan(dot(aux, cyl.uvTestY), dot(aux, cyl.uvTestX));\n\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 9521:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                            \n                                                                                                                        \n\nstruct HalfSpaceShape {\n    int id;\n    Vector normal;\n    Isometry absoluteIsomInv;\n};\n\n   \n                                                 \n   \nfloat sdf(HalfSpaceShape halfspace, RelVector v) {\n    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);\n    float aux = dot(v.local.pos.coords, normal.dir);\n    return asin(aux);\n}\n\n   \n                                              \n   \nRelVector gradient(HalfSpaceShape halfspace, RelVector v){\n    Vector normal = applyGroupElement(v.invCellBoost, halfspace.normal);\n    Vector local = Vector(v.local.pos, normal.dir);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\nvec2 uvMap(HalfSpaceShape halfspace, RelVector v){\n    Point point = applyGroupElement(v.cellBoost, v.local.pos);\n    point = applyIsometry(halfspace.absoluteIsomInv, point);\n    vec3 aux = normalize(point.coords.xyw);\n    float sinPhi = length(aux.xy);\n    float cosPhi = aux.z;\n    float uCoord = atan(aux.y, aux.x);\n    float vCoord = atan(sinPhi, cosPhi);\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 9937:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                            \n                                                                                                                        \n\nstruct LocalBallShape {\n    int id;\n    Point center;\n    float radius;\n    Isometry absoluteIsomInv;\n};\n\n   \n                                                 \n   \nfloat sdf(LocalBallShape ball, RelVector v) {\n    return dist(v.local.pos, ball.center) - ball.radius;\n}\n\n   \n                                              \n   \nRelVector gradient(LocalBallShape ball, RelVector v){\n    Vector local = direction(v.local.pos, ball.center);\n    return RelVector(negate(local), v.cellBoost, v.invCellBoost);\n}\n\nvec2 uvMap(LocalBallShape ball, RelVector v){\n    Point pos = v.local.pos;\n    Vector direction = direction(ball.center, pos);\n    direction = applyIsometry(ball.absoluteIsomInv, direction);\n    vec4 dir = normalize(direction.dir);\n    float sinPhi = length(dir.xy);\n    float cosPhi = dir.z;\n    float uCoord = atan(dir.y, dir.x);\n    float vCoord = atan(sinPhi, cosPhi);\n    return vec2(uCoord, vCoord);\n}\n\n"

/***/ }),

/***/ 9807:
/***/ ((module) => {

module.exports = "                                                                                                                        \n          \n                                            \n                                                                                                                        \n\nstruct LocalCylinderShape {\n    int id;\n    Vector direction;\n    float radius;\n    vec4 uvTestX;\n    vec4 uvTestY;\n};\n\n   \n                           \n   \nfloat sdf(LocalCylinderShape cyl, RelVector v) {\n    float aux1 = dot(v.local.pos.coords, cyl.direction.pos.coords);\n    float aux2 = dot(v.local.pos.coords, cyl.direction.dir);\n    return abs(acos(sqrt(aux1 * aux1 + aux2 * aux2))) - cyl.radius;\n}\n\n\n   \n                                              \n   \nRelVector gradient(LocalCylinderShape cyl, RelVector v){\n    vec4 m = v.local.pos.coords;\n    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);\n    float aux1 = dot(m, dir.pos.coords);\n    float aux2 = dot(m, dir.dir);\n    float den = sqrt(aux1 * aux1 + aux2 * aux2);\n    vec4 coords = (aux1/den) * dir.pos.coords + (aux2/den) * dir.dir;\n    Point proj = Point(coords);\n    Vector local = direction(v.local.pos, proj);\n    local = negate(local);\n    return RelVector(local, v.cellBoost, v.invCellBoost);\n}\n\nvec2 uvMap(LocalCylinderShape cyl, RelVector v){\n    vec4 m = v.local.pos.coords;\n    Vector dir = applyGroupElement(v.invCellBoost, cyl.direction);\n    float aux1 = dot(m, dir.pos.coords);\n    float aux2 = dot(m, dir.dir);\n    vec4 proj = aux1 * dir.pos.coords + aux2 * dir.dir;\n    float uCoord = acos(dot(normalize(proj), dir.pos.coords));\n\n                                                                                                                       \n    vec4 aux = m - proj + length(proj) * dir.pos.coords;\n    float vCoord = atan(dot(aux, cyl.uvTestY), dot(aux, cyl.uvTestX));\n\n    return vec2(uCoord, vCoord);\n}\n"

/***/ }),

/***/ 5688:
/***/ ((module) => {

module.exports = "                                                                                                                        \n                                                                                                                        \n  \n                                                            \n  \n                                                                                                                        \n                                                                                                                        \n\n\n"

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
  "T0": () => (/* reexport */ AcesFilmPostProcess),
  "FJ": () => (/* reexport */ AdvancedResetVRControls),
  "GU": () => (/* reexport */ AdvancedShape),
  "XH": () => (/* reexport */ BOTH),
  "ec": () => (/* reexport */ Ball),
  "Yb": () => (/* reexport */ BallShape),
  "QU": () => (/* reexport */ BasicCamera),
  "ZH": () => (/* reexport */ BasicPTMaterial),
  "K9": () => (/* binding */ thurstonSph_BasicRenderer),
  "FT": () => (/* reexport */ BasicShape),
  "cK": () => (/* reexport */ CREEPING_FULL),
  "_x": () => (/* reexport */ CREEPING_OFF),
  "kj": () => (/* reexport */ CREEPING_STRICT),
  "Vz": () => (/* reexport */ CheckerboardMaterial),
  "Cd": () => (/* reexport */ Circle),
  "n": () => (/* reexport */ CircleShape),
  "y7": () => (/* reexport */ CliffordTorus),
  "UQ": () => (/* reexport */ CliffordTorusShape),
  "ck": () => (/* reexport */ CombinedPostProcess),
  "Iy": () => (/* reexport */ ComplementShape),
  "Vf": () => (/* reexport */ ConstDirLight),
  "Ab": () => (/* reexport */ Cylinder),
  "g6": () => (/* reexport */ CylinderShape),
  "TB": () => (/* reexport */ DebugMaterial),
  "Al": () => (/* reexport */ DragVRControls),
  "ix": () => (/* reexport */ EquidistantHypStripsMaterial),
  "jZ": () => (/* reexport */ EquidistantSphStripsMaterial),
  "c$": () => (/* reexport */ ExpFog),
  "mD": () => (/* reexport */ FlyControls),
  "yb": () => (/* reexport */ Fog),
  "iJ": () => (/* reexport */ GraphPaperMaterial),
  "ZA": () => (/* reexport */ Group_Group),
  "Jz": () => (/* reexport */ GroupElement_GroupElement),
  "Fr": () => (/* reexport */ HalfSpace),
  "RM": () => (/* reexport */ HalfSpaceShape),
  "fR": () => (/* reexport */ HighlightLocalWrapMaterial),
  "kK": () => (/* reexport */ HighlightWrapMaterial),
  "ZX": () => (/* reexport */ HypStripsMaterial),
  "_f": () => (/* reexport */ ImprovedEquidistantHypStripsMaterial),
  "Ht": () => (/* reexport */ ImprovedEquidistantSphStripsMaterial),
  "HZ": () => (/* reexport */ InfoControls),
  "TN": () => (/* reexport */ IntersectionShape),
  "JV": () => (/* reexport */ Isometry),
  "Sc": () => (/* reexport */ IsotropicChaseVRControls),
  "Nh": () => (/* reexport */ KeyGenericControls),
  "RL": () => (/* reexport */ LEFT),
  "_k": () => (/* reexport */ Light),
  "uR": () => (/* reexport */ LightVRControls),
  "gU": () => (/* reexport */ LinearToSRGBPostProcess),
  "jo": () => (/* reexport */ LocalBall),
  "Q": () => (/* reexport */ LocalBallShape),
  "gq": () => (/* reexport */ LocalCylinder),
  "Gj": () => (/* reexport */ LocalCylinderShape),
  "L8": () => (/* reexport */ LocalPointLight),
  "F5": () => (/* reexport */ Material),
  "Uc": () => (/* reexport */ Matrix2),
  "Fh": () => (/* reexport */ MoveVRControls),
  "O5": () => (/* reexport */ MultiColorMaterial),
  "oB": () => (/* reexport */ NormalMaterial),
  "pJ": () => (/* reexport */ PTMaterial),
  "GW": () => (/* reexport */ PathTracerCamera),
  "DZ": () => (/* binding */ thurstonSph_PathTracerRenderer),
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
  "bY": () => (/* reexport */ RotatedSphericalTextureMaterial),
  "cV": () => (/* reexport */ SMOOTH_MAX_POLY),
  "lR": () => (/* reexport */ SMOOTH_MIN_POLY),
  "xs": () => (/* reexport */ Scene),
  "bn": () => (/* reexport */ Shape),
  "oC": () => (/* reexport */ ShootVRControls),
  "Z1": () => (/* reexport */ SimpleTextureMaterial),
  "h8": () => (/* reexport */ SingleColorMaterial),
  "Qf": () => (/* reexport */ Solid),
  "k1": () => (/* reexport */ SquaresMaterial),
  "ew": () => (/* reexport */ StripsMaterial),
  "$p": () => (/* reexport */ SwitchControls),
  "xG": () => (/* reexport */ TeleportationSet),
  "qC": () => (/* binding */ thurstonSph_Thurston),
  "N$": () => (/* binding */ thurstonSph_ThurstonLite),
  "TO": () => (/* binding */ thurstonSph_ThurstonVR),
  "g$": () => (/* binding */ thurstonSph_ThurstonVRWoodBalls),
  "u3": () => (/* binding */ thurstonSph_ThurstonVRWoodBallsBis),
  "l_": () => (/* reexport */ TransitionLocalWrapMaterial),
  "pk": () => (/* reexport */ TransitionWrapMaterial),
  "yI": () => (/* reexport */ UnionShape),
  "E6": () => (/* reexport */ VRCamera),
  "zO": () => (/* binding */ thurstonSph_VRRenderer),
  "cB": () => (/* reexport */ VaryingColorMaterial),
  "OW": () => (/* reexport */ Vector),
  "n3": () => (/* reexport */ VideoAlphaTextureMaterial),
  "Se": () => (/* reexport */ VideoFrameTextureMaterial),
  "PQ": () => (/* reexport */ VideoTextureMaterial),
  "$9": () => (/* reexport */ WrapShape),
  "iR": () => (/* reexport */ XRControllerModelFactory),
  "ak": () => (/* reexport */ utils_bind),
  "uZ": () => (/* reexport */ clamp),
  "Cy": () => (/* reexport */ complement),
  "qM": () => (/* reexport */ earthTexture),
  "mV": () => (/* reexport */ highlightLocalWrap),
  "Gi": () => (/* reexport */ highlightWrap),
  "jV": () => (/* reexport */ intersection),
  "j9": () => (/* reexport */ marsTexture),
  "oc": () => (/* reexport */ moonTexture),
  "wS": () => (/* reexport */ pathTracerWrap),
  "IJ": () => (/* reexport */ phongWrap),
  "Ij": () => (/* reexport */ poincare_set),
  "c0": () => (/* reexport */ quaternion_set),
  "p2": () => (/* reexport */ safeString),
  "w0": () => (/* reexport */ sunTexture),
  "VL": () => (/* reexport */ transitionLocalWrap),
  "UR": () => (/* reexport */ transitionWrap),
  "dV": () => (/* reexport */ set),
  "G0": () => (/* reexport */ union),
  "YL": () => (/* reexport */ woodBallMaterial),
  "re": () => (/* reexport */ wrap)
});

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
     * However, the drawback is that the class Position would need also to be extended,
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


;// CONCATENATED MODULE: external "three"
var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
const external_three_namespaceObject = x({ ["AnimationClip"]: () => __WEBPACK_EXTERNAL_MODULE_three__.AnimationClip, ["Bone"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Bone, ["Box3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Box3, ["BufferAttribute"]: () => __WEBPACK_EXTERNAL_MODULE_three__.BufferAttribute, ["BufferGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.BufferGeometry, ["ClampToEdgeWrapping"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ClampToEdgeWrapping, ["Clock"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Clock, ["Color"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Color, ["DirectionalLight"]: () => __WEBPACK_EXTERNAL_MODULE_three__.DirectionalLight, ["DoubleSide"]: () => __WEBPACK_EXTERNAL_MODULE_three__.DoubleSide, ["EventDispatcher"]: () => __WEBPACK_EXTERNAL_MODULE_three__.EventDispatcher, ["FileLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.FileLoader, ["Float32BufferAttribute"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Float32BufferAttribute, ["FloatType"]: () => __WEBPACK_EXTERNAL_MODULE_three__.FloatType, ["FrontSide"]: () => __WEBPACK_EXTERNAL_MODULE_three__.FrontSide, ["Group"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Group, ["ImageBitmapLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ImageBitmapLoader, ["ImageLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ImageLoader, ["InterleavedBuffer"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterleavedBuffer, ["InterleavedBufferAttribute"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterleavedBufferAttribute, ["Interpolant"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Interpolant, ["InterpolateDiscrete"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterpolateDiscrete, ["InterpolateLinear"]: () => __WEBPACK_EXTERNAL_MODULE_three__.InterpolateLinear, ["Line"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Line, ["LineBasicMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LineBasicMaterial, ["LineLoop"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LineLoop, ["LineSegments"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LineSegments, ["LinearFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LinearFilter, ["LinearMipmapLinearFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LinearMipmapLinearFilter, ["LinearMipmapNearestFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LinearMipmapNearestFilter, ["Loader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Loader, ["LoaderUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.LoaderUtils, ["Material"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Material, ["MathUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MathUtils, ["Matrix3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Matrix3, ["Matrix4"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Matrix4, ["Mesh"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Mesh, ["MeshBasicMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MeshBasicMaterial, ["MeshPhysicalMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MeshPhysicalMaterial, ["MeshStandardMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MeshStandardMaterial, ["MirroredRepeatWrapping"]: () => __WEBPACK_EXTERNAL_MODULE_three__.MirroredRepeatWrapping, ["NearestFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NearestFilter, ["NearestMipmapLinearFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NearestMipmapLinearFilter, ["NearestMipmapNearestFilter"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NearestMipmapNearestFilter, ["NumberKeyframeTrack"]: () => __WEBPACK_EXTERNAL_MODULE_three__.NumberKeyframeTrack, ["Object3D"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Object3D, ["OrthographicCamera"]: () => __WEBPACK_EXTERNAL_MODULE_three__.OrthographicCamera, ["PerspectiveCamera"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PerspectiveCamera, ["PointLight"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PointLight, ["Points"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Points, ["PointsMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PointsMaterial, ["PropertyBinding"]: () => __WEBPACK_EXTERNAL_MODULE_three__.PropertyBinding, ["Quaternion"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Quaternion, ["QuaternionKeyframeTrack"]: () => __WEBPACK_EXTERNAL_MODULE_three__.QuaternionKeyframeTrack, ["RGBAFormat"]: () => __WEBPACK_EXTERNAL_MODULE_three__.RGBAFormat, ["RepeatWrapping"]: () => __WEBPACK_EXTERNAL_MODULE_three__.RepeatWrapping, ["Scene"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Scene, ["ShaderMaterial"]: () => __WEBPACK_EXTERNAL_MODULE_three__.ShaderMaterial, ["Skeleton"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Skeleton, ["SkinnedMesh"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SkinnedMesh, ["Sphere"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Sphere, ["SphereGeometry"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SphereGeometry, ["SpotLight"]: () => __WEBPACK_EXTERNAL_MODULE_three__.SpotLight, ["TangentSpaceNormalMap"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TangentSpaceNormalMap, ["Texture"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Texture, ["TextureLoader"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TextureLoader, ["TriangleFanDrawMode"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TriangleFanDrawMode, ["TriangleStripDrawMode"]: () => __WEBPACK_EXTERNAL_MODULE_three__.TriangleStripDrawMode, ["Uniform"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Uniform, ["UniformsUtils"]: () => __WEBPACK_EXTERNAL_MODULE_three__.UniformsUtils, ["Vector2"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector2, ["Vector3"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector3, ["Vector4"]: () => __WEBPACK_EXTERNAL_MODULE_three__.Vector4, ["VectorKeyframeTrack"]: () => __WEBPACK_EXTERNAL_MODULE_three__.VectorKeyframeTrack, ["VideoTexture"]: () => __WEBPACK_EXTERNAL_MODULE_three__.VideoTexture, ["WebGLRenderTarget"]: () => __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderTarget, ["WebGLRenderer"]: () => __WEBPACK_EXTERNAL_MODULE_three__.WebGLRenderer, ["sRGBEncoding"]: () => __WEBPACK_EXTERNAL_MODULE_three__.sRGBEncoding });
;// CONCATENATED MODULE: ./src/geometries/sph/geometry/Isometry.js




Isometry.prototype.build = function () {
    this.matrix = new external_three_namespaceObject.Matrix4();
}

Isometry.prototype.identity = function () {
    this.matrix.identity();
}

Isometry.prototype.reduceError = function () {
    return this;
};

Isometry.prototype.multiply = function (isom) {
    this.matrix.multiply(isom.matrix);
    return this;
};

Isometry.prototype.premultiply = function (isom) {
    this.matrix.premultiply(isom.matrix);
    return this;
};

Isometry.prototype.invert = function () {
    this.matrix.invert();
    return this;
};

Isometry.prototype.makeTranslation = function (point) {
    this.matrix.identity();
    const [x, y, z, w] = point.coords.toArray();
    const u = new external_three_namespaceObject.Vector3(x, y, z);
    const c1 = u.length();

    if (c1 === 0) {
        return this;
    }

    const c2 = 1 - w;
    u.normalize();
    const m = new external_three_namespaceObject.Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        -u.x, -u.y, -u.z, 0
    );
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
    const c1 = Math.sin(t);
    const c2 = 1 - Math.cos(t);
    const m = new external_three_namespaceObject.Matrix4().set(
        0, 0, 0, u.x,
        0, 0, 0, u.y,
        0, 0, 0, u.z,
        -u.x, -u.y, -u.z, 0
    );
    const m2 = m.clone().multiply(m);
    m.multiplyScalar(c1);
    this.matrix.add(m);
    m2.multiplyScalar(c2);
    this.matrix.add(m2);

    return this;
};

/**
 * Update the current isometry with the one sending the vector e_z at the origin to the given vector at the given point
 * It is assumed that `vector` is a vector in the tangent space of the sphere at `point`
 * @param {Point} point - the image of the origin
 * @param {Vector4} vector - the image of e_z.
 * @returns {Isometry} - the current isometry
 */
Isometry.prototype.makeTranslationWithDir = function (point, vector) {
    const transInv = new Isometry().makeInvTranslation(point);
    const trans = new Isometry().makeTranslation(point);

    const aux = vector.clone().applyMatrix4(transInv.matrix);
    const vAtOrigin = new external_three_namespaceObject.Vector3(aux.x, aux.y, aux.z).normalize();
    const ez = new external_three_namespaceObject.Vector3(0, 0, 1);
    const q = new external_three_namespaceObject.Quaternion().setFromUnitVectors(ez, vAtOrigin);
    const rotMatrix = new external_three_namespaceObject.Matrix4().makeRotationFromQuaternion(q);
    this.matrix.copy(trans.matrix).multiply(rotMatrix);
    return this;
}

Isometry.prototype.equals = function (isom) {
    return this.matrix.equals(isom.matrix);
};

Isometry.prototype.clone = function () {
    let res = new Isometry();
    res.matrix.copy(this.matrix);
    return res;
};

Isometry.prototype.copy = function (isom) {
    this.matrix.copy(isom.matrix);
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



;// CONCATENATED MODULE: ./src/geometries/sph/geometry/Point.js




Point.prototype.build = function () {
    if (arguments.length === 0) {
        this.coords = new external_three_namespaceObject.Vector4(0, 0, 0, 1);
    } else {
        this.coords = new external_three_namespaceObject.Vector4(...arguments);
    }
    this.coords.normalize();
};

Point.prototype.reduceError = function () {
    this.coords.normalize();
    return this;
};

Point.prototype.applyIsometry = function (isom) {
    this.coords.applyMatrix4(isom.matrix);
    this.reduceError();
    return this;
};

Point.prototype.equals = function (point) {
    return this.coords.equals(point.coords)
};

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
     * Indeed, Three.js considers the `Vector3` as a 3D **point**
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
        return this;
    }
}



;// CONCATENATED MODULE: ./src/geometries/sph/geometry/Position.js


Position.prototype.flowFromOrigin = function (v) {
    this.boost.makeTranslationFromDir(v);
    this.quaternion.identity();
    return this;
}



// EXTERNAL MODULE: ./src/geometries/sph/geometry/shaders/part1.glsl
var part1 = __webpack_require__(5350);
var part1_default = /*#__PURE__*/__webpack_require__.n(part1);
// EXTERNAL MODULE: ./src/geometries/sph/geometry/shaders/part2.glsl
var part2 = __webpack_require__(7772);
var part2_default = /*#__PURE__*/__webpack_require__.n(part2);
;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/shaders/CopyShader.js
/**
 * Full-screen textured quad shader
 */

const CopyShader = {

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

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.a *= opacity;


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

			const size = renderer.getSize( new external_three_namespaceObject.Vector2() );
			this._pixelRatio = renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = new external_three_namespaceObject.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio );
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
         * @type {DollyCamera}
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
        // this.threeRenderer = new WebGLRenderer(threeRenderer);
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

        // /**
        //  * Number of time the light rays bounce
        //  * @type {number}
        //  */
        // this.maxBounces = params.maxBounces !== undefined ? params.maxBounces : 0;
        /**
         * Add post-processing to the final output
         * @type {PostProcess[]}
         */
        this.postProcess = params.postProcess !== undefined ? params.postProcess : [];

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
// EXTERNAL MODULE: ./src/core/renderers/shaders/basic/postProcessGammaCorrection.glsl
var postProcessGammaCorrection = __webpack_require__(6983);
var postProcessGammaCorrection_default = /*#__PURE__*/__webpack_require__.n(postProcessGammaCorrection);
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
     * @param {DollyCamera} camera - the camera
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

        this.postProcess = params.postProcess !== undefined ? params.postProcess : false;
        this.exposure = params.exposure !== undefined ? params.exposure : 1;
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
        Object.keys(this.globalUniforms).forEach(name => {
            const type = this.globalUniforms[name].type;
            const value = this.globalUniforms[name].value;
            this._fragmentBuilder.addUniform(name, type, value);
        });
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
        this._fragmentBuilder.addChunk(scenes_glsl_mustache_default()(this));
        this._fragmentBuilder.addChunk(vectorDataUpdate_glsl_mustache_default()(this));

        // ray-march and main
        this._fragmentBuilder.addChunk((raymarch_default()));
        if(this.postProcess){
            this._fragmentBuilder.addUniform("exposure", "float", this.exposure);
            this._fragmentBuilder.addChunk((postProcessGammaCorrection_default()));
        }
        else{
            this._fragmentBuilder.addChunk((postProcessVoid_default()));
        }
        this._fragmentBuilder.addChunk((main_default()));
    }

    /**
     * Build the Three.js scene with the non-euclidean shader.
     * @return {BasicRenderer}
     */
    build() {
        // The lag that may occur when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new external_three_namespaceObject.SphereGeometry(1000, 60, 40);
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

        for (let i = 0; i < this.postProcess.length; i++) {
            const effectPass = new ShaderPass(this.postProcess[i].fullShader());
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





















// import SteveShader from "../../postProcess/steve/shader.js";



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
     * @param {DollyCamera} camera - the camera
     * @param {Scene} scene - the scene
     * @param {Object} params - parameters for the Thurston part of the renderer
     * @param {WebGLRenderer|Object} threeRenderer - parameters for the underlying Three.js renderer
     */
    constructor(shader1, shader2, set, camera, scene, params = {}, threeRenderer = {}) {
        super(shader1, shader2, set, camera, scene, params, threeRenderer);
        // different default value for the number of time we bounce
        this.globalUniforms.maxBounces.value = params.maxBounces !== undefined ? params.maxBounces : 50;

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
        Object.keys(this.globalUniforms).forEach(name => {
            const type = this.globalUniforms[name].type;
            const value = this.globalUniforms[name].value;
            this._fragmentBuilder.addUniform(name, type, value);
        });

        const res = new external_three_namespaceObject.Vector2(this.accWriteTarget.width, this.accWriteTarget.height);
        this._fragmentBuilder.addUniform('resolution', 'vec2', res);

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
        const geometry = new external_three_namespaceObject.SphereGeometry(1000, 60, 40);
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
        for (let i = 0; i < this.postProcess.length; i++) {
            const effectPass = new ShaderPass(this.postProcess[i].fullShader());
            effectPass.clear = false;
            this.composer.addPass(effectPass);
        }

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
;// CONCATENATED MODULE: external "webxr-polyfill"
var external_webxr_polyfill_x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var external_webxr_polyfill_y = x => () => x
const external_webxr_polyfill_namespaceObject = external_webxr_polyfill_x({ ["default"]: () => __WEBPACK_EXTERNAL_MODULE_webxr_polyfill_b35c672b__["default"] });
;// CONCATENATED MODULE: ./node_modules/three/examples/jsm/webxr/VRButton.js
class VRButton_VRButton {

	static createButton( renderer ) {

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

					const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking', 'layers' ] };
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

		function showVRNotAllowed( exception ) {

			disableButton();

			console.warn( 'Exception when trying to call xr.isSessionSupported', exception );

			button.textContent = 'VR NOT ALLOWED';

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

				if ( supported && VRButton_VRButton.xrSessionIsGranted ) {

					button.click();

				}

			} ).catch( showVRNotAllowed );

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

	static xrSessionIsGranted = false;

	static registerSessionGrantedListener() {

		if ( 'xr' in navigator ) {

			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if ( /WebXRViewer\//i.test( navigator.userAgent ) ) return;

			navigator.xr.addEventListener( 'sessiongranted', () => {

				VRButton_VRButton.xrSessionIsGranted = true;

			} );

		}

	}

}

VRButton_VRButton.registerSessionGrantedListener();



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
function utils_bind(scope, fn) {
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

/**
 * ID for the both sides (in VR / Stereo)
 * @type {number}
 */
const BOTH = 2;
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
        new external_webxr_polyfill_namespaceObject["default"]();
        super(shader1, shader2, set, camera, scene, params, threeRenderer);

        this.threeRenderer.xr.enabled = true;
        this.threeRenderer.xr.setReferenceSpaceType('local');
        this.camera.threeCamera.layers.enable(1);

        const VRButton = VRButton_VRButton.createButton(this.threeRenderer);
        const _onClickVRButton = utils_bind(this.camera, this.camera.switchStereo);
        VRButton.addEventListener('click', _onClickVRButton, false);
        document.body.appendChild(VRButton);

        /**
         * Builder for the fragment shader.
         * The first one correspond to the left eye, the second one to the right eye
         * @type {ShaderBuilder[]}
         * @private
         */
        this._fragmentBuilder = [new ShaderBuilder(), new ShaderBuilder()];

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
            this._fragmentBuilder[side].addChunk((constants_default()));
            Object.keys(this.globalUniforms).forEach(name => {
                const type = this.globalUniforms[name].type;
                const value = this.globalUniforms[name].value;
                this._fragmentBuilder[side].addUniform(name, type, value);
            });

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
            if(this.postProcess){
                this._fragmentBuilder[side].addUniform("exposure", "float", this.exposure);
                this._fragmentBuilder[side].addChunk((postProcessGammaCorrection_default()));
            }
            else{
                this._fragmentBuilder[side].addChunk((postProcessVoid_default()));
            }
            this._fragmentBuilder[side].addChunk((main_default()));
        }
    }

    build() {
        // The lag that may occurs when we move the sphere to chase the camera can be the source of noisy movement.
        // We put a very large sphere around the user, to minimize this effect.
        const geometry = new external_three_namespaceObject.SphereGeometry(50, 60, 40);
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
        this.camera.chaseThreeCamera();
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
;// CONCATENATED MODULE: external "dat.gui"
var external_dat_gui_x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var external_dat_gui_y = x => () => x
const external_dat_gui_namespaceObject = external_dat_gui_x({ ["GUI"]: () => __WEBPACK_EXTERNAL_MODULE_dat_gui_4e1bbbdc__.GUI });
;// CONCATENATED MODULE: external "stats"
var external_stats_x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var external_stats_y = x => () => x
const external_stats_namespaceObject = external_stats_x({ ["default"]: () => __WEBPACK_EXTERNAL_MODULE_stats__["default"] });
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
 * The idea is to g should give a position in the fundamental domain of the (implicit) underlying lattice.
 * This will keep the coordinates of g in a bounded range.
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
        return this;
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
     * @param {DollyCamera} camera - the non-euclidean camera
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

        this._onKeyDown = utils_bind(this, this.onKeyDown);
        this._onKeyUp = utils_bind(this, this.onKeyUp);

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
 * The minimal GLSL struct should contain
 * - fov
 * - minDist
 * - maxDist
 * - maxSteps
 * - threshold
 * - position
 * - matrix
 * The GLSL code needs to contain (after the declaration) a function `mapping`.
 * The role of this function is to map a point on the horizon sphere
 * to the initial direction to follow during the ray-marching.
 */
class BasicCamera {

    /**
     * Constructor.
     * @param {Object} parameters - the parameters of the camera.
     * These parameters are
     * - {number} fov - the field of view
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
     * These parameters are
     * - {number} fov - the field of view
     * - {number} minDist - the minimal distance we ray-march
     * - {number} maxDist - the maximal distance we ray-march
     * - {number} maxSteps - the maximal number of steps during the ray-marching
     * - {number} threshold - the threshold to stop the ray-marching
     * - {number} safetyDist - in case an object is at the same place as the camera,
     *      we always initially march a distance safetyDist,
     *      no matter what the SDFs return
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

        // if needed, declare the uniform for this instance
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

        const _onPressP = utils_bind(this, this.onPressP);
        window.addEventListener('keydown', _onPressP);
        const _onClickGo = utils_bind(this, this.onClickGo);
        document.querySelector('#thurstonDialogBox input[type=submit]').addEventListener('click', _onClickGo);
        const _onClickDownload = utils_bind(this, this.onClickDownload);
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
        this._onWindowResize = utils_bind(this, this.onWindowResize);
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
        this.gui = new external_dat_gui_namespaceObject.GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://3-dimensional.space');
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
        this.stats = new external_stats_namespaceObject["default"]();
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
        const _animate = utils_bind(this, this.animate);
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
        const _onWindowResize = utils_bind(this, this.onWindowResize);
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
        this.gui = new external_dat_gui_namespaceObject.GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://3-dimensional.space');
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
        this.stats = new external_stats_namespaceObject["default"]();
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
        const _animate = utils_bind(this, this.animate);
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

			return new GLTFMaterialsSheenExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsTransmissionExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsVolumeExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsIorExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsEmissiveStrengthExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsSpecularExtension( parser );

		} );

		this.register( function ( parser ) {

			return new GLTFMaterialsIridescenceExtension( parser );

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

	parseAsync( data, path ) {

		const scope = this;

		return new Promise( function ( resolve, reject ) {

			scope.parse( data, path, resolve, reject );

		} );

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
	KHR_MATERIALS_IOR: 'KHR_materials_ior',
	KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
	KHR_MATERIALS_SHEEN: 'KHR_materials_sheen',
	KHR_MATERIALS_SPECULAR: 'KHR_materials_specular',
	KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
	KHR_MATERIALS_IRIDESCENCE: 'KHR_materials_iridescence',
	KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
	KHR_MATERIALS_VOLUME: 'KHR_materials_volume',
	KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
	KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
	KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
	KHR_MATERIALS_EMISSIVE_STRENGTH: 'KHR_materials_emissive_strength',
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

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture, external_three_namespaceObject.sRGBEncoding ) );

			}

		}

		return Promise.all( pending );

	}

}

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
class GLTFMaterialsEmissiveStrengthExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;

	}

	extendMaterialParams( materialIndex, materialParams ) {

		const parser = this.parser;
		const materialDef = parser.json.materials[ materialIndex ];

		if ( ! materialDef.extensions || ! materialDef.extensions[ this.name ] ) {

			return Promise.resolve();

		}

		const emissiveStrength = materialDef.extensions[ this.name ].emissiveStrength;

		if ( emissiveStrength !== undefined ) {

			materialParams.emissiveIntensity = emissiveStrength;

		}

		return Promise.resolve();

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

				materialParams.clearcoatNormalScale = new external_three_namespaceObject.Vector2( scale, scale );

			}

		}

		return Promise.all( pending );

	}

}

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
class GLTFMaterialsIridescenceExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;

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

		if ( extension.iridescenceFactor !== undefined ) {

			materialParams.iridescence = extension.iridescenceFactor;

		}

		if ( extension.iridescenceTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'iridescenceMap', extension.iridescenceTexture ) );

		}

		if ( extension.iridescenceIor !== undefined ) {

			materialParams.iridescenceIOR = extension.iridescenceIor;

		}

		if ( materialParams.iridescenceThicknessRange === undefined ) {

			materialParams.iridescenceThicknessRange = [ 100, 400 ];

		}

		if ( extension.iridescenceThicknessMinimum !== undefined ) {

			materialParams.iridescenceThicknessRange[ 0 ] = extension.iridescenceThicknessMinimum;

		}

		if ( extension.iridescenceThicknessMaximum !== undefined ) {

			materialParams.iridescenceThicknessRange[ 1 ] = extension.iridescenceThicknessMaximum;

		}

		if ( extension.iridescenceThicknessTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'iridescenceThicknessMap', extension.iridescenceThicknessTexture ) );

		}

		return Promise.all( pending );

	}

}

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
class GLTFMaterialsSheenExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;

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

		materialParams.sheenColor = new external_three_namespaceObject.Color( 0, 0, 0 );
		materialParams.sheenRoughness = 0;
		materialParams.sheen = 1;

		const extension = materialDef.extensions[ this.name ];

		if ( extension.sheenColorFactor !== undefined ) {

			materialParams.sheenColor.fromArray( extension.sheenColorFactor );

		}

		if ( extension.sheenRoughnessFactor !== undefined ) {

			materialParams.sheenRoughness = extension.sheenRoughnessFactor;

		}

		if ( extension.sheenColorTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'sheenColorMap', extension.sheenColorTexture, external_three_namespaceObject.sRGBEncoding ) );

		}

		if ( extension.sheenRoughnessTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'sheenRoughnessMap', extension.sheenRoughnessTexture ) );

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
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
class GLTFMaterialsVolumeExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;

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

		materialParams.thickness = extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0;

		if ( extension.thicknessTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'thicknessMap', extension.thicknessTexture ) );

		}

		materialParams.attenuationDistance = extension.attenuationDistance || Infinity;

		const colorArray = extension.attenuationColor || [ 1, 1, 1 ];
		materialParams.attenuationColor = new external_three_namespaceObject.Color( colorArray[ 0 ], colorArray[ 1 ], colorArray[ 2 ] );

		return Promise.all( pending );

	}

}

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
class GLTFMaterialsIorExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_IOR;

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

		const extension = materialDef.extensions[ this.name ];

		materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5;

		return Promise.resolve();

	}

}

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
class GLTFMaterialsSpecularExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;

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

		materialParams.specularIntensity = extension.specularFactor !== undefined ? extension.specularFactor : 1.0;

		if ( extension.specularTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'specularIntensityMap', extension.specularTexture ) );

		}

		const colorArray = extension.specularColorFactor || [ 1, 1, 1 ];
		materialParams.specularColor = new external_three_namespaceObject.Color( colorArray[ 0 ], colorArray[ 1 ], colorArray[ 2 ] );

		if ( extension.specularColorTexture !== undefined ) {

			pending.push( parser.assignTexture( materialParams, 'specularColorMap', extension.specularColorTexture, external_three_namespaceObject.sRGBEncoding ) );

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
		const loader = parser.options.ktx2Loader;

		if ( ! loader ) {

			if ( json.extensionsRequired && json.extensionsRequired.indexOf( this.name ) >= 0 ) {

				throw new Error( 'THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures' );

			} else {

				// Assumes that the extension is optional and that a fallback texture is present
				return null;

			}

		}

		return parser.loadTextureImage( textureIndex, extension.source, loader );

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

			if ( isSupported ) return parser.loadTextureImage( textureIndex, extension.source, loader );

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

			return buffer.then( function ( res ) {

				const byteOffset = extensionDef.byteOffset || 0;
				const byteLength = extensionDef.byteLength || 0;

				const count = extensionDef.count;
				const stride = extensionDef.byteStride;

				const source = new Uint8Array( res, byteOffset, byteLength );

				if ( decoder.decodeGltfBufferAsync ) {

					return decoder.decodeGltfBufferAsync( count, stride, source, extensionDef.mode, extensionDef.filter ).then( function ( res ) {

						return res.buffer;

					} );

				} else {

					// Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
					return decoder.ready.then( function () {

						const result = new ArrayBuffer( count * stride );
						decoder.decodeGltfBuffer( new Uint8Array( result ), count, stride, source, extensionDef.mode, extensionDef.filter );
						return result;

					} );

				}

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

				attributeTypeMap[ threeAttributeName ] = componentType.name;
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
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Archived/KHR_materials_pbrSpecularGlossiness
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
			'material.roughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.',
			'material.roughness += geometryRoughness;',
			'material.roughness = min( material.roughness, 1.0 );',
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
			'envMapIntensity'
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

			pending.push( parser.assignTexture( materialParams, 'map', pbrSpecularGlossiness.diffuseTexture, external_three_namespaceObject.sRGBEncoding ) );

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
			pending.push( parser.assignTexture( materialParams, 'specularMap', specGlossMapDef, external_three_namespaceObject.sRGBEncoding ) );

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
		material.emissiveIntensity = materialParams.emissiveIntensity === undefined ? 1.0 : materialParams.emissiveIntensity;
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

	interpolate_( i1, t0, t, t1 ) {

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

	}

}

const _q = new external_three_namespaceObject.Quaternion();

class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {

	interpolate_( i1, t0, t, t1 ) {

		const result = super.interpolate_( i1, t0, t, t1 );

		_q.fromArray( result ).normalize().toArray( result );

		return result;

	}

}


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
	let hasMorphColor = false;

	for ( let i = 0, il = targets.length; i < il; i ++ ) {

		const target = targets[ i ];

		if ( target.POSITION !== undefined ) hasMorphPosition = true;
		if ( target.NORMAL !== undefined ) hasMorphNormal = true;
		if ( target.COLOR_0 !== undefined ) hasMorphColor = true;

		if ( hasMorphPosition && hasMorphNormal && hasMorphColor ) break;

	}

	if ( ! hasMorphPosition && ! hasMorphNormal && ! hasMorphColor ) return Promise.resolve( geometry );

	const pendingPositionAccessors = [];
	const pendingNormalAccessors = [];
	const pendingColorAccessors = [];

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

		if ( hasMorphColor ) {

			const pendingAccessor = target.COLOR_0 !== undefined
				? parser.getDependency( 'accessor', target.COLOR_0 )
				: geometry.attributes.color;

			pendingColorAccessors.push( pendingAccessor );

		}

	}

	return Promise.all( [
		Promise.all( pendingPositionAccessors ),
		Promise.all( pendingNormalAccessors ),
		Promise.all( pendingColorAccessors )
	] ).then( function ( accessors ) {

		const morphPositions = accessors[ 0 ];
		const morphNormals = accessors[ 1 ];
		const morphColors = accessors[ 2 ];

		if ( hasMorphPosition ) geometry.morphAttributes.position = morphPositions;
		if ( hasMorphNormal ) geometry.morphAttributes.normal = morphNormals;
		if ( hasMorphColor ) geometry.morphAttributes.color = morphColors;
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

function getImageURIMimeType( uri ) {

	if ( uri.search( /\.jpe?g($|\?)/i ) > 0 || uri.search( /^data\:image\/jpeg/ ) === 0 ) return 'image/jpeg';
	if ( uri.search( /\.webp($|\?)/i ) > 0 || uri.search( /^data\:image\/webp/ ) === 0 ) return 'image/webp';

	return 'image/png';

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

		this.sourceCache = {};
		this.textureCache = {};

		// Track node names, to ensure no duplicates
		this.nodeNamesUsed = {};

		// Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
		// expensive work of uploading a texture to the GPU off the main thread.

		const isSafari = /^((?!chrome|android).)*safari/i.test( navigator.userAgent ) === true;
		const isFirefox = navigator.userAgent.indexOf( 'Firefox' ) > - 1;
		const firefoxVersion = isFirefox ? navigator.userAgent.match( /Firefox\/([0-9]+)\./ )[ 1 ] : - 1;

		if ( typeof createImageBitmap === 'undefined' || isSafari || ( isFirefox && firefoxVersion < 98 ) ) {

			this.textureLoader = new external_three_namespaceObject.TextureLoader( this.options.manager );

		} else {

			this.textureLoader = new external_three_namespaceObject.ImageBitmapLoader( this.options.manager );

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

		// Propagates mappings to the cloned object, prevents mappings on the
		// original object from being lost.
		const updateMappings = ( original, clone ) => {

			const mappings = this.associations.get( original );
			if ( mappings != null ) {

				this.associations.set( clone, mappings );

			}

			for ( const [ i, child ] of original.children.entries() ) {

				updateMappings( child, clone.children[ i ] );

			}

		};

		updateMappings( object, ref );

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
					dependency = this._invokeOne( function ( ext ) {

						return ext.loadAnimation && ext.loadAnimation( index );

					} );
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

			loader.load( external_three_namespaceObject.LoaderUtils.resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {

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
		const sourceIndex = textureDef.source;
		const sourceDef = json.images[ sourceIndex ];

		let loader = this.textureLoader;

		if ( sourceDef.uri ) {

			const handler = options.manager.getHandler( sourceDef.uri );
			if ( handler !== null ) loader = handler;

		}

		return this.loadTextureImage( textureIndex, sourceIndex, loader );

	}

	loadTextureImage( textureIndex, sourceIndex, loader ) {

		const parser = this;
		const json = this.json;

		const textureDef = json.textures[ textureIndex ];
		const sourceDef = json.images[ sourceIndex ];

		const cacheKey = ( sourceDef.uri || sourceDef.bufferView ) + ':' + textureDef.sampler;

		if ( this.textureCache[ cacheKey ] ) {

			// See https://github.com/mrdoob/three.js/issues/21559.
			return this.textureCache[ cacheKey ];

		}

		const promise = this.loadImageSource( sourceIndex, loader ).then( function ( texture ) {

			texture.flipY = false;

			if ( textureDef.name ) texture.name = textureDef.name;

			const samplers = json.samplers || {};
			const sampler = samplers[ textureDef.sampler ] || {};

			texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || external_three_namespaceObject.LinearFilter;
			texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || external_three_namespaceObject.LinearMipmapLinearFilter;
			texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || external_three_namespaceObject.RepeatWrapping;
			texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || external_three_namespaceObject.RepeatWrapping;

			parser.associations.set( texture, { textures: textureIndex } );

			return texture;

		} ).catch( function () {

			return null;

		} );

		this.textureCache[ cacheKey ] = promise;

		return promise;

	}

	loadImageSource( sourceIndex, loader ) {

		const parser = this;
		const json = this.json;
		const options = this.options;

		if ( this.sourceCache[ sourceIndex ] !== undefined ) {

			return this.sourceCache[ sourceIndex ].then( ( texture ) => texture.clone() );

		}

		const sourceDef = json.images[ sourceIndex ];

		const URL = self.URL || self.webkitURL;

		let sourceURI = sourceDef.uri || '';
		let isObjectURL = false;

		if ( sourceDef.bufferView !== undefined ) {

			// Load binary image data from bufferView, if provided.

			sourceURI = parser.getDependency( 'bufferView', sourceDef.bufferView ).then( function ( bufferView ) {

				isObjectURL = true;
				const blob = new Blob( [ bufferView ], { type: sourceDef.mimeType } );
				sourceURI = URL.createObjectURL( blob );
				return sourceURI;

			} );

		} else if ( sourceDef.uri === undefined ) {

			throw new Error( 'THREE.GLTFLoader: Image ' + sourceIndex + ' is missing URI and bufferView' );

		}

		const promise = Promise.resolve( sourceURI ).then( function ( sourceURI ) {

			return new Promise( function ( resolve, reject ) {

				let onLoad = resolve;

				if ( loader.isImageBitmapLoader === true ) {

					onLoad = function ( imageBitmap ) {

						const texture = new external_three_namespaceObject.Texture( imageBitmap );
						texture.needsUpdate = true;

						resolve( texture );

					};

				}

				loader.load( external_three_namespaceObject.LoaderUtils.resolveURL( sourceURI, options.path ), onLoad, undefined, reject );

			} );

		} ).then( function ( texture ) {

			// Clean up resources and configure Texture.

			if ( isObjectURL === true ) {

				URL.revokeObjectURL( sourceURI );

			}

			texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType( sourceDef.uri );

			return texture;

		} ).catch( function ( error ) {

			console.error( 'THREE.GLTFLoader: Couldn\'t load texture', sourceURI );
			throw error;

		} );

		this.sourceCache[ sourceIndex ] = promise;
		return promise;

	}

	/**
	 * Asynchronously assigns a texture to the given material parameters.
	 * @param {Object} materialParams
	 * @param {string} mapName
	 * @param {Object} mapDef
	 * @return {Promise<Texture>}
	 */
	assignTexture( materialParams, mapName, mapDef, encoding ) {

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

			if ( encoding !== undefined ) {

				texture.encoding = encoding;

			}

			materialParams[ mapName ] = texture;

			return texture;

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

		const useDerivativeTangents = geometry.attributes.tangent === undefined;
		const useVertexColors = geometry.attributes.color !== undefined;
		const useFlatShading = geometry.attributes.normal === undefined;

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
		if ( useDerivativeTangents || useVertexColors || useFlatShading ) {

			let cacheKey = 'ClonedMaterial:' + material.uuid + ':';

			if ( material.isGLTFSpecularGlossinessMaterial ) cacheKey += 'specular-glossiness:';
			if ( useDerivativeTangents ) cacheKey += 'derivative-tangents:';
			if ( useVertexColors ) cacheKey += 'vertex-colors:';
			if ( useFlatShading ) cacheKey += 'flat-shading:';

			let cachedMaterial = this.cache.get( cacheKey );

			if ( ! cachedMaterial ) {

				cachedMaterial = material.clone();

				if ( useVertexColors ) cachedMaterial.vertexColors = true;
				if ( useFlatShading ) cachedMaterial.flatShading = true;

				if ( useDerivativeTangents ) {

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

				pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture, external_three_namespaceObject.sRGBEncoding ) );

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

			materialParams.normalScale = new external_three_namespaceObject.Vector2( 1, 1 );

			if ( materialDef.normalTexture.scale !== undefined ) {

				const scale = materialDef.normalTexture.scale;

				materialParams.normalScale.set( scale, scale );

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

			pending.push( parser.assignTexture( materialParams, 'emissiveMap', materialDef.emissiveTexture, external_three_namespaceObject.sRGBEncoding ) );

		}

		return Promise.all( pending ).then( function () {

			let material;

			if ( materialType === GLTFMeshStandardSGMaterial ) {

				material = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].createMaterial( materialParams );

			} else {

				material = new materialType( materialParams );

			}

			if ( materialDef.name ) material.name = materialDef.name;

			assignExtrasToUserData( material, materialDef );

			parser.associations.set( material, { materials: materialIndex } );

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

			for ( let i = 0, il = meshes.length; i < il; i ++ ) {

				parser.associations.set( meshes[ i ], {
					meshes: meshIndex,
					primitives: i
				} );

			}

			if ( meshes.length === 1 ) {

				return meshes[ 0 ];

			}

			const group = new external_three_namespaceObject.Group();

			parser.associations.set( group, { meshes: meshIndex } );

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
			const name = target.node;
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

					node.traverse( function ( object ) {

						if ( object.morphTargetInfluences ) {

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

							const interpolantType = ( this instanceof external_three_namespaceObject.QuaternionKeyframeTrack ) ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant;

							return new interpolantType( this.times, this.values, this.getValueSize() / 3, result );

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

			if ( ! parser.associations.has( node ) ) {

				parser.associations.set( node, {} );

			}

			parser.associations.get( node ).nodes = nodeIndex;

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

			pending.push( buildNodeHierarchy( nodeIds[ i ], scene, json, parser ) );

		}

		return Promise.all( pending ).then( function () {

			// Removes dangling associations, associations that reference a node that
			// didn't make it into the scene.
			const reduceAssociations = ( node ) => {

				const reducedAssociations = new Map();

				for ( const [ key, value ] of parser.associations ) {

					if ( key instanceof external_three_namespaceObject.Material || key instanceof external_three_namespaceObject.Texture ) {

						reducedAssociations.set( key, value );

					}

				}

				node.traverse( ( node ) => {

					const mappings = parser.associations.get( node );

					if ( mappings != null ) {

						reducedAssociations.set( node, mappings );

					}

				} );

				return reducedAssociations;

			};

			parser.associations = reduceAssociations( scene );

			return scene;

		} );

	}

}

function buildNodeHierarchy( nodeId, parentObject, json, parser ) {

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
				pending.push( buildNodeHierarchy( child, node, json, parser ) );

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

        const _onSelectStart = utils_bind(this, this.onSelectStart);
        const _onSelectEnd = utils_bind(this, this.onSelectEnd);
        const _onSqueezeStart = utils_bind(this, this.onSqueezeStart);
        const _onSqueezeEnd = utils_bind(this, this.onSqueezeEnd);


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

        const _onSelectStart = utils_bind(this, this.onSelectStart);
        const _onSelectEnd = utils_bind(this, this.onSelectEnd);
        const _onSqueezeStart = utils_bind(this, this.onSqueezeStart);
        const _onSqueezeEnd = utils_bind(this, this.onSqueezeEnd);


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
        this.renderer = new VRRenderer(shader1, shader2, this.set, this.camera, this.scene, {}, {antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new external_three_namespaceObject.Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);


        // event listener
        const _onWindowResize = utils_bind(this, this.onWindowResize);
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
        this.gui = new external_dat_gui_namespaceObject.GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://3-dimensional.space');
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
        this.stats = new external_stats_namespaceObject["default"]();
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
        const _animate = utils_bind(this, this.animate);
        this.renderer.setAnimationLoop(_animate);
    }
}
;// CONCATENATED MODULE: ./src/commons/app/thurstonVRWoodBalls/ThurstonVRWoodBalls.js
















/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
class ThurstonVRWoodBalls {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     * - {Solid} controller0 - the object representing the controller 0
     * - {Solid} controller1 - the object representing the controller 1
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
        this.renderer = new VRRenderer(shader1, shader2, this.set, this.camera, this.scene, {}, {antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new external_three_namespaceObject.Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);


        // event listener
        const _onWindowResize = utils_bind(this, this.onWindowResize);
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
        // const model0 = controllerModelFactory.createControllerModel(controllerGrip0);
        // controllerGrip0.add(model0);
        this.renderer.threeScene.add(controllerGrip0);
        const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
        // const model1 = controllerModelFactory.createControllerModel(controllerGrip1);
        // controllerGrip1.add(model1);
        this.renderer.threeScene.add(controllerGrip1);

        const controller0 = this.renderer.xr.getController(0);
        this.renderer.threeScene.add(controller0);
        const controller1 = this.renderer.xr.getController(1);
        this.renderer.threeScene.add(controller1);
        this._controllerOldMatrices = [undefined, undefined];
        this._controllerTextureInitialQuat = [undefined, undefined];
        this._controllerPositionCurrentQuat = [undefined, undefined];
        this._controllerUpdateRequired = true;
        this._cameraOldMatrix = new external_three_namespaceObject.Matrix4();
        this._cameraTextureInitialQuat = undefined;
        this._cameraPositionCurrentQuat = undefined;
        this._cameraUpdateRequired = true;


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


        /**
         * Object representing the controller 0 in the scene.
         * type {Solid}
         */
        this.controllerObject0 = params.controllerObject0;
        /**
         * Object representing the controller 0 in the scene.
         * type {Solid}
         */
        this.controllerObject1 = params.controllerObject1;
        /**
         * Object representing the camera in the scene.
         * type {Solid}
         */
        this.cameraObject = params.cameraObject;

        // add the controller to the scene.
        // if we are not in VR mode, these objects are not displayed.
        if (this.controllerObject0 !== undefined) {
            this.scene.add(this.controllerObject0);
            this.controllerObject0.isRendered = false;
        }
        if (this.controllerObject1 !== undefined) {
            this.scene.add(this.controllerObject1);
            this.controllerObject1.isRendered = false;
        }
        if (this.cameraObject !== undefined) {
            this.scene.add(this.cameraObject);
            this.cameraObject.isRendered = false;
        }


    }

    /**
     * Shortcut to get the controller target ray
     * @param {number} index - the index of the controller
     * @return {Group} - the Three.js Group representing the controller target ray
     */
    getController(index) {
        return this.renderer.xr.getController(index);
    }

    /**
     * Shortcut to get the controller grip
     * @param {number} index - the index of the controller
     * @return {Group} - the Three.js Group representing the controller grip
     */
    getControllerGrip(index) {
        return this.renderer.xr.getControllerGrip(index);
    }

    getControllerFull(index) {
        let object;
        switch (index) {
            case 0:
                object = this.controllerObject0;
                break;
            case 1:
                object = this.controllerObject1;
        }
        return {
            targetRay: this.renderer.xr.getController(index),
            grip: this.renderer.xr.getControllerGrip(index),
            object: object
        }
    }

    /**
     * Initialize the graphic user interface
     * @return {Thurston} the current Thurston object
     */
    initGUI() {
        this.gui = new external_dat_gui_namespaceObject.GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://3-dimensional.space');
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
        this.stats = new external_stats_namespaceObject["default"]();
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

        // updating the position / orientation of the camera
        if (this.cameraObject !== undefined) {
            if (this.camera.isStereoOn) {
                const matrix = this.camera.matrix.clone();
                this.cameraObject.isRendered = true;
                this.cameraObject.isom.copy(this.camera.position.local.boost);
                this.cameraObject.updateData();

                if (this._cameraUpdateRequired) {
                    this._cameraTextureInitialQuat = this.cameraObject.material.material.quaternion.clone();
                    this._cameraPositionCurrentQuat = new external_three_namespaceObject.Quaternion().setFromRotationMatrix(matrix);
                    this._cameraUpdateRequired = false;
                } else {
                    const diffMatrix = new external_three_namespaceObject.Matrix4()
                        .copy(this._cameraOldMatrix)
                        .invert()
                        .multiply(matrix);
                    this._cameraPositionCurrentQuat.multiply(
                        new external_three_namespaceObject.Quaternion().setFromRotationMatrix(diffMatrix)
                    );
                    this.cameraObject.material.material.quaternion
                        .copy(this._cameraPositionCurrentQuat)
                        .multiply(this._cameraTextureInitialQuat);
                }

                this._cameraOldMatrix = matrix;

            } else {
                this._cameraUpdateRequired = true;
                this.cameraObject.isRendered = false;
            }
        }

        // updating the position / orientation of the controllers
        for (let i = 0; i < 2; i++) {
            const controllerFull = this.getControllerFull(i);
            if (controllerFull.object !== undefined) {
                if (this.camera.isStereoOn) {
                    controllerFull.object.isRendered = true;
                    // global position of the controller (in the real world)
                    const globalMatrix = controllerFull.targetRay.matrix.clone();
                    if (this._controllerUpdateRequired) {
                        // the VR mode has just been turned on
                        // update the position of the controller, relative to the camera
                        // position of the controller relative to the camera (in the real world)
                        const localMatrix = new external_three_namespaceObject.Matrix4()
                            .copy(this.camera.matrix)
                            .invert()
                            .multiply(globalMatrix);
                        // update the position of the controller (in the geometry)
                        controllerFull.object.isom
                            .copy(this.camera.position.local.boost)
                            .multiply(new Isometry().makeTranslationFromDir(
                                new Vector().setFromMatrixPosition(localMatrix)
                            ));
                        // update the facing of the texture
                        // this is tricky, one has to multiply the rotation obainted by incrementation
                        // with the original rotation of the texture
                        // not sure how to mathematically justify this yet...
                        this._controllerTextureInitialQuat[i] = controllerFull.object.material.material.quaternion.clone();
                        this._controllerPositionCurrentQuat[i] = new external_three_namespaceObject.Quaternion().setFromRotationMatrix(localMatrix);
                        // WARNING: hack !!
                        // if the material is wrap in a phong material,
                        // one needs to get deeper in the hierarchy to find the quaternion!
                        controllerFull.object.material.material.quaternion
                            .copy(this._controllerPositionCurrentQuat[i])
                            .multiply(this._controllerTextureInitialQuat[i]);
                        this._controllerUpdateRequired = false;
                    } else {
                        // the VR was already on
                        // update the position of the controller relative to its previous location
                        const diffVector = new Vector()
                            .setFromMatrixPosition(this._controllerOldMatrices[i])
                            .negate()
                            .add(new Vector().setFromMatrixPosition(globalMatrix));
                        controllerFull.object.isom.multiply(new Isometry().makeTranslationFromDir(
                            diffVector
                        ));
                        const diffMatrix = new external_three_namespaceObject.Matrix4()
                            .copy(this._controllerOldMatrices[i])
                            .invert()
                            .multiply(globalMatrix);
                        // WARNING: hack !!
                        // if the material is wrap in a phong material,
                        // one needs to get deeper in the hierarchy to find the quaternion!
                        this._controllerPositionCurrentQuat[i].multiply(
                            new external_three_namespaceObject.Quaternion().setFromRotationMatrix(diffMatrix)
                        )
                        controllerFull.object.material.material.quaternion
                            .copy(this._controllerPositionCurrentQuat[i])
                            .multiply(this._controllerTextureInitialQuat[i]);
                    }
                    this._controllerOldMatrices[i] = globalMatrix;
                    controllerFull.object.updateData();
                } else {
                    // an update of the controller position is needed next time the VR mode is turned on.
                    controllerFull.object.isRendered = false;
                    this._controllerUpdateRequired = true;
                }
            }
        }


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
        const _animate = utils_bind(this, this.animate);
        this.renderer.setAnimationLoop(_animate);
    }
}
;// CONCATENATED MODULE: ./src/controls/vr/ClapVRControls.js



/**
 * @class
 *
 * @classdesc
 * When pressing the button, change the color of the background
 * The color turn back to normal, when the button is released
 * Log the event if a log function is provided
 * The background material is assumed to be a single color material.
 */

const STATUS_WAITING = 0;
const STATUS_CLAPING = 1;

class ClapVRControls {

    /**
     * Constructor
     * @param {Group} controller - the group representing the controller
     * @param {Scene} scene - the scene (to access its background color)
     * @param {Color} color - clap color
     * @param {function} log - a callback for the log
     *
     */
    constructor( controller,  scene, color, log =undefined) {
        this.controller = controller;
        this._status = STATUS_WAITING;

        this._scene = scene
        this._originalBgColor = this._scene.background.color.clone();
        this._clapBgGolor = color;
        this._log = log;

        const _onSelectStart = bind(this, this.onSelectStart);
        const _onSelectEnd = bind(this, this.onSelectEnd);

        this.controller.addEventListener('selectstart', _onSelectStart);
        this.controller.addEventListener('selectend', _onSelectEnd);
    }

    /**
     * Event handler when the user starts selecting
     */
    onSelectStart() {
        this._status = STATUS_CLAPING;
        this._scene.background.color.copy(this._clapBgGolor);
        if(this._log !== undefined){
            this._log();
        }
    }

    /**
     * Event handler when the user stops selecting
     */
    onSelectEnd() {
        this._status = STATUS_WAITING;
        this._scene.background.color.copy(this._originalBgColor);
    }
}
;// CONCATENATED MODULE: ./src/commons/app/thurstonVRWoodBallsBis/ThurstonVRWoodBallsBis.js

















/**
 * @class
 *
 *
 * @classdesc
 * A combination of all main parts of the API. It can be used to quickly create scenes
 */
class ThurstonVRWoodBallsBis {

    /**
     * Constructor.
     * @param {string} shader1 - the first part of the geometry dependent shader
     * @param {string} shader2 - the second part of the geometry dependent shader
     * @param {TeleportationSet} set - the teleportation set
     * @param {Object} params - additional parameters including
     * - {string} keyboard - the type of keyboard (french, american, etc)
     * - {Solid} controller0 - the object representing the controller 0
     * - {Solid} controller1 - the object representing the controller 1
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
        this.renderer = new VRRenderer(shader1, shader2, this.set, this.camera, this.scene, {}, {antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new external_three_namespaceObject.Color(0, 0, 0.2), 1);
        document.body.appendChild(this.renderer.domElement);


        // event listener
        const _onWindowResize = utils_bind(this, this.onWindowResize);
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
        // const model0 = controllerModelFactory.createControllerModel(controllerGrip0);
        // controllerGrip0.add(model0);
        this.renderer.threeScene.add(controllerGrip0);
        const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
        // const model1 = controllerModelFactory.createControllerModel(controllerGrip1);
        // controllerGrip1.add(model1);
        this.renderer.threeScene.add(controllerGrip1);

        const controller0 = this.renderer.xr.getController(0);
        this.renderer.threeScene.add(controller0);
        const controller1 = this.renderer.xr.getController(1);
        this.renderer.threeScene.add(controller1);
        this._controllerOldMatrices = [undefined, undefined];
        this._controllerTextureInitialQuat = [undefined, undefined];
        this._controllerPositionCurrentQuat = [undefined, undefined];
        this._controllerUpdateRequired = true;
        this._cameraOldMatrix = new external_three_namespaceObject.Matrix4();
        this._cameraTextureInitialQuat = undefined;
        this._cameraPositionCurrentQuat = undefined;
        this._cameraUpdateRequired = true;


        // /**
        //  * Moving in the scene with the VR controller
        //  * @protected
        //  * @type {MoveVRControls}
        //  */
        // this.VRControlsMove = new MoveVRControls(this.camera.position, controller0);
        //
        // this.VRControlsClap = new ClapVRControls(
        //     controller1,
        //     this.scene,
        //     new Color(1,1,0)
        // );


        /**
         * Object representing the controller 0 in the scene.
         * type {Solid}
         */
        this.controllerObject0 = params.controllerObject0;
        /**
         * Object representing the controller 0 in the scene.
         * type {Solid}
         */
        this.controllerObject1 = params.controllerObject1;
        /**
         * Object representing the camera in the scene.
         * type {Solid}
         */
        this.cameraObject = params.cameraObject;

        // add the controller to the scene.
        // if we are not in VR mode, these objects are not displayed.
        if (this.controllerObject0 !== undefined) {
            this.scene.add(this.controllerObject0);
            this.controllerObject0.isRendered = false;
        }
        if (this.controllerObject1 !== undefined) {
            this.scene.add(this.controllerObject1);
            this.controllerObject1.isRendered = false;
        }
        if (this.cameraObject !== undefined) {
            this.scene.add(this.cameraObject);
            this.cameraObject.isRendered = false;
        }
    }

    /**
     * Shortcut to get the controller target ray
     * @param {number} index - the index of the controller
     * @return {Group} - the Three.js Group representing the controller target ray
     */
    getController(index) {
        return this.renderer.xr.getController(index);
    }

    /**
     * Shortcut to get the controller grip
     * @param {number} index - the index of the controller
     * @return {Group} - the Three.js Group representing the controller grip
     */
    getControllerGrip(index) {
        return this.renderer.xr.getControllerGrip(index);
    }

    getControllerFull(index) {
        let object;
        switch (index) {
            case 0:
                object = this.controllerObject0;
                break;
            case 1:
                object = this.controllerObject1;
        }
        return {
            targetRay: this.renderer.xr.getController(index),
            grip: this.renderer.xr.getControllerGrip(index),
            object: object
        }
    }

    /**
     * Initialize the graphic user interface
     * @return {Thurston} the current Thurston object
     */
    initGUI() {
        this.gui = new external_dat_gui_namespaceObject.GUI();
        this.gui.close();
        this.gui.add({
            help: function () {
                window.open('https://3-dimensional.space');
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
        this.stats = new external_stats_namespaceObject["default"]();
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
        // this.VRControlsMove.update(delta);

        // updating the position / orientation of the camera
        if (this.cameraObject !== undefined) {
            if (this.camera.isStereoOn) {
                const matrix = this.camera.matrix.clone();
                // this.cameraObject.isRendered = true;
                this.cameraObject.isom.copy(this.camera.position.local.boost);

                if (this._cameraUpdateRequired) {
                    this._cameraTextureInitialQuat = this.cameraObject.material.material.quaternion.clone();
                    this._cameraPositionCurrentQuat = new external_three_namespaceObject.Quaternion().setFromRotationMatrix(matrix);
                    this._cameraUpdateRequired = false;
                } else {
                    const diffMatrix = new external_three_namespaceObject.Matrix4()
                        .copy(this._cameraOldMatrix)
                        .invert()
                        .multiply(matrix);
                    this._cameraPositionCurrentQuat.multiply(
                        new external_three_namespaceObject.Quaternion().setFromRotationMatrix(diffMatrix)
                    );
                    this.cameraObject.material.material.quaternion
                        .copy(this._cameraPositionCurrentQuat)
                        .multiply(this._cameraTextureInitialQuat)
                        .premultiply(this.camera.position.local.quaternion);
                }

                this.cameraObject.updateData();
                this._cameraOldMatrix = matrix;

            } else {
                this._cameraUpdateRequired = true;
                // this.cameraObject.isRendered = false;
            }
        }

        // updating the position / orientation of the controllers
        for (let i = 0; i < 2; i++) {
            const controllerFull = this.getControllerFull(i);
            if (controllerFull.object !== undefined) {
                if (this.camera.isStereoOn) {
                    // controllerFull.object.isRendered = true;
                    // global position of the controller (in the real world)
                    const globalMatrix = controllerFull.targetRay.matrix.clone();
                    if (this._controllerUpdateRequired) {
                        // the VR mode has just been turned on
                        // update the facing of the texture
                        // this is tricky, one has to multiply the rotation obtained by incrementation
                        // with the original rotation of the texture
                        // not sure how to mathematically justify this yet...
                        this._controllerTextureInitialQuat[i] = controllerFull.object.material.material.quaternion.clone();
                        this._controllerPositionCurrentQuat[i] = new external_three_namespaceObject.Quaternion().setFromRotationMatrix(globalMatrix);
                        // WARNING: hack !!
                        // if the material is wrap in a phong material,
                        // one needs to get deeper in the hierarchy to find the quaternion!
                        controllerFull.object.material.material.quaternion
                            .copy(this._controllerPositionCurrentQuat[i])
                            .multiply(this._controllerTextureInitialQuat[i]);
                        this._controllerUpdateRequired = false;
                    } else {
                        // the VR was already on
                        const diffMatrix = new external_three_namespaceObject.Matrix4()
                            .copy(this._controllerOldMatrices[i])
                            .invert()
                            .multiply(globalMatrix);
                        // WARNING: hack !!
                        // if the material is wrap in a phong material,
                        // one needs to get deeper in the hierarchy to find the quaternion!
                        this._controllerPositionCurrentQuat[i].multiply(
                            new external_three_namespaceObject.Quaternion().setFromRotationMatrix(diffMatrix)
                        )
                        controllerFull.object.material.material.quaternion
                            .copy(this._controllerPositionCurrentQuat[i])
                            .multiply(this._controllerTextureInitialQuat[i])
                            .premultiply(this.camera.position.local.quaternion);
                    }
                    this._controllerOldMatrices[i] = globalMatrix;

                    // update the position of the controller relative to its previous location
                    const diffVector = new Vector()
                        .setFromMatrixPosition(this.camera.matrix)
                        .negate()
                        .add(new Vector().setFromMatrixPosition(globalMatrix))
                        .applyMatrix4(new external_three_namespaceObject.Matrix4().makeRotationFromQuaternion(this.camera.position.local.quaternion));

                    controllerFull.object.isom
                        .copy(this.camera.position.local.boost)
                        .multiply(new Isometry().makeTranslationFromDir(diffVector));

                    controllerFull.object.updateData();
                } else {
                    // an update of the controller position is needed next time the VR mode is turned on.
                    // controllerFull.object.isRendered = false;
                    this._controllerUpdateRequired = true;
                }
            }
        }


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
        const _animate = utils_bind(this, this.animate);
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
 * @abstract
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
const regexpCreep = /float\s*(\w+)\(ExtVector.*\)/m;

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

        const _onKeyDown = utils_bind(this, this.onKeyDown);
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

        const _onSelectStart = utils_bind(this, this.onSelectStart);
        const _onSelectEnd = utils_bind(this, this.onSelectEnd);
        const _onSqueezeStart = utils_bind(this, this.onSqueezeStart);
        const _onSqueezeEnd = utils_bind(this, this.onSqueezeEnd);


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

        const _onKeyDown = utils_bind(this, this.onKeyDown);
        const _onKeyUp = utils_bind(this, this.onKeyUp);
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

        const _onSelectStart = utils_bind(this, this.onSelectStart);
        const _onSelectEnd = utils_bind(this, this.onSelectEnd);

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

        const _onKeyDown = utils_bind(this, this.onKeyDown);
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

        const _onSelectStart = utils_bind(this, this.onSelectStart);
        const _onSelectEnd = utils_bind(this, this.onSelectEnd);

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

        const _onSqueezeStart = utils_bind(this, this.onSqueezeStart);
        const _onSqueeezeEnd = utils_bind(this, this.onSqueezeEnd);

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
// EXTERNAL MODULE: ./src/commons/postProcess/acesFilm/shaders/fragment.glsl
var fragment = __webpack_require__(6947);
var fragment_default = /*#__PURE__*/__webpack_require__.n(fragment);
;// CONCATENATED MODULE: ./src/commons/postProcess/acesFilm/AcesFilmPostProcess.js




class AcesFilmPostProcess extends PostProcess {

    /**
     * Constructor
     * @param {number} exposure - the exposure
     */
    constructor(exposure) {
        super();
        this.exposure = exposure;
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
// EXTERNAL MODULE: ./src/commons/postProcess/linearToSRBG/shaders/fragment.glsl
var shaders_fragment = __webpack_require__(4024);
var shaders_fragment_default = /*#__PURE__*/__webpack_require__.n(shaders_fragment);
;// CONCATENATED MODULE: ./src/commons/postProcess/linearToSRBG/LinearToSRGBPostProcess.js




class LinearToSRGBPostProcess extends PostProcess {

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    fragmentShader() {
        return (shaders_fragment_default());
    }
}
// EXTERNAL MODULE: ./src/commons/postProcess/combined/shaders/fragment.glsl
var combined_shaders_fragment = __webpack_require__(2690);
var combined_shaders_fragment_default = /*#__PURE__*/__webpack_require__.n(combined_shaders_fragment);
;// CONCATENATED MODULE: ./src/commons/postProcess/combined/CombinedPostProcess.js




class CombinedPostProcess extends PostProcess {

    /**
     * Constructor
     * @param {number} exposure - the exposure
     */
    constructor(exposure) {
        super();
        this.exposure = exposure;
    }

    uniforms() {
        const res = super.uniforms();
        res.exposure = {value: this.exposure}
        return res;
    }

    fragmentShader() {
        return (combined_shaders_fragment_default());
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






































// EXTERNAL MODULE: ./src/geometries/sph/groups/quaternion/shaders/element.glsl
var quaternion_shaders_element = __webpack_require__(4905);
var shaders_element_default = /*#__PURE__*/__webpack_require__.n(quaternion_shaders_element);
;// CONCATENATED MODULE: ./src/geometries/sph/groups/quaternion/GroupElement.js




/**
 * @class
 *
 * @classdesc
 * Unit integer quaternions, represented
 * - as a integer Quaternion on a the JS side
 * - as an integer vec4 on the GLSL side
 */
class quaternion_GroupElement_GroupElement extends GroupElement_GroupElement {

    constructor(group, x = 0, y = 0, z = 0, w = 1) {
        super(group);
        this.quaternion = new external_three_namespaceObject.Quaternion(x, y, z, w);
    }

    /**
     * the only way to pass an integer vector to the shader is as an array and not a Vector3
     * @type {number[]}
     */
    get icoords() {
        return this.quaternion.toArray();
    }


    identity() {
        this.quaternion.identity();
        return this;
    }

    multiply(elt) {
        this.quaternion.multiply(elt.quaternion);
        return this;
    }

    premultiply(elt) {
        this.quaternion.premultiply(elt.quaternion);
        return this;
    }

    invert() {
        this.quaternion.conjugate();
        return this;
    }

    toIsometry() {
        const [x, y, z, w] = this.quaternion.toArray();
        const res = new Isometry();
        res.matrix.set(
            w, -z, -y, -x,
            z, w, x, -y,
            y, -x, w, z,
            x, y, -z, w
        );
        return res;
    }

    equals(elt) {
        return this.quaternion.equals(elt.quaternion);
    }

    clone() {
        const res = new quaternion_GroupElement_GroupElement(this.group);
        res.quaternion.copy(this.quaternion);
        return res;
    }

    copy(elt) {
        this.quaternion.copy(elt.quaternion);
        return this;
    }
}

;// CONCATENATED MODULE: ./src/geometries/sph/groups/quaternion/Group.js




/**
 * @class
 *
 * @classdesc
 * Group of unit quaternion with integer coordinates.
 */
class quaternion_Group_Group extends Group_Group {

    constructor() {
        super();
    }

    element() {
        let x = 0, y = 0, z = 0, w = 1;
        if (arguments.length === 4) {
            [x, y, z, w] = arguments;
        }
        return new quaternion_GroupElement_GroupElement(this, x, y, z, w)
    }

    shader(shaderBuilder) {
        shaderBuilder.addChunk((shaders_element_default()));
    }
}
;// CONCATENATED MODULE: ./src/geometries/sph/groups/quaternion/set.js




const group = new quaternion_Group_Group()

const normalXp = new external_three_namespaceObject.Vector4(1, 0, 0, -1);
const normalXn = new external_three_namespaceObject.Vector4(-1, 0, 0, -1);
const normalYp = new external_three_namespaceObject.Vector4(0, 1, 0, -1);
const normalYn = new external_three_namespaceObject.Vector4(0, -1, 0, -1);
const normalZp = new external_three_namespaceObject.Vector4(0, 0, 1, -1);
const normalZn = new external_three_namespaceObject.Vector4(0, 0, -1, -1);

function testXp(p) {
    return normalXp.dot(p.coords) > 0;
}

// language=GLSL
const glslTestXp = `//
bool testXp(Point p){
    vec4 n = vec4(1, 0, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepXp = `//
float creepXp(ExtVector v, float offset){
    vec4 n = vec4(1, 0, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

function testXn(p) {
    return normalXn.dot(p.coords) > 0;
}

// language=GLSL
const glslTestXn = `//
bool testXn(Point p){
    vec4 n = vec4(-1, 0, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepXn = `//
float creepXn(ExtVector v, float offset){
    vec4 n = vec4(-1, 0, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

// language=GLSL
function testYp(p) {
    return normalYp.dot(p.coords) > 0;
}

const glslTestYp = `//
bool testYp(Point p){
    vec4 n = vec4(0, 1, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepYp = `//
float creepYp(ExtVector v, float offset){
    vec4 n = vec4(0, 1, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

// language=GLSL
function testYn(p) {
    return normalYn.dot(p.coords) > 0;
}

const glslTestYn = `//
bool testYn(Point p){
    vec4 n = vec4(0, -1, 0, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepYn = `//
float creepYn(ExtVector v, float offset){
    vec4 n = vec4(0, -1, 0, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;


function testZp(p) {
    return normalZp.dot(p.coords) > 0;
}

// language=GLSL
const glslTestZp = `//
bool testZp(Point p){
    vec4 n = vec4(0, 0, 1, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepZp = `//
float creepZp(ExtVector v, float offset){
    vec4 n = vec4(0, 0, 1, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;

function testZn(p) {
    return normalZn.dot(p.coords) > 0;
}

// language=GLSL
const glslTestZn = `//
bool testZn(Point p){
    vec4 n = vec4(0, 0, -1, -1);
    return dot(n, p.coords) > 0.;
}
`;

// language=GLSL
const glslCreepZn = `//
float creepZn(ExtVector v, float offset){
    vec4 n = vec4(0, 0, -1, -1);
    vec4 coords = v.vector.local.pos.coords;
    vec4 dir = v.vector.local.dir;
    return -atan(dot(coords, n)/dot(dir, n)) + offset;
}
`;


const shiftXp = group.element(1, 0, 0, 0);
const shiftXn = group.element(-1, 0, 0, 0);
const shiftYp = group.element(0, 1, 0, 0);
const shiftYn = group.element(0, -1, 0, 0);
const shiftZp = group.element(0, 0, -1, 0);
const shiftZn = group.element(0, 0, 1, 0);


/* harmony default export */ const quaternion_set = (new TeleportationSet()
    .add(testXp, glslTestXp, shiftXp, shiftXn, glslCreepXp)
    .add(testXn, glslTestXn, shiftXn, shiftXp, glslCreepXn)
    .add(testYp, glslTestYp, shiftYp, shiftYn, glslCreepYp)
    .add(testYn, glslTestYn, shiftYn, shiftYp, glslCreepYn)
    .add(testZp, glslTestZp, shiftZp, shiftZn, glslCreepZp)
    .add(testZn, glslTestZn, shiftZn, shiftZp, glslCreepZn));


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
var isometry_shaders_element_default = /*#__PURE__*/__webpack_require__.n(isometry_shaders_element);
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
        shaderBuilder.addChunk((isometry_shaders_element_default()));
    }
}
;// CONCATENATED MODULE: ./src/geometries/sph/groups/poincare/set.js








/**
 *
 * @param {Point} point
 */
function proj2FakeKlein(point) {
    const coords = point.coords;
    return new external_three_namespaceObject.Vector3(coords.x / coords.w, coords.y / coords.w, coords.z / coords.w);
}

// const halfWidth = 0.996384497847316;
const halfWidth = Math.PI / 10;
// const rotAngle = 3 * Math.PI / 5.;
const rotAngle = Math.PI / 5.;
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
    const fakeKlein = proj2FakeKlein(point);
    const dot = fakeKlein.dot(fakeKlein);

    const normalP = new external_three_namespaceObject.Vector4(fakeKlein.x, fakeKlein.y, fakeKlein.z, -dot);
    const testP = function (p) {
        return p.coords.dot(normalP) > 0;
    }

    const normalN = new external_three_namespaceObject.Vector4(fakeKlein.x, fakeKlein.y, fakeKlein.z, dot);
    const testN = function (p) {
        return p.coords.dot(normalN) < 0;
    }

    // language=GLSL
    const glslTestP = `//
    bool test${i}P(Point p){
        vec4 normal = vec4(${fakeKlein.x}, ${fakeKlein.y}, ${fakeKlein.z}, -${dot});
        return dot(p.coords, normal) > 0.;
    }
    `;

    // language=GLSL
    const glslTestN = `//
    bool test${i}N(Point p){
        vec4 normal = vec4(${fakeKlein.x}, ${fakeKlein.y}, ${fakeKlein.z}, ${dot});
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

/* harmony default export */ const poincare_set = (teleportations);




// EXTERNAL MODULE: ./src/geometries/sph/imports/distance.glsl
var distance = __webpack_require__(3830);
var distance_default = /*#__PURE__*/__webpack_require__.n(distance);
// EXTERNAL MODULE: ./src/geometries/sph/imports/direction.glsl
var direction = __webpack_require__(217);
var direction_default = /*#__PURE__*/__webpack_require__.n(direction);
// EXTERNAL MODULE: ./src/geometries/sph/imports/lightIntensity.glsl
var lightIntensity = __webpack_require__(1156);
var lightIntensity_default = /*#__PURE__*/__webpack_require__.n(lightIntensity);
// EXTERNAL MODULE: ./src/geometries/sph/lights/pointLight/shaders/struct.glsl
var pointLight_shaders_struct = __webpack_require__(3483);
var pointLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(pointLight_shaders_struct);
// EXTERNAL MODULE: ./src/core/lights/shaders/directions.glsl.mustache
var directions_glsl_mustache = __webpack_require__(7577);
var directions_glsl_mustache_default = /*#__PURE__*/__webpack_require__.n(directions_glsl_mustache);
;// CONCATENATED MODULE: ./src/geometries/sph/lights/pointLight/PointLight.js













/**
 * @class
 *
 * @classdesc
 * Spherical point light
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
        super(2);
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
         * The color or the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity or the light.
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
// EXTERNAL MODULE: ./src/geometries/sph/lights/constDirLight/shaders/struct.glsl
var constDirLight_shaders_struct = __webpack_require__(7520);
var constDirLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(constDirLight_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/lights/constDirLight/ConstDirLight.js







/**
 * @class
 *
 * @classdesc
 * Light at a fixed direction
 */
class ConstDirLight extends Light {

    /**
     * Constructor.
     * @param {Color} color - the color of the light
     * @param {number} intensity - the intensity of the light
     * @param {Vector4} direction - the direction of the light.
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
// EXTERNAL MODULE: ./src/geometries/sph/lights/localPointLight/shaders/struct.glsl
var localPointLight_shaders_struct = __webpack_require__(9182);
var localPointLight_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localPointLight_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/lights/localPointLight/LocalPointLight.js













/**
 * @class
 *
 * @classdesc
 * Spherical point light
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
        super(2);
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
         * The color or the light.
         * @type {Color}
         */
        this.color = color;
        /**
         * The intensity or the light.
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
;// CONCATENATED MODULE: ./src/geometries/sph/lights/all.js



// EXTERNAL MODULE: ./src/geometries/sph/material/varyingColor/shaders/struct.glsl
var varyingColor_shaders_struct = __webpack_require__(4193);
var varyingColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(varyingColor_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/material/varyingColor/VaryingColorMaterial.js







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
// EXTERNAL MODULE: ./src/geometries/sph/material/multiColor/shaders/struct.glsl
var multiColor_shaders_struct = __webpack_require__(3889);
var multiColor_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(multiColor_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/material/multiColor/MultiColorMaterial.js







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
;// CONCATENATED MODULE: ./src/geometries/sph/material/all.js


;// CONCATENATED MODULE: ./src/geometries/sph/geometry/General.js









// EXTERNAL MODULE: ./src/geometries/sph/shapes/ball/shaders/struct.glsl
var ball_shaders_struct = __webpack_require__(2473);
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
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/ball/BallShape.js










/**
 * @class
 *
 * @classdesc
 * Shape of a spherical ball
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
        if(this._center === undefined) {
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
// EXTERNAL MODULE: ./src/geometries/sph/shapes/localBall/shaders/struct.glsl
var localBall_shaders_struct = __webpack_require__(9937);
var localBall_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localBall_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/localBall/LocalBallShape.js











/**
 * @class
 *
 * @classdesc
 * Shape of a spherical local ball
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
        this.radius = radius;this._center = undefined;
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
        if(this._center === undefined) {
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
// EXTERNAL MODULE: ./src/geometries/sph/shapes/cylinder/shaders/struct.glsl
var cylinder_shaders_struct = __webpack_require__(9474);
var cylinder_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(cylinder_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/cylinder/CylinderShape.js











/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Cylinder in spherical geometry.
 */
class CylinderShape extends BasicShape {

    /**
     * Constructor
     * The cylinder is the image by isom of the cylinder going through the origin and directed by e_z
     * The UV map takes value in [-pi, pi] x [-pi, pi]. It is computed as follows
     * - the u-coordinate is the distance between the origin and the projection of the on the "core" geodesic
     * - the v-coordinate is such that v = 0 correspond to the point in the e_y direction
     * @param {Isometry} isom - the position of the cylinder
     * @param {number} radius - the radius of the cylinder
     */
    constructor(isom, radius) {
        super(isom);
        this.addImport((direction_default()));
        this.radius = radius;
        this._direction = undefined;
        this._uvTestX = undefined;
        this._uvTestY = undefined;
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._uvTestX = new external_three_namespaceObject.Vector4(1, 0, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._uvTestY = new external_three_namespaceObject.Vector4(0, 1, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
    }

    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    get uvTestX() {
        if (this._uvTestX === undefined) {
            this.updateData();
        }
        return this._uvTestX;
    }

    get uvTestY() {
        if (this._uvTestY === undefined) {
            this.updateData();
        }
        return this._uvTestY;
    }

    get isCylinderShape() {
        return true;
    }

    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return true;
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

    glslUVMap() {
        return shapes_shaders_uv_glsl_mustache_default()(this);
    }
}
// EXTERNAL MODULE: ./src/geometries/sph/shapes/cliffordTorus/shaders/struct.glsl
var cliffordTorus_shaders_struct = __webpack_require__(8166);
var cliffordTorus_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(cliffordTorus_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/cliffordTorus/CliffordTorusShape.js








/**
 * @class
 *
 * @classdesc
 * Shape of the Clifford torus in the three-sphere…
 * which is also a cylinder of radius pi/2 around a geodesic!
 */
class CliffordTorusShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry} location - data for the center of the torus (not implemented yet)
     */
    constructor(location) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else {
            throw new Error('CliffordTorusShape: this type of location is not allowed');
        }
        super(isom);
    }

    updateData() {
        super.updateData();
    }

    /**
     * Says that the object inherits from `Clifford torus`
     * @type {boolean}
     */
    get isCliffordTorusShape() {
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
        return 'CliffordTorusShape';
    }

    static glslClass() {
        return (cliffordTorus_shaders_struct_default());
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
// EXTERNAL MODULE: ./src/geometries/sph/shapes/circle/shaders/struct.glsl
var circle_shaders_struct = __webpack_require__(9527);
var circle_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(circle_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/circle/CircleShape.js











/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Cylinder around a circle of the form z = cst and w = cst
 * Used for instance to draw a wireframe version of the Clifford torus
 */
class CircleShape extends BasicShape {

    /**
     * Constructor
     * The cylinder is the image by isom of the cylinder given by the equations z = cz and w = cw
     * The UV map takes value in [-pi, pi] x [-pi, pi]. It is computed as follows
     * - the u-coordinate is the distance between the origin and the projection of the on the "core" circle
     * - the v-coordinate is such that v = 0 correspond to the point in the e_y direction
     * @param {Isometry} isom - the position of the cylinder
     * @param {number} cz - value of the z-coordinate
     * @param {number} cw - value of the w-coordinate
     * @param {number} radius - the radius of the cylinder around the curve
     */
    constructor(isom, cz, cw, radius) {
        super(isom);
        this.addImport((direction_default()));
        const cAux = cz * cz + cw * cw;
        if (cAux > 1) {
            throw new Error('CircleShape: the circle in not on the sphere');
        }
        const cx = Math.sqrt(1 - cAux);
        this.c = new external_three_namespaceObject.Vector4(cx, cx, cz, cw);
        this.radius = radius;
        this.updateData();

    }

    updateData() {
        super.updateData();
    }

    get isCircleShape() {
        return true;
    }

    get isGlobal() {
        return true;
    }

    get hasUVMap() {
        return true;
    }

    get uniformType() {
        return 'CircleShape';
    }

    static glslClass() {
        return (circle_shaders_struct_default());
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
// EXTERNAL MODULE: ./src/geometries/sph/shapes/halfSpace/shaders/struct.glsl
var halfSpace_shaders_struct = __webpack_require__(9521);
var halfSpace_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(halfSpace_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/halfSpace/HalfSpaceShape.js









/**
 * @class
 *
 * @classdesc
 * Shape of a half space, which is also a ball of radius pi/2 !
 * The half space is the (image of by the given isometry of the) space {z < 0}
 *
 */
class HalfSpaceShape extends BasicShape {

    /**
     * Construction
     * @param {Isometry} location - location of the half space
     */
    constructor(location) {
        const isom = new Isometry();
        if (location.isIsometry) {
            isom.copy(location);
        } else {
            throw new Error('HalfSpaceShape: this type of location is not allowed');
        }
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
     * Center of the ball
     * @type {Point}
     */
    get normal() {
        if (this._normal === undefined) {
            this.updateData();
        }
        return this._normal;
    }

    /**
     * Says that the object inherits from `Ball`
     * @type {boolean}
     */
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
// EXTERNAL MODULE: ./src/geometries/sph/shapes/localCylinder/shaders/struct.glsl
var localCylinder_shaders_struct = __webpack_require__(9807);
var localCylinder_shaders_struct_default = /*#__PURE__*/__webpack_require__.n(localCylinder_shaders_struct);
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/localCylinder/LocalCylinderShape.js











/**
 * @class
 * @extends BasicShape
 *
 * @classdesc
 * Cylinder in spherical geometry.
 */
class LocalCylinderShape extends BasicShape {

    /**
     * Constructor
     * The cylinder is the image by isom of the cylinder going through the origin and directed by e_z
     * The UV map takes value in [-pi, pi] x [-pi, pi]. It is computed as follows
     * - the u-coordinate is the distance between the origin and the projection of the on the "core" geodesic
     * - the v-coordinate is such that v = 0 correspond to the point in the e_y direction
     * @param {Isometry} isom - the position of the cylinder
     * @param {number} radius - the radius of the cylinder
     */
    constructor(isom, radius) {
        super(isom);
        this.addImport((direction_default()));
        this.radius = radius;
        this._direction = undefined;
        this._uvTestX = undefined;
        this._uvTestY = undefined;
    }

    updateData() {
        super.updateData();
        this._direction = {
            pos: new Point().applyIsometry(this.absoluteIsom),
            dir: new external_three_namespaceObject.Vector4(0, 0, 1, 0).applyMatrix4(this.absoluteIsom.matrix)
        };
        this._uvTestX = new external_three_namespaceObject.Vector4(1, 0, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
        this._uvTestY = new external_three_namespaceObject.Vector4(0, 1, 0, 0).applyMatrix4(this.absoluteIsom.matrix);
    }

    get direction() {
        if (this._direction === undefined) {
            this.updateData();
        }
        return this._direction;
    }

    get uvTestX() {
        if (this._uvTestX === undefined) {
            this.updateData();
        }
        return this._uvTestX;
    }

    get uvTestY() {
        if (this._uvTestY === undefined) {
            this.updateData();
        }
        return this._uvTestY;
    }

    // get isCylinderShape() {
    //     return true;
    // }

    get isGlobal() {
        return false;
    }

    get hasUVMap() {
        return true;
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

    glslUVMap() {
        return shapes_shaders_uv_glsl_mustache_default()(this);
    }
}
;// CONCATENATED MODULE: ./src/geometries/sph/shapes/all.js







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
;// CONCATENATED MODULE: ./src/geometries/sph/solids/Ball.js



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
;// CONCATENATED MODULE: ./src/geometries/sph/solids/LocalBall.js



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
;// CONCATENATED MODULE: ./src/geometries/sph/solids/Cylinder.js



/**
 * @class
 * @extends Solid
 * @classdesc
 * Cylinder in spherical geometry
 */
class Cylinder extends Solid {
    /**
     * Constructor
     * @param {Isometry} location - the location of the cylinder
     * @param {number} radius - the radius of the cylinder
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, radius, material, ptMaterial = undefined) {
        const shape = new CylinderShape(location, radius);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/sph/solids/CliffordTorus.js



/**
 * @class
 *
 * @classdesc
 * Clifford Torus
 */
class CliffordTorus extends Solid {

    /**
     * Constructor
     * @param {Isometry|Point|Vector} location - the location of the ball
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, material, ptMaterial = undefined) {
        const shape = new CliffordTorusShape(location);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/sph/solids/Circle.js



/**
 * @class
 * @extends Solid
 * @classdesc
 * Cylinder around the curve with equations z = cz and w = cw (or more precisely, its image by the isometry)
 */
class Circle extends Solid {
    /**
     * Constructor
     * @param {Isometry} isom - the location of the cylinder
     * @param {number} cz - value of the z-coordinate
     * @param {number} cw - value of the w-coordinate
     * @param {number} radius - the radius of the cylinder around the curve
     * @param {Material} material - the material of the cylinder
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(isom, cz, cw, radius, material, ptMaterial = undefined) {
        const shape = new CircleShape(isom, cz, cw, radius);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/sph/solids/HalfSpace.js



/**
 * @class
 *
 * @classdesc
 * Half space
 */
class HalfSpace extends Solid {

    /**
     * Constructor
     * @param {Isometry} location - the location of the half space
     * @param {Material} material - the material of the ball
     * @param {PTMaterial} ptMaterial - material for path tracing (optional)
     */
    constructor(location, material, ptMaterial = undefined) {
        const shape = new HalfSpaceShape(location);
        super(shape, material, ptMaterial);
    }
}
;// CONCATENATED MODULE: ./src/geometries/sph/solids/LocalCylinder.js



/**
 * @class
 *
 * @classdesc
 * Spherical cylinder
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
;// CONCATENATED MODULE: ./src/geometries/sph/solids/all.js









;// CONCATENATED MODULE: ./src/thurstonSph.js













const thurstonSph_BasicRenderer = specifyRenderer(BasicRenderer, (part1_default()), (part2_default()));
const thurstonSph_PathTracerRenderer = specifyRenderer(PathTracerRenderer, (part1_default()), (part2_default()));
const thurstonSph_VRRenderer = specifyRenderer(VRRenderer, (part1_default()), (part2_default()));








const thurstonSph_Thurston = specifyThurston(Thurston, (part1_default()), (part2_default()));
const thurstonSph_ThurstonLite = specifyThurston(ThurstonLite, (part1_default()), (part2_default()));
const thurstonSph_ThurstonVR = specifyThurston(ThurstonVR, (part1_default()), (part2_default()));
const thurstonSph_ThurstonVRWoodBalls = specifyThurston(ThurstonVRWoodBalls, (part1_default()), (part2_default()));
const thurstonSph_ThurstonVRWoodBallsBis = specifyThurston(ThurstonVRWoodBallsBis, (part1_default()), (part2_default()));










})();

var __webpack_exports__AcesFilmPostProcess = __webpack_exports__.T0;
var __webpack_exports__AdvancedResetVRControls = __webpack_exports__.FJ;
var __webpack_exports__AdvancedShape = __webpack_exports__.GU;
var __webpack_exports__BOTH = __webpack_exports__.XH;
var __webpack_exports__Ball = __webpack_exports__.ec;
var __webpack_exports__BallShape = __webpack_exports__.Yb;
var __webpack_exports__BasicCamera = __webpack_exports__.QU;
var __webpack_exports__BasicPTMaterial = __webpack_exports__.ZH;
var __webpack_exports__BasicRenderer = __webpack_exports__.K9;
var __webpack_exports__BasicShape = __webpack_exports__.FT;
var __webpack_exports__CREEPING_FULL = __webpack_exports__.cK;
var __webpack_exports__CREEPING_OFF = __webpack_exports__._x;
var __webpack_exports__CREEPING_STRICT = __webpack_exports__.kj;
var __webpack_exports__CheckerboardMaterial = __webpack_exports__.Vz;
var __webpack_exports__Circle = __webpack_exports__.Cd;
var __webpack_exports__CircleShape = __webpack_exports__.n;
var __webpack_exports__CliffordTorus = __webpack_exports__.y7;
var __webpack_exports__CliffordTorusShape = __webpack_exports__.UQ;
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
var __webpack_exports__FlyControls = __webpack_exports__.mD;
var __webpack_exports__Fog = __webpack_exports__.yb;
var __webpack_exports__GraphPaperMaterial = __webpack_exports__.iJ;
var __webpack_exports__Group = __webpack_exports__.ZA;
var __webpack_exports__GroupElement = __webpack_exports__.Jz;
var __webpack_exports__HalfSpace = __webpack_exports__.Fr;
var __webpack_exports__HalfSpaceShape = __webpack_exports__.RM;
var __webpack_exports__HighlightLocalWrapMaterial = __webpack_exports__.fR;
var __webpack_exports__HighlightWrapMaterial = __webpack_exports__.kK;
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
var __webpack_exports__LocalCylinder = __webpack_exports__.gq;
var __webpack_exports__LocalCylinderShape = __webpack_exports__.Gj;
var __webpack_exports__LocalPointLight = __webpack_exports__.L8;
var __webpack_exports__Material = __webpack_exports__.F5;
var __webpack_exports__Matrix2 = __webpack_exports__.Uc;
var __webpack_exports__MoveVRControls = __webpack_exports__.Fh;
var __webpack_exports__MultiColorMaterial = __webpack_exports__.O5;
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
var __webpack_exports__RotatedSphericalTextureMaterial = __webpack_exports__.bY;
var __webpack_exports__SMOOTH_MAX_POLY = __webpack_exports__.cV;
var __webpack_exports__SMOOTH_MIN_POLY = __webpack_exports__.lR;
var __webpack_exports__Scene = __webpack_exports__.xs;
var __webpack_exports__Shape = __webpack_exports__.bn;
var __webpack_exports__ShootVRControls = __webpack_exports__.oC;
var __webpack_exports__SimpleTextureMaterial = __webpack_exports__.Z1;
var __webpack_exports__SingleColorMaterial = __webpack_exports__.h8;
var __webpack_exports__Solid = __webpack_exports__.Qf;
var __webpack_exports__SquaresMaterial = __webpack_exports__.k1;
var __webpack_exports__StripsMaterial = __webpack_exports__.ew;
var __webpack_exports__SwitchControls = __webpack_exports__.$p;
var __webpack_exports__TeleportationSet = __webpack_exports__.xG;
var __webpack_exports__Thurston = __webpack_exports__.qC;
var __webpack_exports__ThurstonLite = __webpack_exports__.N$;
var __webpack_exports__ThurstonVR = __webpack_exports__.TO;
var __webpack_exports__ThurstonVRWoodBalls = __webpack_exports__.g$;
var __webpack_exports__ThurstonVRWoodBallsBis = __webpack_exports__.u3;
var __webpack_exports__TransitionLocalWrapMaterial = __webpack_exports__.l_;
var __webpack_exports__TransitionWrapMaterial = __webpack_exports__.pk;
var __webpack_exports__UnionShape = __webpack_exports__.yI;
var __webpack_exports__VRCamera = __webpack_exports__.E6;
var __webpack_exports__VRRenderer = __webpack_exports__.zO;
var __webpack_exports__VaryingColorMaterial = __webpack_exports__.cB;
var __webpack_exports__Vector = __webpack_exports__.OW;
var __webpack_exports__VideoAlphaTextureMaterial = __webpack_exports__.n3;
var __webpack_exports__VideoFrameTextureMaterial = __webpack_exports__.Se;
var __webpack_exports__VideoTextureMaterial = __webpack_exports__.PQ;
var __webpack_exports__WrapShape = __webpack_exports__.$9;
var __webpack_exports__XRControllerModelFactory = __webpack_exports__.iR;
var __webpack_exports__bind = __webpack_exports__.ak;
var __webpack_exports__clamp = __webpack_exports__.uZ;
var __webpack_exports__complement = __webpack_exports__.Cy;
var __webpack_exports__earthTexture = __webpack_exports__.qM;
var __webpack_exports__highlightLocalWrap = __webpack_exports__.mV;
var __webpack_exports__highlightWrap = __webpack_exports__.Gi;
var __webpack_exports__intersection = __webpack_exports__.jV;
var __webpack_exports__marsTexture = __webpack_exports__.j9;
var __webpack_exports__moonTexture = __webpack_exports__.oc;
var __webpack_exports__pathTracerWrap = __webpack_exports__.wS;
var __webpack_exports__phongWrap = __webpack_exports__.IJ;
var __webpack_exports__poincareSet = __webpack_exports__.Ij;
var __webpack_exports__quaternionSet = __webpack_exports__.c0;
var __webpack_exports__safeString = __webpack_exports__.p2;
var __webpack_exports__sunTexture = __webpack_exports__.w0;
var __webpack_exports__transitionLocalWrap = __webpack_exports__.VL;
var __webpack_exports__transitionWrap = __webpack_exports__.UR;
var __webpack_exports__trivialSet = __webpack_exports__.dV;
var __webpack_exports__union = __webpack_exports__.G0;
var __webpack_exports__woodBallMaterial = __webpack_exports__.YL;
var __webpack_exports__wrap = __webpack_exports__.re;
export { __webpack_exports__AcesFilmPostProcess as AcesFilmPostProcess, __webpack_exports__AdvancedResetVRControls as AdvancedResetVRControls, __webpack_exports__AdvancedShape as AdvancedShape, __webpack_exports__BOTH as BOTH, __webpack_exports__Ball as Ball, __webpack_exports__BallShape as BallShape, __webpack_exports__BasicCamera as BasicCamera, __webpack_exports__BasicPTMaterial as BasicPTMaterial, __webpack_exports__BasicRenderer as BasicRenderer, __webpack_exports__BasicShape as BasicShape, __webpack_exports__CREEPING_FULL as CREEPING_FULL, __webpack_exports__CREEPING_OFF as CREEPING_OFF, __webpack_exports__CREEPING_STRICT as CREEPING_STRICT, __webpack_exports__CheckerboardMaterial as CheckerboardMaterial, __webpack_exports__Circle as Circle, __webpack_exports__CircleShape as CircleShape, __webpack_exports__CliffordTorus as CliffordTorus, __webpack_exports__CliffordTorusShape as CliffordTorusShape, __webpack_exports__CombinedPostProcess as CombinedPostProcess, __webpack_exports__ComplementShape as ComplementShape, __webpack_exports__ConstDirLight as ConstDirLight, __webpack_exports__Cylinder as Cylinder, __webpack_exports__CylinderShape as CylinderShape, __webpack_exports__DebugMaterial as DebugMaterial, __webpack_exports__DragVRControls as DragVRControls, __webpack_exports__EquidistantHypStripsMaterial as EquidistantHypStripsMaterial, __webpack_exports__EquidistantSphStripsMaterial as EquidistantSphStripsMaterial, __webpack_exports__ExpFog as ExpFog, __webpack_exports__FlyControls as FlyControls, __webpack_exports__Fog as Fog, __webpack_exports__GraphPaperMaterial as GraphPaperMaterial, __webpack_exports__Group as Group, __webpack_exports__GroupElement as GroupElement, __webpack_exports__HalfSpace as HalfSpace, __webpack_exports__HalfSpaceShape as HalfSpaceShape, __webpack_exports__HighlightLocalWrapMaterial as HighlightLocalWrapMaterial, __webpack_exports__HighlightWrapMaterial as HighlightWrapMaterial, __webpack_exports__HypStripsMaterial as HypStripsMaterial, __webpack_exports__ImprovedEquidistantHypStripsMaterial as ImprovedEquidistantHypStripsMaterial, __webpack_exports__ImprovedEquidistantSphStripsMaterial as ImprovedEquidistantSphStripsMaterial, __webpack_exports__InfoControls as InfoControls, __webpack_exports__IntersectionShape as IntersectionShape, __webpack_exports__Isometry as Isometry, __webpack_exports__IsotropicChaseVRControls as IsotropicChaseVRControls, __webpack_exports__KeyGenericControls as KeyGenericControls, __webpack_exports__LEFT as LEFT, __webpack_exports__Light as Light, __webpack_exports__LightVRControls as LightVRControls, __webpack_exports__LinearToSRGBPostProcess as LinearToSRGBPostProcess, __webpack_exports__LocalBall as LocalBall, __webpack_exports__LocalBallShape as LocalBallShape, __webpack_exports__LocalCylinder as LocalCylinder, __webpack_exports__LocalCylinderShape as LocalCylinderShape, __webpack_exports__LocalPointLight as LocalPointLight, __webpack_exports__Material as Material, __webpack_exports__Matrix2 as Matrix2, __webpack_exports__MoveVRControls as MoveVRControls, __webpack_exports__MultiColorMaterial as MultiColorMaterial, __webpack_exports__NormalMaterial as NormalMaterial, __webpack_exports__PTMaterial as PTMaterial, __webpack_exports__PathTracerCamera as PathTracerCamera, __webpack_exports__PathTracerRenderer as PathTracerRenderer, __webpack_exports__PathTracerWrapMaterial as PathTracerWrapMaterial, __webpack_exports__PhongMaterial as PhongMaterial, __webpack_exports__PhongWrapMaterial as PhongWrapMaterial, __webpack_exports__Point as Point, __webpack_exports__PointLight as PointLight, __webpack_exports__Position as Position, __webpack_exports__QuadRing as QuadRing, __webpack_exports__QuadRingElement as QuadRingElement, __webpack_exports__QuadRingMatrix4 as QuadRingMatrix4, __webpack_exports__RIGHT as RIGHT, __webpack_exports__RelPosition as RelPosition, __webpack_exports__ResetVRControls as ResetVRControls, __webpack_exports__RotatedSphericalTextureMaterial as RotatedSphericalTextureMaterial, __webpack_exports__SMOOTH_MAX_POLY as SMOOTH_MAX_POLY, __webpack_exports__SMOOTH_MIN_POLY as SMOOTH_MIN_POLY, __webpack_exports__Scene as Scene, __webpack_exports__Shape as Shape, __webpack_exports__ShootVRControls as ShootVRControls, __webpack_exports__SimpleTextureMaterial as SimpleTextureMaterial, __webpack_exports__SingleColorMaterial as SingleColorMaterial, __webpack_exports__Solid as Solid, __webpack_exports__SquaresMaterial as SquaresMaterial, __webpack_exports__StripsMaterial as StripsMaterial, __webpack_exports__SwitchControls as SwitchControls, __webpack_exports__TeleportationSet as TeleportationSet, __webpack_exports__Thurston as Thurston, __webpack_exports__ThurstonLite as ThurstonLite, __webpack_exports__ThurstonVR as ThurstonVR, __webpack_exports__ThurstonVRWoodBalls as ThurstonVRWoodBalls, __webpack_exports__ThurstonVRWoodBallsBis as ThurstonVRWoodBallsBis, __webpack_exports__TransitionLocalWrapMaterial as TransitionLocalWrapMaterial, __webpack_exports__TransitionWrapMaterial as TransitionWrapMaterial, __webpack_exports__UnionShape as UnionShape, __webpack_exports__VRCamera as VRCamera, __webpack_exports__VRRenderer as VRRenderer, __webpack_exports__VaryingColorMaterial as VaryingColorMaterial, __webpack_exports__Vector as Vector, __webpack_exports__VideoAlphaTextureMaterial as VideoAlphaTextureMaterial, __webpack_exports__VideoFrameTextureMaterial as VideoFrameTextureMaterial, __webpack_exports__VideoTextureMaterial as VideoTextureMaterial, __webpack_exports__WrapShape as WrapShape, __webpack_exports__XRControllerModelFactory as XRControllerModelFactory, __webpack_exports__bind as bind, __webpack_exports__clamp as clamp, __webpack_exports__complement as complement, __webpack_exports__earthTexture as earthTexture, __webpack_exports__highlightLocalWrap as highlightLocalWrap, __webpack_exports__highlightWrap as highlightWrap, __webpack_exports__intersection as intersection, __webpack_exports__marsTexture as marsTexture, __webpack_exports__moonTexture as moonTexture, __webpack_exports__pathTracerWrap as pathTracerWrap, __webpack_exports__phongWrap as phongWrap, __webpack_exports__poincareSet as poincareSet, __webpack_exports__quaternionSet as quaternionSet, __webpack_exports__safeString as safeString, __webpack_exports__sunTexture as sunTexture, __webpack_exports__transitionLocalWrap as transitionLocalWrap, __webpack_exports__transitionWrap as transitionWrap, __webpack_exports__trivialSet as trivialSet, __webpack_exports__union as union, __webpack_exports__woodBallMaterial as woodBallMaterial, __webpack_exports__wrap as wrap };
