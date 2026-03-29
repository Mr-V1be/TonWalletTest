import { describe, expect, it } from 'vitest';
import { toncenterTransactionsResponseSchema } from '@/shared/lib/toncenter-response-schemas';

describe('toncenter transaction schemas', () => {
  it('accepts v3 transactions with external inbound message fields set to null', () => {
    const response = {
      transactions: [
        {
          description: {
            aborted: false,
          },
          hash: 'hash-1',
          in_msg: {
            destination:
              '0:250BC79EEDA8481C3B2575D297C642B7175BE8D94F9A59331899CC6281BC0654',
            message_content: {
              decoded: null,
            },
            source: null,
            value: null,
          },
          now: 1774778866,
          out_msgs: [
            {
              destination:
                '0:D972F2117A356CC452AF042382DA99CD770B714B29EFE8FE317AED372EE5BCA4',
              message_content: {
                decoded: {
                  '@type': 'empty_cell',
                },
              },
              source:
                '0:250BC79EEDA8481C3B2575D297C642B7175BE8D94F9A59331899CC6281BC0654',
              value: '100000000',
            },
          ],
        },
      ],
    };

    const parsed =
      toncenterTransactionsResponseSchema.safeParse(
        response,
      );

    expect(parsed.success).toBe(true);
  });
});
