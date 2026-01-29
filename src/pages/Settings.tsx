import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <h1 className="text-2xl font-bold text-gray-900">设置</h1>
       
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
             <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                账户
             </h2>
             <p className="mt-1 text-sm text-gray-500">管理您的账户设置。</p>
          </div>
          
          <div className="p-6 space-y-4">
             <div className="flex items-center justify-between py-2">
                <div>
                   <h3 className="text-sm font-medium text-gray-900">邮箱</h3>
                   <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
             </div>

             <div className="border-t border-gray-100 pt-4 flex items-center justify-between py-2">
                <div>
                   <h3 className="text-sm font-medium text-red-600">退出登录</h3>
                   <p className="text-xs text-gray-500">退出当前账户。</p>
                </div>
                <button onClick={handleSignOut} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                   <LogOut className="w-4 h-4 mr-2" />
                   退出登录
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Settings;
