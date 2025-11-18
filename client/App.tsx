import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Pages
import Apps from "./pages/Apps";

// Module Imports
import CRM from "./pages/modules/CRM";
import Sales from "./pages/modules/Sales";
import Purchases from "./pages/modules/Purchases";
import Inventory from "./pages/modules/Inventory";
import Accounting from "./pages/modules/Accounting";
import HR from "./pages/modules/HR";
import Payroll from "./pages/modules/Payroll";
import Projects from "./pages/modules/Projects";
import Manufacturing from "./pages/modules/Manufacturing";
import POS from "./pages/modules/POS";
import ECommerce from "./pages/modules/ECommerce";
import Helpdesk from "./pages/modules/Helpdesk";
import School from "./pages/modules/School";
import Medical from "./pages/modules/Medical";
import RealEstate from "./pages/modules/RealEstate";
import Restaurant from "./pages/modules/Restaurant";
import Admin from "./pages/modules/Admin";
import Hospital from "./pages/modules/Hospital";
import Surveys from "./pages/modules/Surveys";
import SMSMarketing from "./pages/modules/SMSMarketing";
import Repairs from "./pages/modules/Repairs";
import Barcode from "./pages/modules/Barcode";
import Attendances from "./pages/modules/Attendances";
import EmployeeContracts from "./pages/modules/EmployeeContracts";
import Appointments from "./pages/modules/Appointments";
import Notes from "./pages/modules/Notes";
import SkillsManagement from "./pages/modules/SkillsManagement";
import OnlineJobs from "./pages/modules/OnlineJobs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apps" element={<Apps />} />

            {/* Sales & Marketing Modules */}
            <Route path="/crm" element={<CRM />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/ecommerce" element={<ECommerce />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/sms-marketing" element={<SMSMarketing />} />

            {/* Supply Chain Modules */}
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/manufacturing" element={<Manufacturing />} />

            {/* Finance & HR Modules */}
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/hr" element={<HR />} />
            <Route path="/payroll" element={<Payroll />} />

            {/* Operations Modules */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/helpdesk" element={<Helpdesk />} />
            <Route path="/repairs" element={<Repairs />} />
            <Route path="/barcode" element={<Barcode />} />
            <Route path="/attendances" element={<Attendances />} />
            <Route path="/contracts" element={<EmployeeContracts />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/skills" element={<SkillsManagement />} />
            <Route path="/jobs" element={<OnlineJobs />} />

            {/* Vertical Solutions */}
            <Route path="/school" element={<School />} />
            <Route path="/medical" element={<Medical />} />
            <Route path="/hospital" element={<Hospital />} />
            <Route path="/real-estate" element={<RealEstate />} />

            {/* Administration */}
            <Route path="/admin" element={<Admin />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
