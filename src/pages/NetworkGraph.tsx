import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ReactFlow, {
    Background,
    Controls,
    Handle,
    MarkerType,
    Position,
    ReactFlowProvider,
    type Edge,
    type Node,
    type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { Calendar, RotateCcw, User, SendHorizontal, Bot } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

type GraphUser = {
    id: string;
    name: string;
    email: string;
    year: string;
    faculty: string;
    interests: string;
    end_goal: string;
    timeline?: string;
    resume_key?: string;
    created_at: string;
    updated_at: string;
};

type GraphEvent = {
    event_id: string;
    title: string;
    description?: string;
    start_dt: string;
    end_dt?: string;
    category?: string;
    source?: string;
    created_at: string;
};

type GraphLink = {
    userId: string;
    eventId: string;
    relationship?: string;
};

type GraphPayload = {
    users: GraphUser[];
    events: GraphEvent[];
    links: GraphLink[];
};

type UserNodeData = {
    name: string;
    faculty: string;
    email: string;
    year: string;
    interests: string;
    endGoal: string;
    timeline?: string;
};

type EventNodeData = {
    title: string;
    description?: string;
    category?: string;
    source?: string;
    timeframe: string;
};

type FlowNode = Node<UserNodeData | EventNodeData>;
type FlowEdge = Edge;

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
};

const quickPrompts = [
    "Connect Avery to a sustainability summit happening in January.",
    "Add a design-thinking workshop for Zara and link her as a volunteer.",
    "Introduce a mentorship sync between Leo and a fintech accelerator.",
];

const demoGraphPayload: GraphPayload = {
    users: [
        {
            id: "user-avery",
            name: "Avery Chen",
            email: "avery.chen@example.com",
            year: "3",
            faculty: "Engineering",
            interests: "Robotics club, applied AI labs",
            end_goal: "Launch a sustainability-focused robotics startup",
            timeline: "18 months",
            resume_key: "avery-chen-resume.pdf",
            created_at: "2024-01-05T10:15:00Z",
            updated_at: "2024-11-18T08:45:00Z",
        },
        {
            id: "user-leo",
            name: "Leo Martinez",
            email: "leo.martinez@example.com",
            year: "4",
            faculty: "Business",
            interests: "Venture capital club, design sprints",
            end_goal: "Join a product strategy fellowship",
            timeline: "6 months",
            resume_key: "leo-martinez-resume.pdf",
            created_at: "2023-11-12T14:10:00Z",
            updated_at: "2024-10-20T16:30:00Z",
        },
        {
            id: "user-zara",
            name: "Zara Patel",
            email: "zara.patel@example.com",
            year: "2",
            faculty: "Information Science",
            interests: "Community building, hackathons, writing",
            end_goal: "Curate inclusive tech events across campus",
            timeline: "12 months",
            resume_key: "zara-patel-resume.pdf",
            created_at: "2024-03-08T09:00:00Z",
            updated_at: "2024-10-10T17:42:00Z",
        },
    ],
    events: [
        {
            event_id: "event-101",
            title: "AI Product Sprint",
            description: "Weekend design challenge focused on applied AI use cases.",
            start_dt: "2024-11-08T09:00:00Z",
            end_dt: "2024-11-09T18:00:00Z",
            category: "Innovation",
            source: "Campus Innovation Lab",
            created_at: "2024-10-01T08:00:00Z",
        },
        {
            event_id: "event-102",
            title: "Founder Chats Series",
            description: "Intimate conversations with alumni founders and operators.",
            start_dt: "2024-11-15T17:00:00Z",
            end_dt: "2024-11-15T19:00:00Z",
            category: "Community",
            source: "Launchpad Society",
            created_at: "2024-09-14T11:22:00Z",
        },
        {
            event_id: "event-103",
            title: "Peer Mentorship Kickoff",
            description: "Matching night for peer mentors and ambitious underclassmen.",
            start_dt: "2024-12-02T18:00:00Z",
            end_dt: "2024-12-02T20:30:00Z",
            category: "Mentorship",
            source: "Pathfinder HQ",
            created_at: "2024-10-25T15:30:00Z",
        },
        {
            event_id: "event-104",
            title: "Sustainability Venture Fair",
            description: "Showcase of student-led climate and impact ventures.",
            start_dt: "2024-12-10T12:00:00Z",
            end_dt: "2024-12-10T16:00:00Z",
            category: "Showcase",
            source: "Impact Collective",
            created_at: "2024-10-30T13:05:00Z",
        },
    ],
    links: [
        { userId: "user-avery", eventId: "event-101", relationship: "Mentor" },
        { userId: "user-avery", eventId: "event-104", relationship: "Attending" },
        { userId: "user-leo", eventId: "event-101", relationship: "Advisor" },
        { userId: "user-leo", eventId: "event-102", relationship: "Speaker" },
        { userId: "user-zara", eventId: "event-103", relationship: "Volunteer" },
        { userId: "user-zara", eventId: "event-104", relationship: "Exploring" },
    ],
};

const proOptions = { hideAttribution: true };

const formatDateRange = (start: string, end?: string) => {
    const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    const startLabel = formatter.format(new Date(start));
    if (!end) return startLabel;
    const endLabel = formatter.format(new Date(end));
    return `${startLabel} → ${endLabel}`;
};

const buildPromptedGraph = (prompt: string, current: GraphPayload | null): GraphPayload => {
    const base = current ?? demoGraphPayload;
    const normalizedGraph =
        base.users.length > 0
            ? base
            : {
                  ...base,
                  users: [
                      {
                          id: "user-pathfinder",
                          name: "Pathfinder Mentor",
                          email: "mentor@pathfinder.local",
                          year: "Alumni",
                          faculty: "Advisory",
                          interests: "Coaching ambitious students",
                          end_goal: "Support every cohort",
                          timeline: "Ongoing",
                          resume_key: undefined,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                      },
                  ],
              };

    const trimmedPrompt = prompt.trim() || "Custom opportunity";
    const headline = trimmedPrompt.length > 50 ? `${trimmedPrompt.slice(0, 47)}...` : trimmedPrompt;
    const eventId = `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const newEvent: GraphEvent = {
        event_id: eventId,
        title: `Idea: ${headline}`,
        description: `Generated from chat prompt: "${trimmedPrompt}"`,
        start_dt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_dt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        category: "Copilot",
        source: "Pathfinder Copilot",
        created_at: new Date().toISOString(),
    };

    const anchorUser = normalizedGraph.users[0];
    const newLink: GraphLink = {
        userId: anchorUser.id,
        eventId: eventId,
        relationship: "Suggested",
    };

    return {
        ...normalizedGraph,
        events: [newEvent, ...normalizedGraph.events],
        links: [newLink, ...normalizedGraph.links],
    };
};

function UserNode({ data }: NodeProps<UserNodeData>) {
    return (
        <div className="w-[260px] rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-lg shadow-blue-200/50">
            <Handle type="source" position={Position.Right} className="!h-3 !w-3 !bg-indigo-500 border-0" />
            <div className="mb-2 flex items-center gap-2">
                <div className="rounded-full bg-indigo-50 p-2 text-indigo-500">
                    <User className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">{data.name}</p>
                    <p className="text-xs text-slate-500">
                        {data.faculty} • Year {data.year}
                    </p>
                </div>
            </div>
            <p className="text-xs text-slate-500">{data.email}</p>
            <div className="mt-3 rounded-xl bg-indigo-50/60 p-3 text-xs text-indigo-800">
                <p className="font-semibold uppercase tracking-wide text-indigo-500">Focus</p>
                <p className="mt-1 text-sm text-slate-700">{data.endGoal}</p>
                <p className="mt-1 text-slate-500">{data.interests}</p>
                {data.timeline && <p className="mt-2 font-medium text-indigo-700">Timeline: {data.timeline}</p>}
            </div>
        </div>
    );
}

function EventNode({ data }: NodeProps<EventNodeData>) {
    return (
        <div className="w-[260px] rounded-2xl border border-purple-100 bg-gradient-to-br from-white via-purple-50 to-indigo-50 p-4 shadow-lg shadow-purple-200/50">
            <Handle type="target" position={Position.Left} className="!h-3 !w-3 !bg-purple-500 border-0" />
            <div className="mb-2 flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                    <Calendar className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">{data.title}</p>
                    <p className="text-xs text-slate-500">{data.category || "Event"}</p>
                </div>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{data.timeframe}</p>
            <p className="mt-2 text-sm text-slate-600">{data.description}</p>
            {data.source && <p className="mt-3 text-xs text-slate-500">Source: {data.source}</p>}
        </div>
    );
}

const nodeTypes = {
    userNode: UserNode,
    eventNode: EventNode,
};

export default function NetworkGraphPage() {
    const [graphData, setGraphData] = useState<GraphPayload | null>(null);
    const [graphLoading, setGraphLoading] = useState(true);
    const [graphError, setGraphError] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: "assistant-welcome",
            role: "assistant",
            text: "Hi! I'm the Pathfinder Copilot. Ask me to connect users, suggest events, or reshape the network.",
        },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const chatListRef = useRef<HTMLDivElement>(null);

    const loadGraphData = useCallback(async () => {
        setGraphLoading(true);
        setGraphError(null);

        try {
            // Placeholder for the real data fetch:
            // const response = await fetch(`${API_BASE}/graph/user-events`);
            // if (!response.ok) throw new Error("Unable to fetch graph data");
            // const payload: GraphPayload = await response.json();
            await new Promise((resolve) => setTimeout(resolve, 450));
            setGraphData(demoGraphPayload);
        } catch (error) {
            console.error("Graph fetch error:", error);
            setGraphError("Unable to load the network right now. Showing cached demo data.");
            setGraphData(demoGraphPayload);
        } finally {
            setGraphLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGraphData();
    }, [loadGraphData]);

    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const nodes = useMemo<FlowNode[]>(() => {
        if (!graphData) return [];

        const userSpacing = 220;
        const eventSpacing = 170;
        const baselineY = 280;

        const computeY = (index: number, total: number, spacing: number) =>
            baselineY + index * spacing - ((total - 1) * spacing) / 2;

        const userNodes: FlowNode[] = graphData.users.map((user, index) => ({
            id: user.id,
            type: "userNode",
            position: { x: 0, y: computeY(index, graphData.users.length, userSpacing) },
            data: {
                name: user.name,
                faculty: user.faculty,
                email: user.email,
                year: user.year,
                interests: user.interests,
                endGoal: user.end_goal,
                timeline: user.timeline,
            },
        }));

        const eventNodes: FlowNode[] = graphData.events.map((event, index) => ({
            id: event.event_id,
            type: "eventNode",
            position: { x: 460, y: computeY(index, graphData.events.length, eventSpacing) },
            data: {
                title: event.title,
                description: event.description,
                category: event.category,
                source: event.source,
                timeframe: formatDateRange(event.start_dt, event.end_dt),
            },
        }));

        return [...userNodes, ...eventNodes];
    }, [graphData]);

    const edges = useMemo<FlowEdge[]>(() => {
        if (!graphData) return [];

        return graphData.links.map((link) => ({
            id: `${link.userId}-${link.eventId}`,
            source: link.userId,
            target: link.eventId,
            type: "smoothstep",
            animated: true,
            label: link.relationship,
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 999,
            labelBgStyle: { fill: "#eef2ff", stroke: "#c7d2fe" },
            labelStyle: { fill: "#312e81", fontSize: 11, fontWeight: 600 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#4c1d95", width: 18, height: 18 },
            style: { strokeWidth: 2, stroke: "#818cf8" },
        }));
    }, [graphData]);

    const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!chatInput.trim()) return;

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
            const response = await fetch(`${API_BASE}/graph/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    graph: graphData ?? demoGraphPayload,
                }),
            });

            if (!response.ok) {
                throw new Error("Backend rejected the copilot request");
            }

            const payload = (await response.json()) as GraphPayload;
            setGraphData(payload);
            setChatMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    role: "assistant",
                    text: "Updated the graph with your latest request—take a look!",
                },
            ]);
        } catch (error) {
            console.error("Copilot error:", error);
            const fallbackGraph = buildPromptedGraph(prompt, graphData);
            setGraphData(fallbackGraph);
            setChatMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    role: "assistant",
                    text: "I applied a simulated update while the backend is unreachable. Refresh once it's back online.",
                },
            ]);
            setChatError(error instanceof Error ? error.message : "Unable to reach the copilot backend.");
        } finally {
            setChatLoading(false);
        }
    };

    const handlePromptInsert = (prompt: string) => {
        setChatInput(prompt);
        setChatError(null);
    };

    const isSendDisabled = chatLoading || !chatInput.trim();

    return (
        <ReactFlowProvider>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-12 px-4 min-h-[calc(100vh-73px)]">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 xl:flex-row xl:items-start">
                    <div className="order-2 flex-1 xl:order-1">
                        <div className="relative h-[640px] rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3">
                            <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex justify-between gap-3">
                                <div className="pointer-events-auto inline-flex gap-2">
                                    <button
                                        type="button"
                                        onClick={loadGraphData}
                                        disabled={graphLoading}
                                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm shadow-indigo-100 hover:bg-white disabled:opacity-50"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            {graphLoading && (
                                <div className="flex h-full flex-col items-center justify-center text-slate-500">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500" />
                                    <p className="mt-4 text-sm font-medium text-slate-600">Loading network...</p>
                                </div>
                            )}

                            {!graphLoading && graphError && (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-white/80 p-8 text-center">
                                    <p className="text-sm font-semibold text-rose-500">{graphError}</p>
                                    <p className="mt-2 text-xs text-rose-400">We will keep serving the demo connections meanwhile.</p>
                                </div>
                            )}

                            {!graphLoading && !graphError && nodes.length > 0 && (
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    nodeTypes={nodeTypes}
                                    defaultViewport={{ x: 80, y: 0, zoom: 0.9 }}
                                    fitView
                                    fitViewOptions={{ padding: 0.2 }}
                                    nodesDraggable={false}
                                    nodesConnectable={false}
                                    edgesUpdatable={false}
                                    panOnScroll
                                    zoomOnScroll={false}
                                    panOnDrag={false}
                                    selectionOnDrag={false}
                                    className="rounded-2xl bg-transparent"
                                    proOptions={proOptions}
                                >
                                    <Background gap={24} size={1} color="#c7d2fe" />
                                    <Controls className="bg-white/90 shadow-lg shadow-indigo-200/70" showInteractive={false} />
                                </ReactFlow>
                            )}
                        </div>
                    </div>

                    <aside className="order-1 w-full xl:order-2 xl:max-w-[420px]">
                        <div className="sticky top-8 flex h-full flex-col rounded-[28px] border border-indigo-100/70 bg-white/90 p-6 shadow-[0_30px_70px_rgba(93,76,246,0.22)] backdrop-blur">
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-3 text-white shadow-lg shadow-indigo-500/40">
                                        <Bot className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-500">Copilot</p>
                                        <h2 className="text-xl font-semibold text-slate-900">Graph Assistant</h2>
                                        <p className="text-xs text-slate-500">Ask for new events, connections, or timeline tweaks.</p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </div>
                            </div>

                            <div className="mb-5 space-y-3 rounded-2xl border border-indigo-100/60 bg-indigo-50/60 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-400">Jumpstart</p>
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
                            </div>

                            {chatError && <p className="mt-3 text-xs text-rose-500">{chatError}</p>}

                            <form className="mt-4 space-y-3" onSubmit={handleChatSubmit}>
                                <div className="rounded-[24px] border border-indigo-100 bg-white/95 p-3 shadow-inner shadow-indigo-100/70">
                                    <TextareaAutosize
                                        value={chatInput}
                                        onChange={(event) => setChatInput(event.target.value)}
                                        minRows={2}
                                        maxRows={5}
                                        className="w-full resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                        placeholder="e.g., Connect Zara to a wellness retreat next month..."
                                        disabled={chatLoading}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500">
                                    <button
                                        type="submit"
                                        disabled={isSendDisabled}
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-semibold text-white shadow-lg shadow-indigo-400/70 transition hover:brightness-110 disabled:opacity-50"
                                    >
                                        {chatLoading ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <SendHorizontal className="h-4 w-4" />
                                                Send
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </aside>
                </div>
            </div>
        </ReactFlowProvider>
    );
}
