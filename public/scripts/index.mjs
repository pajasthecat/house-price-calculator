document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = getInput();

  const output = getOutput(input);

  setLoanTable(output);

  setCostTable(output);
});

const getInput = () => {
  const price = document.getElementById("price").value;
  const rent = document.getElementById("rent").value;
  const income = document.getElementById("income").value;
  const interest = document.getElementById("interets").value;
  const downPayment = document.getElementById("downPayment").value;
  const maintenance = document.getElementById("maintenance").value;

  return {
    price: parseAndSetDefault(price),
    rent: parseAndSetDefault(rent),
    income: parseAndSetDefault(income),
    interest: parseAndSetDefault(interest),
    downPayment: parseAndSetDefault(downPayment),
    maintenance: parseAndSetDefault(maintenance),
  };
};

const parseAndSetDefault = (text) => (text ? parseInt(text) : 0);

const setLoanTable = (output) => {
  const {
    borrowedSum,
    loanAsQuotaOfYearlyIncome,
    amortizationPerYear,
    paidDownPayment,
  } = output;

  document.getElementById(
    "paidDownPayment"
  ).innerHTML = `${formatAndRoundCurrency(paidDownPayment)} SEK`;

  document.getElementById("borrowedSum").innerHTML = `${formatAndRoundCurrency(
    borrowedSum
  )} SEK`;

  document.getElementById(
    "loanAsQuotaOfYearlyIncome"
  ).innerHTML = `${loanAsQuotaOfYearlyIncome} gånger hushållets årsinkomst`;

  document.getElementById(
    "amortizationPerYear"
  ).innerHTML = `${formatAndRoundCurrency(amortizationPerYear)} %`;
};

const setCostTable = (output) => {
  const {
    amortizationPerMonth,
    interestPerMonth,
    rent,
    totalPerMonth,
    totalPerMonthExDeduction,
    costAsShareOfIncome,
    interestAsShareOfIncome,
  } = output;

  document.getElementById(
    "amortizationPerMonth"
  ).innerHTML = `${formatAndRoundCurrency(amortizationPerMonth)} SEK`;

  document.getElementById(
    "interestPerMonth"
  ).innerHTML = `${formatAndRoundCurrency(interestPerMonth)} SEK`;

  document.getElementById("rentPerMonth").innerHTML = `${formatAndRoundCurrency(
    rent
  )} SEK`;

  document.getElementById(
    "totalPerMonth"
  ).innerHTML = `<b> ${formatAndRoundCurrency(totalPerMonth)} SEK </b>`;

  document.getElementById(
    "totalPerMonthExDeduction"
  ).innerHTML = ` <b>${formatAndRoundCurrency(
    totalPerMonthExDeduction
  )} SEK </b>`;

  document.getElementById(
    "costAsShareOfIncome"
  ).innerHTML = `${costAsShareOfIncome}%`;

  document.getElementById(
    "interestAsShareOfIncome"
  ).innerHTML = `${interestAsShareOfIncome}%`;
};

const getOutput = (input) => {
  const { price, downPayment, income, interest, rent, maintenance } = input;
  const paidDownPayment = (downPayment / 100) * price;

  const borrowedSum = price - paidDownPayment;

  const loanAsQuotaOfYearlyIncome = getLoanAsQuotaOfYearlyIncome(
    borrowedSum,
    income
  );

  const amortizationPerYear = getAmortizationPerYear(
    borrowedSum,
    price,
    loanAsQuotaOfYearlyIncome
  );

  const amortizationPerMonth = getAmortizationPerMonth(
    borrowedSum,
    amortizationPerYear
  );

  const interestPerMonth = getInterestPerMonth(borrowedSum, interest);

  const totalPerMonth =
    amortizationPerMonth + interestPerMonth + rent + maintenance;

  const totalPerMonthExDeduction = totalPerMonth - interestPerMonth * 0.3;

  const costAsShareOfIncome = round((totalPerMonth / (income * 0.7)) * 100);

  const interestAsShareOfIncome = round(
    ((interestPerMonth * 0.7) / income) * 100
  );

  return {
    paidDownPayment,
    borrowedSum,
    loanAsQuotaOfYearlyIncome,
    amortizationPerYear,
    interestPerMonth,
    amortizationPerMonth,
    rent,
    totalPerMonth,
    totalPerMonthExDeduction,
    costAsShareOfIncome,
    interestAsShareOfIncome,
  };
};

const getAmortizationPerMonth = (borrowedSum, amortizationPerYear) =>
  ((amortizationPerYear / 100) * borrowedSum) / 12;

const getInterestPerMonth = (borrowedSum, interest) =>
  ((interest / 100) * borrowedSum) / 12;

const getAmortizationPerYear = (
  borrowedSum,
  price,
  loanAsQuotaOfYearlyIncome
) => {
  const borrowingPriceQuota = borrowedSum / price;

  let amortizationPerYear = 0;

  if (borrowingPriceQuota > 0.7) amortizationPerYear += 2;
  if (borrowingPriceQuota <= 0.7 && borrowingPriceQuota > 0.5)
    amortizationPerYear += 1;
  if (loanAsQuotaOfYearlyIncome > 4.5) amortizationPerYear += 1;

  return round(amortizationPerYear);
};

const getLoanAsQuotaOfYearlyIncome = (borrowedSum, income) =>
  round(borrowedSum / (income * 12));

export const round = (number) => Math.round(number * 100) / 100;

export const formatAndRoundCurrency = (price) => {
  const roundedPrice = round(price);
  return new Intl.NumberFormat("en-US").format(roundedPrice);
};
