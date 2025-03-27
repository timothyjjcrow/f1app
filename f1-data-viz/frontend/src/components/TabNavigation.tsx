import React from "react";

type Tab = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-slate-800 sticky top-0 z-10 shadow-lg">
      <div className="max-w-[95%] w-full mx-auto">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center py-6 px-8 text-xl font-medium transition-all duration-200 border-b-4 ${
                activeTab === tab.id
                  ? "text-white border-red-500 bg-slate-700/50"
                  : "text-slate-400 border-transparent hover:text-slate-200 hover:border-red-500/50"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
