require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

const ACCESS_TOKEN = process.env.TOKEN;  // Or change .env to ACCESS_TOKEN

const ROBLOX_SCRIPT = `
-- Remove previous GUI if exists
local player = game:GetService("Players").LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

if playerGui:FindFirstChild("EggGUI") then
    playerGui.EggGUI:Destroy()
end

-- Setup
local UIS = game:GetService("UserInputService")

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "EggGUI"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = playerGui

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 220, 0, 260)
Frame.Position = UDim2.new(0.4, 0, 0.4, 0)
Frame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
Frame.Active = true
Frame.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 10)
UICorner.Parent = Frame

-- Title
local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(1, -40, 0, 25)
Title.Position = UDim2.new(0, 10, 0, 5)
Title.Text = "🥚 Egg Placer"
Title.TextColor3 = Color3.new(1, 1, 1)
Title.BackgroundTransparency = 1
Title.Font = Enum.Font.SourceSansBold
Title.TextSize = 20
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Frame

-- Minimize Button (-)
local MinBtn = Instance.new("TextButton")
MinBtn.Size = UDim2.new(0, 20, 0, 20)
MinBtn.Position = UDim2.new(1, -45, 0, 5)
MinBtn.Text = "-"
MinBtn.TextColor3 = Color3.new(1, 1, 1)
MinBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 100)
MinBtn.Font = Enum.Font.SourceSansBold
MinBtn.TextSize = 16
MinBtn.Parent = Frame

-- Close Button (x)
local CloseBtn = Instance.new("TextButton")
CloseBtn.Size = UDim2.new(0, 20, 0, 20)
CloseBtn.Position = UDim2.new(1, -25, 0, 5)
CloseBtn.Text = "x"
CloseBtn.TextColor3 = Color3.new(1, 1, 1)
CloseBtn.BackgroundColor3 = Color3.fromRGB(200, 50, 50)
CloseBtn.Font = Enum.Font.SourceSansBold
CloseBtn.TextSize = 16
CloseBtn.Parent = Frame

-- Dragging setup
local dragging, dragInput, dragStart, startPos

Frame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging = true
        dragStart = input.Position
        startPos = Frame.Position

        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
            end
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
        Frame.Position = UDim2.new(
            startPos.X.Scale,
            startPos.X.Offset + delta.X,
            startPos.Y.Scale,
            startPos.Y.Offset + delta.Y
        )
    end
end)

-- Egg coordinates
local vector = Vector3.new
local positions = {
    vector(43.991, 0.175, -87.396),
    vector(50.305, 0.175, -88.329),
    vector(57.799, 0.175, -88.030),
    vector(66.236, 0.175, -88.215),
    vector(44.061, 0.175, -81.714),
    vector(50.816, 0.175, -82.522),
    vector(57.982, 0.175, -83.095),
    vector(66.247, 0.175, -83.410)
}

-- Egg placement function
local function placeEggs(count)
    local eggService = game:GetService("ReplicatedStorage"):WaitForChild("GameEvents"):WaitForChild("PetEggService")
    for i = 1, count do
        local pos = positions[((i - 1) % #positions) + 1]
        eggService:FireServer("CreateEgg", pos)
        wait(0.2)
    end
    game.StarterGui:SetCore("SendNotification", {
        Title = "✅ Eggs Placed",
        Text = tostring(count) .. " Egg(s) Placed",
        Duration = 3
    })
end

-- Buttons creation helper function (to reduce code duplication)
local function createButton(text, positionY, color, parent)
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(1, -20, 0, 30)
    btn.Position = UDim2.new(0, 10, 0, positionY)
    btn.Text = text
    btn.BackgroundColor3 = color
    btn.TextColor3 = Color3.new(1,1,1)
    btn.Font = Enum.Font.SourceSansBold
    btn.TextSize = 18
    btn.Parent = parent
    return btn
end

local OneBtn = createButton("Place 1 Egg", 40, Color3.fromRGB(0, 200, 100), Frame)
local EightBtn = createButton("Place 8 Eggs", 75, Color3.fromRGB(0, 170, 255), Frame)
local SkipBtn = createButton("Skip Growth", 110, Color3.fromRGB(255, 140, 0), Frame)
local HatchBtn = createButton("Hatch All Eggs", 145, Color3.fromRGB(150, 100, 255), Frame)

-- Button connections
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
        Text = tostring(skipped) .. " Egg(s) Skipped",
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
        Text = tostring(hatched) .. " Egg(s) Hatched",
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
        if (v:IsA("TextButton") or v:IsA("TextLabel")) and v ~= Title and v ~= MinBtn and v ~= CloseBtn then
            v.Visible = isVisible
        end
    end
end)

-- Keyboard shortcut (M) for minimize
UIS.InputBegan:Connect(function(input, gameProcessedEvent)
    if gameProcessedEvent then return end
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
  console.log(`Server running on http://localhost:${PORT}`);
});









