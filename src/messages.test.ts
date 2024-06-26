import { CompanyTypes } from "israeli-bank-scrapers";
import { getSummaryMessage } from "./messages";
import { AccountScrapeResult, SaveStats, Transaction } from "./types";
import {
  TransactionStatuses,
  TransactionTypes,
} from "israeli-bank-scrapers/lib/transactions";
import { ScraperErrorTypes } from "israeli-bank-scrapers/lib/scrapers/errors";

describe("messages", () => {
  describe("getSummaryMessage", () => {
    it("should return a summary message", () => {
      const results: Array<AccountScrapeResult> = [
        {
          companyId: CompanyTypes.max,
          result: {
            success: true,
            accounts: [
              {
                accountNumber: "account1",
                txns: [],
              },
              {
                accountNumber: "account2",
                txns: [
                  transaction({
                    type: TransactionTypes.Installments,
                  }),
                  transaction({
                    status: TransactionStatuses.Pending,
                    originalAmount: 20,
                  }),
                  transaction({
                    status: TransactionStatuses.Pending,
                    originalAmount: 20,
                    originalCurrency: "USD",
                  }),
                  transaction({
                    status: TransactionStatuses.Pending,
                    originalAmount: -20,
                  }),
                  transaction({
                    description: "description2",
                    memo: "memo2",
                  }),
                  transaction({
                    chargedAmount: 20,
                    originalAmount: 5,
                    originalCurrency: "USD",
                  }),
                ],
              },
            ],
          },
        },
      ];

      const stats: Array<SaveStats> = [
        {
          name: "Storage 1",
          table: "TheTable",
          total: 1,
          added: 2,
          pending: 3,
          skipped: 4,
          existing: 5,
        },
        {
          name: "Storage 2",
          table: "TheTable",
          total: 6,
          added: 7,
          pending: 8,
          skipped: 9,
          existing: 10,
        },
      ];

      const summary = getSummaryMessage(results, stats);

      expect(summary).toMatchSnapshot();
    });

    it("should return a summary message with no results", () => {
      const results: Array<AccountScrapeResult> = [];

      const stats: Array<SaveStats> = [];

      const summary = getSummaryMessage(results, stats);

      expect(summary).toMatchSnapshot();
    });

    it("should return a summary message with failed results", () => {
      const results: Array<AccountScrapeResult> = [
        {
          companyId: CompanyTypes.max,
          result: {
            success: false,
            errorType: ScraperErrorTypes.Generic,
            errorMessage: "Some error message",
          },
        },
        {
          companyId: CompanyTypes.hapoalim,
          result: {
            success: false,
            errorType: ScraperErrorTypes.ChangePassword,
          },
        },
        {
          companyId: CompanyTypes.hapoalim,
          result: {
            success: true,
            accounts: [
              {
                accountNumber: "account1",
                txns: [transaction({})],
              },
            ],
          },
        },
      ];

      const stats: Array<SaveStats> = [];

      const summary = getSummaryMessage(results, stats);

      expect(summary).toMatchSnapshot();
    });
  });
});

function transaction(t: Partial<Transaction>): Transaction {
  return {
    type: TransactionTypes.Normal,
    date: new Date().toISOString(),
    processedDate: new Date().toISOString(),
    description: "description1",
    originalAmount: 10,
    originalCurrency: "ILS",
    chargedAmount: t.status === TransactionStatuses.Pending ? 0 : 10,
    status: TransactionStatuses.Completed,
    ...t,
  };
}
