import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";
import SidebarV2 from "../../components/SidebarV2";
import Header from "../../components/Header";
import Dialog from "../../components/composites/Dialog";
import Input from "../../components/primitives/Input";
import roomService, { Room } from "../../services/roomService";
import tenantService, { Tenant } from "../../services/tenantService";
import invoiceService, { Invoice } from "../../services/invoiceService";
import contractService from "../../services/contractService";
import maintenanceService from "../../services/maintenanceService";
import BottomTabBar from "../../components/BottomTabBar";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "expiry" | "overdue" | "maintenance";
  link: string;
}

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // Search index datasets
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isSearchingData, setIsSearchingData] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Load notifications
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
          const [activeContracts, allInvoices, pendingMaintenance] = await Promise.all([
            contractService.getActiveContracts(),
            invoiceService.getInvoices(),
            maintenanceService.getMaintenanceRequests(undefined, "pending"),
          ]);

          const list: NotificationItem[] = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // 1. Check contracts expiring in <= 30 days
          activeContracts.forEach((contract) => {
            const endDate = new Date(contract.end_date);
            endDate.setHours(0, 0, 0, 0);
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= 30) {
              list.push({
                id: `contract-expiry-${contract.contract_id}`,
                title: `สัญญาใกล้หมดอายุ (ห้อง ${contract.house_number || "ไม่ระบุ"})`,
                description: `คุณ ${contract.tenant_name || "ผู้เช่า"} จะหมดสัญญาเช่าในอีก ${diffDays} วัน (${new Date(contract.end_date).toLocaleDateString("th-TH")})`,
                type: "expiry",
                link: "/contracts",
              });
            }
          });

          // 2. Check overdue invoices
          allInvoices
            .filter((inv) => inv.status === "overdue")
            .forEach((inv) => {
              list.push({
                id: `invoice-overdue-${inv.invoice_id}`,
                title: `ใบแจ้งหนี้ค้างชำระเกินกำหนด`,
                description: `ใบแจ้งหนี้หมายเลข #${inv.invoice_id} เลยวันครบกำหนดชำระ ยอดรวม ฿${inv.total_amount.toLocaleString()}`,
                type: "overdue",
                link: "/invoices",
              });
            });

          // 3. Check pending maintenance requests
          pendingMaintenance.forEach((req) => {
            list.push({
              id: `maintenance-pending-${req.request_id}`,
              title: `รายการแจ้งซ่อมใหม่`,
              description: `มีแจ้งรายการซ่อมแซมรอดำเนินการ: ${req.title}`,
              type: "maintenance",
              link: "/maintenance",
            });
          });

          setNotifications(list);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        } finally {
          setIsLoadingNotifications(false);
        }
      };

      fetchNotifications();
      // Refetch notifications every 2 minutes
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Load search data once when search dialog opens
  useEffect(() => {
    if (isSearchOpen) {
      const loadSearchData = async () => {
        setIsSearchingData(true);
        try {
          const [roomsData, tenantsData, invoicesData] = await Promise.all([
            roomService.getRooms(),
            tenantService.getTenants(),
            invoiceService.getInvoices(),
          ]);
          setRooms(roomsData);
          setTenants(tenantsData);
          setInvoices(invoicesData);
        } catch (error) {
          console.error("Failed to load search index data:", error);
        } finally {
          setIsSearchingData(false);
        }
      };
      loadSearchData();
    }
  }, [isSearchOpen]);

  // Listen to keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Collapse sidebar automatically on smaller viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close search and mobile sidebar on route change
  useEffect(() => {
    setIsOpenMobile(false);
    setIsSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-sans font-medium text-muted">
            กำลังตรวจสอบข้อมูลผู้ใช้งาน...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Width offsets for desktop viewports
  const sidebarOffsetClass = isCollapsed ? "lg:pl-16" : "lg:pl-64";

  // Filter datasets in real-time
  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredRooms = cleanQuery
    ? rooms.filter(
        (r) =>
          r.house_number.toLowerCase().includes(cleanQuery) ||
          (r.tenant_name && r.tenant_name.toLowerCase().includes(cleanQuery))
      )
    : [];

  const filteredTenants = cleanQuery
    ? tenants.filter(
        (t) =>
          t.full_name.toLowerCase().includes(cleanQuery) ||
          (t.phone && t.phone.toLowerCase().includes(cleanQuery)) ||
          (t.id_card && t.id_card.toLowerCase().includes(cleanQuery))
      )
    : [];

  const filteredInvoices = cleanQuery
    ? invoices.filter(
        (i) =>
          String(i.invoice_id).includes(cleanQuery) ||
          i.month_year.toLowerCase().includes(cleanQuery) ||
          i.status.toLowerCase().includes(cleanQuery)
      )
    : [];

  const hasResults =
    filteredRooms.length > 0 ||
    filteredTenants.length > 0 ||
    filteredInvoices.length > 0;

  return (
    <div className="w-full min-h-screen bg-white flex">
      {/* Grouped Sidebar */}
      <SidebarV2
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarOffsetClass}`}>
        {/* Hierarchical Header */}
        <Header
          isCollapsed={isCollapsed}
          setIsOpenMobile={setIsOpenMobile}
          onSearchClick={() => setIsSearchOpen(true)}
          notifications={notifications}
          isLoadingNotifications={isLoadingNotifications}
        />

        {/* Page Content viewport - constrained layout */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-[1280px] w-full mx-auto pb-[calc(var(--mobile-bottom-bar-height)+var(--mobile-safe-area-bottom)+16px)] lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />

      {/* Global Command Palette Search Overlay */}
      <Dialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="ค้นหาด่วน"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input
            autoFocus
            type="text"
            placeholder="ค้นหา ห้องพัก, ผู้เช่า, เลขที่ใบแจ้งหนี้..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="max-h-[300px] overflow-y-auto flex flex-col gap-3 font-sans">
            {isSearchingData ? (
              <div className="py-8 text-center text-muted text-xs font-sans">
                กำลังโหลดดัชนีการค้นหา...
              </div>
            ) : cleanQuery ? (
              hasResults ? (
                <div className="flex flex-col gap-4 py-2">
                  {/* Rooms Results */}
                  {filteredRooms.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-[10px] font-bold text-muted tracking-wider uppercase font-sans select-none">
                        ห้องพัก
                      </h4>
                      <div className="flex flex-col gap-1">
                        {filteredRooms.map((room) => (
                          <Link
                            key={room.room_id}
                            to="/rooms"
                            className="p-2.5 rounded-md border border-border hover:border-primary/30 hover:bg-primary-light flex justify-between items-center transition-all group"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-ink group-hover:text-primary transition-colors font-sans">
                                ห้อง {room.house_number}
                              </span>
                              <span className="text-xs text-muted font-sans mt-0.5">
                                {room.tenant_name ? `ผู้เช่า: ${room.tenant_name}` : "ห้องว่าง"}
                              </span>
                            </div>
                            <span className="text-xs font-medium px-2.5 py-1 rounded bg-surface text-ink group-hover:bg-primary group-hover:text-white transition-all font-sans">
                              ดูรายละเอียด
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tenants Results */}
                  {filteredTenants.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-[10px] font-bold text-muted tracking-wider uppercase font-sans select-none">
                        ผู้เช่า
                      </h4>
                      <div className="flex flex-col gap-1">
                        {filteredTenants.map((tenant) => (
                          <Link
                            key={tenant.tenant_id}
                            to="/tenants"
                            className="p-2.5 rounded-md border border-border hover:border-primary/30 hover:bg-primary-light flex justify-between items-center transition-all group"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-ink group-hover:text-primary transition-colors font-sans">
                                {tenant.full_name}
                              </span>
                              <span className="text-xs text-muted font-sans mt-0.5">
                                โทร: {tenant.phone || "-"} | บัตรประชาชน: {tenant.id_card}
                              </span>
                            </div>
                            <span className="text-xs font-medium px-2.5 py-1 rounded bg-surface text-ink group-hover:bg-primary group-hover:text-white transition-all font-sans">
                              ดูรายละเอียด
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invoices Results */}
                  {filteredInvoices.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-[10px] font-bold text-muted tracking-wider uppercase font-sans select-none">
                        ใบแจ้งหนี้
                      </h4>
                      <div className="flex flex-col gap-1">
                        {filteredInvoices.map((invoice) => (
                          <Link
                            key={invoice.invoice_id}
                            to="/invoices"
                            className="p-2.5 rounded-md border border-border hover:border-primary/30 hover:bg-primary-light flex justify-between items-center transition-all group"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-ink group-hover:text-primary transition-colors font-sans">
                                ใบแจ้งหนี้ #{invoice.invoice_id}
                              </span>
                              <span className="text-xs text-muted font-sans mt-0.5">
                                ประจำเดือน: {invoice.month_year} | ยอดรวม: ฿{invoice.total_amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans ${
                                invoice.status === "paid"
                                  ? "bg-success-light text-success"
                                  : invoice.status === "pending"
                                  ? "bg-warning-light text-warning"
                                  : "bg-error-light text-error"
                              }`}>
                                {invoice.status === "paid" ? "จ่ายแล้ว" : invoice.status === "pending" ? "ค้างชำระ" : "ยกเลิก"}
                              </span>
                              <span className="text-xs font-medium px-2.5 py-1 rounded bg-surface text-ink group-hover:bg-primary group-hover:text-white transition-all font-sans">
                                ดูรายละเอียด
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-muted text-xs font-sans">
                  ไม่พบผลการค้นหาสำหรับ "{searchQuery}"
                </div>
              )
            ) : (
              <div className="py-12 text-center text-muted text-xs border border-dashed border-border rounded-md font-sans select-none">
                ป้อนคำค้นหาเพื่อเริ่มต้นค้นหาข้อมูลในระบบ
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-muted border-t border-border pt-3 font-sans select-none">
            <span>กดปุ่ม Esc เพื่อปิดหน้าต่างนี้</span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AppLayout;
