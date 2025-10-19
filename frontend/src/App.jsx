import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Alerts from './pages/Alerts';

import GoogleSheets from "./pages/GoogleSheets";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import Inventory from "./pages/Inventory";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
	return (
		<Router>
			<AuthProvider>
				<Toaster position="top-right" />
				<Routes>
					{/* Public Routes */}
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/verify-email" element={<VerifyEmail />} />
					<Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
					<Route
						path="/google-sheets"
						element={
							<ProtectedRoute>
								<GoogleSheets />
							</ProtectedRoute>
						}
					/>

					{/* Protected Routes */}
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/files"
						element={
							<ProtectedRoute>
								<Files />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/inventory"
						element={
							<ProtectedRoute>
								<Inventory />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/chat"
						element={
							<ProtectedRoute>
								<Chat />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/analytics"
						element={
							<ProtectedRoute>
								<Analytics />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/settings"
						element={
							<ProtectedRoute>
								<Settings />
							</ProtectedRoute>
						}
					/>

					{/* Redirect root to dashboard */}
					<Route path="/" element={<Navigate to="/dashboard" replace />} />

					{/* 404 Route */}
					<Route path="*" element={<Navigate to="/dashboard" replace />} />
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;
