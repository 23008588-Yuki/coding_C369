document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    function getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    function getCurrentUser() {
        return JSON.parse(localStorage.getItem("loggedInUser"));
    }

    function saveCurrentUser(user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }

    function updateUser(user) {
        const users = getUsers();
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) {
            users[index] = user;
            saveUsers(users);
            saveCurrentUser(user);
        }
    }

    function getSuspiciousTransactions() {
        return JSON.parse(localStorage.getItem("suspiciousTransactions")) || [];
    }

    function saveSuspiciousTransactions(transactions) {
        localStorage.setItem("suspiciousTransactions", JSON.stringify(transactions));
    }

    // Check login state
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loggedInUser = getCurrentUser();

    // Handle profile information display
    if (window.location.pathname.endsWith("/profile.html")) {
        if (isLoggedIn && loggedInUser) {
            document.getElementById('display-name').textContent = loggedInUser.name || 'N/A';
            document.getElementById('display-email').textContent = loggedInUser.email || 'N/A';
            document.getElementById('display-password').textContent = loggedInUser.password || 'N/A';
            document.getElementById('display-country').textContent = loggedInUser.country || 'N/A';

            // Display card details
            if (loggedInUser.cardDetails) {
                document.getElementById('display-card-number').textContent = loggedInUser.cardDetails.cardNumber || 'N/A';
                document.getElementById('display-card-holder-name').textContent = loggedInUser.cardDetails.cardHolderName || 'N/A';
                document.getElementById('display-expiry-date').textContent = loggedInUser.cardDetails.expiryDate || 'N/A';
                document.getElementById('display-cvv').textContent = loggedInUser.cardDetails.cvv || 'N/A';
            }
        } else {
            // Redirect to signup if no user is found
            console.log("No current user found, redirecting to signup");
            window.location.href = 'signup.html';
        }
    }

    // Function to enable profile editing
    window.editProfile = function () {
        document.getElementById('edit-name').value = loggedInUser.name || '';
        document.getElementById('edit-email').value = loggedInUser.email || '';
        document.getElementById('edit-password').value = loggedInUser.password || '';
        document.getElementById('edit-country').value = loggedInUser.country || '';

        document.getElementById('edit-profile-section').style.display = 'block';
    };

    // Handle profile form submission
    const editProfileForm = document.getElementById("edit-profile-form");
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const updatedName = document.getElementById('edit-name').value;
            const updatedEmail = document.getElementById('edit-email').value;
            const updatedPassword = document.getElementById('edit-password').value;
            const updatedCountry = document.getElementById('edit-country').value;

            loggedInUser.name = updatedName;
            loggedInUser.email = updatedEmail;
            loggedInUser.password = updatedPassword;
            loggedInUser.country = updatedCountry;

            updateUser(loggedInUser);

            // Reload to show updated details
            window.location.reload();
        });
    }

    // Function to cancel profile editing
    window.cancelEdit = function () {
        document.getElementById('edit-profile-section').style.display = 'none';
    };

    // Function to update the visibility of sections
    function updateSections() {
        const investingSection = document.getElementById('investing-section');

        if (isLoggedIn && loggedInUser) {
            if (investingSection) investingSection.style.display = 'none';
        } else {
            if (investingSection) investingSection.style.display = 'flex';
        }
    }

    // Update navbar buttons based on login status
    function updateNavbar() {
        const authButtons = document.getElementById("auth-buttons");
        const lgButton = document.getElementById("lgbutton");

        if (isLoggedIn && loggedInUser) {
            authButtons.innerHTML = `
                <li class="nav-item">
                    <span class="nav-link"><a href="profile.html" style="color: black; margin-right: 10px;">Welcome, ${loggedInUser.name}</a></span>
                </li>
                <li class="nav-item">
                    <button class="btn btn-danger" onclick="logout()">Logout</button>
                </li>
            `;

            // Update the signup button to Get Started linking to exchange.html
            if (lgButton) {
                lgButton.innerHTML = `
                    <a href="bitcoin.html" class="btn btn-success" style="width: 130px;">Get Started</a>
                `;
            }
        } else {
            authButtons.innerHTML = `
                <li class="nav-item">
                    <a class="btn btn-white" style="width: 140px; border: 2px solid #007bff; color: #007bff; margin-right: 10px; border-radius: 5px" href="/login.html">Log in</a>
                </li>
                <li class="nav-item">
                    <a class="btn btn-primary" style="width: 140px; border-radius: 5px" href="/signup.html">Sign up</a>
                </li>
            `;

            // Ensure the signup button remains as is when not logged in
            if (lgButton) {
                lgButton.innerHTML = `
                    <a href="/signup.html" class="btn btn-primary" style="width: 130px;">Sign up</a>
                `;
            }
        }
    }

    function shouldRunScripts() {
        const currentPath = window.location.pathname;
        return !(currentPath.endsWith("/login.html") || currentPath.endsWith("/signup.html"));
    }

    if (shouldRunScripts()) {
        updateNavbar();
        updateSections();
    }

    function getStatusMessage(type) {
        switch (type) {
            case 'top-up':
                return 'Successful Top-up';
            case 'buy':
                return 'Successful Buy';
            case 'sell':
                return 'Successful Sell';
            case 'exchange':
                return 'Successful Exchange';
            case 'transfer':
                return 'Successful Transfer';
            default:
                return 'Unknown';
        }
    }

    // Load user balance on homepage
    window.loadHomePage = function () {
        const user = getCurrentUser();
        if (!user) return;

        document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;

        // Update welcome message
        const userName = user.name || user.email;
        document.getElementById('user-name').textContent = userName;

        // Load transactions on bitcoin page
        if (window.location.pathname === '/bitcoin.html') {
            const transactionTableBody = document.getElementById('transaction-table-body');
            transactionTableBody.innerHTML = '';

            user.transactions.forEach(transaction => {
                const statusMessage = getStatusMessage(transaction.type);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${transaction.type || '-'}</td>
                    <td>${transaction.coin || '-'}</td>
                    <td>${transaction.date || '-'}</td>
                    <td>${transaction.reference || '-'}</td>
                    <td>${transaction.amount || '-'}</td>
                    <td>${statusMessage || '-'}</td>
                `;
                transactionTableBody.appendChild(tr);
            });
        }  
    };

    // function getStatusMessage(type) {
    //     switch (type) {
    //         case 'top-up':
    //             return 'Successful Top-up';
    //         case 'buy':
    //             return 'Successful Buy';
    //         case 'sell':
    //             return 'Successful Sell';
    //         case 'exchange':
    //             return 'Successful Exchange';
    //         case 'transfer':
    //             return 'Successful Transfer';
    //         default:
    //             return 'Unknown';
    //     }
    // }

    // Ensure loadHomePage runs on specific pages
    if (window.location.pathname === '/index.html' || window.location.pathname === '/bitcoin.html') {
        loadHomePage();
    }

    // Handle login form submission
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem("isLoggedIn", "true");
                saveCurrentUser(user);
                window.location.href = "/index.html";
            } else {
                alert("Invalid email or password");
            }
        });
    }

    // Handle profile information display
    if (window.location.pathname.endsWith("/profile.html")) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log("Current user data:", currentUser);

        if (isLoggedIn && loggedInUser) {
            document.getElementById('display-name').textContent = loggedInUser.name || 'N/A';
            document.getElementById('display-email').textContent = loggedInUser.email || 'N/A';
            document.getElementById('display-password').textContent = loggedInUser.password || 'N/A';
            document.getElementById('display-country').textContent = loggedInUser.country || 'N/A';
        } else {
            // Redirect to signup if no user is found
            console.log("No current user found, redirecting to signup");
            window.location.href = 'signup.html';
        }
    }

    // Handle signup form submission
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const country = document.getElementById("country").value;

            const newUser = { name, email, password, country, balance: 0, transactions: [] };
            const users = getUsers();
            users.push(newUser);
            saveUsers(users);

            window.location.href = "/login.html";
        });
    }

    // Handle logout
    window.logout = function () {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        window.location.href = "/login.html";
    };

    // Load dashboard data
    window.loadDashboard = function () {
        const user = getCurrentUser();
        if (!user) return;

        document.getElementById('balance').textContent = user.balance.toFixed(2);

        const transactionTableBody = document.getElementById('transaction-table-body');
        transactionTableBody.innerHTML = '';
        user.transactions.forEach(transaction => {
            const statusMessage = getStatusMessage(transaction.type);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${transaction.type || '-'}</td>
                <td>${transaction.coin || '-'}</td>
                <td>${transaction.date || '-'}</td>
                <td>${transaction.reference || '-'}</td>
                <td>${transaction.amount || '-'}</td>
                <td>${transaction.recipient || '-'}</td>
                <td>${transaction.currency || '-'}</td>
                <td>${statusMessage || '-'}</td>
            `;
            transactionTableBody.appendChild(tr);
        });
        // Highlight rows and add click event listeners after populating the table
        highlightRows();
        addRowClickEvent();
        
    };

    // Redirect to the dashboard page
    function backhome() {
        window.location.href = 'dashboard.html';
    }

    // Make the functions available in the global scope
    window.backhome = backhome;

    // Handle top-up amount setting
    window.setAmount = function (amount) {
        document.getElementById('amount').value = amount;
    };

    window.continueTopUp = function () {
        const amount = parseFloat(document.getElementById('amount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please select a valid amount to top up');
            return;
        }
        localStorage.setItem('topUpAmount', amount);
        window.location.href = 'checkout.html';
    };

    // Process payment and update user balance
    window.processPayment = function (event) {
        event.preventDefault(); // Prevent form submission

        const amount = parseFloat(localStorage.getItem('topUpAmount'));
        const cardNumber = document.getElementById('cardNumber').value;
        const cardHolderName = document.getElementById('cardHolderName').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        if (cardNumber && cardHolderName && expiryDate && cvv && !isNaN(amount) && amount > 0) {
            const user = getCurrentUser();
            if (!user) return;


            user.balance += amount;
            user.transactions.push({ amount: `+${amount.toFixed(2)}`, date: new Date().toLocaleString(), reference: Math.floor(Math.random() * 1000000), status: 'Successful', type: 'top-up' });
            updateUser(user);

            // Clear card information after processing
            document.getElementById('cardNumber').value = '';
            document.getElementById('cardHolderName').value = '';
            document.getElementById('expiryDate').value = '';
            document.getElementById('cvv').value = '';

            // // Refresh transaction table
            // loadHomePage();

            window.location.href = 'verification.html';
        } else {
            alert('Please fill in all the card details');
        }
    };


    // Handle verification submission
    window.submitVerification = function (event) {
        event.preventDefault();  // Prevent form from reloading the page
        const verificationCode = document.getElementById('verificationCode').value;
        // Allow any code to pass
        window.location.href = 'successful.html';
    };

    
    window.continuetransfer = function () {
        const amount = parseFloat(document.getElementById('amount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please select a valid amount to top up');
            return;
        }
        localStorage.setItem('topUpAmount', amount);
        window.location.href = 'recipient.html';
    };

    // Process payment and update user balance
    window.transferpayment = function (event) {
        event.preventDefault(); // Prevent form submission

        const amount = parseFloat(localStorage.getItem('topUpAmount'));
        const accountnumber = document.getElementById('accountnumber').value;
        const accountname = document.getElementById('accountname').value;
        const currency = document.getElementById('currency').value;

        if (accountnumber && accountname && currency && !isNaN(amount) && amount > 0) {
            const user = getCurrentUser();
            if (!user) return;

            user.balance -= amount;
            user.transactions.push({
                amount: `-${amount.toFixed(2)}`,
                date: new Date().toLocaleString(),
                reference: Math.floor(Math.random() * 1000000),
                status: 'Successful',
                type: 'transfer',
                recipient: accountname,
                currency: currency
            });
            updateUser(user);

            // Clear account information after processing
            document.getElementById('accountnumber').value = '';
            document.getElementById('accountname').value = '';
            document.getElementById('currency').value = '';

            // Check if the transfer amount is greater than 10000
            if (amount > 2500) {
                let transfers = JSON.parse(localStorage.getItem('transfers')) || [];
                let transferDetails = {
                    amount: amount.toFixed(2),
                    accountname: accountname,
                    date: new Date().toISOString(),
                    currency: currency
                };
                transfers.push(transferDetails);
                localStorage.setItem('transfers', JSON.stringify(transfers));

                // Add transfer details to AML2.html dynamically
                let alertTableBody = document.getElementById('alert-table-body');
                if (alertTableBody) {
                    let row = alertTableBody.insertRow();
                    row.insertCell(0).textContent = new Date(transferDetails.date).toLocaleDateString();
                    row.insertCell(1).textContent = new Date(transferDetails.date).toLocaleTimeString();
                    row.insertCell(2).textContent = transferDetails.accountname;
                    row.insertCell(3).textContent = transferDetails.amount;
                }

                alert('Transfer added to AML2.html');
            }


            // Redirect to verification page
            window.location.href = 'verification.html';
        } else {
            alert('Please fill in account details');
        }
    };


    // Load the dashboard when the page is loaded
    if (window.location.pathname.endsWith('/dashboard.html')) {
        loadDashboard();
    }


    // Load user balance on homepage
    window.loadHomePage = function () {
        const user = getCurrentUser();
        if (!user) return;

        document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;
        document.getElementById('currentbalance').textContent = `$${user.balance.toFixed(2)}`;

        // Update welcome message
        const userName = user.name || user.email;
        document.getElementById('user-name').textContent = userName;

        // Load transactions on bitcoin page
        if (window.location.pathname === '/bitcoin.html') {
            const transactionTableBody = document.getElementById('transaction-table-body');
            transactionTableBody.innerHTML = '';

        // Filter transactions
        const filteredTransactions = user.transactions.filter(transaction =>
            ['buy', 'sell', 'exchange'].includes(transaction.asset)
        );

        loadTransactions(filteredTransactions);
            user.transactions.forEach(transaction => {
                const statusMessage = getStatusMessage(transaction.type);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${transaction.type}</td>
                    <td>${transaction.asset || '-'}</td>
                    <td>${transaction.date || '-'}</td>
                    <td>${transaction.reference || '-'}</td>
                    <td>${transaction.amount || '-'}</td>
                    <td>${statusMessage || '-'}</td>
                `;
                transactionTableBody.appendChild(tr);
            });
        }
    };

    // Handle coin purchase
    window.buyCoin = function () {
        const coin = document.getElementById('coin').value;
        const amount = parseFloat(document.getElementById('amount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const user = getCurrentUser();
        if (!user) return;

        if (user.balance < amount) {
            alert('Insufficient balance');
            return;
        }

        user.balance -= amount;
        const transaction = {
            type:'buy',
            coin: coin,
            amount: `-${amount.toFixed(2)}`,
            date: new Date().toLocaleString(),
            reference: Math.floor(Math.random() * 1000000),
            status: 'Successful',
        };
        user.transactions.push(transaction);
        updateUser(user);

        document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;

        // Filter transactions
        const filteredTransactions = user.transactions.filter(transaction =>
            ['buy', 'sell', 'exchange'].includes(transaction.asset)
        );

        loadTransactions(filteredTransactions);

        // Update transactions table on bitcoin page
        if (window.location.pathname === '/bitcoin.html') {
            const transactionTableBody = document.getElementById('transaction-table-body');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${transaction.type}</td>
                <td>${transaction.coin}</td>
                <td>${transaction.date}</td>
                <td>${transaction.reference}</td>
                <td>${transaction.amount || '-'}</td>
                <td>${transaction.status || '-'}</td>
            `;
            transactionTableBody.appendChild(tr);
        }
        

        // Clear input fields
        document.getElementById('amount').value = '';

        // Update transactions on dashboard page
        if (window.location.pathname === '/dashboard.html') {
            loadDashboard();
        }

        // Refresh transaction table
        loadHomePage();
    };

    // Handle coin selling
    window.sellCoin = function () {
        const coin = document.getElementById('coin').value;
        const amount = parseFloat(document.getElementById('amount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        

        const user = getCurrentUser();
        if (!user) return;

        user.balance -= amount;
        const transaction = {
            type:'sell',
            coin: coin,
            amount: `+${amount.toFixed(2)}`,
            date: new Date().toLocaleString(),
            reference: Math.floor(Math.random() * 1000000),
            status: 'Successful'
        };
        user.transactions.push(transaction);
        updateUser(user);

        document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;
        loadTransactions();
        // Filter transactions
        const filteredTransactions = user.transactions.filter(transaction =>
            ['buy', 'sell', 'exchange'].includes(transaction.asset)
        );

        loadTransactions(filteredTransactions);
       

        // Update transactions table on bitcoin page
        if (window.location.pathname === '/bitcoin.html') {
            const transactionTableBody = document.getElementById('transaction-table-body');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${transaction.type}</td>
                <td>${transaction.coin}</td>
                <td>${transaction.date}</td>
                <td>${transaction.reference}</td>
                <td>${transaction.amount || '-'}</td>
                <td>${transaction.status || '-'}</td>
            `;
            transactionTableBody.appendChild(tr);
        }

        // Clear input fields
        document.getElementById('amount').value = '';

        // Update transactions on dashboard page
        if (window.location.pathname === '/dashboard.html') {
            loadDashboard();
        }

        // Refresh transaction table
        loadHomePage();
    };

    // Show exchange form
    window.showExchangeForm = function () {
        document.getElementById('exchange-form').style.display = 'block';
        document.getElementById('transfer-form').style.display = 'none';
    };

    // Handle coin exchange
    window.exchangeCoin = function () {
        const reference = document.getElementById('transaction-reference').value;
        const newCoin = document.getElementById('new-coin').value;
        const exchangeAmount = parseFloat(document.getElementById('exchange-amount').value);
        if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        console.log("Reference:", reference);
        console.log("New Coin:", newCoin);
        console.log("Exchange Amount:", exchangeAmount);

        const user = getCurrentUser();
        if (!user) return;

        const oldTransaction = user.transactions.find(t => t.reference && t.reference.toString() === reference);
        console.log("Transaction Found:", oldTransaction);
        if (!oldTransaction) {
            alert('Transaction not found');
            return;
        }

        if (exchangeAmount > Math.abs(parseFloat(oldTransaction.amount))) {
            alert('Exchange amount exceeds the original transaction amount');
            return;
        }

        // Create a new transaction entry instead of overwriting the old one
        const newReference = Math.floor(Math.random() * 1000000);
        const newTransaction = {
            type: 'exchange',
            coin: newCoin,
            amount: exchangeAmount.toFixed(2),
            date: new Date().toLocaleString(),
            reference: newReference,  // Generate a new reference number
            status: 'Successful',
            
        };
        user.transactions.push(newTransaction);
        updateUser(user);


        console.log("Updated User:", user);

        // Clear exchange form fields
        document.getElementById('transaction-reference').value = '';
        document.getElementById('new-coin').value = '';
        document.getElementById('exchange-amount').value = '';

        alert(`Exchange completed successfully\nOld Transaction Reference: ${oldTransaction.reference}\nNew Transaction Reference: ${newReference}`);

        // Reload the transaction list without filtering here
        loadTransactions(filterTransactions);
    };
    // Event listener to filter transactions based on type
    document.getElementById('asset-filter').addEventListener('change', function() {
        const filter = this.value;
        loadTransactions(filter);
    });
    // Function to load transactions and filter them based on the selected type
    function loadTransactions(filter = "all") {
        const user = getCurrentUser();
        if (!user) return;

        const transactionTableBody = document.getElementById('transaction-table-body');
        transactionTableBody.innerHTML = '';

        let transactions = user.transactions;

        transactions = transactions.filter(transaction => filter === "all" || transaction.type === filter);
        
        transactions.forEach(transaction => {
            const statusMessage = getStatusMessage(transaction.type);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${transaction.type}</td>
                <td>${transaction.coin}</td>
                <td>${transaction.date}</td>
                <td>${transaction.reference}</td>
                <td>${transaction.amount || '-'}</td>
                <td>${transaction.status || '-'}</td>
            `;
            transactionTableBody.appendChild(tr);
        });

        function loadBalance() {
            const user = getCurrentUser();
            if (!user) return;

            const balanceElements = document.querySelectorAll('#balance, #total-balance, #current-balance');
            balanceElements.forEach(el => {
                if (el) el.textContent = `$${user.balance.toFixed(2)}`;
            });
        }

        window.filterTransactions = function () {
            const filter = document.getElementById('asset-filter').value;
            loadTransactions(filter);
        }

        function loadDashboard() {
            loadBalance();
            loadTransactions();
        }
    
        function loadHomePage() {
            const user = getCurrentUser();
            if (!user) return;

            document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;

            // Filter transactions
            const filteredTransactions = user.transactions.filter(transaction =>
                ['buy', 'sell', 'exchange'].includes(transaction.asset)
            );

            loadTransactions(filteredTransactions);

            const userName = user.name || user.email;
            document.getElementById('user-name').textContent = userName;

            loadTransactions();
        }

        if (window.location.pathname === '/index.html' || window.location.pathname === '/bitcoin.html') {
            loadHomePage();
        }

        if (window.location.pathname === '/dashboard.html') {
            loadDashboard();
        }
    }

    // Handle profile editing
    function editProfile() {
        const editProfileSection = document.getElementById('edit-profile-section');
        const displayProfileSection = document.getElementById('display-profile-section');
        const nameInput = document.getElementById('edit-name');
        const countryInput = document.getElementById('edit-country');
        const profilePicInput = document.getElementById('upload-pic');
        const saveProfileBtn = document.getElementById('save-profile-btn');

        if (editProfileSection && displayProfileSection && nameInput && countryInput && saveProfileBtn) {
            nameInput.value = loggedInUser.name || '';
            countryInput.value = loggedInUser.country || '';

            editProfileSection.style.display = 'block';
            displayProfileSection.style.display = 'none';

            saveProfileBtn.addEventListener('click', function () {
                const updatedName = nameInput.value;
                const updatedCountry = countryInput.value;
                const updatedProfilePic = profilePicInput.files[0];

                if (updatedName && updatedCountry) {
                    loggedInUser.name = updatedName;
                    loggedInUser.country = updatedCountry;

                    if (updatedProfilePic) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            loggedInUser.profilePic = e.target.result;
                            saveCurrentUser(loggedInUser);
                            updateUser(loggedInUser);
                            window.location.reload();
                        };
                        reader.readAsDataURL(updatedProfilePic);
                    } else {
                        saveCurrentUser(loggedInUser);
                        updateUser(loggedInUser);
                        window.location.reload();
                    }
                } else {
                    alert('Please fill in all required fields.');
                }
            });
        }
    }

    // Check if on homepage or bitcoin page and load balance
    if (window.location.pathname === '/index.html' || window.location.pathname === '/bitcoin.html') {
        loadHomePage();
    }

    // Check if on dashboard page and load dashboard data
    if (window.location.pathname === '/dashboard.html') {
        loadDashboard();
    }

    // Load suspicious transactions on AML2.html
    if (window.location.pathname.endsWith('/AML2.html')) {
        const suspiciousTransactions = JSON.parse(localStorage.getItem('suspiciousTransactions'))
        const alertTableBody = document.getElementById('alert-table-body');
        alertTableBody.innerHTML = '';
        suspiciousTransactions.forEach(transaction => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${transaction.date.split(',')[0]}</td>
                <td>${transaction.date.split(',')[1].trim()}</td>
                <td>${transaction.recipient || '-'}</td>
                <td>${transaction.amount || '-'}</td>
            `;
            alertTableBody.appendChild(tr);
        });
    }

    // Handle profile information display
    if (window.location.pathname.endsWith("/profile.html")) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log("Current user data:", currentUser);

        if (isLoggedIn && loggedInUser) {
            document.getElementById('display-name').textContent = loggedInUser.name || 'N/A';
            document.getElementById('display-email').textContent = loggedInUser.email || 'N/A';
            document.getElementById('display-password').textContent = loggedInUser.password || 'N/A';
            document.getElementById('display-country').textContent = loggedInUser.country || 'N/A';

            // Display card details
            if (loggedInUser.cardDetails) {
                document.getElementById('display-card-number').textContent = loggedInUser.cardDetails.cardNumber || 'N/A';
                document.getElementById('display-card-holder-name').textContent = loggedInUser.cardDetails.cardHolderName || 'N/A';
                document.getElementById('display-expiry-date').textContent = loggedInUser.cardDetails.expiryDate || 'N/A';
                document.getElementById('display-cvv').textContent = loggedInUser.cardDetails.cvv || 'N/A';
            }
        } else {
            // Redirect to signup if no user is found
            console.log("No current user found, redirecting to signup");
            window.location.href = 'signup.html';
        }
    }

    // Filter for the dropdown box (dashboard.html)
    function loadTransactions(filter = "all") {
        const user = getCurrentUser();
        if (!user) return;

        const transactionTableBody = document.getElementById('transaction-table-body');
        transactionTableBody.innerHTML = '';

        let transactions = user.transactions;

        if (window.location.pathname === '/bitcoin.html') {
            transactions = transactions.filter(transaction =>
                ['buy', 'sell', 'exchange'].includes(transaction.type)
            );


        }

        transactions
            .filter(transaction => filter === "all" || transaction.type === filter)
            .forEach(transaction => {
                const statusMessage = getStatusMessage(transaction.type);
                const tr = document.createElement('tr');
                if (window.location.pathname === '/dashboard.html') {
                    tr.innerHTML = `
                        <td>${transaction.type || '-'}</td>
                        <td>${transaction.coin || '-'}</td>
                        <td>${transaction.date || '-'}</td>
                        <td>${transaction.reference || '-'}</td>
                        <td>${transaction.amount || '-'}</td>
                        <td>${transaction.recipient || '-'}</td>
                        <td>${transaction.currency || '-'}</td>
                        <td>${statusMessage || '-'}</td>
                    `;
                } 
                transactionTableBody.appendChild(tr);
            });
    }
    

    window.filterTransactions = function () {
        const filter = document.getElementById('asset-filter').value;
        loadTransactions(filter);
    }

    function buyCoin() {
        const coin = document.getElementById('coin').value;
        const amount = parseFloat(document.getElementById('amount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const user = getCurrentUser();
        if (!user) return;

        if (user.balance < amount) {
            alert('Insufficient balance');
            return;
        }

        user.balance -= amount;
        const transaction = {
            type: 'buy',
            asset: coin,
            amount: `-${amount.toFixed(2)}`,
            date: new Date().toLocaleString(),
            reference: Math.floor(Math.random() * 1000000),
            status: 'Successful'
        };
        user.transactions.push(transaction);
        updateUser(user);

        document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;
        
        loadTransactions();
    }

    function sellCoin() {
        const coin = document.getElementById('coin').value;
        const amount = parseFloat(document.getElementById('amount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const user = getCurrentUser();
        if (!user) return;

        user.balance += amount;
        const transaction = {
            type: 'sell',
            asset: coin,
            amount: `+${amount.toFixed(2)}`,
            date: new Date().toLocaleString(),
            reference: Math.floor(Math.random() * 1000000),
            status: 'Successful'
        };
        user.transactions.push(transaction);
        updateUser(user);

        document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;

        loadTransactions();
    }

    window.showExchangeForm = function () {
        document.getElementById('exchange-form').style.display = 'block';
    };

    function exchangeCoin() {
        const reference = document.getElementById('transaction-reference').value;
        const newCoin = document.getElementById('new-coin').value;
        const exchangeAmount = parseFloat(document.getElementById('exchange-amount').value);
        if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const user = getCurrentUser();
        if (!user) return;

        const oldTransaction = user.transactions.find(t => t.reference && t.reference.toString() === reference);
        if (!oldTransaction) {
            alert('Transaction not found');
            return;
        }

        if (exchangeAmount > Math.abs(parseFloat(oldTransaction.amount))) {
            alert('Exchange amount exceeds the original transaction amount');
            return;
        }

        const newReference = Math.floor(Math.random() * 1000000);
        const newTransaction = {
            type: 'exchange',
            asset: newCoin,
            amount: exchangeAmount.toFixed(2),
            date: new Date().toLocaleString(),
            reference: newReference,
            status: 'Successful'
        };
        user.transactions.push(newTransaction);
        updateUser(user);

        document.getElementById('current-balance').textContent = `$${user.balance.toFixed(2)}`;
        loadTransactions();
        

    }

    // Load the current balance in dashboard, bitcoin and transfer
    function loadBalance() {
        const user = getCurrentUser();
        if (!user) return;

        document.getElementById('current-balance').textContent = user.balance.toFixed(2);
        document.getElementById('total-balance').textContent = `$${user.balance.toFixed(2)}`;
    }

    window.filterTransactions = function () {
        const filter = document.getElementById('asset-filter').value;
        loadTransactions(filter);
    }

    if (window.location.pathname === '/bitcoin.html' || window.location.pathname === '/dashboard.html' || window.location.pathname === '/transfer.html') {
        loadTransactions();
        loadBalance();
    }


    document.addEventListener("DOMContentLoaded", function () {
        console.log("DOM fully loaded and parsed");

        // Function to get the current user from local storage
        function getCurrentUser() {
            return JSON.parse(localStorage.getItem("loggedInUser"));
        }

        // Function to update user information in local storage
        function updateUser(user) {
            const users = getUsers();
            const index = users.findIndex(u => u.email === user.email);
            if (index !== -1) {
                users[index] = user;
                localStorage.setItem("users", JSON.stringify(users));
                localStorage.setItem("loggedInUser", JSON.stringify(user));
            }
        }

        // Function to get all users from local storage
        function getUsers() {
            return JSON.parse(localStorage.getItem("users")) || [];
        }

        // Handle transfer form submission
        if (window.location.pathname.endsWith('/transfer.html')) {
            document.getElementById('transfer-form').addEventListener('submit', function (event) {
                event.preventDefault();

                const recipientName = document.getElementById('recipient-name').value;
                const recipientEmail = document.getElementById('recipient').value;
                const amount = parseFloat(document.getElementById('amount').value);
                const currency = document.getElementById('currency').value;

                if (isNaN(amount) || amount <= 0) {
                    alert('Please enter a valid amount');
                    return;
                }

                const transaction = {
                    asset:type, 
                    type: 'Transfer',
                    recipientName,
                    recipientEmail,
                    amount: `-${amount.toFixed(2)}`,
                    currency,
                    date: new Date().toLocaleString(),
                    reference: Math.floor(Math.random() * 1000000),
                    status: 'Successful'
                };

                let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
                transactions.push(transaction);
                localStorage.setItem('transactions', JSON.stringify(transactions));

                alert('Transfer successful!');
                window.location.href = 'dashboard.html';
            });

            // Load current balance
            const user = getCurrentUser();
            if (user) {
                document.getElementById('current-balance').textContent = user.balance.toFixed(2);
            }
        }

        // Load transactions on dashboard
        if (window.location.pathname.endsWith('/dashboard.html')) {
            loadDashboard();
        }
    });

    function loadDashboard() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const transactionTableBody = document.getElementById('transaction-table-body');
        transactionTableBody.innerHTML = '';

        transactions.forEach(transaction => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${transaction.type}</td>
                <td>${transaction.date}</td>
                <td>${transaction.reference}</td>
                <td>${transaction.amount}</td>
                <td>${transaction.recipientName}</td>
                <td>${transaction.currency}</td>
                <td>${transaction.status}</td>
            `;
            transactionTableBody.appendChild(tr);
        });

        // Load current balance
        const user = getCurrentUser();
        if (user) {
            document.getElementById('balance').textContent = user.balance.toFixed(2);
        }
    }


    window.buyCoin = buyCoin;
    window.sellCoin = sellCoin;
    window.exchangeCoin = exchangeCoin;

});

