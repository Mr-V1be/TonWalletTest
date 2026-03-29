import { Address } from '@ton/ton';
import { describe, expect, it } from 'vitest';
import { mapToncenterTransactions } from '@/infrastructure/ton/toncenter-read-gateway';
import type { ToncenterTransaction } from '@/shared/lib/toncenter-response-schemas';

const accountFriendly =
  '0QAlC8ee7ahIHDslddKXxkK3F1vo2U-aWTMYmcxigbwGVHwl';
const marketRaw =
  '0:B111A976236E3B5E990A250406098BE60EA7C1A242CD4055A774B106DAB968E7';
const giverRaw =
  '0:92112D13658A9C56482882E8486FC88C128E1CBDA130988AD4E6A6D082737C7E';

describe('mapToncenterTransactions', () => {
  it('splits an aborted inbound transaction into inbound and bounce rows', () => {
    const transactions = [
      {
        description: {
          aborted: true,
        },
        hash: 'market-hash',
        in_msg: {
          destination:
            '0:250BC79EEDA8481C3B2575D297C642B7175BE8D94F9A59331899CC6281BC0654',
          message_content: {
            decoded: {
              comment:
                'Get 300 testnet TON | TG: @testnet_market',
            },
          },
          source: marketRaw,
          value: '1000000',
        },
        now: 1774776345,
        out_msgs: [
          {
            destination: marketRaw,
            source:
              '0:250BC79EEDA8481C3B2575D297C642B7175BE8D94F9A59331899CC6281BC0654',
            value: '600000',
          },
        ],
      },
      {
        description: {
          aborted: true,
        },
        hash: 'giver-hash',
        in_msg: {
          destination:
            '0:250BC79EEDA8481C3B2575D297C642B7175BE8D94F9A59331899CC6281BC0654',
          message_content: {
            decoded: {
              comment:
                'https://t.me/testgiver_ton_bot',
            },
          },
          source: giverRaw,
          value: '2000000000',
        },
        now: 1774776312,
        out_msgs: [],
      },
    ] satisfies ToncenterTransaction[];

    const records = mapToncenterTransactions(
      transactions,
      accountFriendly,
    );

    expect(records).toHaveLength(3);
    expect(records).toEqual([
      expect.objectContaining({
        amountTon: '0.001',
        comment:
          'Get 300 testnet TON | TG: @testnet_market',
        counterparty: Address.parseRaw(
          marketRaw,
        ).toString({
          bounceable: false,
          testOnly: true,
        }),
        direction: 'incoming',
        id: 'market-hash:incoming',
        status: 'confirmed',
      }),
      expect.objectContaining({
        amountTon: '0.0006',
        counterparty: Address.parseRaw(
          marketRaw,
        ).toString({
          bounceable: false,
          testOnly: true,
        }),
        direction: 'outgoing',
        id: 'market-hash:outgoing:0',
        status: 'failed',
      }),
      expect.objectContaining({
        amountTon: '2',
        comment: 'https://t.me/testgiver_ton_bot',
        counterparty: Address.parseRaw(
          giverRaw,
        ).toString({
          bounceable: false,
          testOnly: true,
        }),
        direction: 'incoming',
        id: 'giver-hash:incoming',
        status: 'confirmed',
      }),
    ]);
  });
});
