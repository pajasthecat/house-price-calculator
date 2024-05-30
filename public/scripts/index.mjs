const formatInput = (id) => {
  const input = document.getElementById(id);
  if (!input?.value) return;
  input.value = formatAndRoundCurrency(input.value);
};

document
  .getElementById("price")
  .addEventListener("focusout", formatInput.bind(null, "price"));

document
  .getElementById("rent")
  .addEventListener("focusout", formatInput.bind(null, "rent"));

document
  .getElementById("maintenance")
  .addEventListener("focusout", formatInput.bind(null, "maintenance"));

document
  .getElementById("income")
  .addEventListener("focusout", formatInput.bind(null, "income"));

document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = getInput();

  const output = getOutput(input);

  setLoanTable(output);

  setCostTable(output);

  setMiscTable(output);

  const elementToZoomInto = document.getElementById("elementToScroll");
  elementToZoomInto.scrollIntoView();
});

const getInput = () => {
  const price = document.getElementById("price").value;
  const rent = document.getElementById("rent").value;
  const income = document.getElementById("income").value;
  const interest = document.getElementById("interets").value;
  const downPayment = document.getElementById("downPayment").value;
  const maintenance = document.getElementById("maintenance").value;
  const kvm = document.getElementById("kvm").value;

  return {
    price: parseAndSetDefault(price),
    rent: parseAndSetDefault(rent),
    income: parseAndSetDefault(income),
    interest: parseAndSetDefault(interest),
    downPayment: parseAndSetDefault(downPayment),
    maintenance: parseAndSetDefault(maintenance),
    kvm: parseAndSetDefault(kvm),
  };
};

const getOutput = (input) => {
  const { price, downPayment, income, interest, rent, maintenance, kvm } =
    input;
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

  const interestAsShareOfIncome = round((interestPerMonth / income) * 100);

  const kvmPrice = price / kvm;

  const loanToValueRatio = (borrowedSum / price) * 100;

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
    maintenance,
    kvmPrice,
    loanToValueRatio,
  };
};

const parseAndSetDefault = (text) => (text ? parseIntFromCurrency(text) : 0);

const setLoanTable = (output) => {
  const {
    borrowedSum,
    loanAsQuotaOfYearlyIncome,
    amortizationPerYear,
    paidDownPayment,
    loanToValueRatio,
  } = output;

  document.getElementById(
    "paidDownPayment"
  ).innerHTML = `${formatAndRoundCurrency(paidDownPayment)} SEK`;

  document.getElementById("borrowedSum").innerHTML = `${formatAndRoundCurrency(
    borrowedSum
  )} SEK`;

  document.getElementById("loanAsQuotaOfYearlyIncome").innerHTML =
    ifMissingLine(loanAsQuotaOfYearlyIncome, `${loanAsQuotaOfYearlyIncome}`);

  document.getElementById(
    "amortizationPerYear"
  ).innerHTML = `${formatAndRoundCurrency(amortizationPerYear)} %`;

  document.getElementById("loanToValueRatio").innerHTML = ifMissingLine(
    loanToValueRatio,
    `${round(loanToValueRatio)} %`
  );
};

const setCostTable = (output) => {
  const {
    amortizationPerMonth,
    interestPerMonth,
    rent,
    totalPerMonth,
    totalPerMonthExDeduction,
    maintenance,
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
    "maintenancePerMonth"
  ).innerHTML = `${formatAndRoundCurrency(maintenance)} SEK`;

  document.getElementById(
    "totalPerMonth"
  ).innerHTML = `<b> ${formatAndRoundCurrency(totalPerMonth)} SEK </b>`;

  document.getElementById(
    "totalPerMonthExDeduction"
  ).innerHTML = ` <b>${formatAndRoundCurrency(
    totalPerMonthExDeduction
  )} SEK </b>`;
};

const setMiscTable = (output) => {
  const { costAsShareOfIncome, interestAsShareOfIncome, kvmPrice } = output;

  document.getElementById("costAsShareOfIncome").innerHTML = ifMissingLine(
    costAsShareOfIncome,
    `${costAsShareOfIncome}%`
  );

  document.getElementById("interestAsShareOfIncome").innerHTML = ifMissingLine(
    interestAsShareOfIncome,
    `${interestAsShareOfIncome}%`
  );

  document.getElementById("kvmPrice").innerHTML = ifMissingLine(
    kvmPrice,
    `${formatAndRoundCurrency(kvmPrice)} SEK/kvm`
  );
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

const round = (number) => Math.round(number * 100) / 100;

const formatAndRoundCurrency = (price) => {
  if (typeof price === "string") {
    const toInt = Number(price.replace(/[^0-9\.]+/g, ""));
    const roundedPrice = round(toInt);
    return new Intl.NumberFormat("en-US").format(roundedPrice);
  }
  const roundedPrice = round(price);
  return new Intl.NumberFormat("en-US").format(roundedPrice);
};

const parseIntFromCurrency = (price) => Number(price.replace(/[^0-9\.]+/g, ""));

const ifMissingLine = (value, text) => (isFinite(value) ? text : "-");
