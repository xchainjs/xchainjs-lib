export class BlockFrostAPI {
  addresses(address: string) {
    if (
      address ===
      'addr1zyq0kyrml023kwjk8zr86d5gaxrt5w8lxnah8r6m6s4jp4g3r6dxnzml343sx8jweqn4vn3fz2kj8kgu9czghx0jrsyqqktyhv'
    ) {
      return {
        address,
        amount: [
          {
            unit: 'lovelace',
            quantity: '133884551384',
          },
          {
            unit: '000ffeb007da43324aefe044555fbe5bc469c38aa5063f95dc2ff72a536e656b2052657761726473',
            quantity: '1',
          },
          {
            unit: '05481566c1accd189a6cf46f8d17d794c918101eaa313e9a62aed3a7707473',
            quantity: '9870000',
          },
        ],
      }
    }
    return {
      address,
      amount: [],
    }
  }
}
