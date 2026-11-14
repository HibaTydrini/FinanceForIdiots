# pylint: disable=line-too-long
"""
Curriculum for the Table of Contents.

To add a lesson, append a dict to LESSONS with a unique `id` and an existing `module`.

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
tags        matched against the user's quiz answers in personalize.py
links       optional [{label, url}] for "go further" (e.g. National Bank)
"""

NBC_HOME = "https://www.nbc.ca"
NBDB_HOME = "https://nbdb.ca"  # National Bank Direct Brokerage

MODULES = [
    {"id": "basics", "title": "Investing 101",
     "description": "What investing is, and the few ideas everything else builds on."},
    {"id": "products", "title": "Stocks, ETFs & Mutual Funds",
     "description": "What you can actually buy, explained in plain language."},
    {"id": "crypto", "title": "Crypto & Bitcoin",
     "description": "How crypto works, what makes Bitcoin different, and the real risks."},
    {"id": "accounts", "title": "TFSA, RRSP & FHSA",
     "description": "Canada's tax-sheltered accounts and which one fits your goal."},
    {"id": "taxes", "title": "Taxes",
     "description": "How investment gains are taxed, and how to pay less legally."},
]

LESSONS = [
    # ------------------------------------------------------------------ basics
    {
        "id": "what-is-investing",
        "module": "basics",
        "title": "What Is Investing?",
        "level": 1, "minutes": 4,
        "summary": "Putting your money to work so it grows faster than inflation.",
        "body": [
            "Investing means buying something today (a piece of a company, a loan to a government, a fund) "
            "because you expect it to be worth more in the future or to pay you income along the way.",
            "Why not just save? Because of inflation, the general rise in prices. If prices rise 3% a year "
            "and your savings earn 0.5%, your money buys a little less every year. Investing aims to grow "
            "faster than inflation.",
            "Investing is different from saving: savings are safe and available, investments can go up and "
            "down. That's why money you'll need soon, like an emergency fund, usually stays in savings, "
            "and money for long-term goals gets invested.",
        ],
        "example": "With 2.5% yearly inflation, $10,000 left in cash buys only about $7,800 worth of today's "
                   "goods after 10 years. Invested at 6% a year, it would be worth about $17,900.",
        "key_points": [
            "Investing = buying assets you expect to grow or pay you income.",
            "Cash slowly loses value to inflation.",
            "Save for short-term needs, invest for long-term goals.",
        ],
        "tags": ["core"],
    },
    {
        "id": "compound-interest",
        "module": "basics",
        "title": "Compound Growth",
        "level": 1, "minutes": 4,
        "summary": "How your money earns money on the money it already earned.",
        "body": [
            "Compounding means your returns start earning their own returns. In year one you earn on what "
            "you put in. In year two you earn on what you put in plus last year's gains, and so on.",
            "The biggest drivers are time and consistency. Starting early often matters more than starting "
            "with a lot, because the growth snowballs over many years.",
            "The 'Rule of 72' is a quick shortcut: divide 72 by your yearly return to estimate how many "
            "years it takes your money to double. At 6% per year, that's about 12 years.",
        ],
        "example": "$100/month invested at 6% per year for 30 years: you put in $36,000, and it grows to "
                   "roughly $100,000. Most of that is growth, not deposits.",
        "key_points": [
            "Returns earn their own returns over time.",
            "Time is the most powerful ingredient.",
            "Rule of 72: 72 ÷ return % = years to double.",
        ],
        "tags": ["long_horizon", "retirement", "grow_wealth"],
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
            "Investments with higher expected returns, like stocks and crypto, come with bigger swings. "
            "Safer ones, like GICs and savings accounts, pay less. There is no free lunch.",
            "Your risk tolerance is about two things: how much risk you can afford (how soon you need the "
            "money) and how much you can stomach emotionally without panic-selling.",
        ],
        "example": "In 2008 a typical stock index fell close to 40% in a year, then fully recovered within a "
                   "few years. Someone who sold in panic locked in the loss; someone who held did not.",
        "key_points": [
            "Higher expected return means bigger swings.",
            "Risk tolerance = ability + willingness to take risk.",
            "The sooner you need the money, the less risk you should take.",
        ],
        "tags": ["core"],
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
            "world's stock market) and types of investments (stocks, bonds, cash).",
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
        "tags": ["core"],
    },

    # ------------------------------------------------------------------ products
    {
        "id": "stocks",
        "module": "products",
        "title": "Stocks",
        "level": 1, "minutes": 5,
        "summary": "Owning a small piece of a real company.",
        "body": [
            "A stock (or share) is a tiny piece of ownership in a company. If a company has 1 million shares "
            "and you own 100, you own 0.01% of it.",
            "You make money in two ways: the share price goes up (a capital gain), or the company pays part "
            "of its profits to shareholders (a dividend).",
            "Prices move every day based on company results, the economy and investor mood. Over short "
            "periods they can swing a lot; over long periods stocks have historically grown more than most "
            "other investments.",
            "Picking individual stocks is hard, even for professionals. Many people own stocks through ETFs "
            "or funds instead, so they're not betting on a single company.",
        ],
        "example": "You buy 10 shares at $50 ($500). A year later they're $55 and you received $10 in "
                   "dividends. Your total return is $60, or 12%.",
        "key_points": [
            "A stock is partial ownership of a company.",
            "Returns come from price growth and dividends.",
            "Higher potential return, bigger short-term swings.",
        ],
        "tags": ["core", "stocks", "grow_wealth", "income", "high_risk", "long_horizon"],
        "links": [{"label": "National Bank Direct Brokerage", "url": NBDB_HOME}],
    },
    {
        "id": "etfs",
        "module": "products",
        "title": "ETFs & Index Funds",
        "level": 1, "minutes": 5,
        "summary": "The simplest way to own the whole market for a low fee.",
        "body": [
            "An ETF (exchange-traded fund) is a basket of investments that trades on the stock exchange like "
            "a single stock. Buy one unit and you own a slice of everything inside it.",
            "Many ETFs are index funds: they track a market index like the S&P/TSX Composite (big Canadian "
            "companies) or the S&P 500 (big US companies). Instead of picking winners, you own all of them.",
            "'All-in-one' ETFs hold a complete diversified mix of stocks and bonds in one product and "
            "rebalance it for you. They're popular with beginners because one purchase is a full portfolio.",
            "ETFs usually have very low fees (often under 0.25% per year), which leaves more of the return "
            "for you.",
        ],
        "example": "With one purchase of an all-in-one ETF you can own thousands of stocks and bonds from "
                   "around the world for a yearly fee around 0.2%, or $2 per $1,000 invested.",
        "key_points": [
            "An ETF is a basket of investments that trades like a stock.",
            "Index ETFs track the whole market instead of picking stocks.",
            "Low fees and instant diversification.",
        ],
        "tags": ["core", "etfs", "grow_wealth", "retirement"],
        "links": [{"label": "National Bank Direct Brokerage", "url": NBDB_HOME}],
    },
    {
        "id": "mutual-funds",
        "module": "products",
        "title": "Mutual Funds & Fees",
        "level": 1, "minutes": 5,
        "summary": "How funds work, and how small fees turn into big dollars.",
        "body": [
            "A mutual fund pools money from many investors, and a professional manager decides what to buy. "
            "They're often sold at bank branches and can be bought in small amounts.",
            "Every fund charges a yearly fee called the MER (Management Expense Ratio), taken directly out "
            "of your returns. Canadian mutual funds often charge 1.5 to 2.5%; index ETFs can be under 0.25%.",
            "A 2% fee sounds small, but over decades it can eat a third or more of your final balance. "
            "Most actively managed funds also fail to beat their index over the long run. Always check the "
            "MER before buying.",
        ],
        "example": "$10,000 growing at 6% for 30 years: with a 0.2% fee you end with about $54,000; with a "
                   "2% fee you end with about $32,000.",
        "key_points": [
            "A manager picks the investments for you.",
            "The MER is a yearly fee deducted from your returns.",
            "Fees compound against you, so compare them.",
        ],
        "tags": ["mutual_funds", "has_portfolio"],
    },
    {
        "id": "bonds-and-gics",
        "module": "products",
        "title": "Bonds & GICs",
        "level": 1, "minutes": 4,
        "summary": "Safer investments for stability and short-term goals.",
        "body": [
            "A bond is a loan you give to a government or company. They pay you interest regularly and "
            "return your money at a set date. Bonds are steadier than stocks, which is why they're used to "
            "calm a portfolio down.",
            "A GIC (Guaranteed Investment Certificate) is a Canadian product: you lend money to a bank for a "
            "fixed term (e.g. 1 to 5 years) at a guaranteed rate. Eligible GICs are protected by CDIC "
            "deposit insurance up to set limits.",
            "The trade-off is lower returns, and many GICs lock your money until maturity. They fit goals "
            "1 to 5 years away, like a down payment, where you can't afford a market drop.",
        ],
        "example": "A $10,000 2-year GIC at 3.5% pays about $712 in interest, guaranteed.",
        "key_points": [
            "Bonds and GICs trade growth for stability.",
            "GICs guarantee your rate and principal.",
            "Great for money you'll need within a few years.",
        ],
        "tags": ["low_risk", "short_horizon", "house", "income"],
    },

    # ------------------------------------------------------------------ crypto
    {
        "id": "what-is-crypto",
        "module": "crypto",
        "title": "What Is Crypto?",
        "level": 1, "minutes": 5,
        "summary": "Digital money with no bank in the middle, and why its price swings so much.",
        "body": [
            "A cryptocurrency is a digital asset recorded on a blockchain: a shared public ledger kept by "
            "thousands of computers instead of a bank. Nobody can quietly edit it, and you can send coins "
            "to anyone without a middleman.",
            "Unlike a stock, most crypto doesn't own a business or pay profits. Its price depends mostly on "
            "supply and demand, which is why it can rise or fall 10% or more in a single day.",
            "There are thousands of coins. Bitcoin and Ethereum are by far the largest; many smaller coins "
            "have failed or turned out to be scams.",
        ],
        "example": "If you hold $1,000 of a small coin and it drops 60% in a bad month, you're left with "
                   "$400, and it needs to rise 150% just to get back to $1,000.",
        "key_points": [
            "Crypto lives on a blockchain, not in a bank.",
            "It doesn't produce profits, so price is driven by demand.",
            "Extremely volatile, with many failed coins.",
        ],
        "tags": ["crypto", "high_risk"],
    },
    {
        "id": "bitcoin",
        "module": "crypto",
        "title": "Bitcoin",
        "level": 1, "minutes": 5,
        "summary": "The first and largest cryptocurrency, and why people call it digital gold.",
        "body": [
            "Bitcoin was launched in 2009 by an anonymous creator using the name Satoshi Nakamoto. It was "
            "the first cryptocurrency and is still the largest.",
            "Only 21 million bitcoin will ever exist. New coins are created at a slowing pace (the 'halving' "
            "about every 4 years). That fixed supply is why supporters call it 'digital gold'.",
            "Bitcoin has had huge gains and huge crashes. It fell more than 70% from its 2021 peak during "
            "2022 before recovering. Anyone buying it should be ready for that kind of drop.",
            "You don't have to buy a whole bitcoin. You can buy a fraction, like $50 worth.",
        ],
        "example": "If one bitcoin costs $100,000, $50 buys you 0.0005 BTC. If the price doubles, your "
                   "$50 becomes $100; if it falls 70%, it becomes $15.",
        "key_points": [
            "First and largest crypto, capped at 21 million coins.",
            "Can be bought in tiny fractions.",
            "Big long-term gains, but drops of 70%+ have happened.",
        ],
        "tags": ["crypto", "bitcoin", "high_risk"],
    },
    {
        "id": "crypto-safely",
        "module": "crypto",
        "title": "Buying Crypto Safely in Canada",
        "level": 2, "minutes": 5,
        "summary": "Exchanges, Bitcoin ETFs, wallets, and how to avoid scams.",
        "body": [
            "Option 1: a crypto trading platform. Use one registered with Canadian securities regulators "
            "(you can check through the Canadian Securities Administrators). You own the actual coins.",
            "Option 2: a crypto ETF. Canada has Bitcoin and Ethereum ETFs that trade on the stock exchange. "
            "You buy them through a regular brokerage account, and they can go inside a TFSA or RRSP, which "
            "the coins themselves can't.",
            "Red flags for scams: guaranteed returns, pressure to act fast, someone online offering to "
            "'help you trade', or being asked to send crypto to unlock withdrawals.",
            "A common rule of thumb: keep crypto to a small slice of your investments, an amount you could "
            "lose without changing your life.",
        ],
        "example": "Someone with $5,000 invested might keep $4,750 in a diversified ETF and put $250 (5%) "
                   "into a Bitcoin ETF inside their TFSA.",
        "key_points": [
            "Only use platforms registered in Canada.",
            "Crypto ETFs can be held in a TFSA or RRSP.",
            "No legit investment guarantees returns.",
            "Keep crypto to a small slice.",
        ],
        "tags": ["crypto", "bitcoin"],
    },

    # ------------------------------------------------------------------ accounts
    {
        "id": "tfsa",
        "module": "accounts",
        "title": "TFSA (Tax-Free Savings Account)",
        "level": 1, "minutes": 5,
        "summary": "Grow investments and withdraw them completely tax-free.",
        "body": [
            "Despite the name, a TFSA isn't just a savings account; you can hold stocks, ETFs, bonds, GICs "
            "and crypto ETFs inside it. Any growth, dividends or interest is never taxed, even when you "
            "withdraw.",
            "Every Canadian 18+ gets new contribution room each year (the government sets the amount; check "
            "CRA for the current limit), and unused room carries forward forever.",
            "You can withdraw any time, and the amount you withdraw is added back to your room the next "
            "calendar year. Over-contributing triggers a 1% per month penalty, so track your room in your "
            "CRA My Account.",
        ],
        "example": "You invest $7,000 in an ETF inside your TFSA and it grows to $20,000. You can withdraw "
                   "all $20,000 and pay $0 in tax.",
        "key_points": [
            "Growth and withdrawals are 100% tax-free.",
            "Can hold investments, not just cash.",
            "Unused room carries forward; withdrawals come back next year.",
        ],
        "tags": ["core", "tfsa", "grow_wealth", "retirement", "house"],
        "links": [{"label": "National Bank: TFSA", "url": NBC_HOME}],
    },
    {
        "id": "rrsp",
        "module": "accounts",
        "title": "RRSP (Registered Retirement Savings Plan)",
        "level": 1, "minutes": 5,
        "summary": "A tax deduction now, taxed later in retirement.",
        "body": [
            "Money you put in an RRSP reduces your taxable income this year, which can mean a tax refund. "
            "Investments grow tax-free inside, and you pay tax when you withdraw, ideally in retirement when "
            "your income (and tax rate) is lower.",
            "Your contribution room is 18% of last year's earned income, up to a yearly maximum, and unused "
            "room carries forward. Your Notice of Assessment shows your room.",
            "RRSPs shine when you're in a high tax bracket now. If your income is low (e.g. a student), a "
            "TFSA is often better first.",
        ],
        "example": "You earn $70,000 and contribute $5,000. Your taxable income drops to $65,000, which could "
                   "mean a refund of roughly $1,500 depending on your province.",
        "key_points": [
            "Contributions are tax-deductible today.",
            "Withdrawals are taxed as income later.",
            "Best when your tax rate now is higher than in retirement.",
        ],
        "tags": ["rrsp", "retirement", "long_horizon"],
        "links": [{"label": "National Bank: RRSP", "url": NBC_HOME}],
    },
    {
        "id": "fhsa",
        "module": "accounts",
        "title": "FHSA (First Home Savings Account)",
        "level": 1, "minutes": 4,
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
        "tags": ["fhsa", "house"],
        "links": [{"label": "National Bank: FHSA", "url": NBC_HOME}],
    },

    # ------------------------------------------------------------------ taxes
    {
        "id": "investment-taxes",
        "module": "taxes",
        "title": "How Investments Are Taxed",
        "level": 2, "minutes": 5,
        "summary": "Capital gains, dividends, interest, and crypto.",
        "body": [
            "Inside a TFSA, RRSP or FHSA you generally don't pay tax year-to-year. Outside them (a "
            "'non-registered' account), different kinds of income are taxed differently.",
            "Capital gains: when you sell something for more than you paid, only 50% of the gain is added "
            "to your taxable income. Eligible Canadian dividends get a dividend tax credit. Interest (from "
            "GICs, bonds, savings) is fully taxed.",
            "Crypto counts too. The CRA treats selling crypto, trading one coin for another, or spending it "
            "as a taxable event. Keep records of what you paid for every coin.",
        ],
        "example": "You sell for a $2,000 gain in a non-registered account. $1,000 is added to your taxable "
                   "income. In a TFSA, the same gain is never taxed.",
        "key_points": [
            "Registered accounts shelter you from tax.",
            "Capital gains: 50% taxable. Interest: 100% taxable.",
            "Crypto trades and sales are taxable; keep records.",
        ],
        "tags": ["core", "taxes", "income", "crypto", "has_portfolio"],
    },
    {
        "id": "tfsa-vs-rrsp",
        "module": "taxes",
        "title": "TFSA vs RRSP: Which First?",
        "level": 2, "minutes": 4,
        "summary": "A simple way to decide where your next dollar goes.",
        "body": [
            "Both accounts save you tax; they just do it at different times. An RRSP gives you the tax break "
            "now, a TFSA gives it to you later when you withdraw.",
            "Rough rule: if your income is lower now than it will be in retirement (students, early career), "
            "start with a TFSA. If your income is high now, the RRSP refund is worth more.",
            "If you're saving for a first home, the FHSA usually comes first, since it gives you both breaks. "
            "And if your employer matches RRSP contributions, take the match; it's free money.",
        ],
        "example": "A student earning $20,000 gets a small refund from an RRSP, so a TFSA makes more sense. "
                   "Someone earning $100,000 might get back over 40% of an RRSP contribution.",
        "key_points": [
            "Low income now → TFSA first.",
            "High income now → RRSP first.",
            "Buying a first home → FHSA first. Employer match → always take it.",
        ],
        "tags": ["taxes", "tfsa", "rrsp", "fhsa", "retirement", "house"],
    },
]

LESSONS_BY_ID = {lesson["id"]: lesson for lesson in LESSONS}
MODULES_BY_ID = {module["id"]: module for module in MODULES}
