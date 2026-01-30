import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Plus, Trash2, Tag } from 'lucide-react';
import { IngredientOption } from '../types/definitions';

const IngredientOptions: React.FC = () => {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const { data: options, isLoading } = useQuery({
    queryKey: ['ingredientOptions'],
    queryFn: api.getIngredientOptions
  });

  const addMutation = useMutation({
    mutationFn: (data: { name: string; category?: string }) => api.addIngredientOption(data.name, data.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientOptions'] });
      setNewName('');
      setNewCategory('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteIngredientOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientOptions'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addMutation.mutate({ name: newName.trim(), category: newCategory.trim() || undefined });
    }
  };

  if (isLoading) return <div>加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">食材库管理</h1>
          <p className="text-gray-500">预先添加常用食材，写食谱时选择更方便</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">添加新食材</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">食材名称</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如：鸡胸肉"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">分类 (可选)</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="例如：肉类"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
            />
          </div>
          <button
            type="submit"
            disabled={!newName.trim() || addMutation.isPending}
            className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {options?.map((option: IngredientOption) => (
              <tr key={option.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{option.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {option.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {option.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => deleteMutation.mutate(option.id)}
                    className="text-red-600 hover:text-red-900"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {options?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  暂无数据，请在上方添加。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngredientOptions;
