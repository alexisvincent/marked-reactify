var React = require('react');

var tok = function () {
    switch (this.token.type) {
        case 'space':
        {
            return [];
        }
        case 'hr':
        {
            return React.DOM.hr(null, null);
        }
        case 'heading':
        {
            return React.DOM['h' + this.token.depth](null,
                this.inline.output(this.token.text)
            );
        }
        case 'code':
        {
            if (this.options.highlight) {
                var code = this.options.highlight(this.token.text, this.token.lang);
                if (code != null && code !== this.token.text) {
                    this.token.escaped = true;
                    this.token.text = code;
                }
            }

            return React.DOM.pre(null, React.DOM.code({
                className: this.token.lang
                    ? this.options.langPrefix + this.token.lang
                    : '',
                dangerouslySetInnerHTML: {__html: this.token.text}
            }));

            console.log(this.token.text);
        }
        case 'table':
        {
            var table = []
                , body = []
                , row = []
                , heading
                , i
                , cells
                , j;

            // header
            for (i = 0; i < this.token.header.length; i++) {
                heading = this.inline.output(this.token.header[i]);
                row.push(React.DOM.th(
                    this.token.align[i]
                        ? {style: {textAlign: this.token.align[i]}}
                        : null,
                    heading
                ));
            }
            table.push(React.DOM.thead(null, React.DOM.tr(null, row)));

            // body
            for (i = 0; i < this.token.cells.length; i++) {
                row = [];
                cells = this.token.cells[i];
                for (j = 0; j < cells.length; j++) {
                    row.push(React.DOM.td(
                        this.token.align[j]
                            ? {style: {textAlign: this.token.align[j]}}
                            : null,
                        this.inline.output(cells[j])
                    ));
                }
                body.push(React.DOM.tr(null, row));
            }
            table.push(React.DOM.tbody(null, body));

            return React.DOM.table(null, table);
        }
        case 'blockquote_start':
        {
            var body = [];

            while (this.next().type !== 'blockquote_end') {
                body.push(this.tok());
            }

            return React.DOM.blockquote(null, body);
        }
        case 'list_start':
        {
            var type = this.token.ordered ? 'ol' : 'ul'
                , body = [];

            while (this.next().type !== 'list_end') {
                body.push(this.tok());
            }

            return React.DOM[type](null, body);
        }
        case 'list_item_start':
        {
            var body = [];

            while (this.next().type !== 'list_item_end') {
                body.push(this.token.type === 'text'
                    ? this.parseText()
                    : this.tok());
            }

            return React.DOM.li(null, body);
        }
        case 'loose_item_start':
        {
            var body = [];

            while (this.next().type !== 'list_item_end') {
                body.push(this.tok());
            }

            return React.DOM.li(null, body);
        }
        case 'html':
        {
            return !this.token.pre && !this.options.pedantic
                ? this.inline.output(this.token.text)
                : this.token.text;
        }
        case 'paragraph':
        {
            return this.options.paragraphFn
                ? this.options.paragraphFn.call(null, this.inline.output(this.token.text))
                : React.DOM.p(null, this.inline.output(this.token.text));
        }
        case 'text':
        {
            return this.options.paragraphFn
                ? this.options.paragraphFn.call(null, this.parseText())
                : React.DOM.p(null, this.parseText());
        }
    }
};

var marked_reactify = function (marked, wrapper_config) {

    marked.InlineLexer.prototype.sanitizeUrl = function(url) {
        if (marked.options.sanitize) {
            try {
                var prot = decodeURIComponent(url)
                    .replace(/[^A-Za-z0-9:]/g, '')
                    .toLowerCase();
                if (prot.indexOf('javascript:') === 0) {
                    return '#';
                }
            } catch (e) {
                return '#';
            }
        }
        return url;
    };

    marked.InlineLexer.prototype.output = function (src) {
        var out = []
            , link
            , text
            , href
            , cap;

        while (src) {
            // escape
            if (cap = this.rules.escape.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(cap[1]);
                continue;
            }
            // autolink
            if (cap = this.rules.autolink.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[2] === '@') {
                    text = cap[1][6] === ':'
                        ? cap[1].substring(7)
                        : cap[1];
                    href = 'mailto:' + text;
                } else {
                    text = cap[1];
                    href = text;
                }
                out.push(React.DOM.a({href: marked.InlineLexer.prototype.sanitizeUrl(href)}, text));
                continue;
            }

            // url (gfm)
            if (cap = this.rules.url.exec(src)) {
                src = src.substring(cap[0].length);
                text = cap[1];
                href = text;
                out.push(React.DOM.a({href: marked.InlineLexer.prototype.sanitizeUrl(href)}, text));
                continue;
            }

            // tag
            if (cap = this.rules.tag.exec(src)) {
                src = src.substring(cap[0].length);
                // TODO(alpert): Don't escape if sanitize is false
                out.push(cap[0]);
                continue;
            }

            // link
            if (cap = this.rules.link.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(this.outputLink(cap, {
                    href: cap[2],
                    title: cap[3]
                }));
                continue;
            }

            // reflink, nolink
            if ((cap = this.rules.reflink.exec(src))
                || (cap = this.rules.nolink.exec(src))) {
                src = src.substring(cap[0].length);
                link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
                link = this.links[link.toLowerCase()];
                if (!link || !link.href) {
                    out.push.apply(out, this.output(cap[0][0]));
                    src = cap[0].substring(1) + src;
                    continue;
                }
                out.push(this.outputLink(cap, link));
                continue;
            }

            // strong
            if (cap = this.rules.strong.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(React.DOM.strong(null, this.output(cap[2] || cap[1])));
                continue;
            }

            // em
            if (cap = this.rules.em.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(React.DOM.em(null, this.output(cap[2] || cap[1])));
                continue;
            }

            // code
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(React.DOM.code(null, cap[2]));
                continue;
            }

            // br
            if (cap = this.rules.br.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(React.DOM.br(null, null));
                continue;
            }

            // del (gfm)
            if (cap = this.rules.del.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(React.DOM.del(null, this.output(cap[1])));
                continue;
            }

            // text
            if (cap = this.rules.text.exec(src)) {
                src = src.substring(cap[0].length);
                out.push(this.smartypants(cap[0]));
                continue;
            }

            if (src) {
                throw new
                    Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }

        return out;
    };

    marked.InlineLexer.prototype.outputLink = function (cap, link) {
        if (cap[0][0] !== '!') {
            return React.DOM.a({
                //href: marked.InlineLexer.prototype.sanitizeUrl(link.href),
                href: link.href,
                title: link.title
            }, this.output(cap[1]));
        } else {
            return React.DOM.img({
                src: marked.InlineLexer.prototype.sanitizeUrl(link.href),
                alt: cap[1],
                title: link.title
            }, null);
        }
    };

    //Inhere as we need to refer to marked.InlineLexer
    marked.Parser.prototype.parse = function (src) {
        this.inline = new marked.InlineLexer(src.links, this.options);
        this.tokens = src.reverse();

        var out = [];
        while (this.next()) {
            out.push(this.tok());
        }

        return out;
    };

    marked.Parser.prototype.tok = tok;

    return function (markdown, config) {
        return React.DOM.div({}, marked(markdown, config))
    };
}

module.exports = marked_reactify;
