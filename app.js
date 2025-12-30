// Data
const mockData = {
    books: [
        { id: 1, isbn: "9780134685991", title: "Effective Java", author: "Joshua Bloch", category: "Programming", totalCopies: 3, availableCopies: 2, publishYear: 2018 },
        { id: 2, isbn: "9780132350884", title: "Clean Code", author: "Robert C. Martin", category: "Programming", totalCopies: 5, availableCopies: 3, publishYear: 2008 },
        { id: 3, isbn: "9781491950296", title: "Building Microservices", author: "Sam Newman", category: "Software Architecture", totalCopies: 2, availableCopies: 1, publishYear: 2015 },
        { id: 4, isbn: "9780596517748", title: "JavaScript: The Good Parts", author: "Douglas Crockford", category: "Programming", totalCopies: 4, availableCopies: 4, publishYear: 2008 },
        { id: 5, isbn: "9781449355739", title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", category: "Database", totalCopies: 3, availableCopies: 2, publishYear: 2017 },
        { id: 6, isbn: "9780201633610", title: "Design Patterns", author: "Gang of Four", category: "Software Design", totalCopies: 2, availableCopies: 0, publishYear: 1994 },
        { id: 7, isbn: "9781617294136", title: "The DevOps Handbook", author: "Gene Kim", category: "DevOps", totalCopies: 3, availableCopies: 3, publishYear: 2016 },
        { id: 8, isbn: "9780135957059", title: "The Pragmatic Programmer", author: "David Thomas", category: "Programming", totalCopies: 4, availableCopies: 2, publishYear: 2019 },
    ],
    members: [
        { id: 2, email: "admin@library.com", password: "admin123", name: "Jane Smith", role: "librarian", joinDate: "2023-06-01" },
    ],
    loans: [
        { id: 1, bookId: 1, memberId: 1, issuedDate: "2025-01-10", dueDate: "2025-01-24", returnedDate: null, status: "active" },
        { id: 2, bookId: 6, memberId: 1, issuedDate: "2025-01-05", dueDate: "2025-01-19", returnedDate: null, status: "active" },
    ],
    reservations: [],
}

// ==================== STATE MANAGEMENT ====================

function loadState() {
    const savedState = localStorage.getItem("lms_state")
    const savedUser = localStorage.getItem("lms_user")

    if (savedState) {
        const parsedState = JSON.parse(savedState)
        return {
            ...parsedState,
            currentUser: savedUser ? JSON.parse(savedUser) : null,
            currentPage: "home"
        }
    }

    // Fallback to data
    return {
        currentUser: savedUser ? JSON.parse(savedUser) : null,
        currentPage: "home",
        books: [...mockData.books],
        members: [...mockData.members],
        loans: [...mockData.loans],
        reservations: [...mockData.reservations],
    }
}

const state = loadState()

function saveState() {
    const stateToSave = {
        books: state.books,
        members: state.members,
        loans: state.loans,
        reservations: state.reservations
    }
    localStorage.setItem("lms_state", JSON.stringify(stateToSave))
}

// ==================== UTILITY FUNCTIONS ====================

function generateId(array) {
    return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1
}

function formatDate(dateString) {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

function calculateDaysUntilDue(dueDate) {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

function addDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result.toISOString().split("T")[0]
}

// ==================== AUTH FUNCTIONS ====================

function login(email, password) {
    const user = state.members.find((m) => m.email === email && m.password === password)
    if (user) {
        state.currentUser = user
        localStorage.setItem("lms_user", JSON.stringify(user))
        updateAuthUI()
        return true
    }
    return false
}

function register(email, password, name) {
    const exists = state.members.find((m) => m.email === email)
    if (exists) {
        return { success: false, message: "Email already registered" }
    }

    const newMember = {
        id: generateId(state.members),
        email,
        password,
        name,
        role: "member",
        joinDate: new Date().toISOString().split("T")[0],
    }

    state.members.push(newMember)
    saveState() // PERSISTENCE
    return { success: true, message: "Registration successful! Please login." }
}

function logout() {
    state.currentUser = null
    localStorage.removeItem("lms_user")
    updateAuthUI()
    navigateTo("home")
}

function checkAuth() {
    // State is already loaded via loadState(), just update UI
    updateAuthUI()
}

function updateAuthUI() {
    const authButtons = document.getElementById("auth-buttons")
    const userMenu = document.getElementById("user-menu")
    const navLinks = document.getElementById("nav-links")

    if (state.currentUser) {
        authButtons.classList.add("hidden")
        userMenu.classList.remove("hidden")
        document.getElementById("user-name").textContent = state.currentUser.name

        if (state.currentUser.role === "librarian") {
            navLinks.innerHTML = `
                <a href="#home" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">Home</a>
                <a href="#catalog" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">Catalog</a>
                <a href="#librarian-dashboard" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">Dashboard</a>
            `
        } else {
            navLinks.innerHTML = `
                <a href="#home" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">Home</a>
                <a href="#catalog" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">Catalog</a>
                <a href="#member-dashboard" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">My Loans</a>
            `
        }
    } else {
        authButtons.classList.remove("hidden")
        userMenu.classList.add("hidden")
        navLinks.innerHTML = `
            <a href="#home" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">Home</a>
            <a href="#catalog" class="nav-link text-gray-700 dark:text-gray-300 hover:text-academic-navy dark:hover:text-primary-500 font-medium transition">Catalog</a>
        `
    }
}

// ==================== BOOK FUNCTIONS ====================

function searchBooks(query) {
    const q = query.toLowerCase()
    return state.books.filter(
        (book) => book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q) || book.isbn.includes(q),
    )
}

function getBookById(bookId) {
    return state.books.find((b) => b.id === bookId)
}

function borrowBook(bookId, memberId) {
    const book = getBookById(bookId)
    if (!book || book.availableCopies <= 0) {
        return { success: false, message: "Book not available" }
    }

    const activeLoan = state.loans.find((l) => l.bookId === bookId && l.memberId === memberId && l.status === "active")

    if (activeLoan) {
        return { success: false, message: "You already have this book borrowed" }
    }

    const newLoan = {
        id: generateId(state.loans),
        bookId,
        memberId,
        issuedDate: new Date().toISOString().split("T")[0],
        dueDate: addDays(new Date(), 14),
        returnedDate: null,
        status: "active",
    }

    state.loans.push(newLoan)
    book.availableCopies--

    saveState() // PERSISTENCE
    return { success: true, message: "Book borrowed successfully!" }
}

function returnBook(loanId) {
    const loan = state.loans.find((l) => l.id === loanId)
    if (!loan) {
        return { success: false, message: "Loan not found" }
    }

    if (loan.status === "returned") {
        return { success: false, message: "Book already returned" }
    }

    const book = getBookById(loan.bookId)
    loan.status = "returned"
    loan.returnedDate = new Date().toISOString().split("T")[0]
    book.availableCopies++

    saveState() // PERSISTENCE
    return { success: true, message: "Book returned successfully!" }
}

function reserveBook(bookId, memberId) {
    const existing = state.reservations.find(
        (r) => r.bookId === bookId && r.memberId === memberId && r.status === "active",
    )

    if (existing) {
        return { success: false, message: "You already have a reservation for this book" }
    }

    const newReservation = {
        id: generateId(state.reservations),
        bookId,
        memberId,
        reservedDate: new Date().toISOString().split("T")[0],
        status: "active",
    }

    state.reservations.push(newReservation)
    saveState() // PERSISTENCE
    return { success: true, message: "Book reserved successfully!" }
}

function getMemberLoans(memberId) {
    return state.loans
        .filter((l) => l.memberId === memberId && l.status === "active")
        .map((loan) => ({
            ...loan,
            book: getBookById(loan.bookId),
        }))
}

// ==================== LIBRARIAN FUNCTIONS ====================

function addBook(bookData) {
    const newBook = {
        id: generateId(state.books),
        ...bookData,
        availableCopies: bookData.totalCopies,
    }
    state.books.push(newBook)
    saveState() // PERSISTENCE
    return { success: true, message: "Book added successfully!" }
}

function updateBook(bookId, bookData) {
    const index = state.books.findIndex((b) => b.id === bookId)
    if (index === -1) {
        return { success: false, message: "Book not found" }
    }

    const book = state.books[index]
    const copiesDiff = bookData.totalCopies - book.totalCopies

    state.books[index] = {
        ...book,
        ...bookData,
        availableCopies: book.availableCopies + copiesDiff,
    }

    saveState() // PERSISTENCE
    return { success: true, message: "Book updated successfully!" }
}

function issueBookToMember(isbn, memberEmail) {
    const book = state.books.find((b) => b.isbn === isbn)
    const member = state.members.find((m) => m.email === memberEmail)

    if (!book) {
        return { success: false, message: "Book not found" }
    }

    if (!member) {
        return { success: false, message: "Member not found" }
    }

    return borrowBook(book.id, member.id)
}

// ==================== PAGE RENDERING ====================

function renderHome() {
    return `
        <div class="flex flex-col min-h-screen">
            <div class="relative bg-academic-navy">
                <div class="absolute inset-0">
                    <img class="w-full h-full object-cover" src="/images/lasus.jpg" alt="University Library">
                    <div class="absolute inset-0 bg-academic-navy/80 mix-blend-multiply"></div>
                </div>
                
                <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div class="text-center">
                        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            Discover Knowledge at <br/>
                            <span class="text-blue-200">Lasustech Library</span>
                        </h1>
                        <p class="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light">
                            Your gateway to millions of academic resources, research papers, and digital archives.
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#catalog" class="px-8 py-4 bg-white text-academic-navy rounded-lg hover:bg-blue-50 font-bold text-lg transition shadow-lg flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                Search Catalog
                            </a>
                            ${!state.currentUser ? `
                                <a href="#register" class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 font-bold text-lg transition flex items-center justify-center">
                                    Student Registration
                                </a>
                            ` : ""}
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 py-16">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border-t-4 border-academic-navy hover:-translate-y-1 transition duration-300">
                            <div class="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6 text-academic-navy dark:text-primary-500">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Digital Archives</h3>
                            <p class="text-gray-600 dark:text-gray-400">Access thousands of e-books, journals, and research papers from anywhere on campus.</p>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border-t-4 border-academic-navy hover:-translate-y-1 transition duration-300">
                            <div class="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6 text-academic-navy dark:text-primary-500">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Easy Reservations</h3>
                            <p class="text-gray-600 dark:text-gray-400">Reserve physical copies of popular textbooks and pick them up at the front desk.</p>
                        </div>
                        <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border-t-4 border-academic-navy hover:-translate-y-1 transition duration-300">
                            <div class="w-14 h-14 bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6 text-academic-navy dark:text-primary-500">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-time Status</h3>
                            <p class="text-gray-600 dark:text-gray-400">Check availability of books in real-time and manage your loan deadlines effectively.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 py-16 border-t border-gray-100 dark:border-gray-700">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                        <div class="p-4">
                            <div class="text-5xl font-bold text-academic-navy dark:text-primary-500 mb-2">${state.books.length}</div>
                            <div class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Books Available</div>
                        </div>
                        <div class="p-4">
                            <div class="text-5xl font-bold text-academic-navy dark:text-primary-500 mb-2">${state.members.filter((m) => m.role === "member").length}</div>
                            <div class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Active Students</div>
                        </div>
                        <div class="p-4">
                            <div class="text-5xl font-bold text-academic-navy dark:text-primary-500 mb-2">${state.loans.filter((l) => l.status === "active").length}</div>
                            <div class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Books Borrowed</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}
function renderLogin() {
    return `
        <div class="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
            <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
                    <p class="text-gray-600 dark:text-gray-400">Sign in to your library account</p>
                </div>
                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <input type="email" id="login-email" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="login-password" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div id="login-error" class="hidden text-red-600 dark:text-red-400 text-sm"></div>
                    <button type="submit" class="w-full px-4 py-3 bg-academic-navy dark:bg-primary-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 font-semibold transition">Sign In</button>
                </form>
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account? <a href="#register" class="text-academic-navy dark:text-primary-500 font-semibold hover:underline">Register here</a>
                    </p>
                </div>
                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p class="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2">Librarian/Admin:</p>                  
                    <p class="text-xs text-gray-600 dark:text-gray-400">Login Details: admin@library.com / admin123</p>
                </div>
            </div>
        </div>
    `
}

function renderRegister() {
    return `
        <div class="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
            <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
                    <p class="text-gray-600 dark:text-gray-400">Join our library community</p>
                </div>
                <form id="register-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        <input type="text" id="register-name" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <input type="email" id="register-email" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="register-password" required minlength="6" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div id="register-message" class="hidden text-sm"></div>
                    <button type="submit" class="w-full px-4 py-3 bg-academic-navy dark:bg-primary-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 font-semibold transition">Register</button>
                </form>
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account? <a href="#login" class="text-academic-navy dark:text-primary-500 font-semibold hover:underline">Sign in here</a>
                    </p>
                </div>
            </div>
        </div>
    `
}

function renderCatalog() {
    const categories = [...new Set(state.books.map((b) => b.category))]

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Book Catalog</h1>
                
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 relative">
                        <input type="text" id="search-input" placeholder="Search by title, author, or ISBN..." 
                            class="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <svg class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                    <select id="category-filter" class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option value="">All Categories</option>
                        ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div id="books-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${renderBookCards(state.books)}
            </div>
        </div>
    `
}

function renderBookCards(books) {
    if (books.length === 0) {
        return `<div class="col-span-full text-center py-12"><p class="text-gray-500 dark:text-gray-400 text-lg">No books found</p></div>`
    }

    return books.map((book) => `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">${book.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${book.author}</p>
                    <span class="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded">${book.category}</span>
                </div>
            </div>
            
            <div class="space-y-2 mb-4 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">ISBN:</span>
                    <span class="text-gray-900 dark:text-white font-mono">${book.isbn}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Published:</span>
                    <span class="text-gray-900 dark:text-white">${book.publishYear}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Available:</span>
                    <span class="text-gray-900 dark:text-white font-semibold">${book.availableCopies} / ${book.totalCopies}</span>
                </div>
            </div>
            
            ${book.availableCopies > 0
        ? `<div class="flex items-center gap-2 mb-2"><div class="w-2 h-2 bg-green-500 rounded-full"></div><span class="text-sm text-green-600 dark:text-green-400 font-semibold">Available</span></div>`
        : `<div class="flex items-center gap-2 mb-2"><div class="w-2 h-2 bg-red-500 rounded-full"></div><span class="text-sm text-red-600 dark:text-red-400 font-semibold">Not Available</span></div>`
    }
            
            ${state.currentUser && state.currentUser.role === "member" ? `
                ${book.availableCopies > 0
        ? `<button onclick="handleBorrow(${book.id})" class="w-full px-4 py-2 bg-academic-navy dark:bg-primary-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 font-medium transition">Borrow Book</button>`
        : `<button onclick="handleReserve(${book.id})" class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition">Reserve Book</button>`
    }
            ` : !state.currentUser ? `
                <a href="#login" class="block w-full px-4 py-2 bg-academic-navy dark:bg-primary-600 text-white text-center rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 font-medium transition">Login to Borrow</a>
            ` : ""}
        </div>
    `).join("")
}

function renderMemberDashboard() {
    if (!state.currentUser || state.currentUser.role !== "member") {
        navigateTo("login")
        return ""
    }

    const loans = getMemberLoans(state.currentUser.id)

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Loans</h1>
            ${loans.length === 0 ? `
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Active Loans</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Browse the catalog to borrow books</p>
                    <a href="#catalog" class="inline-block px-6 py-3 bg-academic-navy dark:bg-primary-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 font-medium transition">Browse Catalog</a>
                </div>
            ` : `
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Book</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Author</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Issued</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Due Date</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${loans.map((loan) => {
        const daysLeft = calculateDaysUntilDue(loan.dueDate)
        const isOverdue = daysLeft < 0
        const isDueSoon = daysLeft >= 0 && daysLeft <= 3
        return `
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        <td class="px-6 py-4"><div class="font-semibold text-gray-900 dark:text-white">${loan.book.title}</div><div class="text-sm text-gray-500 dark:text-gray-400">${loan.book.isbn}</div></td>
                                        <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${loan.book.author}</td>
                                        <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${formatDate(loan.issuedDate)}</td>
                                        <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${formatDate(loan.dueDate)}</td>
                                        <td class="px-6 py-4">
                                            ${isOverdue ? `<span class="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-semibold rounded">Overdue (${Math.abs(daysLeft)} days)</span>`
            : isDueSoon ? `<span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded">Due in ${daysLeft} days</span>`
                : `<span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded">${daysLeft} days left</span>`}
                                        </td>
                                        <td class="px-6 py-4">
                                            <button onclick="handleReturn(${loan.id})" class="px-4 py-2 bg-academic-navy dark:bg-primary-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 text-sm font-medium transition">Return</button>
                                        </td>
                                    </tr>
                                `
    }).join("")}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `
}

function renderLibrarianDashboard() {
    if (!state.currentUser || state.currentUser.role !== "librarian") {
        navigateTo("login")
        return ""
    }

    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Librarian Dashboard</h1>
            <div class="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
                <button onclick="switchLibrarianTab('manage-books')" class="librarian-tab px-6 py-3 font-semibold border-b-2 border-academic-navy dark:border-primary-500 text-academic-navy dark:text-primary-500" data-tab="manage-books">Manage Books</button>
                <button onclick="switchLibrarianTab('issue-return')" class="librarian-tab px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition" data-tab="issue-return">Issue/Return</button>
                <button onclick="switchLibrarianTab('all-loans')" class="librarian-tab px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition" data-tab="all-loans">All Loans</button>
            </div>
            <div id="librarian-tab-content">${renderManageBooksTab()}</div>
        </div>
    `
}

function renderManageBooksTab() {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Book</h2>
                <form id="book-form" class="space-y-4">
                    <input type="hidden" id="book-id">
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ISBN</label><input type="text" id="book-isbn" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label><input type="text" id="book-title" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Author</label><input type="text" id="book-author" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label><input type="text" id="book-category" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label><input type="number" id="book-year" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                        <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Copies</label><input type="number" id="book-copies" required min="1" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    </div>
                    <div id="book-form-message" class="hidden text-sm"></div>
                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 px-4 py-2 bg-academic-navy dark:bg-primary-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 font-medium transition"><span id="book-form-submit-text">Add Book</span></button>
                        <button type="button" id="book-form-cancel" onclick="resetBookForm()" class="hidden px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition">Cancel</button>
                    </div>
                </form>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Books Inventory</h2>
                <div class="space-y-4 max-h-[600px] overflow-y-auto">
                    ${state.books.map((book) => `
                        <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-900 dark:text-white">${book.title}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">${book.author}</p>
                                </div>
                                <button onclick='editBook(${JSON.stringify(book)})' class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition">Edit</button>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600 dark:text-gray-400">Copies: <span class="font-semibold text-gray-900 dark:text-white">${book.availableCopies} / ${book.totalCopies}</span></span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `
}

function renderIssueReturnTab() {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Issue Book</h2>
                <form id="issue-form" class="space-y-4">
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ISBN</label><input type="text" id="issue-isbn" required placeholder="Enter ISBN" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Email</label><input type="email" id="issue-member-email" required placeholder="member@library.com" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    <div id="issue-form-message" class="hidden text-sm"></div>
                    <button type="submit" class="w-full px-4 py-3 bg-academic-navy dark:bg-primary-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-primary-700 font-semibold transition">Issue Book</button>
                </form>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Return</h2>
                <form id="return-form" class="space-y-4">
                    <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ISBN (Active Loan)</label><input type="text" id="return-isbn" required placeholder="Enter ISBN" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></div>
                    <div id="return-form-message" class="hidden text-sm"></div>
                    <button type="submit" class="w-full px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 font-semibold transition">Process Return</button>
                </form>
            </div>
        </div>
    `
}

function renderAllLoansTab() {
    const activeLoans = state.loans.filter((l) => l.status === "active")
    return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div class="p-6"><h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Loans (${activeLoans.length})</h2></div>
            ${activeLoans.length === 0 ? `<div class="p-12 text-center"><p class="text-gray-500 dark:text-gray-400">No active loans</p></div>` : `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr><th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Book</th><th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Member</th><th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Issued</th><th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th></tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${activeLoans.map((loan) => {
        const book = getBookById(loan.bookId)
        const member = state.members.find((m) => m.id === loan.memberId)
        return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"><td class="px-6 py-4"><div class="font-semibold text-gray-900 dark:text-white">${book.title}</div></td><td class="px-6 py-4"><div class="text-gray-900 dark:text-white">${member.name}</div></td><td class="px-6 py-4 text-gray-700 dark:text-gray-300">${formatDate(loan.issuedDate)}</td><td class="px-6 py-4"><span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded">Active</span></td></tr>`
    }).join("")}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `
}

// ==================== EVENT HANDLERS ====================

function handleBorrow(bookId) {
    if (!state.currentUser) {
        navigateTo("login")
        return
    }
    const result = borrowBook(bookId, state.currentUser.id)
    showToast(result.message, result.success ? "success" : "error")
    if (result.success && state.currentPage === "catalog") renderPage("catalog")
}

function handleReturn(loanId) {
    const result = returnBook(loanId)
    showToast(result.message, result.success ? "success" : "error")
    if (result.success) renderPage("member-dashboard")
}

function handleReserve(bookId) {
    if (!state.currentUser) {
        navigateTo("login")
        return
    }
    const result = reserveBook(bookId, state.currentUser.id)
    showToast(result.message, result.success ? "success" : "error")
}

function showToast(message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-fade-in-up ${type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"}`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => {
        toast.classList.add("opacity-0", "transition-opacity")
        setTimeout(() => toast.remove(), 300)
    }, 3000)
}

// ==================== ROUTING & LOGIC ====================

function navigateTo(page) {
    window.location.hash = page
}

function renderPage(page) {
    state.currentPage = page
    const content = document.getElementById("content")

    let html = ""
    switch (page) {
        case "home": html = renderHome(); break;
        case "login": html = renderLogin(); break;
        case "register": html = renderRegister(); break;
        case "catalog": html = renderCatalog(); break;
        case "member-dashboard": html = renderMemberDashboard(); break;
        case "librarian-dashboard": html = renderLibrarianDashboard(); break;
        default: html = renderHome();
    }
    content.innerHTML = html
    attachViewListeners()
    window.scrollTo(0, 0)
}

function attachViewListeners() {
    // Login Form
    const loginForm = document.getElementById("login-form")
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault()
            const email = document.getElementById("login-email").value
            const password = document.getElementById("login-password").value
            if (login(email, password)) {
                showToast("Login successful!", "success")
                navigateTo(state.currentUser.role === "librarian" ? "librarian-dashboard" : "member-dashboard")
            } else {
                const errorEl = document.getElementById("login-error")
                errorEl.textContent = "Invalid email or password"
                errorEl.classList.remove("hidden")
            }
        })
    }

    // Register Form
    const registerForm = document.getElementById("register-form")
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault()
            const name = document.getElementById("register-name").value
            const email = document.getElementById("register-email").value
            const password = document.getElementById("register-password").value
            const result = register(email, password, name)
            const messageEl = document.getElementById("register-message")
            messageEl.textContent = result.message
            messageEl.className = `text-sm ${result.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`
            messageEl.classList.remove("hidden")
            if (result.success) setTimeout(() => navigateTo("login"), 2000)
        })
    }

    // Search
    const searchInput = document.getElementById("search-input")
    const categoryFilter = document.getElementById("category-filter")
    if (searchInput) searchInput.addEventListener("input", filterCatalog)
    if (categoryFilter) categoryFilter.addEventListener("change", filterCatalog)

    // Librarian Forms (Add Book, Issue, Return)
    const bookForm = document.getElementById("book-form")
    if (bookForm) bookForm.addEventListener("submit", handleBookFormSubmit)

    const issueForm = document.getElementById("issue-form")
    if (issueForm) {
        issueForm.addEventListener("submit", (e) => {
            e.preventDefault()
            const result = issueBookToMember(document.getElementById("issue-isbn").value, document.getElementById("issue-member-email").value)
            handleFormResult(result, "issue-form-message", issueForm)
            if(result.success) setTimeout(() => window.switchLibrarianTab("all-loans"), 1500)
        })
    }

    const returnForm = document.getElementById("return-form")
    if (returnForm) {
        returnForm.addEventListener("submit", (e) => {
            e.preventDefault()
            const isbn = document.getElementById("return-isbn").value
            const book = state.books.find(b => b.isbn === isbn)
            if(!book) return handleFormResult({success:false, message:"Book not found"}, "return-form-message")
            const loan = state.loans.find(l => l.bookId === book.id && l.status === "active")
            if(!loan) return handleFormResult({success:false, message:"No active loan for this book"}, "return-form-message")

            const result = returnBook(loan.id)
            handleFormResult(result, "return-form-message", returnForm)
            if(result.success) setTimeout(() => window.switchLibrarianTab("all-loans"), 1500)
        })
    }
}

function handleFormResult(result, elementId, form = null) {
    const messageEl = document.getElementById(elementId)
    messageEl.textContent = result.message
    messageEl.className = `text-sm ${result.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`
    messageEl.classList.remove("hidden")
    if(result.success && form) {
        form.reset()
        setTimeout(() => messageEl.classList.add("hidden"), 3000)
    }
}

function filterCatalog() {
    const searchQuery = document.getElementById("search-input").value
    const category = document.getElementById("category-filter").value
    let filtered = searchQuery ? searchBooks(searchQuery) : state.books
    if (category) filtered = filtered.filter((book) => book.category === category)
    document.getElementById("books-grid").innerHTML = renderBookCards(filtered)
}

function handleBookFormSubmit(e) {
    e.preventDefault()
    const bookData = {
        isbn: document.getElementById("book-isbn").value,
        title: document.getElementById("book-title").value,
        author: document.getElementById("book-author").value,
        category: document.getElementById("book-category").value,
        publishYear: parseInt(document.getElementById("book-year").value),
        totalCopies: parseInt(document.getElementById("book-copies").value),
    }
    const bookId = document.getElementById("book-id").value
    const result = bookId ? updateBook(parseInt(bookId), bookData) : addBook(bookData)
    handleFormResult(result, "book-form-message", e.target)
    if(result.success) {
        resetBookForm()
        setTimeout(() => renderPage("librarian-dashboard"), 1500)
    }
}

// Global functions for inline HTML access
window.handleBorrow = handleBorrow
window.handleReturn = handleReturn
window.handleReserve = handleReserve
window.resetBookForm = () => {
    document.getElementById("book-form").reset()
    document.getElementById("book-id").value = ""
    document.getElementById("book-form-submit-text").textContent = "Add Book"
    document.getElementById("book-form-cancel").classList.add("hidden")
}
window.editBook = (book) => {
    document.getElementById("book-id").value = book.id
    document.getElementById("book-isbn").value = book.isbn
    document.getElementById("book-title").value = book.title
    document.getElementById("book-author").value = book.author
    document.getElementById("book-category").value = book.category
    document.getElementById("book-year").value = book.publishYear
    document.getElementById("book-copies").value = book.totalCopies
    document.getElementById("book-form-submit-text").textContent = "Update Book"
    document.getElementById("book-form-cancel").classList.remove("hidden")
}
window.switchLibrarianTab = (tab) => {
    document.querySelectorAll(".librarian-tab").forEach((btn) => {
        btn.className = btn.dataset.tab === tab
            ? "librarian-tab px-6 py-3 font-semibold border-b-2 border-academic-navy dark:border-primary-500 text-academic-navy dark:text-primary-500"
            : "librarian-tab px-6 py-3 font-semibold border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
    })
    const content = document.getElementById("librarian-tab-content")
    if(tab === "manage-books") content.innerHTML = renderManageBooksTab()
    else if(tab === "issue-return") content.innerHTML = renderIssueReturnTab()
    else content.innerHTML = renderAllLoansTab()

    attachViewListeners() // Re-attach event listeners for new content
}
window.resetSystem = () => {
    if(confirm("Are you sure you want to reset all data to default? This cannot be undone.")) {
        localStorage.clear()
        location.reload()
    }
}

// ==================== INITIALIZATION ====================

function init() {

    // Global Listeners (Nav, Theme)
    document.getElementById("logout-btn").addEventListener("click", logout)
    const themeToggle = document.getElementById("theme-toggle")
    const html = document.documentElement

    // Check saved theme
    if (localStorage.getItem("theme") === "dark") html.classList.add("dark")

    themeToggle.addEventListener("click", () => {
        html.classList.toggle("dark")
        localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light")
    })

    window.addEventListener("hashchange", () => renderPage(window.location.hash.slice(1) || "home"))

    checkAuth()
    renderPage(window.location.hash.slice(1) || "home")
}

document.addEventListener("DOMContentLoaded", init)


