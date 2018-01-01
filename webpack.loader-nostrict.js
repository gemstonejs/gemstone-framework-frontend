/*
**  GemstoneJS -- Gemstone JavaScript Technology Stack
**  Copyright (c) 2016-2018 Gemstone Project <http://gemstonejs.com>
**  Licensed under Apache License 2.0 <https://spdx.org/licenses/Apache-2.0>
*/

module.exports = function (content) {
    this.cacheable(true)
    content = content
        .replace(/"use strict";?/g, "")
        .replace(/'use strict';?/g, "")
    return content
}

