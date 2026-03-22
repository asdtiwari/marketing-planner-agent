import React, { useState, useEffect } from 'react';
import { uploadKnowledgePdf } from '../services/documentService';
import { generateMarketingPlan } from '../services/agentService';
import { getPlans, renamePlan, deletePlan } from '../services/planService';
import { removeToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Play, LogOut, FileText, CheckCircle, AlertCircle, Loader2, Moon, Sun, Edit2, Trash2, X } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    
    // State
    const [file, setFile] = useState(null);
    const [goal, setGoal] = useState('');
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Loading & Status States
    const [isUploading, setIsUploading] = useState(false);
    const [isPlanning, setIsPlanning] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [newTitle, setNewTitle] = useState('');

    const fetchPlans = async () => {
        try {
            const data = await getPlans();
            setPlans(data);
        } catch (error) {
            setStatusMsg({ type: 'error', text: error.message || 'Failed to load history.' });
        }
    };

    useEffect(() => {
        fetchPlans();
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        const root = document.documentElement;
        if (root.classList.contains('dark')) {
            root.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            root.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };

    const handleGeneratePlan = async (e) => {
        e.preventDefault();
        if (!goal) return;
        setIsPlanning(true);
        setStatusMsg({ type: '', text: '' });
        
        try {
            const result = await generateMarketingPlan(goal);
            setStatusMsg({ type: 'success', text: 'Plan generated successfully!' });
            await fetchPlans(); // Refresh history
            setSelectedPlan({ title: goal, content: result.plan }); // Show immediately
            setGoal('');
        } catch (error) {
            setStatusMsg({ type: 'error', text: error.response?.data?.detail || error.message });
        } finally {
            setIsPlanning(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if(!window.confirm('Are you sure you want to delete this plan?')) return;
        try {
            await deletePlan(id);
            if (selectedPlan?.id === id) setSelectedPlan(null);
            fetchPlans();
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Failed to delete plan.' });
        }
    };

    const handleRename = async (id, e) => {
        e.stopPropagation();
        try {
            await renamePlan(id, newTitle);
            setEditingPlanId(null);
            fetchPlans();
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Failed to rename plan.' });
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setStatusMsg({ type: '', text: '' }); // Clear any previous alerts
        try {
            // Make sure uploadKnowledgePdf is imported at the very top of your file!
            const result = await uploadKnowledgePdf(file); 
            setStatusMsg({ type: 'success', text: result.message || 'PDF uploaded and vectorized successfully!' });
            setFile(null); // Clear the file input after success
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Failed to upload document. Please ensure the backend is running.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            
            {/* LEFT SIDEBAR: History */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Plan History
                    </h2>
                    <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id} 
                            onClick={() => setSelectedPlan(plan)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all group ${selectedPlan?.id === plan.id ? 'bg-blue-50 border-blue-200 dark:bg-gray-700 dark:border-gray-600' : 'bg-white border-gray-100 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-500'}`}
                        >
                            {editingPlanId === plan.id ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        autoFocus
                                        className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white"
                                        value={newTitle} 
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename(plan.id, e)}
                                    />
                                    <button onClick={(e) => handleRename(plan.id, e)}><CheckCircle className="w-4 h-4 text-green-500"/></button>
                                    <button onClick={(e) => {e.stopPropagation(); setEditingPlanId(null);}}><X className="w-4 h-4 text-red-500"/></button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm line-clamp-2">{plan.title}</h4>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(plan.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingPlanId(plan.id); setNewTitle(plan.title); }} className="text-gray-400 hover:text-blue-500"><Edit2 className="w-4 h-4"/></button>
                                        <button onClick={(e) => handleDelete(plan.id, e)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {plans.length === 0 && <p className="text-sm text-gray-400 text-center mt-10">No plans saved yet.</p>}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => {removeToken(); navigate('/login');}} className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                <div className="p-8 max-w-5xl mx-auto w-full">
                    
                    {/* Status Alerts */}
                    {statusMsg.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                            {statusMsg.text}
                        </div>
                    )}

                    {/* NEW: Knowledge Base Context Engine */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <UploadCloud className="w-5 h-5 text-blue-500" /> 1. Provide Context to Agent
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* PDF Upload */}
                            <form onSubmit={handleFileUpload} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50">
                                <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    onChange={(e) => setFile(e.target.files[0])} 
                                    className="flex-1 text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!file || isUploading}
                                    className="px-4 py-2 bg-gray-900 dark:bg-gray-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload PDF'}
                                </button>
                            </form>

                            {/* URL Scraper (UI Ready for future backend hookup) */}
                            <form onSubmit={(e) => { e.preventDefault(); setStatusMsg({ type: 'success', text: 'URL staged for future agent scraping.' }); }} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50">
                                <input 
                                    type="url" 
                                    placeholder="https://competitor.com/strategy"
                                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-gray-900 dark:bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
                                >
                                    Add Link
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Generator Controls */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Generate New Plan</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-white"
                                placeholder="e.g., Analyze competitor ads and formulate a Q3 launch strategy..."
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                disabled={isPlanning}
                            />
                        </div>
                        <button 
                            onClick={handleGeneratePlan}
                            disabled={!goal || isPlanning}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all h-12"
                        >
                            {isPlanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {isPlanning ? 'Agent Planning...' : 'Generate'}
                        </button>
                    </div>

                    {/* HTML Document Viewer */}
                    {selectedPlan ? (
                        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
                                {selectedPlan.title}
                            </h2>
                            {/* Tailwind Typography 'prose' formats the raw HTML beautifully */}
                            <div 
                                className="prose prose-blue dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedPlan.content }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Select a plan from the history sidebar or generate a new one.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;