
exports.escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
exports.containsRegex = (str) => new RegExp(exports.escapeRegex(str), 'i');
