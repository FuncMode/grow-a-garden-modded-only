require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

const ACCESS_TOKEN = process.env.TOKEN;  // Or change .env to ACCESS_TOKEN

const ROBLOX_SCRIPT = `
-- Unified Tabbed GUI (Eggs AutoBuy, Pets AutoBuy, Lollipop Auto, Egg Placer)
-- Paste this into a LocalScript (client)

-- Remove old GUI if exists
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local StarterGui = game:GetService("StarterGui")
local UIS = game:GetService("UserInputService")

local Player = Players.LocalPlayer
local PlayerGui = Player:WaitForChild("PlayerGui")

if PlayerGui:FindFirstChild("TabbedGUI") then
	PlayerGui:FindFirstChild("TabbedGUI"):Destroy()
end

-- ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "TabbedGUI"
screenGui.Parent = PlayerGui
screenGui.ResetOnSpawn = false

-- Main Frame (liit na version)
local frame = Instance.new("Frame")
frame.Size = UDim2.new(0, 420, 0, 320)
frame.Position = UDim2.new(0.3, 0, 0.25, 0)
frame.BackgroundColor3 = Color3.fromRGB(34,34,34)
frame.BorderSizePixel = 0
frame.Active = true
frame.Draggable = true
frame.Parent = screenGui
Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 10)

-- Title bar
local titleBar = Instance.new("Frame")
titleBar.Size = UDim2.new(1, 0, 0, 30)
titleBar.BackgroundColor3 = Color3.fromRGB(20,20,20)
titleBar.BorderSizePixel = 0
titleBar.Parent = frame
Instance.new("UICorner", titleBar).CornerRadius = UDim.new(0, 10)

local titleLabel = Instance.new("TextLabel")
titleLabel.Size = UDim2.new(1, -80, 1, 0)
titleLabel.Position = UDim2.new(0, 12, 0, 0)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = "Grow A Garden Modded Script (by funcMode)"
titleLabel.TextColor3 = Color3.fromRGB(240,240,240)
titleLabel.TextSize = 15
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextXAlignment = Enum.TextXAlignment.Left
titleLabel.Parent = titleBar

local minimizeBtn = Instance.new("TextButton")
minimizeBtn.Size = UDim2.new(0, 26, 0, 26)
minimizeBtn.Position = UDim2.new(1, -58, 0, 2)
minimizeBtn.Text = "➖"
minimizeBtn.BackgroundTransparency = 1
minimizeBtn.TextColor3 = Color3.fromRGB(220,220,220)
minimizeBtn.Font = Enum.Font.GothamBold
minimizeBtn.TextSize = 18
minimizeBtn.Parent = titleBar

local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 26, 0, 26)
closeBtn.Position = UDim2.new(1, -28, 0, 2)
closeBtn.Text = "❌"
closeBtn.BackgroundTransparency = 1
closeBtn.TextColor3 = Color3.fromRGB(255,120,120)
closeBtn.Font = Enum.Font.GothamBold
closeBtn.TextSize = 15
closeBtn.Parent = titleBar

-- Left tabs container (palitan natin ng ScrollingFrame para may scroll)
local tabsFrame = Instance.new("ScrollingFrame")
tabsFrame.Size = UDim2.new(0, 120, 1, -30)
tabsFrame.Position = UDim2.new(0, 0, 0, 30)
tabsFrame.BackgroundColor3 = Color3.fromRGB(25,25,25)
tabsFrame.BorderSizePixel = 0
tabsFrame.ScrollBarThickness = 6
tabsFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
tabsFrame.Parent = frame
Instance.new("UICorner", tabsFrame).CornerRadius = UDim.new(0,6)

-- UIListLayout for tab buttons
local UIListLayoutTabs = Instance.new("UIListLayout")
UIListLayoutTabs.FillDirection = Enum.FillDirection.Vertical
UIListLayoutTabs.SortOrder = Enum.SortOrder.LayoutOrder
UIListLayoutTabs.Padding = UDim.new(0, 6)
UIListLayoutTabs.Parent = tabsFrame

-- Para mag auto adjust ang scroll kapag dumami tabs
UIListLayoutTabs:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	tabsFrame.CanvasSize = UDim2.new(0, 0, 0, UIListLayoutTabs.AbsoluteContentSize.Y + 10)
end)

-- Right content frame
local contentFrame = Instance.new("Frame")
contentFrame.Size = UDim2.new(1, -130, 1, -40)
contentFrame.Position = UDim2.new(0, 130, 0, 36)
contentFrame.BackgroundColor3 = Color3.fromRGB(44,44,44)
contentFrame.BorderSizePixel = 0
contentFrame.Parent = frame
Instance.new("UICorner", contentFrame).CornerRadius = UDim.new(0, 6)

-- Helper to create tab button
local function createTab(name, emoji)
	local btn = Instance.new("TextButton")
	btn.Size = UDim2.new(1, -14, 0, 38)
	btn.Position = UDim2.new(0, 7, 0, 0)
	btn.BackgroundColor3 = Color3.fromRGB(50,50,50)
	btn.BorderSizePixel = 0
	btn.Font = Enum.Font.GothamBold
	btn.TextSize = 13
	btn.TextColor3 = Color3.fromRGB(230,230,230)
	btn.Text = (emoji and (emoji.." ") or "") .. name
	btn.Parent = tabsFrame
	Instance.new("UICorner", btn).CornerRadius = UDim.new(0,6)
	return btn
end

-- Tabs setup
local tabNames = {"Eggs", "Pets", "Lollipop", "Egg Placer", "Gear", "Seed", "Chris P.'S k."}
local tabIcons = {
    Eggs = "🥚",
    Pets = "🐾",
    Lollipop = "🍭",
    ["Egg Placer"] = "📍",
    Gear = "⚙️",
    Seed = "🌱",
	["Chris P.'S k."] = "👨‍🍳"
}

local tabButtons, tabContents = {}, {}

for _, tabName in ipairs(tabNames) do
    local icon = tabIcons[tabName] or "📌"
    local tabBtn = createTab(tabName, icon)
    tabButtons[tabName] = tabBtn

    local tabContent = Instance.new("Frame")
    tabContent.Size = UDim2.new(1, 0, 1, 0)
    tabContent.BackgroundTransparency = 1
    tabContent.Visible = false
    tabContent.Parent = contentFrame
    tabContents[tabName] = tabContent
end

-- Function para mag-set ng active tab
local function setActiveTab(name)
    for tabName, btn in pairs(tabButtons) do
        if tabName == name then
            btn.BackgroundColor3 = Color3.fromRGB(85, 85, 85)
            tabContents[tabName].Visible = true
        else
            btn.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
            tabContents[tabName].Visible = false
        end
    end
end

-- Default active tab
setActiveTab("Eggs")

-- Tab button click connections
for tabName, btn in pairs(tabButtons) do
    btn.MouseButton1Click:Connect(function()
        setActiveTab(tabName)
    end)
end

-- Notification helper
local function notify(title, text, duration)
	duration = duration or 2
	pcall(function()
		StarterGui:SetCore("SendNotification", {Title = title or "Notice", Text = text or "", Duration = duration})
	end)
end

-- ========== MINIMIZE / CLOSE logic ==========
local minimized = false
local originalSize = frame.Size
local minimizedSize = UDim2.new(0, originalSize.X.Offset, 0, 30)

minimizeBtn.MouseButton1Click:Connect(function()
	minimized = not minimized
	if minimized then
		frame.Size = minimizedSize
		contentFrame.Visible = false
		tabsFrame.Visible = false
	else
		frame.Size = originalSize
		contentFrame.Visible = true
		tabsFrame.Visible = true
	end
end)

closeBtn.MouseButton1Click:Connect(function()
	screenGui:Destroy()
end)

UIS.InputBegan:Connect(function(input, gpe)
	if gpe then return end
	if input.KeyCode == Enum.KeyCode.M then
		minimizeBtn:Activate()
	end
end)

-- TODO: Ilagay dito yung buong features code (Eggs, Pets, Lollipop, Egg Placer) mula sa original
-- (Hindi ko na inulit dito para malinaw yung minimize fix at size changes)

-- ========== FEATURE: Eggs Auto Buy ==========
-- ========== EGGS TAB ==========
local eggsTab = tabContents["Eggs"]
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Dropdown button
local dropdownEggBtn = Instance.new("TextButton", eggsTab)
dropdownEggBtn.AnchorPoint = Vector2.new(0.5, 0.5)
dropdownEggBtn.Position = UDim2.new(0.5, 0, 0.5, -20)
dropdownEggBtn.Size = UDim2.new(0, 240, 0, 32)
dropdownEggBtn.Text = "Select Egg Type ▼"
dropdownEggBtn.TextColor3 = Color3.fromRGB(245,245,245)
dropdownEggBtn.BackgroundColor3 = Color3.fromRGB(65,65,65)
dropdownEggBtn.Font = Enum.Font.Gotham
dropdownEggBtn.TextSize = 14
Instance.new("UICorner", dropdownEggBtn).CornerRadius = UDim.new(0,6)

-- Dropdown frame
local dropdownEggFrame = Instance.new("Frame", eggsTab)
dropdownEggFrame.AnchorPoint = Vector2.new(0.5, 0)
dropdownEggFrame.Position = UDim2.new(0.5, 0, 0.5, 12)
dropdownEggFrame.Size = UDim2.new(0, 240, 0, 0)
dropdownEggFrame.BackgroundColor3 = Color3.fromRGB(55,55,55)
dropdownEggFrame.ClipsDescendants = true
dropdownEggFrame.Visible = false
Instance.new("UICorner", dropdownEggFrame).CornerRadius = UDim.new(0,6)

-- Scroll inside dropdown
local scrollEggFrame = Instance.new("ScrollingFrame", dropdownEggFrame)
scrollEggFrame.Size = UDim2.new(1, 0, 1, 0)
scrollEggFrame.CanvasSize = UDim2.new(0,0,0,0)
scrollEggFrame.ScrollBarThickness = 6
scrollEggFrame.BackgroundTransparency = 1
scrollEggFrame.ScrollBarImageColor3 = Color3.fromRGB(120,120,120)
scrollEggFrame.AutomaticCanvasSize = Enum.AutomaticSize.None

-- Padding
local paddingEgg = Instance.new("UIPadding", scrollEggFrame)
paddingEgg.PaddingTop = UDim.new(0,2)
paddingEgg.PaddingLeft = UDim.new(0,4)
paddingEgg.PaddingRight = UDim.new(0,4)

local layoutEgg = Instance.new("UIListLayout", scrollEggFrame)
layoutEgg.SortOrder = Enum.SortOrder.LayoutOrder
layoutEgg.Padding = UDim.new(0,2)

-- Auto Buy button
local autoBuyEggBtn = Instance.new("TextButton", eggsTab)
autoBuyEggBtn.AnchorPoint = Vector2.new(0.5, 0.5)
autoBuyEggBtn.Position = UDim2.new(0.5, 0, 0.5, 20)
autoBuyEggBtn.Size = UDim2.new(0, 240, 0, 36)
autoBuyEggBtn.Text = "Start Auto Buy"
autoBuyEggBtn.TextColor3 = Color3.fromRGB(250,250,250)
autoBuyEggBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
autoBuyEggBtn.Font = Enum.Font.GothamBold
autoBuyEggBtn.TextSize = 14
Instance.new("UICorner", autoBuyEggBtn).CornerRadius = UDim.new(0,6)

-- State vars
local buyingEgg = false
local selectedEgg = nil

local eggCodes = {
    ["Common Egg"] = "\n\000\000\224\138\"i\232A",
    ["Common Summer Egg"] = "\n\000\000\128\127+\173\232A",
    ["Rare Summer Egg"] = "\n\000\000@\143+\173\232A",
    ["Mythical Egg"] = "\n\000\000`\181\157|\232A",
    ["Paradise Egg"] = "\n\000\000`\161+\173\232A",
    ["Bug Egg"] = "\n\000\000\128\224aj\232A",
    ["Night Egg"] = "\n\000\000\000\2247t\232A",
    ["Zen Egg"] = "\n\000\000\160n\156\222\232A",
    ["Bee Egg"] = "\n\000\000\192]y\141\232A",
    ["Oasis Egg"] = "\n\000\000\128\030\141\183\232A",
    ["Anti Bee Egg"] = "\n\000\000\000\187=\153\232A",
}

-- Populate options
for eggName, code in pairs(eggCodes) do
	local option = Instance.new("TextButton")
	option.Size = UDim2.new(1, -8, 0, 26)
	option.Text = eggName
	option.TextColor3 = Color3.fromRGB(245,245,245)
	option.BackgroundColor3 = Color3.fromRGB(75,75,75)
	option.Font = Enum.Font.Gotham
	option.TextSize = 14
	option.Parent = scrollEggFrame
	Instance.new("UICorner", option).CornerRadius = UDim.new(0,4)

	option.MouseButton1Click:Connect(function()
		selectedEgg = code
		dropdownEggBtn.Text = eggName.." ▼"

		dropdownEggFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownEggFrame.Visible = false
		end)
		dropdownEggBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		autoBuyEggBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)

		notify("🥚 Auto Buy Eggs", "Selected Egg: "..eggName, 2)
	end)
end

-- Update scroll size
layoutEgg:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scrollEggFrame.CanvasSize = UDim2.new(0,0,0, layoutEgg.AbsoluteContentSize.Y + 4)
end)

-- Toggle dropdown
dropdownEggBtn.MouseButton1Click:Connect(function()
	local maxHeight = 140
	local contentHeight = layoutEgg.AbsoluteContentSize.Y + 4
	local visibleHeight = math.min(contentHeight, maxHeight)

	if dropdownEggFrame.Visible then
		-- CLOSE
		dropdownEggFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownEggFrame.Visible = false
		end)
		dropdownEggBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		dropdownEggFrame:TweenPosition(UDim2.new(0.5, 0, 0.5, 12), "Out", "Quad", 0.18, true)
		autoBuyEggBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)
	else
		-- OPEN
		dropdownEggFrame.Visible = true
		dropdownEggFrame:TweenPosition(
			UDim2.new(0.5, 0, 0.5, -(visibleHeight/2) + 12),
			"Out", "Quad", 0.18, true
		)
		dropdownEggFrame:TweenSize(UDim2.new(0, 240, 0, visibleHeight), "Out", "Quad", 0.18, true)
		dropdownEggBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -visibleHeight/2 - 4), "Out", "Quad", 0.18, true)

		-- Limit para hindi lumabas sa GUI yung button
		local maxBtnOffset = (eggsTab.AbsoluteSize.Y / 2) - (autoBuyEggBtn.Size.Y.Offset / 2) - 5
		local targetOffset = math.min(visibleHeight + 40, maxBtnOffset)

		autoBuyEggBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, targetOffset), "Out", "Quad", 0.18, true)
	end
end)

-- Auto buy loop
local function autoBuyEggLoop()
	while buyingEgg and selectedEgg do
		local success = pcall(function()
			local args = { buffer.fromstring(selectedEgg) }
			ReplicatedStorage:WaitForChild("ByteNetReliable"):FireServer(unpack(args))
		end)
		if success then
			notify("🥚 Auto Buy Eggs", "Bought 1 egg", 1)
		end
		task.wait(1)
	end
end

-- Toggle buy button
autoBuyEggBtn.MouseButton1Click:Connect(function()
	if not selectedEgg then
		notify("⚠ Auto Buy Eggs", "Please select an egg first.", 2)
		return
	end
	buyingEgg = not buyingEgg
	if buyingEgg then
		autoBuyEggBtn.Text = "Stop Auto Buy"
		autoBuyEggBtn.BackgroundColor3 = Color3.fromRGB(170,40,40)
		task.spawn(autoBuyEggLoop)
	else
		autoBuyEggBtn.Text = "Start Auto Buy"
		autoBuyEggBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
	end
end)

-- ========== PETS TAB ==========
local petsTab = tabContents["Pets"]
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Dropdown button
local dropdownPetBtn = Instance.new("TextButton", petsTab)
dropdownPetBtn.AnchorPoint = Vector2.new(0.5, 0.5)
dropdownPetBtn.Position = UDim2.new(0.5, 0, 0.5, -20)
dropdownPetBtn.Size = UDim2.new(0, 240, 0, 32)
dropdownPetBtn.Text = "Select Pet ▼"
dropdownPetBtn.TextColor3 = Color3.fromRGB(245,245,245)
dropdownPetBtn.BackgroundColor3 = Color3.fromRGB(65,65,65)
dropdownPetBtn.Font = Enum.Font.Gotham
dropdownPetBtn.TextSize = 14
Instance.new("UICorner", dropdownPetBtn).CornerRadius = UDim.new(0,6)

-- Dropdown frame
local dropdownPetFrame = Instance.new("Frame", petsTab)
dropdownPetFrame.AnchorPoint = Vector2.new(0.5, 0)
dropdownPetFrame.Position = UDim2.new(0.5, 0, 0.5, 12)
dropdownPetFrame.Size = UDim2.new(0, 240, 0, 0)
dropdownPetFrame.BackgroundColor3 = Color3.fromRGB(55,55,55)
dropdownPetFrame.ClipsDescendants = true
dropdownPetFrame.Visible = false
Instance.new("UICorner", dropdownPetFrame).CornerRadius = UDim.new(0,6)

-- Scroll inside dropdown
local scrollPetFrame = Instance.new("ScrollingFrame", dropdownPetFrame)
scrollPetFrame.Size = UDim2.new(1, 0, 1, 0)
scrollPetFrame.CanvasSize = UDim2.new(0,0,0,0)
scrollPetFrame.ScrollBarThickness = 6
scrollPetFrame.BackgroundTransparency = 1
scrollPetFrame.ScrollBarImageColor3 = Color3.fromRGB(120,120,120)
scrollPetFrame.AutomaticCanvasSize = Enum.AutomaticSize.None

-- Padding
local paddingPet = Instance.new("UIPadding", scrollPetFrame)
paddingPet.PaddingTop = UDim.new(0,2)
paddingPet.PaddingLeft = UDim.new(0,4)
paddingPet.PaddingRight = UDim.new(0,4)

local layoutPet = Instance.new("UIListLayout", scrollPetFrame)
layoutPet.SortOrder = Enum.SortOrder.LayoutOrder
layoutPet.Padding = UDim.new(0,2)

-- Auto Buy button
local autoBuyPetBtn = Instance.new("TextButton", petsTab)
autoBuyPetBtn.AnchorPoint = Vector2.new(0.5, 0.5)
autoBuyPetBtn.Position = UDim2.new(0.5, 0, 0.5, 20)
autoBuyPetBtn.Size = UDim2.new(0, 240, 0, 36)
autoBuyPetBtn.Text = "Start Auto Buy"
autoBuyPetBtn.TextColor3 = Color3.fromRGB(250,250,250)
autoBuyPetBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
autoBuyPetBtn.Font = Enum.Font.GothamBold
autoBuyPetBtn.TextSize = 14
Instance.new("UICorner", autoBuyPetBtn).CornerRadius = UDim.new(0,6)

-- State vars
local buyingPet = false
local selectedPet = nil

local petCodes = {
    ["Blood HedgeHog"] = "\n\000\000\1609i|\232A",
    ["Blood Kiwi"] = "\n\000\000\224\"i|\232A",
    ["Blood Owl"] = "\n\000\000`Di|\232A",
    ["Hamster"] = "\n\000\000\0007\003\183\232A",
    ["Moon Cat"] = "\n\000\000\192\209\132\135\232A",
}

-- Populate options
for petName, code in pairs(petCodes) do
	local option = Instance.new("TextButton")
	option.Size = UDim2.new(1, -8, 0, 26)
	option.Text = petName
	option.TextColor3 = Color3.fromRGB(245,245,245)
	option.BackgroundColor3 = Color3.fromRGB(75,75,75)
	option.Font = Enum.Font.Gotham
	option.TextSize = 14
	option.Parent = scrollPetFrame
	Instance.new("UICorner", option).CornerRadius = UDim.new(0,4)

	option.MouseButton1Click:Connect(function()
		selectedPet = code
		dropdownPetBtn.Text = petName.." ▼"

		dropdownPetFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownPetFrame.Visible = false
		end)
		dropdownPetBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		autoBuyPetBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)

		notify("🐾 Auto Buy Pets", "Selected Pet: "..petName, 2)
	end)
end

-- Update scroll size
layoutPet:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scrollPetFrame.CanvasSize = UDim2.new(0,0,0, layoutPet.AbsoluteContentSize.Y + 4)
end)

-- Toggle dropdown
dropdownPetBtn.MouseButton1Click:Connect(function()
	local maxHeight = 140
	local contentHeight = layoutPet.AbsoluteContentSize.Y + 4
	local visibleHeight = math.min(contentHeight, maxHeight)

	if dropdownPetFrame.Visible then
		-- CLOSE
		dropdownPetFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownPetFrame.Visible = false
		end)
		dropdownPetBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		dropdownPetFrame:TweenPosition(UDim2.new(0.5, 0, 0.5, 12), "Out", "Quad", 0.18, true)
		autoBuyPetBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)
	else
		-- OPEN
		dropdownPetFrame.Visible = true
		dropdownPetFrame:TweenPosition(
			UDim2.new(0.5, 0, 0.5, -(visibleHeight/2) + 12),
			"Out", "Quad", 0.18, true
		)
		dropdownPetFrame:TweenSize(UDim2.new(0, 240, 0, visibleHeight), "Out", "Quad", 0.18, true)
		dropdownPetBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -visibleHeight/2 - 4), "Out", "Quad", 0.18, true)

		local maxBtnOffset = (petsTab.AbsoluteSize.Y / 2) - (autoBuyPetBtn.Size.Y.Offset / 2) - 5
		local targetOffset = math.min(visibleHeight + 40, maxBtnOffset)

		autoBuyPetBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, targetOffset), "Out", "Quad", 0.18, true)
	end
end)

-- Auto buy loop
local function autoBuyPetLoop()
	while buyingPet and selectedPet do
		local success = pcall(function()
			local args = { buffer.fromstring(selectedPet) }
			ReplicatedStorage:WaitForChild("ByteNetReliable"):FireServer(unpack(args))
		end)
		if success then
			notify("🐾 Auto Buy Pets", "Bought 1 pet", 1)
		end
		task.wait(1)
	end
end

-- Toggle buy button
autoBuyPetBtn.MouseButton1Click:Connect(function()
	if not selectedPet then
		notify("⚠ Auto Buy Pets", "Please select a pet first.", 2)
		return
	end
	buyingPet = not buyingPet
	if buyingPet then
		autoBuyPetBtn.Text = "Stop Auto Buy"
		autoBuyPetBtn.BackgroundColor3 = Color3.fromRGB(170,40,40)
		task.spawn(autoBuyPetLoop)
	else
		autoBuyPetBtn.Text = "Start Auto Buy"
		autoBuyPetBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
	end
end)


-- ========== FEATURE: Lollipop Auto ==========
local lolliTab = tabContents["Lollipop"]

-- Wrapper frame para i-center lahat ng UI sa gitna
local lolliWrapper = Instance.new("Frame", lolliTab)
lolliWrapper.Size = UDim2.new(0, 320, 0, 150)
lolliWrapper.AnchorPoint = Vector2.new(0.5, 0.5)
lolliWrapper.Position = UDim2.new(0.5, 0, 0.5, 0)
lolliWrapper.BackgroundTransparency = 1

-- Title label
local lolliLabel = Instance.new("TextLabel", lolliWrapper)
lolliLabel.Size = UDim2.new(1, 0, 0, 24)
lolliLabel.Position = UDim2.new(0.5, 0, 0, 0)
lolliLabel.AnchorPoint = Vector2.new(0.5, 0)
lolliLabel.BackgroundTransparency = 1
lolliLabel.Text = "Lollipop Auto (Levelup Lollipop)"
lolliLabel.TextColor3 = Color3.fromRGB(240,240,240)
lolliLabel.Font = Enum.Font.GothamBold
lolliLabel.TextSize = 16
lolliLabel.TextXAlignment = Enum.TextXAlignment.Center

-- Toggle button
local toggleLolliBtn = Instance.new("TextButton", lolliWrapper)
toggleLolliBtn.Size = UDim2.new(0.6, 0, 0, 40)
toggleLolliBtn.Position = UDim2.new(0.5, 0, 0, 44)
toggleLolliBtn.AnchorPoint = Vector2.new(0.5, 0)
toggleLolliBtn.Text = "Start Auto Buy"
toggleLolliBtn.BackgroundColor3 = Color3.fromRGB(65,130,180)
toggleLolliBtn.Font = Enum.Font.GothamBold
toggleLolliBtn.TextColor3 = Color3.fromRGB(245,245,245)
toggleLolliBtn.TextSize = 14
Instance.new("UICorner", toggleLolliBtn).CornerRadius = UDim.new(0,6)

-- Status label
local statusLabel = Instance.new("TextLabel", lolliWrapper)
statusLabel.Size = UDim2.new(1, 0, 0, 22)
statusLabel.Position = UDim2.new(0.5, 0, 0, 92)
statusLabel.AnchorPoint = Vector2.new(0.5, 0)
statusLabel.BackgroundTransparency = 1
statusLabel.Text = "Status: Idle"
statusLabel.TextColor3 = Color3.fromRGB(200,255,200)
statusLabel.Font = Enum.Font.Gotham
statusLabel.TextSize = 14
statusLabel.TextXAlignment = Enum.TextXAlignment.Center

-- Auto buy logic
local autoLolli = false

toggleLolliBtn.MouseButton1Click:Connect(function()
	autoLolli = not autoLolli
	toggleLolliBtn.Text = autoLolli and "Stop Auto Buy" or "Start Auto Buy"
	statusLabel.Text = autoLolli and "Status: Attempting..." or "Status: Idle"

	if autoLolli then
		task.spawn(function()
			while autoLolli do
				-- Request restock
				pcall(function()
					local restockArgs = { buffer.fromstring("\n\000\000\021JU\232A") }
					ReplicatedStorage:WaitForChild("ByteNetReliable"):FireServer(unpack(restockArgs))
				end)

				task.wait(1.5)

				local success, err = pcall(function()
					ReplicatedStorage:WaitForChild("GameEvents"):WaitForChild("BuyGearStock"):FireServer("Levelup Lollipop")
				end)

				local gearRestocks = ReplicatedStorage:FindFirstChild("GearRestocks")
				local lollipopRestock = gearRestocks and gearRestocks:FindFirstChild("Levelup Lollipop")
				local hasStock = lollipopRestock and lollipopRestock.Value > 0

				if success and hasStock then
					statusLabel.Text = "Status: ✅ Bought Lollipop!"
					notify("🍭 Lollipop", "Bought Lollipop!", 2)
				elseif not hasStock then
					statusLabel.Text = "Status: ⏳ Waiting for restock..."
				else
					statusLabel.Text = "Status: ❌ Failed to buy"
				end

				task.wait(1.5)
			end
		end)
	end
end)


-- ========== FEATURE: Egg Placer ==========
local placerTab = tabContents["Egg Placer"]

-- Create scrolling container
local scrollFrame = Instance.new("ScrollingFrame", placerTab)
scrollFrame.Size = UDim2.new(1, 0, 1, 0)
scrollFrame.Position = UDim2.new(0, 0, 0, 0)
scrollFrame.CanvasSize = UDim2.new(0, 0, 0, 300) -- adjust later dynamically
scrollFrame.ScrollBarThickness = 6
scrollFrame.BackgroundTransparency = 1

-- UIListLayout for automatic positioning
local layout = Instance.new("UIListLayout", scrollFrame)
layout.Padding = UDim.new(0, 8)
layout.SortOrder = Enum.SortOrder.LayoutOrder

-- Optional: adjust canvas size automatically
layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scrollFrame.CanvasSize = UDim2.new(0, 0, 0, layout.AbsoluteContentSize.Y + 10)
end)

-- Egg Placer Label
local placerLabel = Instance.new("TextLabel", scrollFrame)
placerLabel.Size = UDim2.new(1, -20, 0, 24)
placerLabel.Position = UDim2.new(0, 10, 0, 0)
placerLabel.BackgroundTransparency = 1
placerLabel.Text = "Egg Placer"
placerLabel.TextColor3 = Color3.fromRGB(240,240,240)
placerLabel.Font = Enum.Font.GothamBold
placerLabel.TextSize = 16
placerLabel.TextXAlignment = Enum.TextXAlignment.Left

-- Place 1 Egg
local oneBtn = Instance.new("TextButton", scrollFrame)
oneBtn.Size = UDim2.new(1, -20, 0, 36)
oneBtn.Position = UDim2.new(0, 10, 0, 0)
oneBtn.Text = "Place 1 Egg"
oneBtn.Font = Enum.Font.GothamBold
oneBtn.TextSize = 16
oneBtn.TextColor3 = Color3.new(1,1,1)
oneBtn.BackgroundColor3 = Color3.fromRGB(0,200,100)
Instance.new("UICorner", oneBtn).CornerRadius = UDim.new(0,6)

-- Place 8 Eggs
local eightBtn = Instance.new("TextButton", scrollFrame)
eightBtn.Size = UDim2.new(1, -20, 0, 36)
eightBtn.Text = "Place 8 Eggs"
eightBtn.Font = Enum.Font.GothamBold
eightBtn.TextSize = 16
eightBtn.TextColor3 = Color3.new(1,1,1)
eightBtn.BackgroundColor3 = Color3.fromRGB(0,140,220)
Instance.new("UICorner", eightBtn).CornerRadius = UDim.new(0,6)

-- Spacing Label
local spacingLabel = Instance.new("TextLabel", scrollFrame)
spacingLabel.Size = UDim2.new(1, -20, 0, 22)
spacingLabel.BackgroundTransparency = 1
spacingLabel.Text = "Use Default Positions"
spacingLabel.TextColor3 = Color3.fromRGB(220,220,220)
spacingLabel.Font = Enum.Font.Gotham
spacingLabel.TextSize = 14
spacingLabel.TextXAlignment = Enum.TextXAlignment.Left

-- Default positions
local positions = {
	Vector3.new(43.991127014160156, 0.1754859983921051, -87.39613342285156),
	Vector3.new(50.305335998535156, 0.1754859983921051, -88.32907104492188),
	Vector3.new(57.79936218261719, 0.1754859983921051, -88.03072357177734),
	Vector3.new(66.23564147949219, 0.1754859983921051, -88.21456909177734),
	Vector3.new(44.061241149902344, 0.1754859983921051, -81.71434020996094),
	Vector3.new(50.816139221191406, 0.1754859983921051, -82.52154541015625),
	Vector3.new(57.98183059692383, 0.1754859983921051, -83.09522247314453),
	Vector3.new(66.24691009521484, 0.1754859983921051, -83.41040802001953)
}

local function placeEggs(count)
	local ok, eggService = pcall(function()
		return ReplicatedStorage:WaitForChild("GameEvents"):WaitForChild("PetEggService")
	end)
	if not ok or not eggService then
		notify("Egg Placer", "PetEggService not found.", 3)
		return
	end

	for i = 1, count do
		local pos = positions[((i-1) % #positions) + 1]
		pcall(function()
			eggService:FireServer("CreateEgg", pos)
		end)
		task.wait(0.2)
	end
	notify("✅ Eggs Placed", tostring(count).." Egg(s) Placed", 3)
end

oneBtn.MouseButton1Click:Connect(function() placeEggs(1) end)
eightBtn.MouseButton1Click:Connect(function() placeEggs(8) end)

-- Skip Growth
local skipBtn = Instance.new("TextButton", scrollFrame)
skipBtn.Size = UDim2.new(1, -20, 0, 36)
skipBtn.Text = "Skip Growth (All Eggs)"
skipBtn.Font = Enum.Font.GothamBold
skipBtn.TextSize = 16
skipBtn.TextColor3 = Color3.new(1,1,1)
skipBtn.BackgroundColor3 = Color3.fromRGB(255,140,0)
Instance.new("UICorner", skipBtn).CornerRadius = UDim.new(0,6)

skipBtn.MouseButton1Click:Connect(function()
	local ok, eggService = pcall(function()
		return ReplicatedStorage:WaitForChild("GameEvents"):WaitForChild("PetEggService")
	end)
	if not ok or not eggService then
		notify("Skip Growth", "PetEggService not found.", 3)
		return
	end

	local eggFolder = workspace:FindFirstChild("Farm")
	if eggFolder then
		local target = eggFolder:FindFirstChild("Farm") and eggFolder:FindFirstChild("Farm") or eggFolder
		target = target:FindFirstChild("Important") and target:FindFirstChild("Important") or target
		target = target:FindFirstChild("Objects_Physical") and target:FindFirstChild("Objects_Physical") or target

		local skipped = 0
		for _, egg in pairs(target:GetChildren()) do
			if egg.Name == "PetEgg" then
				pcall(function() eggService:FireServer("AuthorisePurchase", egg) end)
				skipped = skipped + 1
			end
		end
		notify("⚡ Skipped Growth", tostring(skipped).." Egg(s) Skipped", 3)
	else
		notify("⚠ Skip Growth", "Farm folder not found.", 3)
	end
end)

-- Hatch All
local hatchBtn = Instance.new("TextButton", scrollFrame)
hatchBtn.Size = UDim2.new(1, -20, 0, 36)
hatchBtn.Text = "Hatch All Eggs"
hatchBtn.Font = Enum.Font.GothamBold
hatchBtn.TextSize = 16
hatchBtn.TextColor3 = Color3.new(1,1,1)
hatchBtn.BackgroundColor3 = Color3.fromRGB(140,90,220)
Instance.new("UICorner", hatchBtn).CornerRadius = UDim.new(0,6)

hatchBtn.MouseButton1Click:Connect(function()
	local ok, eggService = pcall(function()
		return ReplicatedStorage:WaitForChild("GameEvents"):WaitForChild("PetEggService")
	end)
	if not ok or not eggService then
		notify("Hatch All", "PetEggService not found.", 3)
		return
	end

	local eggFolder = workspace:FindFirstChild("Farm")
	if eggFolder then
		local target = eggFolder:FindFirstChild("Farm") and eggFolder:FindFirstChild("Farm") or eggFolder
		target = target:FindFirstChild("Important") and target:FindFirstChild("Important") or target
		target = target:FindFirstChild("Objects_Physical") and target:FindFirstChild("Objects_Physical") or target

		local hatched = 0
		for _, egg in pairs(target:GetChildren()) do
			if egg.Name == "PetEgg" then
				pcall(function() eggService:FireServer("HatchPet", egg) end)
				hatched = hatched + 1
			end
		end
		notify("🐣 Eggs Hatched", tostring(hatched).." Egg(s) Hatched", 3)
	else
		notify("⚠ Hatch All", "Farm folder not found.", 3)
	end
end)

-- Auto Place + Skip + Hatch Combo
local comboBtn = Instance.new("TextButton", scrollFrame)
comboBtn.Size = UDim2.new(1, -20, 0, 36)
comboBtn.Text = "Place + Skip + Hatch"
comboBtn.Font = Enum.Font.GothamBold
comboBtn.TextSize = 16
comboBtn.TextColor3 = Color3.new(1,1,1)
comboBtn.BackgroundColor3 = Color3.fromRGB(255,80,150)
Instance.new("UICorner", comboBtn).CornerRadius = UDim.new(0,6)

comboBtn.MouseButton1Click:Connect(function()
	placeEggs(8)
	task.wait(0.5)

	local ok, eggService = pcall(function()
		return ReplicatedStorage:WaitForChild("GameEvents"):WaitForChild("PetEggService")
	end)
	if ok and eggService then
		local eggFolder = workspace:FindFirstChild("Farm")
		if eggFolder then
			local target = eggFolder:FindFirstChild("Farm") or eggFolder
			target = target:FindFirstChild("Important") or target
			target = target:FindFirstChild("Objects_Physical") or target

			for _, egg in pairs(target:GetChildren()) do
				if egg.Name == "PetEgg" then
					pcall(function() eggService:FireServer("AuthorisePurchase", egg) end)
				end
			end
		end
	end
	task.wait(0.5)

	if ok and eggService then
		local eggFolder = workspace:FindFirstChild("Farm")
		if eggFolder then
			local target = eggFolder:FindFirstChild("Farm") or eggFolder
			target = target:FindFirstChild("Important") or target
			target = target:FindFirstChild("Objects_Physical") or target

			for _, egg in pairs(target:GetChildren()) do
				if egg.Name == "PetEgg" then
					pcall(function() eggService:FireServer("HatchPet", egg) end)
				end
			end
		end
	end

	notify("🎯 Combo Done", "Placed, Skipped, Hatched All Eggs", 3)
end)



-- ========== GEAR TAB ==========
local gearTab = tabContents["Gear"]
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Dropdown button
local dropdownGearBtn = Instance.new("TextButton", gearTab)
dropdownGearBtn.AnchorPoint = Vector2.new(0.5, 0.5)
dropdownGearBtn.Position = UDim2.new(0.5, 0, 0.5, -20)
dropdownGearBtn.Size = UDim2.new(0, 240, 0, 32)
dropdownGearBtn.Text = "Select Gear Type ▼"
dropdownGearBtn.TextColor3 = Color3.fromRGB(245,245,245)
dropdownGearBtn.BackgroundColor3 = Color3.fromRGB(65,65,65)
dropdownGearBtn.Font = Enum.Font.Gotham
dropdownGearBtn.TextSize = 14
Instance.new("UICorner", dropdownGearBtn).CornerRadius = UDim.new(0,6)

-- Dropdown frame
local dropdownGearFrame = Instance.new("Frame", gearTab)
dropdownGearFrame.AnchorPoint = Vector2.new(0.5, 0)
dropdownGearFrame.Position = UDim2.new(0.5, 0, 0.5, 12)
dropdownGearFrame.Size = UDim2.new(0, 240, 0, 0)
dropdownGearFrame.BackgroundColor3 = Color3.fromRGB(55,55,55)
dropdownGearFrame.ClipsDescendants = true
dropdownGearFrame.Visible = false
Instance.new("UICorner", dropdownGearFrame).CornerRadius = UDim.new(0,6)

-- Scroll inside dropdown
local scrollGearFrame = Instance.new("ScrollingFrame", dropdownGearFrame)
scrollGearFrame.Size = UDim2.new(1, 0, 1, 0)
scrollGearFrame.CanvasSize = UDim2.new(0,0,0,0)
scrollGearFrame.ScrollBarThickness = 6
scrollGearFrame.BackgroundTransparency = 1
scrollGearFrame.ScrollBarImageColor3 = Color3.fromRGB(120,120,120)
scrollGearFrame.AutomaticCanvasSize = Enum.AutomaticSize.None

-- Padding
local paddingGear = Instance.new("UIPadding", scrollGearFrame)
paddingGear.PaddingTop = UDim.new(0,2)
paddingGear.PaddingLeft = UDim.new(0,4)
paddingGear.PaddingRight = UDim.new(0,4)

local layoutGear = Instance.new("UIListLayout", scrollGearFrame)
layoutGear.SortOrder = Enum.SortOrder.LayoutOrder
layoutGear.Padding = UDim.new(0,2)

-- Auto Buy button
local autoBuyGearBtn = Instance.new("TextButton", gearTab)
autoBuyGearBtn.AnchorPoint = Vector2.new(0.5, 0.5)
autoBuyGearBtn.Position = UDim2.new(0.5, 0, 0.5, 20)
autoBuyGearBtn.Size = UDim2.new(0, 240, 0, 36)
autoBuyGearBtn.Text = "Start Auto Buy"
autoBuyGearBtn.TextColor3 = Color3.fromRGB(250,250,250)
autoBuyGearBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
autoBuyGearBtn.Font = Enum.Font.GothamBold
autoBuyGearBtn.TextSize = 14
Instance.new("UICorner", autoBuyGearBtn).CornerRadius = UDim.new(0,6)

-- State vars
local buyingGear = false
local selectedGear = nil

local gearCodes = {
	["Watering Can"]   = "\n\000\000@\207dJ\232A",
	["Trading Ticket"] = "\n\000\000\192\1365\251\232A",
	["Trowel"]         = "\n\000\000 xLU\232A",
	["Recall Wrench"]        = "\n\000\000`\128\171u\232A",
	["Basic Sprinkler"]       = "\n\000\000 \1680U\232A",
	["Advance Sprinker"]     = "n\000\000\224\1860U\232A",
	["Medium Toy"]     = "\n\000\000\192s\145\206\232A",
	["Small Toy"]   = "\n\000\000\160\200\145\206\232A",
	["Godly Sprinkler"]   = "\n\000\000\128\2110U\232A",
	["Magnifying Glass"]    = "\n\000\000\160kD\181\232A",
	["Tanning Mirror"]    = "\n\000\000\128C\137\171\232A",
	["Master Sprinkler"]    = "\n\000\000\1609jX\232A",
	["Cleaning Spray"]    = "\n\000\000`X(\163\232A",
	["Favorite Tool"]    = "\n\000\000\160^Ns\232A",
	["Harvest Tool"]    = "\n\000\000\128\219\158{\232A",
	["FriendShip Pot"]    = "\n\000\000@\174\015\153\232A",
	["GrandMaster Sprinker"]    = "\n\000\000\128\211~\253\232A",
}

-- Populate options
for gearName, code in pairs(gearCodes) do
	local option = Instance.new("TextButton")
	option.Size = UDim2.new(1, -8, 0, 26)
	option.Text = gearName
	option.TextColor3 = Color3.fromRGB(245,245,245)
	option.BackgroundColor3 = Color3.fromRGB(75,75,75)
	option.Font = Enum.Font.Gotham
	option.TextSize = 14
	option.Parent = scrollGearFrame
	Instance.new("UICorner", option).CornerRadius = UDim.new(0,4)

	option.MouseButton1Click:Connect(function()
		selectedGear = code
		dropdownGearBtn.Text = gearName.." ▼"

		dropdownGearFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownGearFrame.Visible = false
		end)
		dropdownGearBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		autoBuyGearBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)

		notify("⚔ Auto Buy Gear", "Selected Gear: "..gearName, 2)
	end)
end

-- Update scroll size when content changes
layoutGear:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scrollGearFrame.CanvasSize = UDim2.new(0,0,0, layoutGear.AbsoluteContentSize.Y + 4)
end)

-- Toggle dropdown
dropdownGearBtn.MouseButton1Click:Connect(function()
	local maxHeight = 140
	local contentHeight = layoutGear.AbsoluteContentSize.Y + 4
	local visibleHeight = math.min(contentHeight, maxHeight)

	if dropdownGearFrame.Visible then
		-- CLOSE
		dropdownGearFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownGearFrame.Visible = false
		end)
		dropdownGearBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		dropdownGearFrame:TweenPosition(UDim2.new(0.5, 0, 0.5, 12), "Out", "Quad", 0.18, true)
		autoBuyGearBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)
	else
		-- OPEN
		dropdownGearFrame.Visible = true
		dropdownGearFrame:TweenPosition(
			UDim2.new(0.5, 0, 0.5, -(visibleHeight/2) + 12),
			"Out", "Quad", 0.18, true
		)
		dropdownGearFrame:TweenSize(UDim2.new(0, 240, 0, visibleHeight), "Out", "Quad", 0.18, true)
		dropdownGearBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -visibleHeight/2 - 4), "Out", "Quad", 0.18, true)

		-- Limit para hindi lumabas sa GUI yung button
		local maxBtnOffset = (gearTab.AbsoluteSize.Y / 2) - (autoBuyGearBtn.Size.Y.Offset / 2) - 5
		local targetOffset = math.min(visibleHeight + 40, maxBtnOffset)

		autoBuyGearBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, targetOffset), "Out", "Quad", 0.18, true)
	end
end)

-- Auto buy loop
local function autoBuyGearLoop()
	while buyingGear and selectedGear do
		local success = pcall(function()
			local args = { buffer.fromstring(selectedGear) }
			ReplicatedStorage:WaitForChild("ByteNetReliable"):FireServer(unpack(args))
		end)
		if success then
			notify("⚔ Auto Buy Gear", "Bought 1 gear", 1)
		end
		task.wait(1)
	end
end

-- Toggle buy button
autoBuyGearBtn.MouseButton1Click:Connect(function()
	if not selectedGear then
		notify("⚠ Auto Buy Gear", "Please select a gear first.", 2)
		return
	end
	buyingGear = not buyingGear
	if buyingGear then
		autoBuyGearBtn.Text = "Stop Auto Buy"
		autoBuyGearBtn.BackgroundColor3 = Color3.fromRGB(170,40,40)
		task.spawn(autoBuyGearLoop)
	else
		autoBuyGearBtn.Text = "Start Auto Buy"
		autoBuyGearBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
	end
end)


-- ========== SEED TAB ==========
local seedTab = tabContents["Seed"]
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Dropdown button
local dropdownSeedBtn = Instance.new("TextButton", seedTab)
dropdownSeedBtn.AnchorPoint = Vector2.new(0.5, 0.5)
dropdownSeedBtn.Position = UDim2.new(0.5, 0, 0.5, -20)
dropdownSeedBtn.Size = UDim2.new(0, 240, 0, 32)
dropdownSeedBtn.Text = "Select Seed Type ▼"
dropdownSeedBtn.TextColor3 = Color3.fromRGB(245,245,245)
dropdownSeedBtn.BackgroundColor3 = Color3.fromRGB(65,65,65)
dropdownSeedBtn.Font = Enum.Font.Gotham
dropdownSeedBtn.TextSize = 14
Instance.new("UICorner", dropdownSeedBtn).CornerRadius = UDim.new(0,6)

-- Dropdown frame
local dropdownSeedFrame = Instance.new("Frame", seedTab)
dropdownSeedFrame.AnchorPoint = Vector2.new(0.5, 0)
dropdownSeedFrame.Position = UDim2.new(0.5, 0, 0.5, 12)
dropdownSeedFrame.Size = UDim2.new(0, 240, 0, 0)
dropdownSeedFrame.BackgroundColor3 = Color3.fromRGB(55,55,55)
dropdownSeedFrame.ClipsDescendants = true
dropdownSeedFrame.Visible = false
Instance.new("UICorner", dropdownSeedFrame).CornerRadius = UDim.new(0,6)

-- Scroll inside dropdown
local scrollSeedFrame = Instance.new("ScrollingFrame", dropdownSeedFrame)
scrollSeedFrame.Size = UDim2.new(1, 0, 1, 0)
scrollSeedFrame.CanvasSize = UDim2.new(0,0,0,0)
scrollSeedFrame.ScrollBarThickness = 6
scrollSeedFrame.BackgroundTransparency = 1
scrollSeedFrame.ScrollBarImageColor3 = Color3.fromRGB(120,120,120)
scrollSeedFrame.AutomaticCanvasSize = Enum.AutomaticSize.None

-- Padding
local paddingSeed = Instance.new("UIPadding", scrollSeedFrame)
paddingSeed.PaddingTop = UDim.new(0,2)
paddingSeed.PaddingLeft = UDim.new(0,4)
paddingSeed.PaddingRight = UDim.new(0,4)

local layoutSeed = Instance.new("UIListLayout", scrollSeedFrame)
layoutSeed.SortOrder = Enum.SortOrder.LayoutOrder
layoutSeed.Padding = UDim.new(0,2)

-- Auto Buy button
local autoBuySeedBtn = Instance.new("TextButton", seedTab)
autoBuySeedBtn.AnchorPoint = Vector2.new(0.5, 0.5)
autoBuySeedBtn.Position = UDim2.new(0.5, 0, 0.5, 20)
autoBuySeedBtn.Size = UDim2.new(0, 240, 0, 36)
autoBuySeedBtn.Text = "Start Auto Buy"
autoBuySeedBtn.TextColor3 = Color3.fromRGB(250,250,250)
autoBuySeedBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
autoBuySeedBtn.Font = Enum.Font.GothamBold
autoBuySeedBtn.TextSize = 14
Instance.new("UICorner", autoBuySeedBtn).CornerRadius = UDim.new(0,6)

-- State vars
local buyingSeed = false
local selectedSeed = nil

-- Palitan mo na lang laman ng seedCodes
local seedCodes = {
	["Carrot Seed"] = "\n\000\000`yc4\232A",
	["StarberrySeed 2"] = "\n\000\000`Qe4\232A",
	["Blueberry Seed"] = "\n\000\000\000\226b4\232A",
	["Orange Seed"] = "\n\000\000\000\030CU\232A",
	["Tomato Seed"] = "\n\000\000\192\205e4\232A",
	["Corn Seed"] = "\n\000\000\160\205c4\232A",
	["Daffodil Seed"] = "\n\000\000@eCU\232A",
	["Watermelon Seed"] = "\n\000\000@\025f4\232A",
	["Pumpkin Seed"] = "\n\000\000\224\243d4\232A",
	["Apple Seed"] = "\n\000\000\1929o4\232A",
	["Bamboo Seed"] = "\n\000\000\160\155\225K\232A",
	["Coconut Seed"] = "\n\000\000\160",
	["Cactus Seed"] = "\n\000\000@5\192K\232A",
	["Dragon Fruit Seed"] = "\n\000\000\000\220\160<\232A",
	["Mango Seed"] = "\n\000\000\192d\175H\232A",
	["Grape Seed"] = "\n\000\000\160\182\254K\232A",
	["Mushroom Seed"] = "\n\000\000 \252\155d\232A",
	["Pepper Seed"] = "\n\000\000\128q\171k\232A",
	["Cacao Seed"] = "\n\000\000@F\148u\232A",
	["Beanstalk Seed"] = "\n\000\000@@zx\232A",
	["Ember Lily Seed"] = "\n\000\000`\169 \152\232A",
	["Sugar Apple Seed"] = "\n\000\000 W\186\159\232A",
	["Burning Bud Seed"] = "\n\000\000@KX\182\232A",
	["Giant Picone Seed"] = "\n\000\000\000\004\139\208\232A",
	["Elder Strawberry Seed"] = "\n\000\000\224\026]\236\232A",
}

-- Populate options
for seedName, code in pairs(seedCodes) do
	local option = Instance.new("TextButton")
	option.Size = UDim2.new(1, -8, 0, 26)
	option.Text = seedName
	option.TextColor3 = Color3.fromRGB(245,245,245)
	option.BackgroundColor3 = Color3.fromRGB(75,75,75)
	option.Font = Enum.Font.Gotham
	option.TextSize = 14
	option.Parent = scrollSeedFrame
	Instance.new("UICorner", option).CornerRadius = UDim.new(0,4)

	option.MouseButton1Click:Connect(function()
		selectedSeed = code
		dropdownSeedBtn.Text = seedName.." ▼"

		dropdownSeedFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownSeedFrame.Visible = false
		end)
		dropdownSeedBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		autoBuySeedBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)

		notify("🌱 Auto Buy Seed", "Selected Seed: "..seedName, 2)
	end)
end

-- Update scroll size when content changes
layoutSeed:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scrollSeedFrame.CanvasSize = UDim2.new(0,0,0, layoutSeed.AbsoluteContentSize.Y + 4)
end)

-- Toggle dropdown
dropdownSeedBtn.MouseButton1Click:Connect(function()
	local maxHeight = 140
	local contentHeight = layoutSeed.AbsoluteContentSize.Y + 4
	local visibleHeight = math.min(contentHeight, maxHeight)

	if dropdownSeedFrame.Visible then
		-- CLOSE
		dropdownSeedFrame:TweenSize(UDim2.new(0, 240, 0, 0), "Out", "Quad", 0.18, true, function()
			dropdownSeedFrame.Visible = false
		end)
		dropdownSeedBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -20), "Out", "Quad", 0.18, true)
		dropdownSeedFrame:TweenPosition(UDim2.new(0.5, 0, 0.5, 12), "Out", "Quad", 0.18, true)
		autoBuySeedBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, 20), "Out", "Quad", 0.18, true)
	else
		-- OPEN
		dropdownSeedFrame.Visible = true
		dropdownSeedFrame:TweenPosition(
			UDim2.new(0.5, 0, 0.5, -(visibleHeight/2) + 12),
			"Out", "Quad", 0.18, true
		)
		dropdownSeedFrame:TweenSize(UDim2.new(0, 240, 0, visibleHeight), "Out", "Quad", 0.18, true)
		dropdownSeedBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, -visibleHeight/2 - 4), "Out", "Quad", 0.18, true)

		local maxBtnOffset = (seedTab.AbsoluteSize.Y / 2) - (autoBuySeedBtn.Size.Y.Offset / 2) - 5
		local targetOffset = math.min(visibleHeight + 40, maxBtnOffset)

		autoBuySeedBtn:TweenPosition(UDim2.new(0.5, 0, 0.5, targetOffset), "Out", "Quad", 0.18, true)
	end
end)

-- Auto buy loop
local function autoBuySeedLoop()
	while buyingSeed and selectedSeed do
		local success = pcall(function()
			local args = { buffer.fromstring(selectedSeed) }
			ReplicatedStorage:WaitForChild("ByteNetReliable"):FireServer(unpack(args))
		end)
		if success then
			notify("🌱 Auto Buy Seed", "Bought 1 seed", 1)
		end
		task.wait(1)
	end
end

-- Toggle buy button
autoBuySeedBtn.MouseButton1Click:Connect(function()
	if not selectedSeed then
		notify("⚠ Auto Buy Seed", "Please select a seed first.", 2)
		return
	end
	buyingSeed = not buyingSeed
	if buyingSeed then
		autoBuySeedBtn.Text = "Stop Auto Buy"
		autoBuySeedBtn.BackgroundColor3 = Color3.fromRGB(170,40,40)
		task.spawn(autoBuySeedLoop)
	else
		autoBuySeedBtn.Text = "Start Auto Buy"
		autoBuySeedBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
	end
end)


-- ========== CHRIS P.'S KITCHEN TAB ==========
local kitchenTab = tabContents["Chris P.'S k."]
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

-- Remote references
local cookingEvent = ReplicatedStorage:WaitForChild("GameEvents"):WaitForChild("CookingPotService_RE")

-- State variables
local autoSubmitRunning = false
local autoKitchenRunning = false


-- =================== BUTTON 2: Auto Kitchen (Submit + Cook + Skip + Get) ===================
local autoKitchenBtn = Instance.new("TextButton", kitchenTab)
autoKitchenBtn.AnchorPoint = Vector2.new(0.5, 0.5)
autoKitchenBtn.Position = UDim2.new(0.5, 0, 0.6, 0) -- positioned below first button
autoKitchenBtn.Size = UDim2.new(0, 260, 0, 38)
autoKitchenBtn.Text = "(hold fruit) Start Auto Kitchen"
autoKitchenBtn.TextColor3 = Color3.fromRGB(255,255,255)
autoKitchenBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
autoKitchenBtn.Font = Enum.Font.GothamBold
autoKitchenBtn.TextSize = 14
Instance.new("UICorner", autoKitchenBtn).CornerRadius = UDim.new(0,6)

local function autoKitchenLoop()
	while autoKitchenRunning do
		local success = pcall(function()
			cookingEvent:FireServer("SubmitHeldPlant")
			cookingEvent:FireServer("CookBest")
			cookingEvent:FireServer("TrySkipCooking")
			cookingEvent:FireServer("GetFoodFromPot")
		end)
		if success then
			notify("🍽 Chris P.'S kitchen", "Executed all cooking actions", 1)
		end
		task.wait(1.5)
	end
end

autoKitchenBtn.MouseButton1Click:Connect(function()
	autoKitchenRunning = not autoKitchenRunning
	if autoKitchenRunning then
		autoKitchenBtn.Text = "Stop Auto Kitchen"
		autoKitchenBtn.BackgroundColor3 = Color3.fromRGB(170,40,40)
		task.spawn(autoKitchenLoop)
	else
		autoKitchenBtn.Text = "(hold fruit) Start Auto Kitchen"
		autoKitchenBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
	end
end)

-- =================== BUTTON 1: Auto Submit Food Only ===================
local autoSubmitBtn = Instance.new("TextButton", kitchenTab)
autoSubmitBtn.AnchorPoint = Vector2.new(0.5, 0.5)
autoSubmitBtn.Position = UDim2.new(0.5, 0, 0.4, 0) -- moved up a bit to fit second button
autoSubmitBtn.Size = UDim2.new(0, 240, 0, 36)
autoSubmitBtn.Text = "(Hold food) Start Auto Submit Food"
autoSubmitBtn.TextColor3 = Color3.fromRGB(250,250,250)
autoSubmitBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
autoSubmitBtn.Font = Enum.Font.GothamBold
autoSubmitBtn.TextSize = 14
Instance.new("UICorner", autoSubmitBtn).CornerRadius = UDim.new(0,6)

local function autoSubmitLoop()
	while autoSubmitRunning do
		local success = pcall(function()
			local args = { "SubmitHeldFood" }
			ReplicatedStorage:WaitForChild("GameEvents")
				:WaitForChild("SubmitFoodService_RE")
				:FireServer(unpack(args))
		end)
		if success then
			notify("🍽 Chris P.'S kitchen", "Submitted held food", 1)
		end
		task.wait(1)
	end
end

autoSubmitBtn.MouseButton1Click:Connect(function()
	autoSubmitRunning = not autoSubmitRunning
	if autoSubmitRunning then
		autoSubmitBtn.Text = "Stop Auto Submit Food"
		autoSubmitBtn.BackgroundColor3 = Color3.fromRGB(170,40,40)
		task.spawn(autoSubmitLoop)
	else
		autoSubmitBtn.Text = "(Hold food) Start Auto Submit Food"
		autoSubmitBtn.BackgroundColor3 = Color3.fromRGB(0,160,0)
	end
end)

notify("Grow A Garden Modded", "Enjoy your script!", 3)

`;

app.get('/script', (req, res) => {
  const token = req.query.token;
  if (token !== ACCESS_TOKEN) {
    return res.status(403).send("INVALID");
  }
  res.send(ROBLOX_SCRIPT);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});











