import { toBitcoinJS } from "../src/coininfo";

describe('coininfo', () => {
    describe('test litecoin', () => {
        it('test mainnet ok', () => {
            const result = toBitcoinJS('litecoin', 'main');
            expect(result).toEqual({
                messagePrefix: "\u0019Litecoin Signed Message:\n",
                bech32: "ltc",
                bip32: {
                    public: 27108450,
                    private: 27106558,
                },
                pubKeyHash: 48,
                scriptHash: 50,
                wif: 176,
                dustThreshold: null,
            });
        });

        it('test testnet ok', () => {
            const result = toBitcoinJS('litecoin', 'test');
            expect(result).toEqual({
                messagePrefix: "\u0019Litecoin Signed Message:\n",
                bech32: "tltc",
                bip32: {
                    public: 70711009,
                    private: 70709117,
                },
                pubKeyHash: 111,
                scriptHash: 58,
                wif: 239,
                dustThreshold: null,
            });
        });
    });

    describe('test doge', () => {
        it('test mainnet ok', () => {
            const result = toBitcoinJS('dogecoin', 'main');
            expect(result).toEqual({
                messagePrefix: "\u0019Dogecoin Signed Message:\n",
                bech32: undefined,
                bip32: {
                    public: 49990397,
                    private: 49988504,
                },
                pubKeyHash: 30,
                scriptHash: 22,
                wif: 158,
                dustThreshold: null,
            });
        });

        it('test testnet ok', () => {
            const result = toBitcoinJS('dogecoin', 'test');
            expect(result).toEqual({
                messagePrefix: "\u0019Dogecoin Signed Message:\n",
                bech32: undefined,
                bip32: {
                    public: 70617039,
                    private: 70615956,
                },
                pubKeyHash: 113,
                scriptHash: 196,
                wif: 241,
                dustThreshold: null,
            });
        });
    });
});
