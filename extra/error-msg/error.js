exports.Log = (...args) => {
    console.error('[Error]');
    for (i = 0; i < args.length; i++) {
        console.error('[' + args[i] + ']\n');
        if (args[i].stack !== undefined) console.error(args[i].stack);
    }
};
