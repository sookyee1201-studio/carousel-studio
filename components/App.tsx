"use client";
import Sidebar from "./layout/Sidebar";
import TopProgress from "./layout/TopProgress";
import { Spinner, Toast } from "./ui";
import { StudioProvider, useStudio } from "@/lib/store";
import Dashboard, { ProjectsView } from "./screens/Dashboard";
import { TemplatesView, DesignSystemView, BrandsView } from "./screens/Library";
import Login from "./screens/Login";
import Step1Input from "./screens/Step1Input";
import Step2Analysis from "./screens/Step2Analysis";
import Step3Hook from "./screens/Step3Hook";
import Step4Structure from "./screens/Step4Structure";
import Step5Art from "./screens/Step5Art";
import Workbench from "./workbench/Workbench";
import Step7Preview from "./screens/Step7Preview";

function Shell() {
  const { view, step, advanced, quickBusy, user, authReady, authRequired } = useStudio();
  // 配置了登录就必须先登录才能使用；没配置（本地开发）时不强制
  if (!authReady) return <div className="min-h-screen bg-bg" />;
  if (authRequired && !user) return <><Login /><Toast /></>;
  if (view === "login") return <><Login /><Toast /></>;
  if (view === "wizard" && quickBusy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="enter px-8">
          <div className="label mb-2 text-accent-ink">Carousel Studio</div>
          <Spinner text="AI 正在为你写整套 Carousel，大约 10–20 秒……" />
        </div>
      </div>
    );
  }
  const inBench = view === "wizard" && (!advanced || step === 6);
  return (
    <div className="flex min-h-screen">
      {!inBench && <Sidebar />}
      <main className="min-w-0 flex-1">
        {view === "dashboard" && <Dashboard />}
        {view === "projects" && <ProjectsView />}
        {view === "templates" && <TemplatesView />}
        {view === "design-system" && <DesignSystemView />}
        {view === "brands" && <BrandsView />}
        {view === "wizard" && (
          <>
            {advanced && <TopProgress />}
            {advanced && step === 1 && <Step1Input />}
            {advanced && step === 2 && <Step2Analysis />}
            {advanced && step === 3 && <Step3Hook />}
            {advanced && step === 4 && <Step4Structure />}
            {advanced && step === 5 && <Step5Art />}
            {(step === 6 || (!advanced && step !== 6)) && <Workbench topOffset={advanced ? 65 : 0} />}
            {advanced && step === 7 && <Step7Preview />}
          </>
        )}
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return <StudioProvider><Shell /></StudioProvider>;
}
