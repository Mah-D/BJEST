var t = bjest.types;

function BankAccount(balance) {
    this.balance = balance;
}

BankAccount.prototype.getBalance = function () {
    return this.balance;
};

BankAccount.prototype.withdraw = function (amount) {
    this.balance -= amount;
    return amount;
};

function atmTest(balance, amount) {
    var b = new BankAccount(balance);
    var ra = b.withdraw(amount);
    return ra <= amount && b.getBalance() >= 0;
}

forAll([t.int.nonNegative, t.int.nonNegative], 'withdraw is safe', function (x, y) {
    return atmTest(x, y);
});