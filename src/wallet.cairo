#[abi]
trait ETHContract {
    #[external]
    fn transferFrom(
        sender: starknet::ContractAddress, recipient: starknet::ContractAddress, amount: u128
    );
}

#[contract]
mod Wallet {
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use starknet::get_contract_address;
    use super::ETHContractDispatcherTrait;
    use super::ETHContractLibraryDispatcher;

    struct Storage {
        wallets: LegacyMap::<ContractAddress, u128>, 
    }

    #[event]
    fn Deposit(user_adress: ContractAddress, amount: u128) {}

    #[event]
    fn Withdraw(user_adress: ContractAddress, amount: u128) {}

    #[view]
    fn contract_address() -> ContractAddress {
        let this_contract = get_contract_address();
        this_contract
    }

    #[view]
    fn get_balance() -> u128 {
        let caller = get_caller_address();
        wallets::read(caller)
    }

    #[external]
    fn deposit(amount: u128) {
        let caller = get_caller_address();
        let caller_balance = get_balance();
        let caller_new_balance = caller_balance + amount;
        ETHContractLibraryDispatcher {
            class_hash: starknet::class_hash_const::<0x00d0e183745e9dae3e4e78a8ffedcce0903fc4900beace4e0abf192d4c202da3>()
        }.transferFrom(caller, contract_address(), amount);
        Deposit(caller, amount);
        wallets::write(caller, caller_new_balance);
    }

    #[external]
    fn withdraw(amount: u128) {
        let caller = get_caller_address();
        let caller_balance = get_balance();
        assert(caller_balance > 0_u128, 'Not enought funds');
        let caller_new_balance = caller_balance - amount;
        wallets::write(caller, caller_new_balance);
        ETHContractLibraryDispatcher {
            class_hash: starknet::class_hash_const::<0x00d0e183745e9dae3e4e78a8ffedcce0903fc4900beace4e0abf192d4c202da3>()
        }.transferFrom(contract_address(), caller, amount);
        Withdraw(caller, amount);
    }
}
