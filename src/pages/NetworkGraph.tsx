import { useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ReactFlow, { Background, Controls, Handle, Position, ReactFlowProvider, useNodesState, useEdgesState, type Node, type Edge, type NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import { Calendar, User, Target, Layers, Award, RotateCcw, Sparkles, Bot, SendHorizontal } from "lucide-react";

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
};

const quickPrompts = ["What skills should I focus on for my career goal?", "Which events are most critical for my timeline?", "How can I optimize my learning path?"];

const API_BASE = "http://127.0.0.1:8000";

// User start node component
function UserStartNode({ data }: NodeProps) {
    return (
        <div className="w-[280px] rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-500 to-purple-600 p-5 shadow-xl">
            <Handle type="source" position={Position.Right} className="!h-4 !w-4 !bg-white border-2 border-indigo-300" />
            <div className="flex items-start gap-3 mb-3">
                <div className="rounded-full bg-white/20 p-2.5">
                    <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{data.label}</h3>
                    <p className="text-xs text-indigo-100">{data.faculty}</p>
                    <p className="text-xs text-indigo-100">Year {data.year}</p>
                </div>
            </div>

            <div className="space-y-2 text-xs text-white/90">
                <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-sm">
                    <p className="font-semibold text-white mb-1">Interests:</p>
                    <p className="line-clamp-3 text-indigo-50">{data.interests}</p>
                </div>
                {data.timeline && (
                    <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-sm">
                        <p className="font-semibold text-white mb-1">Timeline:</p>
                        <p className="text-indigo-50">{data.timeline}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stage node component
function StageNode({ data }: NodeProps) {
    return (
        <div className="w-[380px] rounded-xl border-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-lg">
            <Handle type="target" position={Position.Left} className="!h-3 !w-3 !bg-slate-400" />
            <Handle type="source" position={Position.Right} className="!h-3 !w-3 !bg-slate-400" />

            <div className="flex items-center gap-2.5 mb-2">
                <div className="rounded-lg bg-slate-100 p-2">
                    <Layers className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{data.label}</h3>
                        <span className="text-xs font-semibold text-slate-400">
                            {data.stageIndex}/{data.totalStages}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{data.description}</p>
        </div>
    );
}

// Event node component
function EventNode({ data }: NodeProps) {
    const isMustAttend = data.isMustAttend;

    return (
        <div
            className={`w-[360px] rounded-xl border-2 p-4 shadow-lg transition-all hover:shadow-xl ${
                isMustAttend ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50" : "border-purple-200 bg-gradient-to-br from-white to-purple-50"
            }`}
        >
            <Handle type="target" position={Position.Left} className={`!h-3 !w-3 ${isMustAttend ? "!bg-amber-500" : "!bg-purple-400"}`} />

            <div className="flex items-start gap-2.5 mb-3">
                <div className={`rounded-lg p-2 ${isMustAttend ? "bg-amber-100" : "bg-purple-100"}`}>
                    <Calendar className={`h-4 w-4 ${isMustAttend ? "text-amber-600" : "text-purple-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{data.label}</h4>
                        {isMustAttend && <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                    </div>
                    {data.category && (
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${isMustAttend ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>
                            {data.category}
                        </span>
                    )}
                </div>
            </div>

            {data.description && <p className="text-xs text-slate-600 mb-2 line-clamp-2 leading-relaxed">{data.description}</p>}

            <div className="space-y-1.5 text-xs">
                {data.startDate && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{data.startDate}</span>
                    </div>
                )}

                {data.skills && data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {data.skills.slice(0, 3).map((skill: string, idx: number) => (
                            <span key={idx} className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {data.similarity && <div className="text-xs text-slate-400 mt-2">Match: {(data.similarity * 100).toFixed(0)}%</div>}
            </div>
        </div>
    );
}

// Goal end node component
function GoalNode({ data }: NodeProps) {
    return (
        <div className="w-[280px] rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-xl">
            <Handle type="target" position={Position.Left} className="!h-4 !w-4 !bg-white border-2 border-emerald-300" />

            <div className="flex items-start gap-3 mb-3">
                <div className="rounded-full bg-white/20 p-2.5">
                    <Target className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{data.label}</h3>
                    <p className="text-xs text-emerald-100">Career Goal</p>
                </div>
            </div>

            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-white/90 leading-relaxed line-clamp-6">{data.goal}</p>
            </div>

            {data.timeline && (
                <div className="mt-2 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-white mb-1">Timeline:</p>
                    <p className="text-xs text-emerald-50">{data.timeline}</p>
                </div>
            )}
        </div>
    );
}

// Custom node types
const customNodeTypes = {
    input: UserStartNode,
    default: (props: NodeProps) => {
        if (props.data.type === "event") {
            return <EventNode {...props} />;
        }
        return <StageNode {...props} />;
    },
    output: GoalNode,
};

export default function CareerGraphPage() {
    const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[]; metadata?: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserId] = useState("c002d160a44d");

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: "assistant-welcome",
            role: "assistant",
            text: "Hi! I'm your Career Pathfinder assistant. Ask me about your roadmap, events, or career strategy. I can help you modify and optimize your career path!",
        },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const chatListRef = useRef<HTMLDivElement>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const loadCareerGraph = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/users/${selectedUserId}/career-graph`);
            if (!response.ok) {
                throw new Error("Failed to fetch career graph");
            }
            const data = await response.json();
            setGraphData(data);
        } catch (err) {
            console.error("Error loading career graph:", err);
            setError(err instanceof Error ? err.message : "Failed to load career graph");
        } finally {
            setLoading(false);
        }
    }, [selectedUserId]);

    useEffect(() => {
        loadCareerGraph();
    }, [loadCareerGraph]);

    useEffect(() => {
        if (graphData) {
            setNodes(graphData.nodes || []);
            setEdges(graphData.edges || []);
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [graphData, setNodes, setEdges]);

    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const prompt = chatInput.trim();
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            role: "user",
            text: prompt,
        };

        setChatMessages((prev) => [...prev, userMessage]);
        setChatInput("");
        setChatLoading(true);
        setChatError(null);

        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: selectedUserId,
                    message: prompt,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to process message");
            }

            const data = await response.json();

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                role: "assistant",
                text: data.message || "I've updated your career path based on your request. The graph has been refreshed!",
            };

            setChatMessages((prev) => [...prev, assistantMessage]);

            if (data.career_path) {
                setGraphData(data.career_path);
            }

            await loadCareerGraph();
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unable to process your request.";
            setChatError(errorMessage);

            setChatMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    role: "assistant",
                    text: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
                },
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    const handlePromptInsert = (prompt: string) => {
        setChatInput(prompt);
        setChatError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit();
        }
    };

    const isSendDisabled = chatLoading || !chatInput.trim();

    return (
        <ReactFlowProvider>
            <div className="bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen py-8 px-4">
                <div className="mx-auto max-w-[1800px] flex flex-col xl:flex-row gap-6">
                    <div className="flex-1 order-2 xl:order-1">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-3">
                                    <Sparkles className="h-7 w-7 text-indigo-500" />
                                    Career Roadmap
                                </h1>
                                <p className="text-sm text-slate-600">Your personalized path to success</p>
                                {graphData?.metadata && (
                                    <div className="mt-1 flex gap-3 text-xs text-slate-500">
                                        <span>{graphData.metadata.totalStages} stages</span>
                                        <span>•</span>
                                        <span>{graphData.metadata.totalEvents} events</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={loadCareerGraph}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Refresh
                            </button>
                        </div>

                        <div className="relative h-[calc(100vh-180px)] rounded-2xl border-2 border-indigo-100 bg-white shadow-2xl">
                            {loading && (
                                <div className="flex h-full flex-col items-center justify-center">
                                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500" />
                                    <p className="mt-4 text-sm font-medium text-slate-600">Building your career roadmap...</p>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="flex h-full flex-col items-center justify-center p-8">
                                    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-8 text-center max-w-md">
                                        <p className="text-sm font-semibold text-rose-600 mb-2">{error}</p>
                                        <p className="text-xs text-rose-500">Unable to load your career graph. Please try again.</p>
                                        <button onClick={loadCareerGraph} className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold hover:bg-rose-600 transition-colors">
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!loading && !error && nodes.length > 0 && (
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    nodeTypes={customNodeTypes}
                                    defaultViewport={{ x: 50, y: 100, zoom: 0.65 }}
                                    fitView
                                    fitViewOptions={{ padding: 0.15, maxZoom: 0.8 }}
                                    nodesDraggable={true}
                                    nodesConnectable={false}
                                    edgesUpdatable={false}
                                    panOnScroll
                                    zoomOnScroll={true}
                                    panOnDrag={true}
                                    className="rounded-2xl"
                                    minZoom={0.3}
                                    maxZoom={1.2}
                                >
                                    <Background gap={20} size={1} color="#e0e7ff" />
                                    <Controls className="bg-white/90 shadow-lg rounded-lg border border-indigo-100" showInteractive={false} />
                                </ReactFlow>
                            )}

                            {!loading && !error && nodes.length === 0 && (
                                <div className="flex h-full flex-col items-center justify-center p-8">
                                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center max-w-md">
                                        <p className="text-sm font-semibold text-slate-600 mb-2">No roadmap available</p>
                                        <p className="text-xs text-slate-500">Complete your profile to generate a personalized career roadmap.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                                <span className="text-slate-600">Your Profile</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded border-2 border-slate-300 bg-slate-50" />
                                <span className="text-slate-600">Career Stage</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded border-2 border-amber-300 bg-amber-50" />
                                <span className="text-slate-600">Must-Attend Event</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded border-2 border-purple-200 bg-purple-50" />
                                <span className="text-slate-600">Recommended Event</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600" />
                                <span className="text-slate-600">Career Goal</span>
                            </div>
                        </div>
                    </div>

                    <aside className="order-1 w-full xl:order-2 xl:w-[420px]">
                        <div className="sticky top-4 flex h-[calc(100vh-120px)] flex-col rounded-[28px] border border-indigo-100/70 bg-white/90 p-6 shadow-[0_30px_70px_rgba(93,76,246,0.22)] backdrop-blur">
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-3 text-white shadow-lg shadow-indigo-500/40">
                                        <Bot className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-500">Assistant</p>
                                        <h2 className="text-xl font-semibold text-slate-900">Career Guide</h2>
                                        <p className="text-xs text-slate-500">Ask about your roadmap and events</p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </div>
                            </div>

                            <div className="mb-5 space-y-3 rounded-2xl border border-indigo-100/60 bg-indigo-50/60 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-400">Quick Questions</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => handlePromptInsert(prompt)}
                                            className="rounded-full border border-indigo-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm shadow-indigo-100 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div
                                ref={chatListRef}
                                aria-live="polite"
                                className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-indigo-50 bg-gradient-to-b from-white to-indigo-50/40 p-4 pr-5 text-sm shadow-inner shadow-indigo-100/60"
                            >
                                {chatMessages.map((message) => (
                                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[85%] rounded-3xl px-4 py-2 text-sm leading-relaxed shadow ${
                                                message.role === "user"
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-indigo-400/60"
                                                    : "border border-slate-100 bg-white/95 text-slate-700 shadow-slate-200/70"
                                            }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] rounded-3xl px-4 py-2 border border-slate-100 bg-white/95 shadow-slate-200/70">
                                            <div className="flex gap-1">
                                                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {chatError && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-600">{chatError}</div>}

                            <div className="mt-4 space-y-3">
                                <div className="rounded-[24px] border border-indigo-100 bg-white/95 p-3 shadow-inner shadow-indigo-100/70">
                                    <TextareaAutosize
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        minRows={2}
                                        maxRows={5}
                                        className="w-full resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                        placeholder="Ask me to modify your career path..."
                                        disabled={chatLoading}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500">
                                    <button
                                        type="button"
                                        onClick={handleChatSubmit}
                                        disabled={isSendDisabled}
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-semibold text-white shadow-lg shadow-indigo-400/70 transition hover:brightness-110 disabled:opacity-50"
                                    >
                                        {chatLoading ? (
                                            "Updating..."
                                        ) : (
                                            <>
                                                <SendHorizontal className="h-4 w-4" />
                                                Send
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </ReactFlowProvider>
    );
}
