"""
Curriculum for the Table of Contents.

Everything the learner can read lives here. To add a lesson, append a dict to
LESSONS with a unique `id` and an existing `module`. No other code changes needed.

Fields
------
id          unique slug, used in URLs (/learn/<id>)
module      id of a module in MODULES
title       short title shown in the TOC
level       1 = beginner, 2 = intermediate, 3 = advanced
minutes     rough reading time
summary     one-line description shown in the TOC
body        list of paragraphs (the detailed explanation)
example     a concrete, numbers-based example
key_points  3-4 bullet takeaways
quiz        one multiple-choice check {question, options, answer (index), explanation}
tags        used by personalize.py to match the user's profile
links       optional [{label, url}] for "go further" (e.g. National Bank)
"""

NBC_HOME = "https://www.nbc.ca"
NBDB_HOME = "https://nbdb.ca"  # National Bank Direct Brokerage

MODULES = [
    {"id": "foundations", "title": "Money Foundations",
     "description": "The habits and ideas that come before you invest a single dollar."},
    {"id": "basics", "title": "Investing Basics",
     "description": "What you're actually buying, and why risk and return go together."},
    {"id": "products", "title": "Investment Products",
     "description": "ETFs, mutual funds, GICs and bonds explained in plain language."},
    {"id": "accounts", "title": "Canadian Accounts",
     "description": "TFSA, RRSP, FHSA, RESP: which tax-sheltered account does what."},
    {"id": "portfolio", "title": "Building Your Portfolio",
     "description": "Putting the pieces together into a plan that fits you."},
    {"id": "analyze", "title": "Understanding Your Portfolio",
     "description": "How to read what you already own, before we analyze it together."},
    {"id": "next", "title": "Taking the Next Step",
     "description": "Opening an account, placing your first order and handling taxes."},
]

LESSONS = [
    # ------------------------------------------------------------------ foundations
    {
        "id": "emergency-fund",
        "module": "foundations",
        "title": "Budgeting & the Emergency Fund",
        "level": 1, "minutes": 4,
        "summary": "Why you need a cash cushion before you invest.",
        "body": [
            "Investing works best with money you won't need for a while. If an unexpected bill shows up "
            "and your only savings are in the stock market, you might have to sell at a bad time, "
            "possibly at a loss.",
            "An emergency fund is cash kept somewhere safe and easy to access, like a high-interest savings "
            "account. A common rule of thumb is 3 to 6 months of essential expenses (rent, food, transport, "
            "bills). Students or people with very stable situations sometimes start smaller.",
            "A simple budget tells you how much that is. Track what comes in and what goes out for a month, "
            "then split it into needs, wants and savings. The popular 50/30/20 split is a starting point, "
            "not a law.",
        ],
        "example": "If your rent, groceries, phone and transit cost $1,800/month, a 3-month emergency fund "
                   "is $5,400. Once you have it, extra savings can go toward investing.",
        "key_points": [
            "Build a cash cushion before investing.",
            "Aim for 3 to 6 months of essential expenses.",
            "Keep it in a safe, accessible account, not in stocks.",
        ],
        "quiz": {
            "question": "Where should your emergency fund usually be kept?",
            "options": ["In individual stocks", "In a high-interest savings account",
                        "In a 5-year locked GIC", "In cryptocurrency"],
            "answer": 1,
            "explanation": "An emergency fund needs to be safe and available right away. A savings account fits; "
                           "stocks and crypto can drop and a locked GIC can't be withdrawn.",
        },
        "tags": ["emergency_fund", "short_horizon", "no_portfolio"],
    },
    {
        "id": "compound-interest",
        "module": "foundations",
        "title": "Compound Interest",
        "level": 1, "minutes": 4,
        "summary": "How your money earns money on the money it already earned.",
        "body": [
            "Compound interest means your returns start earning their own returns. In year one you earn on "
            "what you put in. In year two you earn on what you put in plus last year's gains, and so on.",
            "The two biggest drivers are time and consistency. Starting earlier often matters more than "
            "starting with a lot of money, because the growth snowballs over many years.",
            "The 'Rule of 72' is a quick shortcut: divide 72 by your yearly return to estimate how many "
            "years it takes your money to double. At 6% per year, that's about 12 years.",
        ],
        "example": "$100/month invested at 6% per year for 30 years: you put in $36,000, and it grows to "
                   "roughly $100,000. Most of that is growth, not deposits.",
        "key_points": [
            "Returns earn their own returns over time.",
            "Time in the market is the most powerful ingredient.",
            "Rule of 72: 72 ÷ return % = years to double.",
        ],
        "quiz": {
            "question": "Using the Rule of 72, how long does it take money to double at 8% per year?",
            "options": ["About 6 years", "About 9 years", "About 12 years", "About 18 years"],
            "answer": 1,
            "explanation": "72 ÷ 8 = 9 years.",
        },
        "tags": ["long_horizon", "retirement", "grow_wealth", "no_portfolio"],
    },
    {
        "id": "inflation",
        "module": "foundations",
        "title": "Inflation: Why Cash Loses Value",
        "level": 1, "minutes": 3,
        "summary": "Why keeping everything in a chequing account slowly costs you.",
        "body": [
            "Inflation is the general rise in prices over time. If inflation is 3%, something that costs "
            "$100 today will cost about $103 next year.",
            "Money sitting in an account paying 0.5% interest is losing purchasing power when inflation is "
            "higher than that. That's why long-term savings are usually invested rather than left in cash.",
            "The Bank of Canada aims to keep inflation around 2% per year over the long run.",
        ],
        "example": "With 2.5% yearly inflation, $10,000 in cash buys only about $7,800 worth of today's "
                   "goods after 10 years.",
        "key_points": [
            "Inflation reduces what your money can buy.",
            "Cash is safe in dollars but not in purchasing power.",
            "Investing aims to grow faster than inflation.",
        ],
        "quiz": {
            "question": "Your savings earn 1% and inflation is 3%. What is happening to your purchasing power?",
            "options": ["Growing by 4%", "Growing by 1%", "Shrinking by about 2%", "Staying the same"],
            "answer": 2,
            "explanation": "Your 'real' return is roughly 1% − 3% = −2% per year.",
        },
        "tags": ["low_risk", "no_portfolio"],
    },
    {
        "id": "debt-vs-investing",
        "module": "foundations",
        "title": "Pay Off Debt or Invest?",
        "level": 1, "minutes": 3,
        "summary": "How to decide where your next dollar should go.",
        "body": [
            "Paying off a debt is like earning a guaranteed return equal to its interest rate. Paying off a "
            "credit card at 20% interest is like earning a risk-free 20%, which almost no investment can beat.",
            "Low-interest debt (for example a student loan at 4 to 6%) is less urgent. Many people invest "
            "while paying it down slowly, especially if an employer matches retirement contributions.",
            "A common order: minimum payments on everything, small emergency fund, kill high-interest debt, "
            "full emergency fund, then invest.",
        ],
        "example": "You have $2,000 on a credit card at 20%. Paying it off saves about $400 a year in "
                   "interest, guaranteed.",
        "key_points": [
            "High-interest debt first; it's a guaranteed 'return'.",
            "Low-interest debt can be paid alongside investing.",
            "Never miss minimum payments.",
        ],
        "quiz": {
            "question": "Which should usually come first?",
            "options": ["Investing in stocks", "Paying off a 19.99% credit card",
                        "Paying off a 3% loan early", "Buying a GIC"],
            "answer": 1,
            "explanation": "Paying off 19.99% debt is a guaranteed 19.99% return.",
        },
        "tags": ["no_portfolio", "beginner"],
    },

    # ------------------------------------------------------------------ basics
    {
        "id": "stocks",
        "module": "basics",
        "title": "What Is a Stock?",
        "level": 1, "minutes": 4,
        "summary": "Owning a small piece of a real company.",
        "body": [
            "A stock (or share) is a tiny piece of ownership in a company. If a company has 1 million shares "
            "and you own 100, you own 0.01% of it.",
            "You can make money in two ways: the share price goes up (a capital gain), or the company pays "
            "part of its profits to shareholders (a dividend).",
            "Prices move every day based on company results, the economy and investor mood. Over short "
            "periods they can swing a lot; over long periods they have historically grown more than most "
            "other investments.",
        ],
        "example": "You buy 10 shares at $50 ($500). A year later they're $55 and you received $10 in "
                   "dividends. Your total return is $60, or 12%.",
        "key_points": [
            "A stock is partial ownership of a company.",
            "Returns come from price growth and dividends.",
            "Higher potential return, higher short-term swings.",
        ],
        "quiz": {
            "question": "What is a dividend?",
            "options": ["A fee you pay to buy stock", "A share of company profits paid to shareholders",
                        "A type of bond", "A tax on gains"],
            "answer": 1,
            "explanation": "Dividends are profits a company chooses to pay out to its shareholders.",
        },
        "tags": ["grow_wealth", "high_risk", "income"],
    },
    {
        "id": "bonds",
        "module": "basics",
        "title": "What Is a Bond?",
        "level": 1, "minutes": 4,
        "summary": "Lending money to a government or company in exchange for interest.",
        "body": [
            "A bond is a loan you give to a government or company. They promise to pay you interest "
            "regularly (the coupon) and return your money at a set date (maturity).",
            "Bonds are generally less volatile than stocks, which is why they're used to make a portfolio "
            "steadier. Government of Canada bonds are among the safest.",
            "Bond prices move opposite to interest rates: when rates rise, existing bonds with lower rates "
            "become less attractive and their prices fall.",
        ],
        "example": "You buy a $1,000 5-year bond paying 4%. You get $40 a year for 5 years, then your "
                   "$1,000 back.",
        "key_points": [
            "A bond is a loan that pays you interest.",
            "Usually steadier than stocks, with lower expected returns.",
            "When interest rates go up, bond prices go down.",
        ],
        "quiz": {
            "question": "If interest rates rise, what typically happens to existing bond prices?",
            "options": ["They rise", "They fall", "Nothing", "They double"],
            "answer": 1,
            "explanation": "New bonds pay more, so older lower-rate bonds are worth less.",
        },
        "tags": ["low_risk", "income", "short_horizon"],
    },
    {
        "id": "risk-and-return",
        "module": "basics",
        "title": "Risk & Return",
        "level": 1, "minutes": 5,
        "summary": "Why higher potential rewards always come with bigger ups and downs.",
        "body": [
            "In investing, 'risk' mostly means how much and how often an investment's value swings, and the "
            "chance you lose money when you need it.",
            "Investments with higher expected returns, like stocks, come with bigger swings. Safer ones, like "
            "GICs and savings accounts, pay less. There is no free lunch.",
            "Your risk tolerance is about two things: how much risk you can afford (time horizon, income, "
            "savings) and how much you can stomach emotionally without panic-selling.",
        ],
        "example": "In 2008 a typical stock index fell close to 40% in a year, then fully recovered within a "
                   "few years. Someone who sold in panic locked in the loss; someone who held did not.",
        "key_points": [
            "Higher expected return means more volatility.",
            "Risk tolerance = ability + willingness to take risk.",
            "Time horizon is one of the biggest factors.",
        ],
        "quiz": {
            "question": "Which investment typically has the highest expected long-term return AND the most volatility?",
            "options": ["Savings account", "GIC", "Government bonds", "Stocks"],
            "answer": 3,
            "explanation": "Stocks have historically offered the highest returns with the biggest swings.",
        },
        "tags": ["core", "risk"],
    },
    {
        "id": "diversification",
        "module": "basics",
        "title": "Diversification",
        "level": 1, "minutes": 4,
        "summary": "Don't put all your eggs in one basket.",
        "body": [
            "Diversification means spreading your money across many investments so one bad outcome can't "
            "sink you. If you own one company and it fails, you lose everything. If you own 500 companies "
            "and one fails, you barely notice.",
            "You can diversify across companies, industries, countries (Canada is only about 3% of the "
            "world's stock market) and asset types (stocks, bonds, cash).",
            "Diversification lowers risk without necessarily lowering expected return, which is why it's "
            "often called the only free lunch in investing.",
        ],
        "example": "Instead of $5,000 in one bank stock, you buy one ETF holding thousands of companies "
                   "across Canada, the US and the rest of the world.",
        "key_points": [
            "Spread money across many investments.",
            "Diversify across companies, sectors, countries and asset types.",
            "Lowers risk without giving up much return.",
        ],
        "quiz": {
            "question": "Which portfolio is MOST diversified?",
            "options": ["One tech stock", "Five Canadian bank stocks",
                        "A global ETF with thousands of companies", "One gold bar"],
            "answer": 2,
            "explanation": "A global ETF spreads your money across thousands of companies and countries.",
        },
        "tags": ["core", "has_portfolio"],
    },

    # ------------------------------------------------------------------ products
    {
        "id": "etfs-and-index-funds",
        "module": "products",
        "title": "ETFs & Index Funds",
        "level": 1, "minutes": 5,
        "summary": "The simplest way to own the whole market for a low fee.",
        "body": [
            "An index fund tracks a market index, like the S&P/TSX Composite (big Canadian companies) or the "
            "S&P 500 (big US companies). Instead of picking winners, you own all of them.",
            "An ETF (exchange-traded fund) is a basket of investments that trades on the stock exchange like "
            "a single stock. Many ETFs are index funds.",
            "'All-in-one' or asset-allocation ETFs hold a full diversified portfolio of stocks and bonds in "
            "one product, rebalanced for you. They're popular with beginners.",
        ],
        "example": "With one purchase of an all-in-one ETF, you can own thousands of stocks and bonds from "
                   "around the world for a yearly fee around 0.2%.",
        "key_points": [
            "Index funds track the whole market instead of picking stocks.",
            "ETFs trade like stocks and are usually low-cost.",
            "All-in-one ETFs are a full portfolio in a single product.",
        ],
        "quiz": {
            "question": "What does an index fund try to do?",
            "options": ["Beat the market by picking winners", "Match the performance of a market index",
                        "Guarantee no losses", "Only buy bonds"],
            "answer": 1,
            "explanation": "Index funds aim to match an index, not beat it, which keeps costs low.",
        },
        "tags": ["grow_wealth", "retirement", "core"],
    },
    {
        "id": "mutual-funds-and-fees",
        "module": "products",
        "title": "Mutual Funds & Fees (MER)",
        "level": 2, "minutes": 5,
        "summary": "How small percentages turn into big dollars over time.",
        "body": [
            "A mutual fund pools money from many investors, and a manager decides what to buy. They're often "
            "sold at bank branches.",
            "Every fund charges a yearly fee called the MER (Management Expense Ratio), taken directly out of "
            "your returns. Canadian mutual funds often charge 1.5 to 2.5%; index ETFs can be under 0.25%.",
            "A 2% fee sounds small, but over decades it can eat a third or more of your final balance. Always "
            "check the MER before buying.",
        ],
        "example": "$10,000 growing at 6% for 30 years: with a 0.2% fee you end with about $54,000; with a "
                   "2% fee you end with about $32,000.",
        "key_points": [
            "MER is a yearly fee deducted from your returns.",
            "Fees compound against you just like returns compound for you.",
            "Compare MERs before buying any fund.",
        ],
        "quiz": {
            "question": "What does MER stand for?",
            "options": ["Market Exchange Rate", "Management Expense Ratio",
                        "Minimum Equity Requirement", "Monthly Earnings Return"],
            "answer": 1,
            "explanation": "MER is the Management Expense Ratio, the annual cost of owning a fund.",
        },
        "tags": ["has_portfolio", "fees"],
    },
    {
        "id": "gics",
        "module": "products",
        "title": "GICs & Safe Savings",
        "level": 1, "minutes": 3,
        "summary": "Guaranteed returns for money you'll need soon.",
        "body": [
            "A GIC (Guaranteed Investment Certificate) is a Canadian savings product: you lend money to a bank "
            "for a fixed term (e.g. 1 to 5 years) and get a guaranteed interest rate.",
            "Your principal is safe, and eligible GICs are protected by CDIC deposit insurance up to set "
            "limits. The trade-off: lower returns, and many GICs lock your money until maturity.",
            "GICs are great for goals 1 to 5 years away, like a down payment, where you can't afford a "
            "market drop.",
        ],
        "example": "A $10,000 2-year GIC at 3.5% pays about $712 in interest, guaranteed.",
        "key_points": [
            "Guaranteed rate, principal protected.",
            "Money is often locked in until maturity.",
            "Best for short-term goals.",
        ],
        "quiz": {
            "question": "When is a GIC usually a good fit?",
            "options": ["Saving for retirement in 40 years", "Saving for a down payment in 2 years",
                        "Day trading", "Your daily spending money"],
            "answer": 1,
            "explanation": "GICs fit short-term goals where you can't risk a market drop.",
        },
        "tags": ["low_risk", "short_horizon", "house", "emergency_fund"],
    },

    # ------------------------------------------------------------------ accounts
    {
        "id": "tfsa",
        "module": "accounts",
        "title": "TFSA (Tax-Free Savings Account)",
        "level": 1, "minutes": 5,
        "summary": "Grow investments and withdraw them completely tax-free.",
        "body": [
            "Despite the name, a TFSA isn't just a savings account; you can hold stocks, ETFs, bonds and GICs "
            "inside it. Any growth, dividends or interest is never taxed, even when you withdraw.",
            "Every Canadian 18+ gets new contribution room each year (the government sets the amount; check "
            "CRA for the current limit), and unused room carries forward forever.",
            "Withdrawals are allowed any time, and the amount you withdraw is added back to your room the "
            "next calendar year. Over-contributing triggers a 1% per month penalty, so track your room "
            "in your CRA My Account.",
        ],
        "example": "You invest $7,000 in an ETF inside your TFSA and it grows to $20,000. You can withdraw "
                   "all $20,000 and pay $0 in tax.",
        "key_points": [
            "Growth and withdrawals are 100% tax-free.",
            "Can hold investments, not just cash.",
            "Unused room carries forward; withdrawals come back next year.",
        ],
        "quiz": {
            "question": "What happens to room you withdraw from a TFSA?",
            "options": ["It's lost forever", "It's added back the next calendar year",
                        "It's added back immediately", "It becomes RRSP room"],
            "answer": 1,
            "explanation": "Withdrawn amounts are re-added to your contribution room on January 1 of the next year.",
        },
        "tags": ["core", "tfsa", "grow_wealth", "retirement", "house"],
        "links": [{"label": "National Bank: TFSA", "url": NBC_HOME}],
    },
    {
        "id": "rrsp",
        "module": "accounts",
        "title": "RRSP (Registered Retirement Savings Plan)",
        "level": 2, "minutes": 5,
        "summary": "A tax deduction now, taxed later in retirement.",
        "body": [
            "Contributions to an RRSP reduce your taxable income this year, which can mean a tax refund. "
            "Investments grow tax-deferred, and you pay tax when you withdraw, ideally in retirement when "
            "your income (and tax rate) is lower.",
            "Your contribution room is 18% of last year's earned income, up to a yearly maximum, and "
            "unused room carries forward. Your Notice of Assessment shows your room.",
            "RRSPs shine when you're in a high tax bracket now. If your income is low (e.g. a student), "
            "a TFSA is often better first.",
        ],
        "example": "You earn $70,000 and contribute $5,000. Your taxable income drops to $65,000, which "
                   "could mean a refund of roughly $1,500 depending on your province.",
        "key_points": [
            "Contributions are tax-deductible today.",
            "Withdrawals are taxed as income later.",
            "Best when your current tax rate is higher than in retirement.",
        ],
        "quiz": {
            "question": "When are RRSP savings taxed?",
            "options": ["When you contribute", "Every year as they grow",
                        "When you withdraw", "Never"],
            "answer": 2,
            "explanation": "RRSPs are tax-deferred: you pay tax on withdrawals.",
        },
        "tags": ["rrsp", "retirement", "long_horizon"],
        "links": [{"label": "National Bank: RRSP", "url": NBC_HOME}],
    },
    {
        "id": "fhsa",
        "module": "accounts",
        "title": "FHSA (First Home Savings Account)",
        "level": 2, "minutes": 4,
        "summary": "The best of TFSA and RRSP for your first home.",
        "body": [
            "The FHSA is for first-time home buyers. Contributions are tax-deductible like an RRSP, and "
            "qualifying withdrawals for a first home are tax-free like a TFSA.",
            "You can contribute up to $8,000 per year, with a $40,000 lifetime limit. Up to $8,000 of unused "
            "room can carry forward one year.",
            "If you don't end up buying a home, you can transfer the money to your RRSP without using RRSP "
            "room. The account can stay open for up to 15 years.",
        ],
        "example": "Contributing $8,000 a year for 5 years gives you $40,000 plus growth toward a down "
                   "payment, plus about 5 years of tax deductions.",
        "key_points": [
            "Tax deduction going in, tax-free coming out (for a first home).",
            "$8,000/year, $40,000 lifetime.",
            "Can roll into your RRSP if you don't buy.",
        ],
        "quiz": {
            "question": "What's the lifetime FHSA contribution limit?",
            "options": ["$8,000", "$20,000", "$40,000", "Unlimited"],
            "answer": 2,
            "explanation": "The lifetime limit is $40,000.",
        },
        "tags": ["fhsa", "house"],
        "links": [{"label": "National Bank: FHSA", "url": NBC_HOME}],
    },
    {
        "id": "resp",
        "module": "accounts",
        "title": "RESP (Registered Education Savings Plan)",
        "level": 2, "minutes": 3,
        "summary": "Saving for a child's education, with free government money.",
        "body": [
            "An RESP helps you save for a child's post-secondary education. Investments grow tax-sheltered.",
            "The government adds the Canada Education Savings Grant (CESG): 20% on the first $2,500 "
            "contributed per child per year, which is up to $500/year and $7,200 lifetime.",
            "When the student withdraws for school, the growth and grants are taxed in their hands, usually "
            "at a very low rate.",
        ],
        "example": "Contributing $2,500 a year gets $500 in free grants each year, an instant 20% return.",
        "key_points": [
            "Government adds 20% (up to $500/year per child).",
            "Grows tax-sheltered.",
            "Taxed in the student's hands at withdrawal.",
        ],
        "quiz": {
            "question": "How much CESG do you get on a $2,500 contribution?",
            "options": ["$0", "$250", "$500", "$2,500"],
            "answer": 2,
            "explanation": "20% of $2,500 = $500.",
        },
        "tags": ["resp", "education"],
    },

    # ------------------------------------------------------------------ portfolio
    {
        "id": "asset-allocation",
        "module": "portfolio",
        "title": "Asset Allocation",
        "level": 2, "minutes": 5,
        "summary": "Choosing your stock/bond mix, the decision that matters most.",
        "body": [
            "Asset allocation is how you split your money between asset types, mainly stocks (growth) and "
            "bonds/cash (stability). It explains most of how your portfolio behaves.",
            "A longer time horizon and higher risk tolerance usually mean more stocks. A shorter horizon or "
            "lower tolerance means more bonds and cash.",
            "Typical examples: conservative 40% stocks / 60% bonds; balanced 60/40; growth 80/20; "
            "aggressive 100% stocks.",
        ],
        "example": "A 25-year-old saving for retirement might choose 90% stocks / 10% bonds. Someone buying "
                   "a house in 3 years might hold mostly GICs and bonds.",
        "key_points": [
            "Your stock/bond split drives most of your results.",
            "Longer horizon means you can usually hold more stocks.",
            "Pick a mix you can stick with during crashes.",
        ],
        "quiz": {
            "question": "Who should usually hold MORE stocks?",
            "options": ["Someone needing the money in 1 year", "Someone investing for 30 years",
                        "Someone who panics at any loss", "Nobody"],
            "answer": 1,
            "explanation": "A long horizon gives time to recover from downturns.",
        },
        "tags": ["core", "risk", "has_portfolio"],
    },
    {
        "id": "dollar-cost-averaging",
        "module": "portfolio",
        "title": "Dollar-Cost Averaging",
        "level": 1, "minutes": 3,
        "summary": "Investing a fixed amount on a schedule so timing doesn't matter.",
        "body": [
            "Dollar-cost averaging (DCA) means investing the same amount at regular intervals, for example "
            "$200 every payday, no matter what the market is doing.",
            "When prices are low, your fixed amount buys more units; when high, fewer. It removes the stress "
            "of trying to 'time the market', which even professionals rarely do well.",
            "Most brokerages let you set up automatic contributions so it happens without thinking.",
        ],
        "example": "$100/month: at $10/unit you buy 10 units, at $5 you buy 20, at $10 again you buy 10. "
                   "You own 40 units for $300, an average cost of $7.50.",
        "key_points": [
            "Invest a fixed amount on a regular schedule.",
            "Removes the need to time the market.",
            "Automate it.",
        ],
        "quiz": {
            "question": "With DCA, what happens when prices drop?",
            "options": ["You stop investing", "Your fixed amount buys more units",
                        "You buy fewer units", "You sell everything"],
            "answer": 1,
            "explanation": "The same dollars buy more units at lower prices.",
        },
        "tags": ["no_portfolio", "beginner", "grow_wealth", "retirement"],
    },
    {
        "id": "rebalancing",
        "module": "portfolio",
        "title": "Rebalancing",
        "level": 2, "minutes": 4,
        "summary": "Bringing your portfolio back to your target mix.",
        "body": [
            "Over time, your investments grow at different speeds, so your 80/20 portfolio might drift to "
            "90/10 after a strong year for stocks. That means you're taking more risk than you planned.",
            "Rebalancing is selling some of what grew and buying what lagged, or directing new money to the "
            "underweight part, to return to your target.",
            "Common approaches: rebalance once a year, or whenever an asset drifts more than 5 percentage "
            "points from target. All-in-one ETFs do it for you automatically.",
        ],
        "example": "Target 60/40. After a good year you're at 70/30 on a $10,000 portfolio. Move about "
                   "$1,000 from stocks to bonds to get back to 60/40.",
        "key_points": [
            "Portfolios drift as markets move.",
            "Rebalancing keeps your risk where you chose.",
            "Once a year or at a set threshold is enough.",
        ],
        "quiz": {
            "question": "Why rebalance?",
            "options": ["To maximize trading", "To keep your risk level at your target",
                        "To avoid all losses", "Because it's required by law"],
            "answer": 1,
            "explanation": "Rebalancing keeps your portfolio's risk aligned with your plan.",
        },
        "tags": ["has_portfolio"],
    },

    # ------------------------------------------------------------------ analyze
    {
        "id": "reading-your-statement",
        "module": "analyze",
        "title": "Reading Your Investment Statement",
        "level": 2, "minutes": 5,
        "summary": "What book value, market value and unrealized gains mean.",
        "body": [
            "Book value (or cost basis) is what you paid for an investment, including fees. Market value is "
            "what it's worth today.",
            "The difference is your unrealized gain or loss: it's only on paper until you sell. Once you "
            "sell, it becomes realized (and may be taxable outside a TFSA/RRSP).",
            "Your statement also lists holdings (what you own), asset allocation (stocks vs bonds vs cash), "
            "contributions, withdrawals, dividends and fees. Gather these before we analyze your portfolio.",
        ],
        "example": "You bought an ETF for $5,000 (book value). It's now worth $5,600 (market value). You have "
                   "a $600 unrealized gain, or 12%.",
        "key_points": [
            "Book value = what you paid. Market value = what it's worth now.",
            "Gains are unrealized until you sell.",
            "Know your holdings and allocation before analyzing.",
        ],
        "quiz": {
            "question": "You paid $1,000 and it's now worth $900. What do you have?",
            "options": ["A realized loss of $100", "An unrealized loss of $100",
                        "A $100 dividend", "A gain"],
            "answer": 1,
            "explanation": "It's unrealized because you haven't sold yet.",
        },
        "tags": ["has_portfolio"],
    },
    {
        "id": "performance-and-benchmarks",
        "module": "analyze",
        "title": "Performance & Benchmarks",
        "level": 3, "minutes": 5,
        "summary": "Is your portfolio actually doing well? Compare it fairly.",
        "body": [
            "A return number alone doesn't tell you much. 8% sounds great until you learn the market did 15%.",
            "A benchmark is a comparison point that matches what you hold, like the S&P/TSX Composite for "
            "Canadian stocks, or a balanced index for a 60/40 portfolio.",
            "Compare over several years, after fees. If an expensive fund keeps trailing its benchmark, a "
            "low-cost index fund may be a better choice.",
        ],
        "example": "Your Canadian equity fund returned 6% last year after a 2% MER. The TSX returned 9%. "
                   "The fund underperformed its benchmark by 3%.",
        "key_points": [
            "Always compare returns to a fitting benchmark.",
            "Look at multi-year results after fees.",
            "Persistent underperformance is a red flag.",
        ],
        "quiz": {
            "question": "What's a fair benchmark for a fund of large Canadian companies?",
            "options": ["The S&P/TSX Composite", "Gold prices", "Your savings account rate", "Bitcoin"],
            "answer": 0,
            "explanation": "The S&P/TSX Composite tracks large Canadian companies.",
        },
        "tags": ["has_portfolio", "advanced"],
    },

    # ------------------------------------------------------------------ next
    {
        "id": "opening-an-account",
        "module": "next",
        "title": "Opening an Investment Account",
        "level": 1, "minutes": 4,
        "summary": "Self-directed brokerage, robo-advisor or advisor: which is for you?",
        "body": [
            "Self-directed (online brokerage): you choose and buy investments yourself. Lowest cost, most "
            "control, requires a bit of knowledge. National Bank Direct Brokerage is one example.",
            "Robo-advisor: answer a questionnaire, and it builds and rebalances an ETF portfolio for you for "
            "a small fee. Good middle ground.",
            "Human advisor: personalized advice and planning, usually at a higher cost. Useful for complex "
            "situations.",
            "Whichever you choose, you'll pick the account type (TFSA, RRSP, FHSA, non-registered) when you "
            "open it.",
        ],
        "example": "A beginner comfortable with one all-in-one ETF might open a self-directed TFSA and set up "
                   "a $200 automatic monthly contribution.",
        "key_points": [
            "Self-directed = cheapest, you're in charge.",
            "Robo-advisor = automated, low-cost help.",
            "Advisor = personal help, higher cost.",
        ],
        "quiz": {
            "question": "Which option gives you the most control and lowest fees?",
            "options": ["Human advisor", "Robo-advisor", "Self-directed brokerage", "Mutual fund at a branch"],
            "answer": 2,
            "explanation": "With self-directed you choose everything and avoid advisory fees.",
        },
        "tags": ["no_portfolio", "core"],
        "links": [{"label": "National Bank Direct Brokerage", "url": NBDB_HOME},
                  {"label": "National Bank: Investing", "url": NBC_HOME}],
    },
    {
        "id": "first-order",
        "module": "next",
        "title": "Placing Your First Order",
        "level": 2, "minutes": 4,
        "summary": "Tickers, market orders vs limit orders, and avoiding rookie mistakes.",
        "body": [
            "Every stock and ETF has a ticker symbol (a short code). Double-check you have the right one and "
            "the right exchange (TSX vs US) before buying.",
            "A market order buys right away at the current price. A limit order only buys at your price or "
            "better, which protects you from sudden jumps. Limit orders are generally safer for beginners.",
            "Buying US-listed investments with Canadian dollars involves currency conversion, which can cost "
            "1 to 2% each way. Canadian-listed ETFs avoid this.",
        ],
        "example": "An ETF trades at $30.10. You place a limit order to buy 20 units at $30.15. It fills at "
                   "or below $30.15, so you pay at most $603.",
        "key_points": [
            "Verify the ticker and exchange.",
            "Limit orders give you price control.",
            "Watch for currency conversion costs.",
        ],
        "quiz": {
            "question": "What does a limit order do?",
            "options": ["Buys immediately at any price", "Buys only at your set price or better",
                        "Limits how many shares exist", "Sells automatically after a loss"],
            "answer": 1,
            "explanation": "A limit order sets the maximum you'll pay (or minimum you'll accept when selling).",
        },
        "tags": ["no_portfolio", "grow_wealth"],
        "links": [{"label": "National Bank Direct Brokerage", "url": NBDB_HOME}],
    },
    {
        "id": "investment-taxes",
        "module": "next",
        "title": "Taxes on Investments",
        "level": 3, "minutes": 5,
        "summary": "Capital gains, dividends and interest outside registered accounts.",
        "body": [
            "Inside a TFSA, RRSP or FHSA you generally don't pay tax year-to-year. Outside them (a "
            "'non-registered' account), different income is taxed differently.",
            "Capital gains: only 50% of the gain is added to your taxable income. Eligible Canadian dividends "
            "get a dividend tax credit, lowering their tax. Interest (from GICs, bonds, savings) is fully taxed.",
            "That's why many people fill their TFSA/RRSP first, and keep track of their cost basis for "
            "anything held in a non-registered account.",
        ],
        "example": "You sell for a $2,000 capital gain in a non-registered account. $1,000 is added to your "
                   "taxable income. In a TFSA, the same gain is never taxed.",
        "key_points": [
            "Use registered accounts first when you can.",
            "Capital gains: 50% taxable. Interest: 100% taxable.",
            "Canadian dividends get a tax credit.",
        ],
        "quiz": {
            "question": "Which is taxed most heavily outside a registered account?",
            "options": ["Capital gains", "Eligible Canadian dividends", "Interest income", "TFSA withdrawals"],
            "answer": 2,
            "explanation": "Interest income is fully taxable at your marginal rate.",
        },
        "tags": ["advanced", "income", "has_portfolio"],
    },
]

LESSONS_BY_ID = {lesson["id"]: lesson for lesson in LESSONS}
MODULES_BY_ID = {module["id"]: module for module in MODULES}
