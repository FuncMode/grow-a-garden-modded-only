require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const ROBLOX_SCRIPT = `
-- Remove previous GUI if exists
if game:GetService("Players").LocalPlayer.PlayerGui:FindFirstChild("EggGUI") then
	game:GetService("Players").LocalPlayer.PlayerGui:FindFirstChild("EggGUI"):Destroy()
end

-- Setup
local Player = game:GetService("Players").LocalPlayer
local UIS = game:GetService("UserInputService")

local ScreenGui = Instance.new("ScreenGui", Player.PlayerGui)
ScreenGui.Name = "EggGUI"
ScreenGui.ResetOnSpawn = false

local Frame = Instance.new("Frame", ScreenGui)
Frame.Size = UDim2.new(0, 220, 0, 260)
Frame.Position = UDim2.new(0.4, 0, 0.4, 0)
Frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
Frame.Active = true

local UICorner = Instance.new("UICorner", Frame)
UICorner.CornerRadius = UDim.new(0, 10)

-- Title
local Title = Instance.new("TextLabel", Frame)
Title.Size = UDim2.new(1, -40, 0, 25)
Title.Position = UDim2.new(0, 10, 0, 5)
Title.Text = "🥚 Egg Placer"
Title.TextColor3 = Color3.new(1, 1, 1)
Title.BackgroundTransparency = 1
Title.Font = Enum.Font.SourceSansBold
Title.TextSize = 20
Title.TextXAlignment = Enum.TextXAlignment.Left

-- Minimize Button (-)
local MinBtn = Instance.new("TextButton", Frame)
MinBtn.Size = UDim2.new(0, 20, 0, 20)
MinBtn.Position = UDim2.new(1, -45, 0, 5)
MinBtn.Text = "-"
MinBtn.TextColor3 = Color3.new(1, 1, 1)
MinBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100)
MinBtn.Font = Enum.Font.SourceSansBold
MinBtn.TextSize = 16

-- Close Button (x)
local CloseBtn = Instance.new("TextButton", Frame)
CloseBtn.Size = UDim2.new(0, 20, 0, 20)
CloseBtn.Position = UDim2.new(1, -25, 0, 5)
CloseBtn.Text = "x"
CloseBtn.TextColor3 = Color3.new(1, 1, 1)
CloseBtn.BackgroundColor3 = Color3.fromRGB(200, 50, 50)
CloseBtn.Font = Enum.Font.SourceSansBold
CloseBtn.TextSize = 16

-- Dragging setup
local dragging, dragInput, dragStart, startPos
Frame.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 then
		dragging = true
		dragStart = input.Position
		startPos = Frame.Position
		input.Changed:Connect(function()
			if input.UserInputState == Enum.UserInputState.End then dragging = false end
		end)
	end
end)
Frame.InputChanged:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseMovement then
		dragInput = input
	end
end)
UIS.InputChanged:Connect(function(input)
	if input == dragInput and dragging then
		local delta = input.Position - dragStart
		Frame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X,
			startPos.Y.Scale, startPos.Y.Offset + delta.Y)
	end
end)

-- Egg coordinates
local vector = Vector3.new
local positions = {
	vector(43.991127014160156, 0.1754859983921051, -87.39613342285156),
	vector(50.305335998535156, 0.1754859983921051, -88.32907104492188),
	vector(57.79936218261719, 0.1754859983921051, -88.03072357177734),
	vector(66.23564147949219, 0.1754859983921051, -88.21456909179688),
	vector(44.061241149902344, 0.1754859983921051, -81.71434020996094),
	vector(50.816139221191406, 0.1754859983921051, -82.52154541015625),
	vector(57.98183059692383, 0.1754859983921051, -83.09522247314453),
	vector(66.24691009521484, 0.1754859983921051, -83.41040802001953)
}

-- Egg placement function
local function placeEggs(count)
	local eggService = game:GetService("ReplicatedStorage"):WaitForChild("GameEvents"):WaitForChild("PetEggService")
	for i = 1, count do
		eggService:FireServer("CreateEgg", positions[(i - 1) % #positions + 1])
		wait(0.2)
	end
	game.StarterGui:SetCore("SendNotification", {
		Title = "✅ Eggs Placed",
		Text = tostring(count).." Egg(s) Placed",
		Duration = 3
	})
end

-- Place 1 Button
local OneBtn = Instance.new("TextButton", Frame)
OneBtn.Size = UDim2.new(1, -20, 0, 30)
OneBtn.Position = UDim2.new(0, 10, 0, 40)
OneBtn.Text = "Place 1 Egg"
OneBtn.BackgroundColor3 = Color3.fromRGB(0, 200, 100)
OneBtn.TextColor3 = Color3.new(1, 1, 1)
OneBtn.Font = Enum.Font.SourceSansBold
OneBtn.TextSize = 18

-- Place 8 Button
local EightBtn = Instance.new("TextButton", Frame)
EightBtn.Size = UDim2.new(1, -20, 0, 30)
EightBtn.Position = UDim2.new(0, 10, 0, 75)
EightBtn.Text = "Place 8 Eggs"
EightBtn.BackgroundColor3 = Color3.fromRGB(0, 170, 255)
EightBtn.TextColor3 = Color3.new(1, 1, 1)
EightBtn.Font = Enum.Font.SourceSansBold
EightBtn.TextSize = 18

-- Skip Growth Button
local SkipBtn = Instance.new("TextButton", Frame)
SkipBtn.Size = UDim2.new(1, -20, 0, 30)
SkipBtn.Position = UDim2.new(0, 10, 0, 110)
SkipBtn.Text = "Skip Growth"
SkipBtn.BackgroundColor3 = Color3.fromRGB(255, 140, 0)
SkipBtn.TextColor3 = Color3.new(1, 1, 1)
SkipBtn.Font = Enum.Font.SourceSansBold
SkipBtn.TextSize = 18

-- Hatch All Button
local HatchBtn = Instance.new("TextButton", Frame)
HatchBtn.Size = UDim2.new(1, -20, 0, 30)
HatchBtn.Position = UDim2.new(0, 10, 0, 145)
HatchBtn.Text = "Hatch All Eggs"
HatchBtn.BackgroundColor3 = Color3.fromRGB(150, 100, 255)
HatchBtn.TextColor3 = Color3.new(1, 1, 1)
HatchBtn.Font = Enum.Font.SourceSansBold
HatchBtn.TextSize = 18

-- Button Connections
OneBtn.MouseButton1Click:Connect(function()
	placeEggs(1)
end)

EightBtn.MouseButton1Click:Connect(function()
	placeEggs(8)
end)

SkipBtn.MouseButton1Click:Connect(function()
	local eggFolder = workspace:WaitForChild("Farm"):WaitForChild("Farm"):WaitForChild("Important"):WaitForChild("Objects_Physical")
	local eggService = game:GetService("ReplicatedStorage"):WaitForChild("GameEvents"):WaitForChild("PetEggService")
	local skipped = 0
	for _, egg in pairs(eggFolder:GetChildren()) do
		if egg.Name == "PetEgg" then
			eggService:FireServer("AuthorisePurchase", egg)
			skipped += 1
		end
	end
	game.StarterGui:SetCore("SendNotification", {
		Title = "⚡ Skipped Growth",
		Text = tostring(skipped).." Egg(s) Skipped",
		Duration = 3
	})
end)

HatchBtn.MouseButton1Click:Connect(function()
	local eggFolder = workspace:WaitForChild("Farm"):WaitForChild("Farm"):WaitForChild("Important"):WaitForChild("Objects_Physical")
	local eggService = game:GetService("ReplicatedStorage"):WaitForChild("GameEvents"):WaitForChild("PetEggService")
	local hatched = 0
	for _, egg in pairs(eggFolder:GetChildren()) do
		if egg.Name == "PetEgg" then
			eggService:FireServer("HatchPet", egg)
			hatched += 1
		end
	end
	game.StarterGui:SetCore("SendNotification", {
		Title = "🐣 Eggs Hatched",
		Text = tostring(hatched).." Egg(s) Hatched",
		Duration = 3
	})
end)

CloseBtn.MouseButton1Click:Connect(function()
	ScreenGui:Destroy()
end)

local isVisible = true
MinBtn.MouseButton1Click:Connect(function()
	isVisible = not isVisible
	for _, v in ipairs(Frame:GetChildren()) do
		if v:IsA("TextButton") or v:IsA("TextLabel") then
			if v ~= Title and v ~= MinBtn and v ~= CloseBtn then
				v.Visible = isVisible
			end
		end
	end
end)

-- Keyboard shortcut (M) for minimize
UIS.InputBegan:Connect(function(input, gpe)
	if gpe then return end
	if input.KeyCode == Enum.KeyCode.M then
		MinBtn:Activate()
	end
end)

`;

app.get('/script', (req, res) => {
  const token = req.query.token;
  if (token !== ACCESS_TOKEN) {
    return res.status(403).send("INVALID");
  }
  res.send(ROBLOX_SCRIPT);
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});






