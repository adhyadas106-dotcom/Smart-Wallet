(() => {
	const storageKey = "smart-wallet-transactions";
	const incomeForm = document.getElementById("income-form");
	const expenseForm = document.getElementById("expense-form");
	const clearButton = document.getElementById("clear-all");
	const totalBalance = document.getElementById("total-balance");
	const totalExpense = document.getElementById("total-expense");
	const incomeRows = document.getElementById("income-rows");
	const expenseRows = document.getElementById("expense-rows");
	const welcomeUser = document.getElementById("welcome-user");
	const logoutButton = document.querySelector(".logout-button");
	const username = localStorage.getItem("uname");
	if (welcomeUser && username) welcomeUser.textContent = `Welcome ${username}`;
	if (logoutButton) {
		logoutButton.addEventListener("click", (event) => {
			event.preventDefault();
			localStorage.removeItem("uname");
			window.location.href = logoutButton.href;
		});
	}

	if (!incomeForm || !expenseForm || !clearButton) return;

	let transactions = loadTransactions();

	function loadTransactions() {
		try {
			const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
			return Array.isArray(stored) ? stored.filter((entry) =>
				entry && (entry.type === "income" || entry.type === "expense") &&
				typeof entry.description === "string" && Number.isFinite(Number(entry.amount)) &&
				Number(entry.amount) > 0 && !Number.isNaN(Date.parse(entry.createdAt))
			) : [];
		} catch {
			return [];
		}
	}

	function formatCurrency(amount) {
		return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount)}/-`;
	}

	function formatDate(value) {
		return new Intl.DateTimeFormat("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		}).format(new Date(value));
	}

	function appendEmptyRow(tableBody, message) {
		const row = document.createElement("tr");
		row.className = "empty-row";
		const cell = document.createElement("td");
		cell.colSpan = 4;
		cell.textContent = message;
		row.append(cell);
		tableBody.replaceChildren(row);
	}

	function renderRows(tableBody, entries, message) {
		tableBody.replaceChildren();
		if (entries.length === 0) {
			appendEmptyRow(tableBody, message);
			return;
		}

		for (const entry of [...entries].reverse()) {
			const row = document.createElement("tr");
			for (const value of [entry.description, formatCurrency(entry.amount), formatCurrency(entry.balance), formatDate(entry.createdAt)]) {
				const cell = document.createElement("td");
				cell.textContent = value;
				row.append(cell);
			}
			tableBody.append(row);
		}
	}

	function render() {
		let balance = 0;
		let expenses = 0;
		const incomeEntries = [];
		const expenseEntries = [];
		const ordered = [...transactions].sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt));

		for (const transaction of ordered) {
			const amount = Number(transaction.amount);
			if (transaction.type === "income") {
				balance += amount;
				incomeEntries.push({ ...transaction, amount, balance });
			} else {
				balance -= amount;
				expenses += amount;
				expenseEntries.push({ ...transaction, amount, balance });
			}
		}

		totalBalance.textContent = formatCurrency(balance);
		totalExpense.textContent = formatCurrency(expenses);
		renderRows(incomeRows, incomeEntries, "No income entries yet.");
		renderRows(expenseRows, expenseEntries, "No expense entries yet.");
	}

	function addTransaction(form, type) {
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const formData = new FormData(form);
			const description = String(formData.get("description") || "").trim();
			const amount = Number(formData.get("amount"));
			if (!description || !Number.isFinite(amount) || amount <= 0) return;

			transactions.push({
				type,
				description,
				amount,
				createdAt: new Date().toISOString()
			});
			localStorage.setItem(storageKey, JSON.stringify(transactions));
			form.reset();
			render();
		});
	}

	addTransaction(incomeForm, "income");
	addTransaction(expenseForm, "expense");

	clearButton.addEventListener("click", () => {
		if (transactions.length === 0 || !window.confirm("Clear all income and expense entries?")) return;
		transactions = [];
		localStorage.removeItem(storageKey);
		render();
	});

	render();
})();
