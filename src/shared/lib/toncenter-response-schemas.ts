import { z } from 'zod';

const toncenterMessageSchema = z.object({
  destination: z.string().nullable().optional(),
  message_content: z
    .object({
      decoded: z.unknown().optional(),
    })
    .optional(),
  source: z.string().nullable().optional(),
  value: z.string().optional(),
});

export const toncenterTransactionsResponseSchema =
  z.object({
    transactions: z
      .array(
        z.object({
          description: z
            .object({
              aborted: z.boolean().optional(),
            })
            .optional(),
          hash: z.string(),
          in_msg: toncenterMessageSchema
            .nullable()
            .optional(),
          now: z.number(),
          out_msgs: z
            .array(toncenterMessageSchema)
            .optional(),
        }),
      )
      .optional(),
  });

export const toncenterWalletStatesResponseSchema =
  z.object({
    wallets: z
      .array(
        z.object({
          balance: z.string(),
          is_wallet: z.boolean(),
          status: z.enum([
            'active',
            'frozen',
            'nonexist',
            'uninit',
          ]),
        }),
      )
      .optional(),
  });

export type ToncenterMessage = z.infer<
  typeof toncenterMessageSchema
>;
export type ToncenterTransaction = NonNullable<
  z.infer<
    typeof toncenterTransactionsResponseSchema
  >['transactions']
>[number];
export type TransactionsResponse = z.infer<
  typeof toncenterTransactionsResponseSchema
>;
export type WalletStatesResponse = z.infer<
  typeof toncenterWalletStatesResponseSchema
>;
