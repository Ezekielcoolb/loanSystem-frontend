import { useRoutes } from "react-router-dom";
import { Suspense, lazy } from "react";
import TopLoader from "../Preload/TopLoader";
import Home from "../GuestPages/Home";
import AdminController from "../Controller/adminController";
import Dashboard from "../Users/Admin/Dashboard";
import Setting from "../Users/Admin/Setting";
import Branch from "../Users/Admin/Branch";
import Cso from "../Users/Admin/cso";
import CsoDetails from "../Users/Admin/csoPages/CsoDetails";
import NewLoan from "../Users/Admin/LoanPages/NewLoan";
import NewLoanDetails from "../Users/Admin/LoanPages/NewLoanDetails";
import Disbursement from "../Users/Admin/LoanPages/Disbursement";
import AllLoans from "../Users/Admin/LoanPages/Loans/allLoans";
import CsoController from "../Controller/csoController";
import CsoHome from "../Users/CsosPages/csoHome";
import CsoLogin from "../Users/CsosPages/CsoLogin";
import CsoProfile from "../Users/CsosPages/CsoProfile";
import CsoSettings from "../Users/CsosPages/CsoSettings";
import LoanActiveDetails from "../Users/CsosPages/LoanActiveDetails";
import Payment from "../Users/CsosPages/Payment";
import MinimalLoanForm from "../Users/CsosPages/MinimalLoanForm";
import CustomerListLoans from "../Users/CsosPages/CustomerListLoans";
import CsoCollection from "../Users/CsosPages/CsoCollection";
import CsoLoan from "../Users/CsosPages/csoLoan";
import Frontend from "../GuestPages/Frontend";
import SocialMedia from "../GuestPages/SocialMedia";
import Customers from "../Users/Admin/CustomerPages/Customers";

export default function Routess() {
    return (
        <Suspense fallback={<TopLoader />}>
            {useRoutes([
                { path: "/", element: <Home /> },
                 { path: "/frontend", element: <Frontend /> },
                 { path: "/social-media", element: <SocialMedia  /> },
                { path: "/cso/login", element: <CsoLogin /> },

                {
                    path: "/admin",
                    element: <AdminController />,
                    children: [
                        { path: "/admin/dashboard", element:<Dashboard /> },
                        { path: "/admin/loans", element:<NewLoan /> },
                        { path: "/admin/customers", element:<Customers /> },
                        { path: "/admin/loans/:id", element:<NewLoanDetails /> },
                        { path: "/admin/disbursements", element:<Disbursement /> },
                        { path: "/admin/branch", element:<Branch /> },
                        { path: "/admin/cso", element:<Cso /> },
                        { path: "/admin/cso/:id", element:<CsoDetails /> },
                        { path: "/admin/cso-loans", element:<AllLoans /> },
                        { path: "/admin/settings", element:<Setting /> },
                       
                    ],
                },
                
                {
                    path: "/cso",
                    element: <CsoController />,
                    children: [
                        { path: "/cso", element: <CsoHome /> },
                        { path: "/cso/home", element: <CsoHome /> },
                        { path: "/cso/profile", element: <CsoProfile /> },
                        { path: "/cso/settings", element: <CsoSettings /> },
                         { path: "/cso/collections", element: <CsoCollection /> },
                         { path: "/cso/all-loans", element: <CsoLoan /> },
                        { path: "/cso/loans/:id", element: <LoanActiveDetails /> },
                        { path: "/cso/loans/:id/payment", element: <Payment /> },
                        { path: "/cso/loans/:id/new-loan", element: <MinimalLoanForm /> },
                        { path: "/cso/customers/:bvn/loans", element: <CustomerListLoans /> },
                       
                    ],
                },
              
             
            ])}
            
        </Suspense>


    );
}
