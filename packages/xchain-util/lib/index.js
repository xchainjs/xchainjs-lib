'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var BigNumber = require('bignumber.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var BigNumber__default = /*#__PURE__*/_interopDefaultLegacy(BigNumber);

/**
 * Helper to delay anything within an `async` function
 *
 * @param ms delay in milliseconds
 *
 * @example
 *
 * const anyAsyncFunc = async () => {
 *  // do something
 *  console.log('before delay')
 *  // wait for 200ms
 *  await delay(200)
 *  // and do other things
 *  console.log('after delay')
 * }
 */
var delay = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };

/**
 * Shortcut to create a BigNumber
 */
var bn = function (value) { return new BigNumber__default['default'](value); };
/**
 * Helper to check whether a BigNumber is valid or not
 * */
var isValidBN = function (value) { return !value.isNaN(); };
/**
 * Helper to create a big number from string or number
 * If it fails to create a big number, a big number with value 0 will be returned instead
 * */
var bnOrZero = function (value) {
    var b = value ? bn(value) : bn(0);
    return isValidBN(b) ? b : bn(0);
};
/**
 * Helper to validate a possible BigNumber
 * If the given valie is invalid or undefined, 0 is returned as a BigNumber
 */
var validBNOrZero = function (value) { return (value && isValidBN(value) ? value : bn(0)); };
/**
 * Format a BaseNumber to a string depending on given decimal places
 * */
var formatBN = function (value, decimalPlaces) {
    if (decimalPlaces === void 0) { decimalPlaces = 2; }
    return value.toFormat(decimalPlaces);
};
var SymbolPosition;
(function (SymbolPosition) {
    SymbolPosition["BEFORE"] = "before";
    SymbolPosition["AFTER"] = "after";
})(SymbolPosition || (SymbolPosition = {}));
/**
 * Formats a big number value by prefixing it with `$`
 */
var formatBNCurrency = function (n, decimalPlaces, symbol, position) {
    if (decimalPlaces === void 0) { decimalPlaces = 2; }
    if (symbol === void 0) { symbol = '$'; }
    if (position === void 0) { position = SymbolPosition.BEFORE; }
    var value = formatBN(n, decimalPlaces);
    if (position === SymbolPosition.BEFORE) {
        return "" + symbol + value;
    }
    return "" + value + symbol;
};
/**
 * Helper to get a fixed `BigNumber`
 * Returns zero `BigNumber` if `value` is invalid
 * */
var fixedBN = function (value, decimalPlaces) {
    if (decimalPlaces === void 0) { decimalPlaces = 2; }
    var n = bn(value || 0);
    var fixedBN = isValidBN(n) ? n.toFixed(decimalPlaces) : bn(0).toFixed(decimalPlaces);
    return bn(fixedBN);
};

/**
 * Removes leading / trailing zeros from a string of numbers
 * (1) Regex to remove trailing zeros https://stackoverflow.com/a/53397618/2032698
 * (2) Regex to remove leading zeros https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch06s06.html
 */
var trimZeros = function (value) {
    return value
        // (1) remove trailing zeros
        .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
        // (2) remove leading zeros
        .replace(/\b0*([1-9][0-9]*|0)\b/, '$1');
};

/**
 * Chains
 *
 * Based on definition in Thorchain `common`
 * https://gitlab.com/thorchain/thornode/-/blob/master/common/chain.go#L15-18
 */
var BNBChain = 'BNB';
var BTCChain = 'BTC';
var ETHChain = 'ETH';
var THORChain = 'THOR';
/**
 * All possible chains Thornode currently supports (or plan to support in near future)
 * */
var chains = [BNBChain, BTCChain, ETHChain, THORChain];

/**
 * Type guard to check whether string  is based on type `Chain`
 */
var isChain = function (c) { return chains.includes(c); };
var chainToString = function (chainId) {
    switch (chainId) {
        case 'THOR':
            return 'Thorchain';
        case 'BTC':
            return 'Bitcoin';
        case 'ETH':
            return 'Ethereum';
        case 'BNB':
            return 'Binance Chain';
        default:
            return 'unknown chain';
    }
};

(function (Denomination) {
    /**
     * values for asset amounts in base units (no decimal)
     */
    Denomination["BASE"] = "BASE";
    /**
     * values of asset amounts (w/ decimal)
     */
    Denomination["ASSET"] = "ASSET";
})(exports.Denomination || (exports.Denomination = {}));

/**
 * Default number of asset decimals
 *
 * For history reason and by starting the project on Binance chain assets, it's 8 decimal.
 *
 * For example:
 * RUNE has a maximum of 8 digits of decimal
 * 0.00000001 RUNE == 1 ð (tor)
 * */
var ASSET_DECIMAL = 8;
/**
 * Factory to create values of assets (e.g. RUNE)
 *
 * @param value - Asset amount - If the value is undefined, AssetAmount with value `0` will be returned
 * @param decimal (optional) - Decimal places - default 8
 *
 **/
var assetAmount = function (value, decimal) {
    if (decimal === void 0) { decimal = ASSET_DECIMAL; }
    return ({
        type: exports.Denomination.ASSET,
        amount: function () { return fixedBN(value, decimal); },
        decimal: decimal,
    });
};
/**
 * Factory to create base amounts (e.g. tor)
 *
 * @param value - Base amount - If the value is undefined, BaseAmount with value `0` will be returned
 * @param decimal - Decimal places - default 8
 *
 **/
var baseAmount = function (value, decimal) {
    if (decimal === void 0) { decimal = ASSET_DECIMAL; }
    return ({
        type: exports.Denomination.BASE,
        amount: function () { return fixedBN(value, 0); },
        decimal: decimal,
    });
};
/**
 * Helper to convert values for a asset from base values (e.g. RUNE from tor)
 * */
var baseToAsset = function (base) {
    var decimal = base.decimal;
    var value = base
        .amount()
        .div(Math.pow(10, decimal))
        .decimalPlaces(decimal);
    return assetAmount(value, decimal);
};
/**
 * Helper to convert asset to base values (e.g. tor -> RUNE)
 * */
var assetToBase = function (asset) {
    var value = asset
        .amount()
        .multipliedBy(Math.pow(10, asset.decimal))
        .integerValue();
    return baseAmount(value);
};
/**
 * Guard to check whether value is an amount of asset or not
 * */
var isAssetAmount = function (v) { return v.type === exports.Denomination.ASSET; };
/**
 * Guard to check whether value is an amount of a base value or not
 * */
var isBaseAmount = function (v) { return v.type === exports.Denomination.BASE; };
/**
 * Formats an `AssetAmount` into `string` based on decimal places
 *
 * If `decimal` is not set, `amount.decimal` is used
 * Note: `trimZeros` wins over `decimal`
 */
var formatAssetAmount = function (_a) {
    var amount = _a.amount, decimal = _a.decimal, _b = _a.trimZeros, trimZeros$1 = _b === void 0 ? false : _b;
    var formatted = formatBN(amount.amount(), decimal || amount.decimal);
    // Note: `trimZeros` wins over `decimal`
    return trimZeros$1 ? trimZeros(formatted) : formatted;
};
/**
 * Formats a `BaseAmount` value into a `string`
 */
var formatBaseAmount = function (amount) { return formatBN(amount.amount(), 0); };
/**
 * Base "chain" assets
 *
 * Based on definition in Thorchain `common`
 * see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
var AssetBNB = { chain: BNBChain, symbol: 'BNB', ticker: 'BNB' };
var AssetBTC = { chain: BTCChain, symbol: 'BTC', ticker: 'BTC' };
var AssetETH = { chain: ETHChain, symbol: 'ETH', ticker: 'ETH' };
var RUNE_TICKER = 'RUNE';
// Rune67CAsset RUNE on Binance test net
var AssetRune67C = { chain: BNBChain, symbol: 'RUNE-67C', ticker: RUNE_TICKER };
// RuneB1AAsset RUNE on Binance main net
var AssetRuneB1A = { chain: BNBChain, symbol: 'RUNE-B1A', ticker: RUNE_TICKER };
var AssetRuneNative = { chain: THORChain, symbol: RUNE_TICKER, ticker: RUNE_TICKER };
/**
 * Helper to check whether asset is valid
 */
var isValidAsset = function (a) { return !!a.chain && !!a.ticker && !!a.symbol; };
/**
 * Creates an `Asset` by a given string
 *
 * This helper function expects a string with following naming convention:
 * `AAA.BBB-CCC`
 * where
 * chain: `AAA`
 * ticker (optional): `BBB`
 * symbol: `BBB-CCC` or `CCC` (if no ticker available)
 *
 * @see  https://docs.thorchain.org/developers/transaction-memos#asset-notation
 *
 * If the naming convention fails, it returns null
 */
var assetFromString = function (s) {
    var _a;
    var data = s.split('.');
    if (data.length <= 1 || ((_a = data[1]) === null || _a === void 0 ? void 0 : _a.length) < 1) {
        return null;
    }
    var chain = data[0];
    // filter out not supported string of chains
    if (!chain || !isChain(chain))
        return null;
    var symbol = data[1];
    var ticker = symbol.split('-')[0];
    return { chain: chain, symbol: symbol, ticker: ticker };
};
/**
 * Returns an `Asset` as a string using following naming convention:
 *
 * `AAA.BBB-CCC`
 * where
 * chain: `AAA`
 * ticker (optional): `BBB`
 * symbol: `BBB-CCC` or `CCC` (if no ticker available)
 *
 * @see https://docs.thorchain.org/developers/transaction-memos#asset-notation
 *
 */
var assetToString = function (_a) {
    var chain = _a.chain, symbol = _a.symbol;
    return chain + "." + symbol;
};
(function (AssetCurrencySymbol) {
    AssetCurrencySymbol["RUNE"] = "\u16B1";
    AssetCurrencySymbol["BTC"] = "\u20BF";
    AssetCurrencySymbol["SATOSHI"] = "\u26A1";
    AssetCurrencySymbol["ETH"] = "\u039E";
    AssetCurrencySymbol["USD"] = "$";
})(exports.AssetCurrencySymbol || (exports.AssetCurrencySymbol = {}));
/**
 * Returns currency symbols by givven `Asset`
 */
var currencySymbolByAsset = function (_a) {
    var ticker = _a.ticker;
    switch (true) {
        case ticker === RUNE_TICKER:
            return exports.AssetCurrencySymbol.RUNE;
        case ticker === AssetBTC.ticker:
            return exports.AssetCurrencySymbol.BTC;
        case ticker === AssetETH.ticker:
            return exports.AssetCurrencySymbol.ETH;
        case ticker.includes('USD'):
            return exports.AssetCurrencySymbol.USD;
        default:
            return ticker;
    }
};
/**
 * Formats an asset amount using its currency symbol
 *
 * If `decimal` is not set, `amount.decimal` is used
 * If `asset` is not set, `$` will be used as currency symbol by default
 * `trimZeros` is `false` by default
 * Note: `trimZeros` wins over `decimal`
 */
var formatAssetAmountCurrency = function (_a) {
    var _b;
    var amount = _a.amount, asset = _a.asset, decimal = _a.decimal, _c = _a.trimZeros, shouldTrimZeros = _c === void 0 ? false : _c;
    var amountFormatted = formatAssetAmount({ amount: amount, decimal: decimal || amount.decimal, trimZeros: shouldTrimZeros });
    var ticker = (_b = asset === null || asset === void 0 ? void 0 : asset.ticker) !== null && _b !== void 0 ? _b : '';
    if (ticker) {
        // RUNE
        var regex = new RegExp(AssetRune67C.ticker + "|" + AssetRuneB1A.ticker + "|" + AssetRuneNative.ticker, 'i');
        if (ticker.match(regex))
            return exports.AssetCurrencySymbol.RUNE + " " + amountFormatted;
        // BTC
        regex = new RegExp(AssetBTC.ticker, 'i');
        if (ticker.match(new RegExp(AssetBTC.ticker, 'i'))) {
            var base = assetToBase(amount);
            // format all < ₿ 0.01 in statoshi
            if (base.amount().isLessThanOrEqualTo('1000000')) {
                return exports.AssetCurrencySymbol.SATOSHI + " " + formatBaseAmount(base);
            }
            return exports.AssetCurrencySymbol.BTC + " " + amountFormatted;
        }
        // ETH
        regex = new RegExp(AssetETH.ticker, 'i');
        if (ticker.match(regex))
            return exports.AssetCurrencySymbol.ETH + " " + amountFormatted;
        // USD
        regex = new RegExp('USD', 'i');
        if (ticker.match('USD'))
            return exports.AssetCurrencySymbol.USD + " " + amountFormatted;
        return amountFormatted + " (" + ticker + ")";
    }
    return "$ " + amountFormatted;
};
/**
 * Formats a `BaseAmount` into a string of an `AssetAmount`
 *
 * If `decimal` is not set, `amount.decimal` is used
 * Note: `trimZeros` wins over `decimal`
 */
var formatBaseAsAssetAmount = function (_a) {
    var amount = _a.amount, decimal = _a.decimal, _b = _a.trimZeros, trimZeros = _b === void 0 ? false : _b;
    return formatAssetAmount({ amount: baseToAsset(amount), decimal: decimal, trimZeros: trimZeros });
};

var getSwapOutput = function (inputAmount, pool, toRune) {
    // formula: (x * X * Y) / (x + X) ^ 2
    var x = inputAmount.amount();
    var X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount(); // input is asset if toRune
    var Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount(); // output is rune if toRune
    var numerator = x.times(X).times(Y);
    var denominator = x.plus(X).pow(2);
    var result = numerator.div(denominator);
    return baseAmount(result);
};
var getSwapOutputWithFee = function (inputAmount, pool, toRune, transactionFee) {
    if (transactionFee === void 0) { transactionFee = assetToBase(assetAmount(1)); }
    // formula: getSwapOutput() - one RUNE
    var x = inputAmount.amount();
    var r = getSwapOutput(inputAmount, pool, toRune);
    var poolAfterTransaction = toRune // used to get rune fee price after swap
        ? {
            assetBalance: baseAmount(pool.assetBalance.amount().plus(x)),
            runeBalance: baseAmount(pool.runeBalance.amount().minus(r.amount())),
        }
        : {
            runeBalance: baseAmount(pool.runeBalance.amount().plus(x)),
            assetBalance: baseAmount(pool.assetBalance.amount().minus(r.amount())),
        };
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    var runeFee = toRune ? transactionFee : getValueOfRuneInAsset(transactionFee, poolAfterTransaction); // toRune its one Rune else its asset(oneRune)
    var result = r.amount().minus(runeFee.amount()); // remove oneRune, or remove asset(oneRune)
    return baseAmount(result);
};
var getSwapInput = function (toRune, pool, outputAmount) {
    // formula: (((X*Y)/y - 2*X) - sqrt(((X*Y)/y - 2*X)^2 - 4*X^2))/2
    // (part1 - sqrt(part1 - part2))/2
    var X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount(); // input is asset if toRune
    var Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount(); // output is rune if toRune
    var y = outputAmount.amount();
    var part1 = X.times(Y).div(y).minus(X.times(2));
    var part2 = X.pow(2).times(4);
    var result = part1.minus(part1.pow(2).minus(part2).sqrt()).div(2);
    return baseAmount(result);
};
var getSwapSlip = function (inputAmount, pool, toRune) {
    // formula: (x) / (x + X)
    var x = inputAmount.amount();
    var X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount(); // input is asset if toRune
    var result = x.div(x.plus(X));
    return result;
};
var getSwapFee = function (inputAmount, pool, toRune) {
    // formula: (x * x * Y) / (x + X) ^ 2
    var x = inputAmount.amount();
    var X = toRune ? pool.assetBalance.amount() : pool.runeBalance.amount(); // input is asset if toRune
    var Y = toRune ? pool.runeBalance.amount() : pool.assetBalance.amount(); // output is rune if toRune
    var numerator = x.times(x).multipliedBy(Y);
    var denominator = x.plus(X).pow(2);
    var result = numerator.div(denominator);
    return baseAmount(result);
};
var getValueOfAssetInRune = function (inputAsset, pool) {
    // formula: ((a * R) / A) => R per A (Runeper$)
    var t = inputAsset.amount();
    var R = pool.runeBalance.amount();
    var A = pool.assetBalance.amount();
    var result = t.times(R).div(A);
    return baseAmount(result);
};
var getValueOfRuneInAsset = function (inputRune, pool) {
    // formula: ((r * A) / R) => A per R ($perRune)
    var r = inputRune.amount();
    var R = pool.runeBalance.amount();
    var A = pool.assetBalance.amount();
    var result = r.times(A).div(R);
    return baseAmount(result);
};
var getDoubleSwapOutput = function (inputAmount, pool1, pool2) {
    // formula: getSwapOutput(pool1) => getSwapOutput(pool2)
    var r = getSwapOutput(inputAmount, pool1, true);
    var output = getSwapOutput(r, pool2, false);
    return output;
};
var getDoubleSwapOutputWithFee = function (inputAmount, pool1, pool2, transactionFee) {
    if (transactionFee === void 0) { transactionFee = assetToBase(assetAmount(1)); }
    // formula: (getSwapOutput(pool1) => getSwapOutput(pool2)) - runeFee
    var r = getSwapOutput(inputAmount, pool1, true);
    var output = getSwapOutput(r, pool2, false);
    var poolAfterTransaction = {
        runeBalance: baseAmount(pool2.runeBalance.amount().plus(r.amount())),
        assetBalance: baseAmount(pool2.assetBalance.amount().minus(output.amount())),
    };
    var runeFee = getValueOfRuneInAsset(transactionFee, poolAfterTransaction); // asset(oneRune)
    var result = output.amount().minus(runeFee.amount()); // remove asset(oneRune)
    return baseAmount(result);
};
var getDoubleSwapInput = function (pool1, pool2, outputAmount) {
    // formula: getSwapInput(pool2) => getSwapInput(pool1)
    var y = getSwapInput(false, pool2, outputAmount);
    var x = getSwapInput(true, pool1, y);
    return x;
};
var getDoubleSwapSlip = function (inputAmount, pool1, pool2) {
    // formula: getSwapSlip1(input1) + getSwapSlip2(getSwapOutput1 => input2)
    var swapSlip1 = getSwapSlip(inputAmount, pool1, true);
    var r = getSwapOutput(inputAmount, pool1, true);
    var swapSlip2 = getSwapSlip(r, pool2, false);
    var result = swapSlip1.plus(swapSlip2);
    return result;
};
var getDoubleSwapFee = function (inputAmount, pool1, pool2) {
    // formula: getSwapFee1 + getSwapFee2
    var fee1 = getSwapFee(inputAmount, pool1, true);
    var r = getSwapOutput(inputAmount, pool1, true);
    var fee2 = getSwapFee(r, pool2, false);
    var fee1Asset = getValueOfRuneInAsset(fee1, pool2);
    var result = fee2.amount().plus(fee1Asset.amount());
    return baseAmount(result);
};
var getValueOfAsset1InAsset2 = function (inputAsset, pool1, pool2) {
    // formula: (A2 / R) * (R / A1) => A2/A1 => A2 per A1 ($ per Asset)
    var oneAsset = assetToBase(assetAmount(1));
    // Note: All calculation needs to be done in `AssetAmount` (not `BaseAmount`)
    var A2perR = baseToAsset(getValueOfRuneInAsset(oneAsset, pool2));
    var RperA1 = baseToAsset(getValueOfAssetInRune(inputAsset, pool1));
    var result = A2perR.amount().times(RperA1.amount());
    // transform result back from `AssetAmount` into `BaseAmount`
    return assetToBase(assetAmount(result));
};

var getStakeUnits = function (stake, pool) {
    // formula: ((R + T) (r T + R t))/(4 R T)
    // part1 * (part2 + part3) / denominator
    var r = stake.rune.amount();
    var t = stake.asset.amount();
    var R = pool.runeBalance.amount().plus(r); // Must add r first
    var T = pool.assetBalance.amount().plus(t); // Must add t first
    var part1 = R.plus(T);
    var part2 = r.times(T);
    var part3 = R.times(t);
    var numerator = part1.times(part2.plus(part3));
    var denominator = R.times(T).times(4);
    var result = numerator.div(denominator);
    return baseAmount(result);
};
var getPoolShare = function (unitData, pool) {
    // formula: (rune * part) / total; (asset * part) / total
    var units = unitData.stakeUnits.amount();
    var total = unitData.totalUnits.amount();
    var R = pool.runeBalance.amount();
    var T = pool.assetBalance.amount();
    var asset = T.times(units).div(total);
    var rune = R.times(units).div(total);
    var stakeData = {
        asset: baseAmount(asset),
        rune: baseAmount(rune),
    };
    return stakeData;
};
var getSlipOnStake = function (stake, pool) {
    // formula: (t * R - T * r)/ (T*r + R*T)
    var r = stake.rune.amount();
    var t = stake.asset.amount();
    var R = pool.runeBalance.amount();
    var T = pool.assetBalance.amount();
    var numerator = t.times(R).minus(T.times(r));
    var denominator = T.times(r).plus(R.times(T));
    var result = numerator.div(denominator).abs();
    return result;
};

/**
 * Memo to swap
 *
 * @param asset Asset to swap
 * @param address Destination `address` to swap and send to someone. If `address` is emtpy, it sends back to self
 * @param limit Price protection. If the value isn't achieved then it is refunded.
 * ie, set 10000000 to be garuanteed a minimum of 1 full asset.
 * If LIM is ommitted, then there is no price protection
 *
 * @see https://docs.thorchain.org/developers/transaction-memos#transactions
 */
var getSwapMemo = function (_a) {
    var _b;
    var _c = _a.asset, chain = _c.chain, symbol = _c.symbol, _d = _a.address, address = _d === void 0 ? '' : _d, limit = _a.limit;
    return "SWAP:" + chain + "." + symbol + ":" + address + ":" + ((_b = limit === null || limit === void 0 ? void 0 : limit.amount().toString()) !== null && _b !== void 0 ? _b : '');
};
/**
 * Memo to deposit
 *
 * @param asset Asset to deposit into a specified pool
 * @param address (optional) For cross-chain deposits, an address is needed to cross-reference addresses
 * @see https://docs.thorchain.org/developers/transaction-memos#transactions
 */
var getDepositMemo = function (_a, address) {
    var chain = _a.chain, symbol = _a.symbol;
    if (address === void 0) { address = ''; }
    return "STAKE:" + chain + "." + symbol + ":" + address;
};
/**
 * Memo to withdraw
 *
 * @param asset Asset to withdraw from a pool
 * @param percent Percent is in basis points (0-10000, where 10000=100%)
 *
 * @see https://docs.thorchain.org/developers/transaction-memos#transactions
 */
var getWithdrawMemo = function (_a, percent) {
    var chain = _a.chain, symbol = _a.symbol;
    return "WITHDRAW:" + chain + "." + symbol + ":" + percent.toString();
};

exports.AssetBNB = AssetBNB;
exports.AssetBTC = AssetBTC;
exports.AssetETH = AssetETH;
exports.AssetRune67C = AssetRune67C;
exports.AssetRuneB1A = AssetRuneB1A;
exports.AssetRuneNative = AssetRuneNative;
exports.BNBChain = BNBChain;
exports.BTCChain = BTCChain;
exports.ETHChain = ETHChain;
exports.RUNE_TICKER = RUNE_TICKER;
exports.THORChain = THORChain;
exports.assetAmount = assetAmount;
exports.assetFromString = assetFromString;
exports.assetToBase = assetToBase;
exports.assetToString = assetToString;
exports.baseAmount = baseAmount;
exports.baseToAsset = baseToAsset;
exports.bn = bn;
exports.bnOrZero = bnOrZero;
exports.chainToString = chainToString;
exports.chains = chains;
exports.currencySymbolByAsset = currencySymbolByAsset;
exports.delay = delay;
exports.fixedBN = fixedBN;
exports.formatAssetAmount = formatAssetAmount;
exports.formatAssetAmountCurrency = formatAssetAmountCurrency;
exports.formatBN = formatBN;
exports.formatBNCurrency = formatBNCurrency;
exports.formatBaseAmount = formatBaseAmount;
exports.formatBaseAsAssetAmount = formatBaseAsAssetAmount;
exports.getDepositMemo = getDepositMemo;
exports.getDoubleSwapFee = getDoubleSwapFee;
exports.getDoubleSwapInput = getDoubleSwapInput;
exports.getDoubleSwapOutput = getDoubleSwapOutput;
exports.getDoubleSwapOutputWithFee = getDoubleSwapOutputWithFee;
exports.getDoubleSwapSlip = getDoubleSwapSlip;
exports.getPoolShare = getPoolShare;
exports.getSlipOnStake = getSlipOnStake;
exports.getStakeUnits = getStakeUnits;
exports.getSwapFee = getSwapFee;
exports.getSwapInput = getSwapInput;
exports.getSwapMemo = getSwapMemo;
exports.getSwapOutput = getSwapOutput;
exports.getSwapOutputWithFee = getSwapOutputWithFee;
exports.getSwapSlip = getSwapSlip;
exports.getValueOfAsset1InAsset2 = getValueOfAsset1InAsset2;
exports.getValueOfAssetInRune = getValueOfAssetInRune;
exports.getValueOfRuneInAsset = getValueOfRuneInAsset;
exports.getWithdrawMemo = getWithdrawMemo;
exports.isAssetAmount = isAssetAmount;
exports.isBaseAmount = isBaseAmount;
exports.isChain = isChain;
exports.isValidAsset = isValidAsset;
exports.isValidBN = isValidBN;
exports.trimZeros = trimZeros;
exports.validBNOrZero = validBNOrZero;
//# sourceMappingURL=index.js.map
