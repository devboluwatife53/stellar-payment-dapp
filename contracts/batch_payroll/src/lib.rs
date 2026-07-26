#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

const ADMIN: Symbol = symbol_short!("ADMIN");
const PAYMENT_LOG: Symbol = symbol_short!("P_LOG");
const TOTAL_PAID: Symbol = symbol_short!("TOT_PAID");

#[contracttype]
pub struct PaymentRecord {
    pub payer: Address,
    pub recipient: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
pub struct BatchSummary {
    pub payer: Address,
    pub recipient_count: u32,
    pub total_amount: i128,
    pub timestamp: u64,
}

#[contract]
pub struct BatchPayroll;

#[contractimpl]
impl BatchPayroll {
    /// Initialize the contract with an admin.
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage()
            .persistent()
            .set(&TOTAL_PAID, &0_i128);
    }

    /// Record a batch payroll run.  Called after the multi-operation
    /// transaction has been submitted on-chain via the Stellar SDK.
    /// This stores the payment records in the contract for querying.
    pub fn record_batch(
        env: Env,
        payer: Address,
        recipients: Vec<Address>,
        amounts: Vec<i128>,
    ) -> BatchSummary {
        payer.require_auth();

        if recipients.len() != amounts.len() {
            panic!("recipients and amounts must have the same length");
        }
        if recipients.is_empty() {
            panic!("batch must have at least one recipient");
        }

        let timestamp = env.ledger().timestamp();
        let mut total: i128 = env.storage().persistent().get(&TOTAL_PAID).unwrap_or(0);
        let mut log: Vec<PaymentRecord> = env
            .storage()
            .persistent()
            .get(&PAYMENT_LOG)
            .unwrap_or_else(|| Vec::new(&env));

        let mut batch_total: i128 = 0;

        for i in 0..recipients.len() {
            let recipient = recipients.get_unchecked(i);
            let amount = amounts.get_unchecked(i);

            batch_total += amount;
            total += amount;

            log.push_back(PaymentRecord {
                payer: payer.clone(),
                recipient,
                amount,
                timestamp,
            });
        }

        env.storage().persistent().set(&PAYMENT_LOG, &log);
        env.storage().persistent().set(&TOTAL_PAID, &total);

        BatchSummary {
            payer,
            recipient_count: recipients.len(),
            total_amount: batch_total,
            timestamp,
        }
    }

    /// Return the full payment history stored in the contract.
    pub fn get_payment_history(env: Env) -> Vec<PaymentRecord> {
        env.storage()
            .persistent()
            .get(&PAYMENT_LOG)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Return the total amount ever processed through this contract.
    pub fn total_paid(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&TOTAL_PAID)
            .unwrap_or(0)
    }

    /// Return the number of individual payments recorded.
    pub fn payment_count(env: Env) -> u32 {
        let log: Vec<PaymentRecord> = env
            .storage()
            .persistent()
            .get(&PAYMENT_LOG)
            .unwrap_or_else(|| Vec::new(&env));
        log.len()
    }
}
