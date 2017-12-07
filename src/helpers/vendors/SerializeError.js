// Credits: https://github.com/sindresorhus/serialize-error

'use strict';

module.exports = value => {
	if (typeof value === 'object') {
		return destroyCircular(value, []);
	}

	// People sometimes throw things besides Error objects, so…

	if (typeof value === 'function') {
		// JSON.stringify discards functions. We do too, unless a function is thrown directly.
		return `[Function: ${(value.name || 'anonymous')}]`;
	}

	return value;
};

// https://www.npmjs.com/package/destroy-circular
function destroyCircular(from, seen) {
	const to = Array.isArray(from) ? [] : {};

	seen.push(from);

	for (const key of Object.keys(from)) {
		const value = from[key];

		if (typeof value === 'function') {
			continue;
		}

		if (!value || typeof value !== 'object') {
			to[key] = value;
			continue;
		}

		if (seen.indexOf(from[key]) === -1) {
			to[key] = destroyCircular(from[key], seen.slice(0));
			continue;
		}

		to[key] = '[Circular]';
	}

	if (typeof from.name === 'string') {
		to.name = from.name;
	}

	if (typeof from.message === 'string') {
		to.message = from.message;
	}

	if (typeof from.stack === 'string') {
		to.stack = from.stack;
	}

	return to;
}